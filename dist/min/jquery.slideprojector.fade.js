!function(a){var b=function(){this.__super.constructor.apply(this,arguments),a(this.slideItems.css("opacity",0).addClass(this.options.hiddenClassName).get(this.currentIndex)).css("opacity",1).removeClass(this.options.hiddenClassName),a(this.previewItems.removeClass(this.options.previewSelectedClassName).get(this.currentIndex[0])).addClass(this.options.previewSelectedClassName),this.inProgress=!1};a.fn.slideprojector.registerImplementation(b,"fade"),a.extend(b.prototype,{getImplementationDefaults:function(){return{queueSlidesAnimation:!1}},beforeScroll:function(){return!this.inProgress&&this.__super.beforeScroll.apply(this,arguments)},performScroll:function(a){this.implOptions.queueSlidesAnimation?this.performScroll_out(this.performScroll_in.bind(this,a)):(this.performScroll_out(),this.performScroll_in(a))},performScroll_out:function(a){var b=this.getCurrentItem();this.inProgress=!0,b.animate({opacity:0},{queue:!1,duration:this.options.duration,complete:function(){b.addClass(this.options.hiddenClassName),"function"==typeof a&&a()}.bind(this)})},performScroll_in:function(a){this.getItem(a).removeClass(this.options.hiddenClassName).animate({opacity:1},{queue:!1,duration:this.options.duration,complete:function(){this.inProgress=!1}.bind(this)})}})}(jQuery);