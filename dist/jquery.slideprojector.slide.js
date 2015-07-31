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
                animationZIndex: 1,
                easing: 'swing'
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
                        left: '0%'
                    }, {
                        queue: false,
                        easing: this.implOptions.easing,
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
