# SlideProjector 0.3

Extremely lightweight jQuery plugin to slide the slides in different ways. Two implementations are available for the 
moment. Can be extended with custom implementations.

## fade
Simple transition through fade-in-out. With optional preview items (or just some bullets). 
[Demo](http://codepen.io/achesco/full/dogLYV).

## slide
Simple transition through slide in. With optional preview items (or just some bullets). 
[Demo](http://codepen.io/achesco/full/GJYLZB)

## poproll
Supports responsive to resize stripe of variable width slides. 
[Demo](http://codepen.io/achesco/full/MwPRja)

## Usage

Available with npm and bower.

`npm install SlideProjector`

`bower install SlideProjector`

Requires jquery (surprisingly)

`<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>`

### Scripts

Use fully packed script `dist/jquery.slideprojector.full.js` or `dist/jquery.slideprojector.js` with any 
of the following: `dist/jquery.slideprojector.(fade|slide|poproll).js`.

Init with: `$('#content-stripe').slideprojector(commonOptions, implementationOptions);`

Access with: `$('#content-stripe').data('slideprojector').onScrollNext();`

### Setup common options default values

Available through `$.fn.slideprojector.defaults`. For instance to set default animation duration to 750ms, use: 
`$.fn.slideprojector.defaults.duration = 750`

### commonOptions

* `{String} implementation` Implementaon name. 'fade' and 'poproll' are available. 
More can be added with `$.fn.slideprojector.registerImplementation(impl, name)`
* `{String|Element|jQuery} slideItems`
* `{String|Element|jQuery} [scrollPrevControl]`
* `{String|Element|jQuery} [scrollNextControl]`
* `{Number} [selectedIndex=0]` Initially selected item index
* `{Boolean} [cycleSlides=true]` Cycle slides from last to first and otherwise
* `{String|Element|jQuery} [previewItems]`
* `{Number} [duration=1000]` Slides switch transition duration (ms)
* `{Boolean} [idleScroll=false]` Enable spontaneous periodical scroll on idle
* `{Number} [idleScrollInterval=4000]` Idle interval (ms)
* `{Function} [onBeforeScroll]` Before scroll callback, can cancel scroll with `return false`
* `{Function} [onAfterScroll]` After scroll callback
* `{String} [hiddenClassName='sp-hidden']` Class name to hide elements
* `{String} [previewSelectedClassName='sp-selected']` Class name for active preview item

### implementationOptions
#### fade

* `{Boolean} [queueSlidesAnimation=false]` Perform fade in for active item after fade out of previos slide has completed

#### slide

* `{Number} [basicZIndex=0]` Basic CSS z-index property value for slide items
* `{Number} [animationZIndex=1]` z-index value to set during slide animation to make new slide ontop of current one

#### poproll

No specific options available.
Following commonOptions will be igonred: `previewItems`, `previewSelectedClassName`, `cycleSlides`.

### Custom implementations

```js
var impl = function () {
    this.__super.constructor.apply(this, arguments);
};

$.fn.slideprojector.registerImplementation(impl, 'custom');

$.extend(impl.prototype, {

    getImplementationDefaults: function () {
        return {
            logFormat: '[%s] %s perfored'
        };
    },

    afterScroll: function (toIndex) {
        this.__super.afterScroll.call(this, toIndex);
        console.log(this.implOptions.logFormat, 'scroll', new Date());
    }
});
```

Custom implementation now available with

```js
$('#content-stripe').slideprojector({
    implementation: 'custom'
});
```
