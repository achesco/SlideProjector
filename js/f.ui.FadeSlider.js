/**
 * @class Слайдер
 */
f.ui.FadeSlider = function(options, scrollOptions) {
	this.parent = f.ui.FadeSlider.superclass;
	this.parent.constructor.call(this, options, scrollOptions);
	
	$(this.slideItems.css('opacity', 0).addClass(this.options.hiddenClassName)
		.get(this.currentIndex)).css('opacity', 1).removeClass(this.options.hiddenClassName);

	$(this.previewItems.removeClass(this.options.previewSelectedClassName).get(this.currentIndex[0]))
		.addClass(this.options.previewSelectedClassName);
};
f.extend(f.ui.FadeSlider, f.ui.Slider);

f.ui.FadeSlider.prototype.scrollOptions = {
	queueSlidesAnimation: false
};

f.ui.FadeSlider.prototype.afterScroll = function(toIndex) {
	this.parent.afterScroll.call(this, toIndex);
	$(this.previewItems.removeClass(this.options.previewSelectedClassName).get(toIndex))
		.addClass(this.options.previewSelectedClassName);
}

f.ui.FadeSlider.prototype.performScroll = function(toIndex) {
	if(this.scrollOptions.queueSlidesAnimation) {
		this.performScroll_out($.proxy(function() {
			this.performScroll_in(toIndex)
		}, this));
	} else {
		this.performScroll_out();
		this.performScroll_in(toIndex);
	}
};

f.ui.FadeSlider.prototype.performScroll_out = function(onComplete) {
	var item = this.getCurrentItem();
	item.animate({ opacity: 0 }, {
		queue: false,
		duration: this.options.duration,
		complete: $.proxy(function() {
			item.addClass(this.options.hiddenClassName);
			typeof onComplete == "function" && onComplete();
		}, this)
	});
};

f.ui.FadeSlider.prototype.performScroll_in = function(toIndex) {
	this.getItem(toIndex).removeClass(this.options.hiddenClassName).animate({ opacity: 1 }, {
		queue: false,
		duration: this.options.duration,
		complete: $.proxy(this.afterPerformScroll, this)
	});
};
