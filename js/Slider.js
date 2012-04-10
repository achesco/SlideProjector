// construct
var Slider = function(options, scrollOptions) {

    this.options = {};
    $.extend(this.options, this.defaultOptions, options||{});

    this.scrollOptions = {};
    $.extend(this.scrollOptions, this['defaultOptions_' + this.options.scrollType], scrollOptions||{});

    this.slideItems = $(this.options.slideItems);
    this.contentStripe = $(this.options.contentStripe);

    this.currentIndex = 0;
    this.currentItem = $(this.slideItems.get(this.currentIndex));
    this.lastIndex = this.slideItems.length - 1;
    
    // init scroll style
    this['initScroll_' + this.options.scrollType]();
    this._scroll = this['scroll_' + this.options.scrollType];
    
    // init prev-next controlls and show next (optional)
    this.scrollPrevControl = $(this.options.scrollPrevControl).click($.proxy(this.onScrollPrev, this));
    this.scrollNextControl = $(this.options.scrollNextControl).click($.proxy(this.onScrollNext, this)).removeClass(this.options.hiddenClassName);
    
    // init previews controls (optional)
    this.previewItems = $(this.options.previewItems).click($.proxy(this.onPreviewClick, this));
    
    // init scroll on idle (optional) 
    this.options.idleScroll && this.initIdleScroll();
}

// 'roll' type scroll performer
Slider.prototype.initScroll_roll = function() {
	this.lastIndex -= (this.scrollOptions.showSlides - 1);
	this.stepWidth = this.currentItem.outerWidth(true);
}
// 'fade' type scroll performer
Slider.prototype.initScroll_fade = function() {
	$(this.slideItems.css('opacity', 0).get(this.currentIndex)).css('opacity', 1);
}

// init scroll on idle 
Slider.prototype.initIdleScroll = function() {
	this.idleSlideTimeout = null;
	this.setIdleSlideTimeout();
	this.contentStripe
		.mouseenter($.proxy(this.clearIdleSlideTimeout, this))
		.mouseleave($.proxy(this.setIdleSlideTimeout, this));

	if(this.options.idleScrollIntroOnly) {
		this.previewItems.one('click', $.proxy(function() {
			this.contentStripe
				.unbind('mouseenter', this.clearIdleSlideTimeout)
				.unbind('mouseleave', this.setIdleSlideTimeout);
		}, this));
	}
}
Slider.prototype.clearIdleSlideTimeout = function() {
	clearTimeout(this.idleSlideTimeout);
}
Slider.prototype.setIdleSlideTimeout = function() {
	this.idleSlideTimeout = setTimeout($.proxy(this.idleSlide, this), this.options.idleScrollInterval);
}
Slider.prototype.idleSlide = function() {
	var toIndex = this.currentIndex + 1;
	if(toIndex > this.lastIndex)
		toIndex = 0;
	this.scroll(toIndex);
	this.setIdleSlideTimeout();
}

// prev-next controls handlers
Slider.prototype.onScrollPrev = function() {
	this.scroll(this.currentIndex-1);
}
Slider.prototype.onScrollNext = function() {
	this.scroll(this.currentIndex+1);
}

// previews handlers
Slider.prototype.onPreviewClick = function(event) { 
	this.scroll(this.previewItems.index($(event.target)));
}

// common scroll performer
Slider.prototype.scroll = function(toIndex) {
	clearTimeout(this.idleSlideTimeout)
	if(toIndex != this.currentIndex && toIndex >=0 && toIndex <= this.lastIndex && !this.contentStripe.is(':animated')) {
		var perform = true;
		var nextCurrentItem = $(this.slideItems.get(toIndex));
		if(typeof this.options.onBeforeScroll == "function")
			perform = this.options.onBeforeScroll(this.currentItem, nextCurrentItem);
		if(perform) {
			this._scroll(toIndex, nextCurrentItem);
			this.currentIndex = toIndex;
			this.currentItem = nextCurrentItem;
			this.updateBefore();
		}
	}
}
// 'roll' type scroll performer 
Slider.prototype.scroll_roll = function(toIndex, nextCurrentItem) {
	this.contentStripe
		.animate({ left: -toIndex * this.stepWidth }, {
			queue: false,
			duration: this.options.duration,
			complete: $.proxy(this.updateAfter, this)
		});
}
// 'fade' type scroll performer
Slider.prototype.scroll_fade = function(toIndex, nextCurrentItem) {
	this.currentItem.animate({ opacity: 0 }, {
		queue: false,
		duration: this.options.duration
	});

	nextCurrentItem.animate({ opacity: 1 }, {
		queue: false,
		duration: this.options.duration,
		complete: $.proxy(this.updateAfter, this)
	});
}
// gui updater
Slider.prototype.updateBefore = function() {
	this.scrollPrevControl[this.currentIndex <= 0 ? 'addClass' : 'removeClass'](this.options.hiddenClassName);
	this.scrollNextControl[this.currentIndex >= this.lastIndex ? 'addClass' : 'removeClass'](this.options.hiddenClassName);

	$(this.previewItems.removeClass(this.options.previewSelectedClassName).get(this.currentIndex))
		.addClass(this.options.previewSelectedClassName);
}
// gui updater
Slider.prototype.updateAfter = function() {
	this.slideItems.removeClass(this.options.selectedClassName);
	this.currentItem.addClass(this.options.selectedClassName);
	
	if(typeof this.options.onAfterScroll == "function")
		this.options.onAfterScroll(this.currentItem);
}

// default Slider options
Slider.prototype.defaultOptions = {
	scrollType: 'roll' // sroll type ('roll', 'fade')
	, contentStripe: new jQuery
	, slideItems: new jQuery
	, scrollPrevControl: new jQuery
	, scrollNextControl: new jQuery
	, previewItems: null
	, duration: 1000
	, idleScroll: false
	, idleScrollInterval: 4000
	, idleScrollIntroOnly: true
	, onBeforeScroll: null
	, onAfterScroll: null
	, hiddenClassName: 'hidden'
	, selectedClassName: 'selected'
	, previewSelectedClassName: 'selected'
};
Slider.prototype.defaultOptions_roll = {
	showSlides: 1
};
Slider.prototype.defaultOptions_fade = {};
