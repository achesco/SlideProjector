/**
 * SlideProjector plugin file
 *
 * @see {@link https://github.com/achesco/SlideProjector}
 * @author Anton Lysenko <achesco@gmail.com>
 * @version 0.3
 */
(function ($) {

    var implementations = {},
        plugin, abstract;

    plugin = $.fn.slideprojector = function (options, implOptions) {
        return this.each(function () {
            if (!$.data(this, 'slideprojector')) {
                $.data(this, 'slideprojector', new implementations[options.implementation](this, options, implOptions));
            }
            return this;
        });
    };

    plugin.defaults = {
        implementation: null,
        slideItems: null,
        scrollPrevControl: null,
        scrollNextControl: null,
        selectedIndex: 0,
        cycleSlides: true,
        previewItems: null,
        duration: 1000,
        idleScroll: false,
        idleScrollInterval: 4000,
        idleScrollIntroOnly: true,
        onBeforeScroll: null,
        onAfterScroll: null,
        hiddenClassName: 'sp-hidden',
        previewSelectedClassName: 'sp-selected'
    };

    /**
     * Make implementation available through $(...).sliderprojector({ implementation: '...' })
     * @param {Function} child Implementation class-function
     * @param {String} name Implementation name
     */
    plugin.registerImplementation = function (child, name) {
        var proxy = function () {};
        proxy.prototype = abstract.prototype;
        child.prototype = new proxy();
        child.prototype.constructor = child;
        child.prototype.__super = abstract.prototype;
        child.prototype.__super.constructor = abstract;
        implementations[name] = child;
    };

    abstract = function (container, options, implOptions) {
        this.options = $.extend({}, plugin.defaults, options);
        this.implOptions = $.extend({}, this.getImplementationDefaults(), implOptions);
        this.slideItems = $(this.options.slideItems);
        this.contentStripe = $(container);
        this.currentIndex = [this.options.selectedIndex || 0];
        this.lastIndex = this.slideItems.length - 1;
        // init prev-next controlls and show next (optional)
        this.scrollPrevControl = $(this.options.scrollPrevControl);
        this.scrollNextControl = $(this.options.scrollNextControl);
        // init previews controls (optional)
        this.previewItems = $(this.options.previewItems);
        this.initUserEvents();
        // init scroll on idle (optional)
        if (this.options.idleScroll) {
            this.initIdleScroll();
        }
        this.updatePrevNext();
    };

    abstract.prototype = {

        /**
         * Get implementation default options
         * @returns {Object}
         */
        getImplementationDefaults: function () {
            return {};
        },

        /**
         * User events basic init
         */
        initUserEvents: function () {
            this.scrollPrevControl.click(this.onScrollPrev.bind(this));
            this.scrollNextControl.click(this.onScrollNext.bind(this));
            this.previewItems.click(this.onPreviewClick.bind(this));
        },

        /**
         * Run periodical scroll on idle
         */
        initIdleScroll: function () {
            this.idleSlideTimeout = null;
            this.setIdleSlideTimeout();
            this.contentStripe
                .mouseenter(this.clearIdleSlideTimeout.bind(this))
                .mouseleave(this.setIdleSlideTimeout.bind(this));

            if (this.options.idleScrollIntroOnly) {
                this.previewItems.one('click', function () {
                    this.contentStripe
                        .unbind('mouseenter', this.clearIdleSlideTimeout)
                        .unbind('mouseleave', this.setIdleSlideTimeout);
                }.bind(this));
            }
        },

        /**
         * Start idle timeout
         */
        setIdleSlideTimeout: function () {
            this.idleSlideTimeout = setTimeout(this.idleSlide.bind(this), this.options.idleScrollInterval);
        },

        /**
         * Clear idle timeout
         */
        clearIdleSlideTimeout: function () {
            clearTimeout(this.idleSlideTimeout);
        },

        /**
         * Perform slide on idle
         */
        idleSlide: function () {
            var toIndex = this.currentIndex[0];

            if (++toIndex > this.lastIndex) {
                toIndex = 0;
            }
            this.scroll(toIndex);
            this.setIdleSlideTimeout();
        },

        /**
         * Get first active slide
         * @returns {jQuery}
         */
        getCurrentItem: function () {
            return this.getItem(this.currentIndex[0]);
        },

        /**
         * Get slide by index
         * @param {Number} idx
         * @returns {jQuery}
         */
        getItem: function (idx) {
            return $(this.slideItems.get(idx));
        },

        /**
         * Scroll to previous slide
         */
        onScrollPrev: function () {
            this.scroll(null, -1);
        },

        /**
         * Scroll to next slide
         */
        onScrollNext: function () {
            this.scroll(null, 1);
        },

        /**
         * Handle click on preview item (event target)
         * @param {jQuery.Event} event
         */
        onPreviewClick: function (event) {
            this.scroll(this.previewItems.index($(event.target)));
        },

        /**
         * Do scroll, one param should be presented
         * @param {Number} [toIndex]
         * @param {Number} [delta]
         */
        scroll: function (toIndex, delta) {
            var perform = true;

            this.clearIdleSlideTimeout();
            toIndex = toIndex === null || isNaN(Number(toIndex)) ? this.currentIndex[0] + delta : toIndex;
            toIndex = this.options.cycleSlides ?
                        (toIndex < 0 ? this.lastIndex : (toIndex > this.lastIndex ? 0 : toIndex)) : toIndex;

            if (this.beforeScroll(toIndex)) {
                if (typeof this.options.onBeforeScroll === 'function') {
                    perform = this.options.onBeforeScroll();
                }
                if (perform) {
                    this.performScroll(toIndex);
                    this.afterScroll(toIndex);
                    if (typeof this.options.onAfterScroll === 'function') {
                        this.options.onAfterScroll.call(this);
                    }
                }
            }
        },

        /**
         * Before scroll actions. Could prevent scroll by return false value.
         * @param {Number} toIndex Target slide index
         * @returns {Boolean} Perform or cancel scroll
         */
        beforeScroll: function (toIndex) {
            return (toIndex !== this.currentIndex[0] && toIndex >= 0 && toIndex <= this.lastIndex);
        },

        /**
         * After scroll
         * @param {Number} toIndex Target slide index
         */
        afterScroll: function (toIndex) {
            this.currentIndex[0] = toIndex;
            this.updatePrevNext();
        },

        /**
         * Check and update prev/next controls visibility
         */
        updatePrevNext: function () {
            if (this.options.cycleSlides) {
                return;
            }
            this.scrollPrevControl
                [this.currentIndex <= 0 ? 'addClass' : 'removeClass'](this.options.hiddenClassName);
            this.scrollNextControl
                [this.currentIndex >= this.lastIndex ? 'addClass' : 'removeClass'](this.options.hiddenClassName);
        },

        /**
         * Make scroll happen.
         * @abstract
         */
        performScroll: function () {
            throw 'performScroll should be implemented';
        }
    };

})(jQuery);
