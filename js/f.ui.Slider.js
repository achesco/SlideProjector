/**
 * Абстрактный базовый суперкласс для конкретных имплементаций слайдера.
 */
f.ui.Slider = function (options, scrollOptions) {

	this.options = $.extend({}, this.options, this.defaultOptions, (options || {}));
	this.scrollOptions = $.extend({}, this.scrollOptions, this.defaultScrollOptions, (scrollOptions || {}));

	this.slideItems = $(this.options.slideItems);
	this.contentStripe = $(this.options.contentStripe);

	this.currentIndex = [0];
	this.lastIndex = this.slideItems.size() - 1;

	// init prev-next controlls and show next (optional)
	this.scrollPrevControl = $(this.options.scrollPrevControl);
	this.scrollNextControl = $(this.options.scrollNextControl);

	// init previews controls (optional)
	this.previewItems = $(this.options.previewItems);

	this.initUserEvents();

	// init scroll on idle (optional)
	this.options.idleScroll && this.initIdleScroll();
};
f.ui.Slider.prototype = {
	/**
	 * Дефолтные настройки слайдера.
	 */
	defaultOptions: {
		contentStripe: null // String|Element|jQuery
		, slideItems: null // String|Element|jQuery
		, scrollPrevControl: null // String|Element|jQuery
		, scrollNextControl: null // String|Element|jQuery
		, previewItems: null, duration: 1000, idleScroll: false, idleScrollInterval: 4000, idleScrollIntroOnly: true, onBeforeScroll: null, onAfterScroll: null, hiddenClassName: 'g-hidden', selectedClassName: 'selected', previewSelectedClassName: "selected"
	},

	/**
	 * Опции конкретной имплементации слайдера.
	 */
	defaultScrollOptions: {},

	/**
	 * Базовая инициализация пользовательских событий.
	 */
	initUserEvents: function () {
		this.scrollPrevControl.click($.proxy(this.onScrollPrev, this));
		this.scrollNextControl.click($.proxy(this.onScrollNext, this));
		this.previewItems.click($.proxy(this.onPreviewClick, this));
	},

	/**
	 * Запустить периодический "самоскрол".
	 */
	initIdleScroll: function () {
		this.idleSlideTimeout = null;
		this.setIdleSlideTimeout();
		this.contentStripe
			.mouseenter($.proxy(this.clearIdleSlideTimeout, this))
			.mouseleave($.proxy(this.setIdleSlideTimeout, this));

		if (this.options.idleScrollIntroOnly) {
			this.previewItems.one('click', $.proxy(function () {
				this.contentStripe
					.unbind('mouseenter', this.clearIdleSlideTimeout)
					.unbind('mouseleave', this.setIdleSlideTimeout);
			}, this));
		}
	},

	/**
	 * Запустить таймаут "самоскрола".
	 */
	setIdleSlideTimeout: function () {
		this.idleSlideTimeout = setTimeout($.proxy(this.idleSlide, this), this.options.idleScrollInterval);
	},

	/**
	 * Очистить таймаут "самоскрола".
	 */
	clearIdleSlideTimeout: function () {
		clearTimeout(this.idleSlideTimeout);
	},

	/**
	 * Выполнить "самоскрол".
	 */
	idleSlide: function () {
		var toIndex = this.currentIndex[0];
		if (++toIndex > this.lastIndex)
			toIndex = 0;
		this.scroll(toIndex);
		this.setIdleSlideTimeout();
	},

	/**
	 * Возвращает первый активный слайд.
	 * @returns {jQuery} Слайд
	 */
	getCurrentItem: function () {
		return this.getItem(this.currentIndex[0]);
	},

	/**
	 * Возвращает слайд по индексу.
	 * @returns {jQuery} Слайд
	 */
	getItem: function (idx) {
		return $(this.slideItems.get(idx));
	},

	/**
	 * Клик по стрелке "назад"
	 */
	onScrollPrev: function () {
		this.scroll(null, -1);
	},

	/**
	 * Клик по стрелке "вперед"
	 */
	onScrollNext: function () {
		this.scroll(null, 1);
	},

	/**
	 * Клик по конкретной превьюшке
	 */
	onPreviewClick: function (event) {
		this.scroll(this.previewItems.index($(event.target)));
	},

	/**
	 * Выполнить скрол
	 */
	scroll: function (toIndex, delta) {
		this.clearIdleSlideTimeout();
		toIndex = toIndex === null ? this.currentIndex[0] + delta : toIndex;

		var perform = true;
		if (this.beforeScroll(toIndex)) {
			if (typeof this.options.onBeforeScroll == "function") {
				perform = this.options.onBeforeScroll();
			}

			if (perform) {
				this.performScroll(toIndex);
				this.afterScroll(toIndex);
			}

		}
	},

	/**
	 * Действия перед выполнением скрола. Выполняет проверки границ для
	 * слайдера одиночных слайдов.
	 * @returns {Bool} выполнить ли скрол.
	 */
	beforeScroll: function (toIndex) {
		return (toIndex != this.currentIndex[0] && toIndex >= 0 && toIndex <= this.lastIndex);
	},

	/**
	 * Действия после выполнением скрола.
	 */
	afterScroll: function (toIndex) {
		this.currentIndex[0] = toIndex;
		this.scrollPrevControl[this.currentIndex <= 0 ? "addClass" : "removeClass"](this.options.hiddenClassName);
		this.scrollNextControl[this.currentIndex >= this.lastIndex ? "addClass" : "removeClass"](this.options.hiddenClassName);
	},

	/**
	 * Действия после выполнения анимации скрола.
	 */
	afterPerformScroll: function (toIndex) {

	},

	/**
	 * Метод выполняющий непосредственную работу. Реализация зависит
	 * от имплементации.
	 */
	performScroll: function () {

	}
};
