/**
 * @class Слайдер
 */
f.ui.PopRollSlider = function(options, scrollOptions) {
	f.ui.Slider.apply(this, arguments);
	this.initLayout();
};
f.extend(f.ui.PopRollSlider, f.ui.Slider);

f.ui.PopRollSlider.prototype.initLayout = function() {
	this.viewportWidth = this.contentStripe.width();
	this.prevViewportWidth = this.viewportWidth;
	this.sections = [[],[],[]];
	this.visibleWidth = 0;
	this.popIndex = 0;
	var sumWidth = 0;
	this.slideItems.each($.proxy(function(i, elem) {
		var item = $(elem);
		var cwidth = item.outerWidth(true);
		item.data("cwidth", cwidth);
		if(i < this.currentIndex[0] ) {
			item.hide();
			this.sections[0].push(item);
		}
		else {
			sumWidth += cwidth;
			if(sumWidth < this.viewportWidth) {
				this.sections[1].push(item);
				this.visibleWidth += cwidth;
			} else {
				this.sections[2].push(item);
				item.hide();
			}
		}
	}, this));
	this.afterScroll(0);
	$(window).resize($.proxy(this.onResize, this));
}

f.ui.PopRollSlider.prototype.beforeScroll = function(toIndex) {
	return this.sections[this.currentIndex[0] < toIndex ? 2 : 0].length > 0;
};

f.ui.PopRollSlider.prototype.performScroll = function(toIndex) {
	if(this.currentIndex[0] < toIndex) {
		var item = this.sections[1].shift();
		this.visibleWidth -= item.data("cwidth");
		this.sections[0].push( item.hide(this.options.duration) );
		item = this.sections[2].shift();
		this.visibleWidth += item.data("cwidth");
		this.sections[1].push( item.show(this.options.duration) );
	}
	else {
		var item = this.sections[1].pop();
		this.visibleWidth -= item.data("cwidth");
		this.sections[2].unshift( item.hide(this.options.duration) );
		item = this.sections[0].pop();
		this.visibleWidth += item.data("cwidth");
		this.sections[1].unshift( item.show(this.options.duration) );
	}
};

f.ui.PopRollSlider.prototype.afterScroll = function(toIndex) {
	this.currentIndex[0] = this.sections[0].length;
	this.scrollPrevControl[this.sections[0].length ? "removeClass" : "addClass"](this.options.hiddenClassName);
	this.scrollNextControl[this.sections[2].length ? "removeClass" : "addClass"](this.options.hiddenClassName);
};

f.ui.PopRollSlider.prototype.onResize = function() {
	var viewportWidth = this.contentStripe.width();
	if(viewportWidth == this.prevViewportWidth)
		return;

	if(viewportWidth > this.prevViewportWidth) {
		if(this.sections[1].length > this.lastIndex)
			return;

		if(this.sections[2].length) {
			var sumWidth = this.visibleWidth;
			var idx = -1;
			$.each(this.sections[2], function(i, item) {
				sumWidth += item.data("cwidth");
				if(sumWidth > viewportWidth)
					return false;
				idx = i;
			});
			if(idx >=0) {
				for(var i = 0; i <= idx; i++) {
					var item = this.sections[2].shift();
					this.visibleWidth += item.data("cwidth");
					this.sections[1].push( item.show(this.options.duration) );
				}
			}
		}

		if(!this.sections[2].length && this.sections[0].length) {
			var sumWidth = this.visibleWidth;
			var idx = -1;
			this.sections[0].reverse();
			$.each(this.sections[0], function(i, item) {
				sumWidth += item.data("cwidth");
				if(sumWidth > viewportWidth)
					return false;
				idx = i;
			});
			this.sections[0].reverse();
			if(idx >=0) {
				for(var i = 0; i <= idx; i++) {
					var item = this.sections[0].pop();
					this.visibleWidth += item.data("cwidth");
					this.sections[1].unshift( item.show(this.options.duration) );
				}
			}
		}
	}
	else {
		var sumWidth = 0;
		var idx = -1;
		$.each(this.sections[1], function(i, item) {
			sumWidth += item.data("cwidth");
			if(sumWidth > viewportWidth) {
				idx = i;
				return false;
			}
		});
		if(idx >=0) {
			for(var i = this.sections[1].length - 1; i >= idx; i--) {
				var item = this.sections[1].pop();
				this.visibleWidth -= item.data("cwidth");
				this.sections[2].unshift( item.hide() );
			}
		}
	}
	this.afterScroll();
	this.viewportWidth = viewportWidth;
	this.prevViewportWidth = viewportWidth;
};
