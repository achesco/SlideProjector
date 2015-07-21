/**
 * SlideProjector 'scroll' implementation
 */
(function ($) {

    var impl = function () {
        this.__super.constructor.apply(this, arguments);
        $(this.slideItems.addClass(this.options.hiddenClassName).get(this.currentIndex))
            .removeClass(this.options.hiddenClassName);
        $(this.previewItems.removeClass(this.options.previewSelectedClassName).get(this.currentIndex[0]))
            .addClass(this.options.previewSelectedClassName);
    };

    $.fn.slideprojector.registerImplementation(impl, 'scroll');

    $.extend(impl.prototype, {

        afterScroll: function (toIndex) {
            this.__super.afterScroll.call(this, toIndex);
            $(this.previewItems.removeClass(this.options.previewSelectedClassName).get(toIndex))
                .addClass(this.options.previewSelectedClassName);
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
                complete: this.afterPerformScroll.bind(this)
            });
        }
    });

})(jQuery);
