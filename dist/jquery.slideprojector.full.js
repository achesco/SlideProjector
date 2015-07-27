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
            $(this.previewItems.removeClass(this.options.previewSelectedClassName).get(toIndex))
                .addClass(this.options.previewSelectedClassName);
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

/**
 * SlideProjector 'fade' implementation
 */
(function ($) {

    var impl = function () {
        this.__super.constructor.apply(this, arguments);
        $(this.slideItems.css('opacity', 0)
            .addClass(this.options.hiddenClassName)
            .get(this.currentIndex)).css('opacity', 1)
            .removeClass(this.options.hiddenClassName);
        $(this.previewItems.removeClass(this.options.previewSelectedClassName).get(this.currentIndex[0]))
            .addClass(this.options.previewSelectedClassName);
        this.inProgress = false;
    };

    $.fn.slideprojector.registerImplementation(impl, 'fade');

    $.extend(impl.prototype, {

        /**
         * @override {slideprojector}
         */
        getImplementationDefaults: function () {
            return {
                queueSlidesAnimation: false
            };
        },

        beforeScroll: function () {
            return !this.inProgress && this.__super.beforeScroll.apply(this, arguments);
        },

        performScroll: function (toIndex) {
            if (this.implOptions.queueSlidesAnimation) {
                this.performScroll_out(this.performScroll_in.bind(this, toIndex));
            } else {
                this.performScroll_out();
                this.performScroll_in(toIndex);
            }
        },

        performScroll_out: function (onComplete) {
            var item = this.getCurrentItem();

            this.inProgress = true;
            item.animate({opacity: 0}, {
                queue: false,
                duration: this.options.duration,
                complete: function () {
                    item.addClass(this.options.hiddenClassName);
                    if (typeof onComplete === 'function') {
                        onComplete();
                    }
                }.bind(this)
            });
        },

        performScroll_in: function (toIndex) {
            this.getItem(toIndex).removeClass(this.options.hiddenClassName).animate({opacity: 1}, {
                queue: false,
                duration: this.options.duration,
                complete: function () {
                    this.inProgress = false;
                }.bind(this)
            });
        }
    });

})(jQuery);

/**
 * SlideProjector 'poproll' implementation
 */
(function ($) {

    var impl = function () {
        this.__super.constructor.apply(this, arguments);
        this.initLayout();
    };

    $.fn.slideprojector.registerImplementation(impl, 'poproll');

    $.extend(impl.prototype, {

        initLayout: function () {
            var sumWidth = 0;

            this.viewportWidth = this.contentStripe.width();
            this.prevViewportWidth = this.viewportWidth;
            this.sections = [[], [], []];
            this.visibleWidth = 0;
            this.popIndex = 0;

            this.slideItems.each(function (i, elem) {
                var item = $(elem),
                    cwidth = item.outerWidth(true);

                item.data('cwidth', cwidth);
                item.data('oversized', cwidth > this.viewportWidth);
                item.data('visibleWidth', cwidth > this.viewportWidth ? 0 : cwidth);
                if (item.data('oversized')) {
                    item.hide();
                }
                if (i < this.currentIndex[0]) {
                    item.hide();
                    this.sections[0].push(item);
                } else {
                    sumWidth = sumWidth + item.data('visibleWidth');

                    if (sumWidth < this.viewportWidth) {
                        this.sections[1].push(item);
                        this.visibleWidth = this.visibleWidth + item.data('visibleWidth');
                    } else {
                        this.sections[2].push(item);
                        item.hide();
                    }
                }
            }.bind(this));
            this.afterScroll(0);
            $(window).resize(this.onResize.bind(this));
        },

        beforeScroll: function (toIndex) {
            return this.sections[this.currentIndex[0] < toIndex ? 2 : 0].length > 0;
        },

        performScroll: function (toIndex) {
            var itemToMove,
                itemsToShow,
                itemsToHide;

            if (this.currentIndex[0] < toIndex) { // move stripe to the left

                // move invisible big slides from right to the middle section making the first right slide
                // available to display
                while (this.sections[2].length && this.sections[2][0].data('oversized')) {
                    this.sections[1].push(this.sections[2].shift());
                }

                // mark first right slide for display, move it to the middle secton
                itemsToShow = this.sections[2][0];
                this.visibleWidth += itemsToShow.data('cwidth');
                this.sections[1].push(this.sections[2].shift());

                // mark first middle slide for hide and move it to the left section while every mid-secton
                // slides are become fit to display
                itemsToHide = this.sections[1][0];
                while (this.visibleWidth > this.viewportWidth) {
                    itemToMove = this.sections[1][0];
                    itemsToHide = itemsToHide.add(itemToMove);
                    this.visibleWidth -= itemToMove.data('visibleWidth');
                    this.sections[0].push(this.sections[1].shift());
                }

                // while first right slide added with mid-secton slides are fit to display mark it for display and
                // move to the middle section
                itemToMove = this.sections[2][0];
                while (this.sections[2].length &&
                    (this.visibleWidth + itemToMove.data('visibleWidth')) <= this.viewportWidth) {
                    if (!itemToMove.data('oversized')) {
                        itemsToShow = itemsToShow.add(itemToMove);
                    }
                    this.visibleWidth += itemToMove.data('visibleWidth');
                    this.sections[1].push(this.sections[2].shift());
                    itemToMove = this.sections[2][0];
                }

            } else { // move stripe to the right

                // move invisible big slides from left to the middle section making the last left slide
                // available to display
                while (this.sections[0].length && this.sections[0][this.sections[0].length - 1].data('oversized')) {
                    this.sections[1].unshift(this.sections[0].pop());
                }

                // mark last left slide for display, move it to the middle secton
                itemsToShow = this.sections[0][this.sections[0].length - 1];
                this.visibleWidth += itemsToShow.data('visibleWidth');
                this.sections[1].unshift(this.sections[0].pop());

                // mark last middle slide for hide and move it to the right section while every mid-secton
                // slides are become fit to display
                itemsToHide = this.sections[1][this.sections[1].length - 1];
                while (this.visibleWidth > this.viewportWidth) {
                    itemToMove = this.sections[1][this.sections[1].length - 1];
                    itemsToHide = itemsToHide.add(itemToMove);
                    this.visibleWidth -= itemToMove.data('visibleWidth');
                    this.sections[2].unshift(this.sections[1].pop());
                }

                // while last left slide added with mid-secton slides are fit to display mark it for display and
                // move to the middle section
                itemToMove = this.sections[0][this.sections[0].length - 1];
                while (this.sections[0].length &&
                    (this.visibleWidth + itemToMove.data('visibleWidth') <= this.viewportWidth)) {
                    if (!itemToMove.data('oversized')) {
                        itemsToShow = itemsToShow.add(itemToMove);
                    }
                    this.visibleWidth += itemToMove.data('visibleWidth');
                    this.sections[1].unshift(this.sections[0].pop());
                    itemToMove = this.sections[0][this.sections[0].length - 1];
                }

            }

            itemsToHide.hide(this.options.duration);
            itemsToShow.show(this.options.duration);

        },

        afterScroll: function () {
            this.currentIndex[0] = this.sections[0].length;
            var section0Length = this.sections[0].length;
            $.each(this.sections[0], function (i, item) {
                if (item.data('oversized')) {
                    section0Length--;
                }
            });
            var section2Length = this.sections[2].length;
            $.each(this.sections[2], function (i, item) {
                if (item.data('oversized')) {
                    section2Length--;
                }
            });
            this.scrollPrevControl[section0Length ? 'removeClass' : 'addClass'](this.options.hiddenClassName);
            this.scrollNextControl[section2Length ? 'removeClass' : 'addClass'](this.options.hiddenClassName);
        },

        onResize: function () {
            var viewportWidth = this.contentStripe.width(),
                itemToMove;

            if (viewportWidth === this.prevViewportWidth) {
                return;
            }

            // mark/unmark slides with big slide tag, hide big ones
            this.slideItems.each(function (i, elem) {
                var item = $(elem);
                item.data('oversized', item.data('cwidth') > viewportWidth);
                item.data('visibleWidth', item.data('oversized') ? 0 : item.data('cwidth'));

                if (item.data('oversized')) {
                    item.hide(this.options.duration);
                }
            }.bind(this));

            // reset visible slides width
            this.visibleWidth = 0;
            // reset middle and right sections to be newly filled
            this.sections[1] = [];
            this.sections[2] = [];

            // while every slide following left-section slides is fit combined with mid-section slides,
            // show it and add to the middle section
            this.slideItems.each(function (i, elem) {
                if (i >= this.sections[0].length) {
                    var item = $(elem);

                    if (this.visibleWidth + item.data('visibleWidth') < viewportWidth) {
                        this.sections[1].push(item);
                        if (!item.data('oversized')) {
                            item.show(this.options.duration);
                        }
                        this.visibleWidth += item.data('visibleWidth');
                    } else {
                        // если баннеры уже не помещаются, скрываем их и добавляем к правой секции
                        this.sections[2].push(item);
                        item.hide(this.options.duration);
                    }
                }
            }.bind(this));

            // while last left slide is not a big one and fit to display combined with mid-secton slides,
            // move it to the middle section and show
            itemToMove = this.sections[0][this.sections[0].length - 1];
            while (this.sections[0].length && (this.visibleWidth + itemToMove.data('visibleWidth') <= viewportWidth)) {
                if (!itemToMove.data('oversized')) {
                    itemToMove.show(this.options.duration);
                }
                this.visibleWidth += itemToMove.data('visibleWidth');
                this.sections[1].unshift(this.sections[0].pop());
                itemToMove = this.sections[0][this.sections[0].length - 1];
            }

            this.afterScroll();
            this.viewportWidth = viewportWidth;
            this.prevViewportWidth = viewportWidth;
        }

    });

})(jQuery);

/**
 * SlideProjector 'slide' implementation
 */
(function ($) {

    var impl = function () {
        this.__super.constructor.apply(this, arguments);
        $(this.slideItems.addClass(this.options.hiddenClassName).get(this.currentIndex))
            .removeClass(this.options.hiddenClassName);
        $(this.previewItems.removeClass(this.options.previewSelectedClassName).get(this.currentIndex[0]))
            .addClass(this.options.previewSelectedClassName);
        this.inProgress = false;
    };

    $.fn.slideprojector.registerImplementation(impl, 'slide');

    $.extend(impl.prototype, {

        /**
         * @override {slideprojector}
         */
        getImplementationDefaults: function () {
            return {
                basicZIndex: 0,
                animationZIndex: 1
            };
        },

        beforeScroll: function () {
            return !this.inProgress && this.__super.beforeScroll.apply(this, arguments);
        },

        performScroll: function (toIndex) {
            var item = this.getCurrentItem(),
                newItem = this.getItem(toIndex);

            this.inProgress = true;
            newItem
                .css({
                    zIndex: this.implOptions.animationZIndex,
                    left: toIndex > this.currentIndex[0] ? '100%' : '-100%'
                })
                .removeClass(this.options.hiddenClassName)
                .animate({
                    left: 0
                }, {
                    queue: false,
                    duration: this.options.duration,
                    complete: function () {
                        newItem.css('zIndex', this.implOptions.basicZIndex);
                        item.addClass(this.options.hiddenClassName);
                        this.inProgress = false;
                    }.bind(this)
                });
        }
    });

})(jQuery);
