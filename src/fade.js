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
