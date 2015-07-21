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
