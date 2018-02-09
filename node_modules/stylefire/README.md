# Stylefire

### Style-setters for CSS, SVG and scroll, optimized for animation.

[![npm version](https://img.shields.io/npm/v/stylefire.svg?style=flat-square)](https://www.npmjs.com/package/stylefire)
[![npm downloads](https://img.shields.io/npm/dm/stylefire.svg?style=flat-square)](https://www.npmjs.com/package/stylefire)
[![Twitter Follow](https://img.shields.io/twitter/follow/espadrine.svg?style=social&label=Follow)](http://twitter.com/popmotionjs)

- **Tiny:** 4kb max, and all stylers can be imported separately.
- **Fast:** Optimized for use with animation libraries, Stylefire batches rendering once per frame (this can be selectively overridden).
- **Simple transforms:** Replaces the [confusing SVG `transform` model](https://css-tricks.com/transforms-on-svg-elements/) with the simpler CSS model.
- **Line drawing:** Full support for SVG path line drawing, simplified to use percentage-based measurements.
- **Cross-browser:** Detects and uses vendor CSS prefixes when necessary.
- **Extendable:** Easy to create performant stylers for other rendering targets.
- **Type-safe:** Written in TypeScript, with Flow definitions available from [flow-typed](https://github.com/flowtype/flow-typed). 'Cause animators love typesafety :)

## Install

```bash
npm install stylefire --save
```

## [Documentation](https://popmotion.io/api/stylefire)
- [CSS](https://popmotion.io/api/css)
- [SVG](https://popmotion.io/api/svg)
- [DOM Scroll](https://popmotion.io/api/scroll)

### Setting CSS properties

Stylefire will automatically detect and set **vendor prefixes** for newer CSS properties.

It also allows you to:
- Set `transform` as seperate properties,
- Provides `x`, `y`, and `z` shorthands for `translate`, and
- Follows the latest CSS spec in ordering seperate transform props by `translate`, `scale` and `rotate`.

```javascript
import css from 'stylefire/css';

const div = document.querySelector('div');
const divStyler = css(div);

divStyler.set({
  scale: 0.5,
  x: 100,
  y: 100,
  rotate: 45,
  background: '#f00'
});
```

`transform` is still supported for more complex transformations.

**[Demo on CodePen](https://codepen.io/popmotion/pen/PJKrQo)**

### Line drawing

Stylefire simplifies [SVG line drawing](https://css-tricks.com/svg-line-animation-works/). It works out the total path length and allows you to set `pathLength`, `pathSpacing` and `pathOffset` properties as percentages:

```javascript
import { tween } from 'popmotion';
import svg from 'stylefire/svg';

const path = document.querySelector('path');
const pathStyler = svg(path);

tween({ to: 100 })
  .start((v) => pathStyler.set('pathLength', v));
```

**[Demo on CodePen](https://codepen.io/popmotion/pen/JryxRb)**

`stroke-dasharray` and `stroke-dashoffset` are still supported if you wish to work with these attributes directly.

### Overriding render batching

By default, firing `set` will **schedule** a render on the next available frame. This way, we batch renders and help prevent [layout thrashing](https://developers.google.com/web/fundamentals/performance/rendering/avoid-large-complex-layouts-and-layout-thrashing).

This behaviour can be manually overridden with the `render` method. 

```javascript
import css from 'stylefire/css';

const div = document.querySelector('div');
const divStyler = css(div);

divStyler
  .set({ width: 500 })
  .render();

console.log(div.offsetWidth); // 500

divStyler.set({ width: 100 });

console.log(div.offsetWidth); // 500

divStyler.render();

console.log(div.offsetWidth); // 100
```

**[Demo on CodePen](https://codepen.io/popmotion/pen/pWrGym)**

## Supported by
<img src="https://user-images.githubusercontent.com/7850794/31086561-107648a4-a792-11e7-88bf-a0c0cfcafb79.png" width="300" alt="DriveTribe Open Source">
