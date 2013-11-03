/**
 * @class Слайдер
 */
f.ui.PopRollSlider = function (options, scrollOptions) {
	f.ui.Slider.apply(this, arguments);
	this.initLayout();
};
f.extend(f.ui.PopRollSlider, f.ui.Slider);

f.ui.PopRollSlider.prototype.initLayout = function () {
	this.viewportWidth = this.contentStripe.width();
	this.prevViewportWidth = this.viewportWidth;
	this.sections = [
		[],
		[],
		[]
	];
	this.visibleWidth = 0;
	this.popIndex = 0;
	var sumWidth = 0;
	this.slideItems.each($.proxy(function (i, elem) {
		var item = $(elem);
		var cwidth = item.outerWidth(true);
		item.data("cwidth", cwidth);
		item.data("oversized", cwidth > this.viewportWidth);
		item.data("visibleWidth", cwidth > this.viewportWidth ? 0 : cwidth);
		if (item.data("oversized")) {
			item.hide();
		}
		if (i < this.currentIndex[0]) {
			item.hide();
			this.sections[0].push(item);
		} else {
			sumWidth = sumWidth + item.data("visibleWidth");

			if (sumWidth < this.viewportWidth) {
				this.sections[1].push(item);
				this.visibleWidth = this.visibleWidth + item.data("visibleWidth");
			} else {
				this.sections[2].push(item);
				item.hide();
			}
		}
	}, this));
	this.afterScroll(0);
	$(window).resize($.proxy(this.onResize, this));
}

f.ui.PopRollSlider.prototype.beforeScroll = function (toIndex) {
	return this.sections[this.currentIndex[0] < toIndex ? 2 : 0].length > 0;
};

f.ui.PopRollSlider.prototype.performScroll = function (toIndex) {
	var
		itemToMove,
		itemsToShow,
		itemsToHide;

	if (this.currentIndex[0] < toIndex) {
		// двигаем ленту влево

		// перемещаем невидимые большие баннеры из правой секцмм в среднюю, чтобы первый правый баннер можно было показывать
		while (this.sections[2].length && this.sections[2][0].data("oversized")) {
			this.sections[1].push(this.sections[2].shift());
		}

		// помечаем первый правый баннер для показа, перемещаем в среднюю секцию
		itemsToShow = this.sections[2][0];
		this.visibleWidth += itemsToShow.data("cwidth");
		this.sections[1].push(this.sections[2].shift());

		// пока все средние баннеры не помещаются, помечаем первый средний для скрытия, и перемещаем его в левую секцию
		itemsToHide = this.sections[1][0];
		while (this.visibleWidth > this.viewportWidth) {
			itemToMove = this.sections[1][0];
			itemsToHide = itemsToHide.add(itemToMove);
			this.visibleWidth -= itemToMove.data("visibleWidth");
			this.sections[0].push(this.sections[1].shift());
		}

		// пока первый правый баннер помещается к средним, помечаем его для показа, и перемещаем в среднюю секцию
		itemToMove = this.sections[2][0];
		while (this.sections[2].length && (this.visibleWidth + itemToMove.data("visibleWidth")) <= this.viewportWidth) {
			if (!itemToMove.data("oversized")) {
				itemsToShow = itemsToShow.add(itemToMove);
			}
			this.visibleWidth += itemToMove.data("visibleWidth");
			this.sections[1].push(this.sections[2].shift());
			itemToMove = this.sections[2][0];
		}

	} else {
		// двигаем ленту вправо

		// перемещаем невидимые большие баннеры из левой секции в среднюю, чтобы последний левый баннер можно было показывать
		while (this.sections[0].length && this.sections[0][this.sections[0].length - 1].data("oversized")) {
			this.sections[1].unshift(this.sections[0].pop());
		}

		// помечаем последний левый баннер для показа, перемещаем в среднюю секцию
		itemsToShow = this.sections[0][this.sections[0].length - 1];
		this.visibleWidth += itemsToShow.data("visibleWidth");
		this.sections[1].unshift(this.sections[0].pop());

		// пока все средние баннеры не помещаются, помечаем последний средний для скрытия, и перемещаем его в правую секцию
		itemsToHide = this.sections[1][this.sections[1].length - 1];
		while (this.visibleWidth > this.viewportWidth) {
			itemToMove = this.sections[1][this.sections[1].length - 1];
			itemsToHide = itemsToHide.add(itemToMove);
			this.visibleWidth -= itemToMove.data("visibleWidth");
			this.sections[2].unshift(this.sections[1].pop());
		}

		// пока последний левый баннер помещается к средним, помечаем его для показа, и перемещаем в среднюю секцию
		itemToMove = this.sections[0][this.sections[0].length - 1];
		while (this.sections[0].length && (this.visibleWidth + itemToMove.data("visibleWidth") <= this.viewportWidth)) {
			if (!itemToMove.data("oversized")) {
				itemsToShow = itemsToShow.add(itemToMove);
			}
			this.visibleWidth += itemToMove.data("visibleWidth");
			this.sections[1].unshift(this.sections[0].pop());
			itemToMove = this.sections[0][this.sections[0].length - 1];
		}

	}

	itemsToHide.hide(this.options.duration);
	itemsToShow.show(this.options.duration);

};

f.ui.PopRollSlider.prototype.afterScroll = function (toIndex) {
	this.currentIndex[0] = this.sections[0].length;
	var section0Length = this.sections[0].length;
	$.each(this.sections[0], function (i, item) {
		if (item.data("oversized")) {
			section0Length--;
		}
	});
	var section2Length = this.sections[2].length;
	$.each(this.sections[2], function (i, item) {
		if (item.data("oversized")) {
			section2Length--;
		}
	});
	this.scrollPrevControl[section0Length ? "removeClass" : "addClass"](this.options.hiddenClassName);
	this.scrollNextControl[section2Length ? "removeClass" : "addClass"](this.options.hiddenClassName);
};

f.ui.PopRollSlider.prototype.onResize = function () {
	var viewportWidth = this.contentStripe.width();
	if (viewportWidth == this.prevViewportWidth)
		return;

	// проходимся по баннерам, ставим/снимаем флаг большого баннера, большие скрываем
	this.slideItems.each($.proxy(function (i, elem) {
		var item = $(elem);
		item.data("oversized", item.data("cwidth") > viewportWidth);
		item.data("visibleWidth", item.data("oversized") ? 0 : item.data("cwidth"));

		if (item.data("oversized")) {
			item.hide(this.options.duration);
		}
	}, this));

	var itemToMove;

	// обнуляем ширину видимых баннеров, а также среднюю и правую секцию, т.к. они будут наполнены заново ниже
	this.visibleWidth = 0;
	this.sections[1] = [];
	this.sections[2] = [];

	// пока каждый баннер (после левых) помещается, показываем его и добавляем к средней секции
	this.slideItems.each($.proxy(function (i, elem) {
		if (i >= this.sections[0].length) {
			var item = $(elem);

			if (this.visibleWidth + item.data("visibleWidth") < viewportWidth) {
				this.sections[1].push(item);
				if (!item.data("oversized")) {
					item.show(this.options.duration);
				}
				this.visibleWidth += item.data("visibleWidth");
			} else {
				// если баннеры уже не помещаются, скрываем их и добавляем к правой секции
				this.sections[2].push(item);
				item.hide(this.options.duration);
			}
		}
	}, this));

	// пока последний левый баннер помещается к средним, показываем его (если он не большой), и перемещаем в среднюю секцию
	itemToMove = this.sections[0][this.sections[0].length - 1];
	while (this.sections[0].length && (this.visibleWidth + itemToMove.data("visibleWidth") <= viewportWidth)) {
		if (!itemToMove.data("oversized")) {
			itemToMove.show(this.options.duration);
		}
		this.visibleWidth += itemToMove.data("visibleWidth");
		this.sections[1].unshift(this.sections[0].pop());
		itemToMove = this.sections[0][this.sections[0].length - 1];
	}

	this.afterScroll();
	this.viewportWidth = viewportWidth;
	this.prevViewportWidth = viewportWidth;
};
