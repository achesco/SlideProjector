/**
 * @class Слайдер
 */
f.ui.FadeSlider = function(options, scrollOptions) {
	this.parent = f.ui.FadeSlider.superclass;
	this.parent.constructor.call(this, options, scrollOptions);
	$(this.slideItems.css('opacity', 0).get(this.currentIndex)).css('opacity', 1);
};
f.extend(f.ui.FadeSlider, f.ui.Slider);

f.ui.FadeSlider.prototype.afterScroll = function(toIndex) {
	$(this.previewItems.removeClass(this.options.previewSelectedClassName).get(toIndex))
		.addClass(this.options.previewSelectedClassName);
	this.parent.afterScroll.call(this, toIndex);
}

f.ui.FadeSlider.prototype.performScroll = function(toIndex) {
	this.getCurrentItem().animate({ opacity: 0 }, {
		queue: false,
		duration: this.options.duration
	});
	this.getItem(toIndex).animate({ opacity: 1 }, {
		queue: false,
		duration: this.options.duration,
		complete: $.proxy(this.afterPerformScroll, this)
	});
};

