Slider
======

Two slider implementations: FadeSlider and PopRollSlider. See examples to figure it out.

Uses f.extend from https://github.com/triangle/fundament

### Possible options

`new j.ui._SliderImplementation_(CommonSliderOptions, ConcreteImplementationOptions);`

#### Common

```js
{
	contentStripe: null, // String|Element|jQuery
	slideItems: null, // String|Element|jQuery
	scrollPrevControl: null, // String|Element|jQuery
	scrollNextControl: null, // String|Element|jQuery
	previewItems: null,
	duration: 1000,
	idleScroll: false,
	idleScrollInterval: 4000,
	idleScrollIntroOnly: true,
	onBeforeScroll: null,
	onAfterScroll: null,
	hiddenClassName: 'g-hidden',
	selectedClassName: 'selected',
	previewSelectedClassName: "selected",
}
```

#### FadeSlider

```js
{
	queueSlidesAnimation: false
}
```

#### PopRollSlider

Doesn't has any specific options.
