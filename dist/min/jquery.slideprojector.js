!function(a){var b,c,d={};b=a.fn.slideprojector=function(b,c){return this.each(function(){return a.data(this,"slideprojector")||a.data(this,"slideprojector",new d[b.implementation](this,b,c)),this})},b.defaults={implementation:null,slideItems:null,scrollPrevControl:null,scrollNextControl:null,selectedIndex:0,cycleSlides:!0,previewItems:null,duration:1e3,idleScroll:!1,idleScrollInterval:4e3,idleScrollIntroOnly:!0,onBeforeScroll:null,onAfterScroll:null,hiddenClassName:"sp-hidden",previewSelectedClassName:"sp-selected"},b.registerImplementation=function(a,b){var e=function(){};e.prototype=c.prototype,a.prototype=new e,a.prototype.constructor=a,a.prototype.__super=c.prototype,a.prototype.__super.constructor=c,d[b]=a},c=function(c,d,e){this.options=a.extend({},b.defaults,d),this.implOptions=a.extend({},this.getImplementationDefaults(),e),this.slideItems=a(this.options.slideItems),this.contentStripe=a(c),this.currentIndex=[this.options.selectedIndex||0],this.lastIndex=this.slideItems.length-1,this.scrollPrevControl=a(this.options.scrollPrevControl),this.scrollNextControl=a(this.options.scrollNextControl),this.previewItems=a(this.options.previewItems),this.initUserEvents(),this.options.idleScroll&&this.initIdleScroll(),this.updatePrevNext()},c.prototype={getImplementationDefaults:function(){return{}},initUserEvents:function(){this.scrollPrevControl.click(this.onScrollPrev.bind(this)),this.scrollNextControl.click(this.onScrollNext.bind(this)),this.previewItems.click(this.onPreviewClick.bind(this))},initIdleScroll:function(){this.idleSlideTimeout=null,this.setIdleSlideTimeout(),this.contentStripe.mouseenter(this.clearIdleSlideTimeout.bind(this)).mouseleave(this.setIdleSlideTimeout.bind(this)),this.options.idleScrollIntroOnly&&this.previewItems.one("click",function(){this.contentStripe.unbind("mouseenter",this.clearIdleSlideTimeout).unbind("mouseleave",this.setIdleSlideTimeout)}.bind(this))},setIdleSlideTimeout:function(){this.idleSlideTimeout=setTimeout(this.idleSlide.bind(this),this.options.idleScrollInterval)},clearIdleSlideTimeout:function(){clearTimeout(this.idleSlideTimeout)},idleSlide:function(){var a=this.currentIndex[0];++a>this.lastIndex&&(a=0),this.scroll(a),this.setIdleSlideTimeout()},getCurrentItem:function(){return this.getItem(this.currentIndex[0])},getItem:function(b){return a(this.slideItems.get(b))},onScrollPrev:function(){this.scroll(null,-1)},onScrollNext:function(){this.scroll(null,1)},onPreviewClick:function(b){this.scroll(this.previewItems.index(a(b.target)))},scroll:function(a,b){var c=!0;this.clearIdleSlideTimeout(),a=null===a||isNaN(Number(a))?this.currentIndex[0]+b:a,a=this.options.cycleSlides?0>a?this.lastIndex:a>this.lastIndex?0:a:a,this.beforeScroll(a)&&("function"==typeof this.options.onBeforeScroll&&(c=this.options.onBeforeScroll()),c&&(this.performScroll(a),this.afterScroll(a),"function"==typeof this.options.onAfterScroll&&this.options.onAfterScroll.call(this)))},beforeScroll:function(a){return a!==this.currentIndex[0]&&a>=0&&a<=this.lastIndex},afterScroll:function(b){this.currentIndex[0]=b,this.updatePrevNext(),a(this.previewItems.removeClass(this.options.previewSelectedClassName).get(b)).addClass(this.options.previewSelectedClassName)},updatePrevNext:function(){this.options.cycleSlides||(this.scrollPrevControl[this.currentIndex<=0?"addClass":"removeClass"](this.options.hiddenClassName),this.scrollNextControl[this.currentIndex>=this.lastIndex?"addClass":"removeClass"](this.options.hiddenClassName))},performScroll:function(){throw"performScroll should be implemented"}}}(jQuery);