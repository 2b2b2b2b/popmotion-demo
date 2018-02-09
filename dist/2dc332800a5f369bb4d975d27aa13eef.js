// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
require = (function (modules, cache, entry) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof require === "function" && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof require === "function" && require;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }
      
      localRequire.resolve = resolve;

      var module = cache[name] = new newRequire.Module;

      modules[name][0].call(module.exports, localRequire, module, module.exports);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module() {
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  // Override the current require with this new one
  return newRequire;
})({211:[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var hasRAF = typeof window !== 'undefined' && window.requestAnimationFrame !== undefined;
var prevTime = 0;
var onNextFrame = hasRAF
    ? function (callback) { return window.requestAnimationFrame(callback); }
    : function (callback) {
        var currentTime = Date.now();
        var timeToCall = Math.max(0, 16.7 - (currentTime - prevTime));
        prevTime = currentTime + timeToCall;
        setTimeout(function () { return callback(prevTime); }, timeToCall);
    };
exports.default = onNextFrame;
//# sourceMappingURL=on-next-frame.js.map
},{}],210:[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createRenderStep(startRenderLoop) {
    var functionsToRun = [];
    var functionsToRunNextFrame = [];
    var numThisFrame = 0;
    var isProcessing = false;
    var i = 0;
    return {
        cancel: function (callback) {
            var indexOfCallback = functionsToRunNextFrame.indexOf(callback);
            if (indexOfCallback !== -1) {
                functionsToRunNextFrame.splice(indexOfCallback, 1);
            }
        },
        process: function () {
            isProcessing = true;
            _a = [functionsToRunNextFrame, functionsToRun], functionsToRun = _a[0], functionsToRunNextFrame = _a[1];
            functionsToRunNextFrame.length = 0;
            numThisFrame = functionsToRun.length;
            for (i = 0; i < numThisFrame; i++) {
                functionsToRun[i]();
            }
            isProcessing = false;
            var _a;
        },
        schedule: function (callback, immediate) {
            if (immediate === void 0) { immediate = false; }
            startRenderLoop();
            var addToCurrentBuffer = immediate && isProcessing;
            var buffer = addToCurrentBuffer ? functionsToRun : functionsToRunNextFrame;
            if (buffer.indexOf(callback) === -1) {
                buffer.push(callback);
                if (addToCurrentBuffer) {
                    numThisFrame = functionsToRun.length;
                }
            }
        },
    };
}
exports.default = createRenderStep;
//# sourceMappingURL=create-render-step.js.map
},{}],209:[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var on_next_frame_1 = require("./on-next-frame");
var create_render_step_1 = require("./create-render-step");
var HAS_PERFORMANCE_NOW = typeof performance !== 'undefined' && performance.now !== undefined;
exports.currentTime = HAS_PERFORMANCE_NOW ? function () { return performance.now(); } : function () { return Date.now(); };
var willRenderNextFrame = false;
var MAX_ELAPSED = 40;
var defaultElapsed = 16.7;
var useDefaultElapsed = true;
var currentFramestamp = 0;
var elapsed = 0;
function startRenderLoop() {
    if (willRenderNextFrame)
        return;
    willRenderNextFrame = true;
    useDefaultElapsed = true;
    on_next_frame_1.default(processFrame);
}
var frameStart = create_render_step_1.default(startRenderLoop);
var frameUpdate = create_render_step_1.default(startRenderLoop);
var frameRender = create_render_step_1.default(startRenderLoop);
var frameEnd = create_render_step_1.default(startRenderLoop);
function processFrame(framestamp) {
    willRenderNextFrame = false;
    elapsed = useDefaultElapsed
        ? defaultElapsed
        : Math.max(Math.min(framestamp - currentFramestamp, MAX_ELAPSED), 1);
    if (!useDefaultElapsed)
        defaultElapsed = elapsed;
    currentFramestamp = framestamp;
    frameStart.process();
    frameUpdate.process();
    frameRender.process();
    frameEnd.process();
    if (willRenderNextFrame)
        useDefaultElapsed = false;
}
exports.onFrameStart = frameStart.schedule;
exports.onFrameUpdate = frameUpdate.schedule;
exports.onFrameRender = frameRender.schedule;
exports.onFrameEnd = frameEnd.schedule;
exports.cancelOnFrameStart = frameStart.cancel;
exports.cancelOnFrameUpdate = frameUpdate.cancel;
exports.cancelOnFrameRender = frameRender.cancel;
exports.cancelOnFrameEnd = frameEnd.cancel;
exports.timeSinceLastFrame = function () { return elapsed; };
exports.currentFrameTime = function () { return currentFramestamp; };
//# sourceMappingURL=index.js.map
},{"./on-next-frame":211,"./create-render-step":210}],208:[function(require,module,exports) {
"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var clamp = function (min, max) { return function (v) { return Math.max(Math.min(v, max), min); }; };
var contains = function (term) { return function (v) { return (typeof term === 'string' && v.indexOf(term) !== -1); }; };
var createUnitType = function (unit) { return ({
    test: contains(unit),
    parse: parseFloat,
    transform: function (v) { return "" + v + unit; }
}); };
var isFirstChars = function (term) { return function (v) { return (typeof term === 'string' && v.indexOf(term) === 0); }; };
exports.getValueFromFunctionString = function (value) { return value.substring(value.indexOf('(') + 1, value.lastIndexOf(')')); };
exports.splitCommaDelimited = function (value) { return typeof value === 'string' ? value.split(/,\s*/) : [value]; };
function splitColorValues(terms) {
    var numTerms = terms.length;
    return function (v) {
        var values = {};
        var valuesArray = exports.splitCommaDelimited(exports.getValueFromFunctionString(v));
        for (var i = 0; i < numTerms; i++) {
            values[terms[i]] = (valuesArray[i] !== undefined) ? parseFloat(valuesArray[i]) : 1;
        }
        return values;
    };
}
exports.splitColorValues = splitColorValues;
exports.number = {
    test: function (v) { return typeof v === 'number'; },
    parse: parseFloat,
    transform: function (v) { return v; }
};
exports.alpha = __assign({}, exports.number, { transform: clamp(0, 1) });
exports.degrees = createUnitType('deg');
exports.percent = createUnitType('%');
exports.px = createUnitType('px');
exports.scale = __assign({}, exports.number, { default: 1 });
var FLOAT_REGEX = /(-)?(\d[\d\.]*)/g;
var generateToken = function (token) { return '${' + token + '}'; };
exports.complex = {
    test: function (v) {
        var matches = v.match && v.match(FLOAT_REGEX);
        return (matches !== undefined && matches.constructor === Array && matches.length > 1);
    },
    parse: function (v) {
        var parsedValue = {};
        v.match(FLOAT_REGEX).forEach(function (value, i) { return parsedValue[i] = parseFloat(value); });
        return parsedValue;
    },
    createTransformer: function (prop) {
        var counter = 0;
        var template = prop.replace(FLOAT_REGEX, function () { return generateToken("" + counter++); });
        return function (v) {
            var output = template;
            for (var key in v) {
                if (v.hasOwnProperty(key)) {
                    output = output.replace(generateToken(key), v[key].toString());
                }
            }
            return output;
        };
    }
};
var clampRgbUnit = clamp(0, 255);
exports.rgbUnit = __assign({}, exports.number, { transform: function (v) { return Math.round(clampRgbUnit(v)); } });
var rgbaTemplate = function (_a) {
    var red = _a.red, green = _a.green, blue = _a.blue, _b = _a.alpha, alpha = _b === void 0 ? 1 : _b;
    return "rgba(" + red + ", " + green + ", " + blue + ", " + alpha + ")";
};
exports.rgba = {
    test: isFirstChars('rgb'),
    parse: splitColorValues(['red', 'green', 'blue', 'alpha']),
    transform: function (_a) {
        var red = _a.red, green = _a.green, blue = _a.blue, alpha = _a.alpha;
        return rgbaTemplate({
            red: exports.rgbUnit.transform(red),
            green: exports.rgbUnit.transform(green),
            blue: exports.rgbUnit.transform(blue),
            alpha: alpha
        });
    }
};
var hslaTemplate = function (_a) {
    var hue = _a.hue, saturation = _a.saturation, lightness = _a.lightness, _b = _a.alpha, alpha = _b === void 0 ? 1 : _b;
    return "hsla(" + hue + ", " + saturation + ", " + lightness + ", " + alpha + ")";
};
exports.hsla = {
    test: isFirstChars('hsl'),
    parse: splitColorValues(['hue', 'saturation', 'lightness', 'alpha']),
    transform: function (_a) {
        var hue = _a.hue, saturation = _a.saturation, lightness = _a.lightness, alpha = _a.alpha;
        return hslaTemplate({
            hue: Math.round(hue),
            saturation: exports.percent.transform(saturation),
            lightness: exports.percent.transform(lightness),
            alpha: alpha
        });
    }
};
exports.hex = __assign({}, exports.rgba, { test: isFirstChars('#'), parse: function (v) {
        var r, g, b;
        if (v.length > 4) {
            r = v.substr(1, 2);
            g = v.substr(3, 2);
            b = v.substr(5, 2);
        }
        else {
            r = v.substr(1, 1);
            g = v.substr(2, 1);
            b = v.substr(3, 1);
            r += r;
            g += g;
            b += b;
        }
        return {
            red: parseInt(r, 16),
            green: parseInt(g, 16),
            blue: parseInt(b, 16),
            alpha: 1
        };
    } });
var isRgba = function (v) { return v.red !== undefined; };
var isHsla = function (v) { return v.hue !== undefined; };
exports.color = {
    test: function (v) { return exports.rgba.test(v) || exports.hsla.test(v) || exports.hex.test(v); },
    parse: function (v) {
        if (exports.rgba.test(v)) {
            return exports.rgba.parse(v);
        }
        else if (exports.hsla.test(v)) {
            return exports.hsla.parse(v);
        }
        else if (exports.hex.test(v)) {
            return exports.hex.parse(v);
        }
        return v;
    },
    transform: function (v) {
        if (isRgba(v)) {
            return exports.rgba.transform(v);
        }
        else if (isHsla(v)) {
            return exports.hsla.transform(v);
        }
        return v;
    }
};
//# sourceMappingURL=index.js.map
},{}],27:[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var isNum = function (v) { return typeof v === 'number'; };
exports.isPoint = function (point) {
    return point.x !== undefined && point.y !== undefined;
};
exports.isPoint3D = function (point) {
    return point.z !== undefined;
};
var toDecimal = function (num, precision) {
    if (precision === void 0) { precision = 2; }
    precision = Math.pow(10, precision);
    return Math.round(num * precision) / precision;
};
var ZERO_POINT = {
    x: 0,
    y: 0,
    z: 0
};
var distance1D = function (a, b) { return Math.abs(a - b); };
exports.angle = function (a, b) {
    if (b === void 0) { b = ZERO_POINT; }
    return exports.radiansToDegrees(Math.atan2(b.y - a.y, b.x - a.x));
};
exports.degreesToRadians = function (degrees) { return degrees * Math.PI / 180; };
exports.dilate = function (a, b, dilation) { return a + ((b - a) * dilation); };
exports.distance = function (a, b) {
    if (b === void 0) { b = ZERO_POINT; }
    if (isNum(a) && isNum(b)) {
        return distance1D(a, b);
    }
    else if (exports.isPoint(a) && exports.isPoint(b)) {
        var xDelta = distance1D(a.x, b.x);
        var yDelta = distance1D(a.y, b.y);
        var zDelta = (exports.isPoint3D(a) && exports.isPoint3D(b)) ? distance1D(a.z, b.z) : 0;
        return Math.sqrt((Math.pow(xDelta, 2)) + (Math.pow(yDelta, 2)) + (Math.pow(zDelta, 2)));
    }
    return 0;
};
exports.getProgressFromValue = function (from, to, value) {
    return (value - from) / (to - from);
};
exports.getValueFromProgress = function (from, to, progress) {
    return (-progress * from) + (progress * to) + from;
};
exports.pointFromAngleAndDistance = function (origin, angle, distance) {
    angle = exports.degreesToRadians(angle);
    return {
        x: distance * Math.cos(angle) + origin.x,
        y: distance * Math.sin(angle) + origin.y
    };
};
exports.radiansToDegrees = function (radians) { return radians * 180 / Math.PI; };
exports.smooth = function (newValue, oldValue, duration, smoothing) {
    if (smoothing === void 0) { smoothing = 0; }
    return toDecimal(oldValue + (duration * (newValue - oldValue) / Math.max(smoothing, duration)));
};
exports.speedPerFrame = function (xps, frameDuration) {
    return (isNum(xps)) ? xps / (1000 / frameDuration) : 0;
};
exports.speedPerSecond = function (velocity, frameDuration) {
    return frameDuration ? velocity * (1000 / frameDuration) : 0;
};
exports.stepProgress = function (steps, progress) {
    var segment = 1 / (steps - 1);
    var target = 1 - (1 / steps);
    var progressOfTarget = Math.min(progress / target, 1);
    return Math.floor(progressOfTarget / segment) * segment;
};
//# sourceMappingURL=calc.js.map
},{}],29:[function(require,module,exports) {
"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var framesync_1 = require("framesync");
var style_value_types_1 = require("style-value-types");
var calc_1 = require("./calc");
var noop = function (v) { return v; };
exports.appendUnit = function (unit) { return function (v) { return "" + v + unit; }; };
exports.applyOffset = function (from, to) {
    var hasReceivedFrom = true;
    if (to === undefined) {
        to = from;
        hasReceivedFrom = false;
    }
    var getOffset = function (v) { return v - from; };
    var applyOffsetTo = function (v) { return v + to; };
    return function (v) {
        if (hasReceivedFrom) {
            return applyOffsetTo(getOffset(v));
        }
        else {
            from = v;
            hasReceivedFrom = true;
            return to;
        }
    };
};
var blend = function (from, to, v) {
    var fromExpo = from * from;
    var toExpo = to * to;
    return Math.sqrt(v * (toExpo - fromExpo) + fromExpo);
};
exports.blendColor = function (from, to) {
    var fromColor = (typeof from === 'string') ? style_value_types_1.color.parse(from) : from;
    var toColor = (typeof to === 'string') ? style_value_types_1.color.parse(to) : to;
    var blended = __assign({}, fromColor);
    var blendFunc = (from.hue !== undefined ||
        typeof from === 'string' && style_value_types_1.hsla.test(from)) ? calc_1.getValueFromProgress
        : blend;
    return function (v) {
        blended = __assign({}, blended);
        for (var key in blended) {
            if (key !== 'alpha' && blended.hasOwnProperty(key)) {
                blended[key] = blendFunc(fromColor[key], toColor[key], v);
            }
        }
        blended.alpha = calc_1.getValueFromProgress(fromColor.alpha, toColor.alpha, v);
        return blended;
    };
};
exports.clamp = function (min, max) { return function (v) { return Math.min(Math.max(v, min), max); }; };
var combineFunctions = function (a, b) { return function (v) { return b(a(v)); }; };
exports.pipe = function () {
    var transformers = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        transformers[_i] = arguments[_i];
    }
    return transformers.reduce(combineFunctions);
};
exports.conditional = function (check, apply) { return function (v) { return check(v) ? apply(v) : v; }; };
exports.interpolate = function (input, output, rangeEasing) {
    var rangeLength = input.length;
    var finalIndex = rangeLength - 1;
    if (input[0] > input[finalIndex]) {
        input.reverse();
        output.reverse();
    }
    return function (v) {
        if (v <= input[0]) {
            return output[0];
        }
        if (v >= input[finalIndex]) {
            return output[finalIndex];
        }
        var i = 1;
        for (; i < rangeLength; i++) {
            if (input[i] > v || i === finalIndex) {
                break;
            }
        }
        var progressInRange = calc_1.getProgressFromValue(input[i - 1], input[i], v);
        var easedProgress = (rangeEasing) ? rangeEasing[i - 1](progressInRange) : progressInRange;
        return calc_1.getValueFromProgress(output[i - 1], output[i], easedProgress);
    };
};
exports.generateStaticSpring = function (alterDisplacement) {
    if (alterDisplacement === void 0) { alterDisplacement = noop; }
    return function (constant, origin) { return function (v) {
        var displacement = origin - v;
        var springModifiedDisplacement = -constant * (0 - alterDisplacement(Math.abs(displacement)));
        return (displacement <= 0) ? origin + springModifiedDisplacement : origin - springModifiedDisplacement;
    }; };
};
exports.linearSpring = exports.generateStaticSpring();
exports.nonlinearSpring = exports.generateStaticSpring(Math.sqrt);
exports.wrap = function (min, max) { return function (v) {
    var rangeSize = max - min;
    return ((v - min) % rangeSize + rangeSize) % rangeSize + min;
}; };
exports.smooth = function (strength) {
    if (strength === void 0) { strength = 50; }
    var previousValue = 0;
    var lastUpdated = 0;
    return function (v) {
        var currentFramestamp = framesync_1.currentFrameTime();
        var timeDelta = (currentFramestamp !== lastUpdated) ? currentFramestamp - lastUpdated : 0;
        var newValue = timeDelta ? calc_1.smooth(v, previousValue, timeDelta, strength) : previousValue;
        lastUpdated = currentFramestamp;
        previousValue = newValue;
        return newValue;
    };
};
exports.snap = function (points) {
    if (typeof points === 'number') {
        return function (v) { return Math.round(v / points) * points; };
    }
    else {
        var i_1 = 0;
        var numPoints_1 = points.length;
        return function (v) {
            var lastDistance = Math.abs(points[0] - v);
            for (i_1 = 1; i_1 < numPoints_1; i_1++) {
                var point = points[i_1];
                var distance = Math.abs(point - v);
                if (distance === 0)
                    return point;
                if (distance > lastDistance)
                    return points[i_1 - 1];
                if (i_1 === numPoints_1 - 1)
                    return point;
                lastDistance = distance;
            }
        };
    }
};
exports.steps = function (st, min, max) {
    if (min === void 0) { min = 0; }
    if (max === void 0) { max = 1; }
    return function (v) {
        var progress = calc_1.getProgressFromValue(min, max, v);
        return calc_1.getValueFromProgress(min, max, calc_1.stepProgress(st, progress));
    };
};
exports.transformMap = function (childTransformers) { return function (v) {
    var output = __assign({}, v);
    for (var key in childTransformers) {
        if (childTransformers.hasOwnProperty(key)) {
            var childTransformer = childTransformers[key];
            output[key] = childTransformer(v[key]);
        }
    }
    return output;
}; };
//# sourceMappingURL=transformers.js.map
},{"framesync":209,"style-value-types":208,"./calc":27}],204:[function(require,module,exports) {
"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var transformers_1 = require("../transformers");
var Chainable = (function () {
    function Chainable(props) {
        if (props === void 0) { props = {}; }
        this.props = props;
    }
    Chainable.prototype.applyMiddleware = function (middleware) {
        return this.create(__assign({}, this.props, { middleware: this.props.middleware ? [middleware].concat(this.props.middleware) : [middleware] }));
    };
    Chainable.prototype.pipe = function () {
        var funcs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            funcs[_i] = arguments[_i];
        }
        var pipedUpdate = funcs.length === 1 ? funcs[0] : transformers_1.pipe.apply(void 0, funcs);
        return this.applyMiddleware(function (update) { return function (v) { return update(pipedUpdate(v)); }; });
    };
    Chainable.prototype.while = function (predicate) {
        return this.applyMiddleware(function (update, complete) { return function (v) { return predicate(v) ? update(v) : complete(); }; });
    };
    Chainable.prototype.filter = function (predicate) {
        return this.applyMiddleware(function (update, complete) { return function (v) { return predicate(v) && update(v); }; });
    };
    return Chainable;
}());
exports.default = Chainable;
//# sourceMappingURL=index.js.map
},{"../transformers":29}],205:[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Observer = (function () {
    function Observer(_a, observer) {
        var middleware = _a.middleware, onComplete = _a.onComplete;
        var _this = this;
        this.isActive = true;
        this.update = function (v) {
            if (_this.observer.update)
                _this.updateObserver(v);
        };
        this.complete = function () {
            if (_this.observer.complete && _this.isActive)
                _this.observer.complete();
            if (_this.onComplete)
                _this.onComplete();
            _this.isActive = false;
        };
        this.error = function (err) {
            if (_this.observer.error && _this.isActive)
                _this.observer.error(err);
            _this.isActive = false;
        };
        this.observer = observer;
        this.updateObserver = function (v) { return observer.update(v); };
        this.onComplete = onComplete;
        if (observer.update && middleware && middleware.length) {
            middleware.forEach(function (m) { return _this.updateObserver = m(_this.updateObserver, _this.complete); });
        }
    }
    return Observer;
}());
exports.Observer = Observer;
exports.default = function (observerCandidate, _a, onComplete) {
    var middleware = _a.middleware;
    if (typeof observerCandidate === 'function') {
        return new Observer({ middleware: middleware, onComplete: onComplete }, { update: observerCandidate });
    }
    else {
        return new Observer({ middleware: middleware, onComplete: onComplete }, observerCandidate);
    }
};
//# sourceMappingURL=index.js.map
},{}],188:[function(require,module,exports) {
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var chainable_1 = require("../chainable");
var observer_1 = require("../observer");
var Action = (function (_super) {
    __extends(Action, _super);
    function Action() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Action.prototype.create = function (props) {
        return new Action(props);
    };
    Action.prototype.start = function (observerCandidate) {
        if (observerCandidate === void 0) { observerCandidate = {}; }
        var isComplete = false;
        var subscription = {
            stop: function () { return undefined; }
        };
        var _a = this.props, init = _a.init, observerProps = __rest(_a, ["init"]);
        var observer = observer_1.default(observerCandidate, observerProps, function () {
            isComplete = true;
            subscription.stop();
        });
        var api = init(observer);
        subscription = api
            ? __assign({}, subscription, api) : subscription;
        if (observerCandidate.registerParent) {
            observerCandidate.registerParent(subscription);
        }
        if (isComplete)
            subscription.stop();
        return subscription;
    };
    return Action;
}(chainable_1.default));
exports.Action = Action;
exports.default = function (init) { return new Action({ init: init }); };
//# sourceMappingURL=index.js.map
},{"../chainable":204,"../observer":205}],186:[function(require,module,exports) {
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var chainable_1 = require("../chainable");
var observer_1 = require("../observer");
var BaseMulticast = (function (_super) {
    __extends(BaseMulticast, _super);
    function BaseMulticast() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.subscribers = [];
        return _this;
    }
    BaseMulticast.prototype.complete = function () {
        this.subscribers.forEach(function (subscriber) { return subscriber.complete(); });
    };
    BaseMulticast.prototype.error = function (err) {
        this.subscribers.forEach(function (subscriber) { return subscriber.error(err); });
    };
    BaseMulticast.prototype.update = function (v) {
        for (var i = 0; i < this.subscribers.length; i++) {
            this.subscribers[i].update(v);
        }
    };
    BaseMulticast.prototype.subscribe = function (observerCandidate) {
        var _this = this;
        var observer = observer_1.default(observerCandidate, this.props);
        this.subscribers.push(observer);
        var subscription = {
            unsubscribe: function () {
                var index = _this.subscribers.indexOf(observer);
                if (index !== -1)
                    _this.subscribers.splice(index, 1);
            }
        };
        return subscription;
    };
    BaseMulticast.prototype.stop = function () {
        if (this.parent)
            this.parent.stop();
    };
    BaseMulticast.prototype.registerParent = function (subscription) {
        this.stop();
        this.parent = subscription;
    };
    return BaseMulticast;
}(chainable_1.default));
exports.BaseMulticast = BaseMulticast;
//# sourceMappingURL=index.js.map
},{"../chainable":204,"../observer":205}],36:[function(require,module,exports) {
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var _1 = require("./");
var Multicast = (function (_super) {
    __extends(Multicast, _super);
    function Multicast() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Multicast.prototype.create = function (props) {
        return new Multicast(props);
    };
    return Multicast;
}(_1.BaseMulticast));
exports.Multicast = Multicast;
exports.default = function () { return new Multicast(); };
//# sourceMappingURL=multicast.js.map
},{"./":186}],37:[function(require,module,exports) {
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var framesync_1 = require("framesync");
var calc_1 = require("../calc");
var _1 = require("./");
var isValueList = function (v) { return Array.isArray(v); };
var isSingleValue = function (v) {
    var typeOfV = typeof v;
    return (typeOfV === 'string' || typeOfV === 'number');
};
var ValueReaction = (function (_super) {
    __extends(ValueReaction, _super);
    function ValueReaction(props) {
        var _this = _super.call(this, props) || this;
        _this.prev = _this.current = props.value || 0;
        if (isSingleValue(_this.current)) {
            _this.updateCurrent = function (v) { return _this.current = v; };
            _this.getVelocityOfCurrent = function () { return _this.getSingleVelocity(_this.current, _this.prev); };
        }
        else if (isValueList(_this.current)) {
            _this.updateCurrent = function (v) { return _this.current = v.slice(); };
            _this.getVelocityOfCurrent = function () { return _this.getListVelocity(); };
        }
        else {
            _this.updateCurrent = function (v) {
                _this.current = {};
                for (var key in v) {
                    if (v.hasOwnProperty(key)) {
                        _this.current[key] = v[key];
                    }
                }
            };
            _this.getVelocityOfCurrent = function () { return _this.getMapVelocity(); };
        }
        if (props.initialSubscription)
            _this.subscribe(props.initialSubscription);
        return _this;
    }
    ValueReaction.prototype.create = function (props) {
        return new ValueReaction(props);
    };
    ValueReaction.prototype.get = function () {
        return this.current;
    };
    ValueReaction.prototype.getVelocity = function () {
        return this.getVelocityOfCurrent();
    };
    ValueReaction.prototype.update = function (v) {
        _super.prototype.update.call(this, v);
        this.prev = this.current;
        this.updateCurrent(v);
        this.timeDelta = framesync_1.timeSinceLastFrame();
    };
    ValueReaction.prototype.subscribe = function (observerCandidate) {
        var sub = _super.prototype.subscribe.call(this, observerCandidate);
        this.update(this.current);
        return sub;
    };
    ValueReaction.prototype.getSingleVelocity = function (current, prev) {
        return (typeof current === 'number' && typeof prev === 'number')
            ? calc_1.speedPerSecond(current - prev, this.timeDelta)
            : 0;
    };
    ValueReaction.prototype.getListVelocity = function () {
        var _this = this;
        return this.current.map(function (c, i) { return _this.getSingleVelocity(c, _this.prev[i]); });
    };
    ValueReaction.prototype.getMapVelocity = function () {
        var velocity = {};
        for (var key in this.current) {
            if (this.current.hasOwnProperty(key)) {
                velocity[key] = this.getSingleVelocity(this.current[key], this.prev[key]);
            }
        }
        return velocity;
    };
    return ValueReaction;
}(_1.BaseMulticast));
exports.ValueReaction = ValueReaction;
exports.default = function (value, initialSubscription) { return new ValueReaction({ value: value, initialSubscription: initialSubscription }); };
//# sourceMappingURL=value.js.map
},{"framesync":209,"../calc":27,"./":186}],185:[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var framesync_1 = require("framesync");
var action_1 = require("../action");
var multi = function (_a) {
    var getCount = _a.getCount, getFirst = _a.getFirst, getOutput = _a.getOutput, mapApi = _a.mapApi, setProp = _a.setProp, startActions = _a.startActions;
    return function (actions) { return action_1.default(function (_a) {
        var update = _a.update, complete = _a.complete, error = _a.error;
        var numActions = getCount(actions);
        var output = getOutput();
        var updateOutput = function () { return update(output); };
        var numCompletedActions = 0;
        var subs = startActions(actions, function (a, name) { return a.start({
            complete: function () {
                numCompletedActions++;
                if (numCompletedActions === numActions)
                    framesync_1.onFrameUpdate(complete);
            },
            error: error,
            update: function (v) {
                setProp(output, name, v);
                framesync_1.onFrameUpdate(updateOutput, true);
            }
        }); });
        return Object.keys(getFirst(subs))
            .reduce(function (api, methodName) {
            api[methodName] = mapApi(subs, methodName);
            return api;
        }, {});
    }); };
};
exports.default = multi;
//# sourceMappingURL=multi.js.map
},{"framesync":209,"../action":188}],39:[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var multi_1 = require("./multi");
var composite = multi_1.default({
    getOutput: function () { return ({}); },
    getCount: function (subs) { return Object.keys(subs).length; },
    getFirst: function (subs) { return subs[Object.keys(subs)[0]]; },
    mapApi: function (subs, methodName) { return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return Object.keys(subs)
            .reduce(function (output, propKey) {
            if (subs[propKey][methodName]) {
                (args[0] && args[0][propKey] !== undefined)
                    ? output[propKey] = subs[propKey][methodName](args[0][propKey])
                    : output[propKey] = (_a = subs[propKey])[methodName].apply(_a, args);
            }
            return output;
            var _a;
        }, {});
    }; },
    setProp: function (output, name, v) { return output[name] = v; },
    startActions: function (actions, starter) { return Object.keys(actions)
        .reduce(function (subs, key) {
        subs[key] = starter(actions[key], key);
        return subs;
    }, {}); }
});
exports.default = composite;
//# sourceMappingURL=composite.js.map
},{"./multi":185}],43:[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var multi_1 = require("./multi");
var parallel = multi_1.default({
    getOutput: function () { return ([]); },
    getCount: function (subs) { return subs.length; },
    getFirst: function (subs) { return subs[0]; },
    mapApi: function (subs, methodName) { return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return subs.map(function (sub, i) {
            if (sub[methodName]) {
                return Array.isArray(args[0])
                    ? sub[methodName](args[0][i])
                    : sub[methodName].apply(sub, args);
            }
        });
    }; },
    setProp: function (output, name, v) { return output[name] = v; },
    startActions: function (actions, starter) { return actions.map(function (action, i) { return starter(action, i); }); }
});
exports.default = function () {
    var actions = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        actions[_i] = arguments[_i];
    }
    return parallel(actions);
};
//# sourceMappingURL=parallel.js.map
},{"./multi":185}],201:[function(require,module,exports) {
"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var style_value_types_1 = require("style-value-types");
var composite_1 = require("../compositors/composite");
var parallel_1 = require("../compositors/parallel");
var transformers_1 = require("../transformers");
var isColor = style_value_types_1.color.test;
var convertToColorAction = function (init, props) { return (typeof props.from === 'string' && isColor(props.from) &&
    typeof props.to === 'string' && isColor(props.to)) ? init(__assign({}, props, { from: 0, to: 1 })).pipe(transformers_1.blendColor(props.from, props.to), style_value_types_1.color.transform)
    : init(props); };
var createVectorTests = function (typeTests) {
    var testNames = Object.keys(typeTests);
    return {
        getVectorKeys: function (props) { return testNames.reduce(function (vectorKeys, key) {
            if (props[key] !== undefined && !typeTests[key](props[key])) {
                vectorKeys.push(key);
            }
            return vectorKeys;
        }, []); },
        test: function (props) { return props && testNames.reduce(function (isVector, key) {
            return isVector || (props[key] !== undefined && !typeTests[key](props[key]));
        }, false); }
    };
};
var reduceArrayValue = function (i) { return function (props, key) {
    props[key] = props[key][i];
    return props;
}; };
var createArrayVector = function (init, props, vectorKeys) {
    var firstVectorKey = vectorKeys[0];
    var actionList = props[firstVectorKey].map(function (v, i) {
        return convertToColorAction(init, vectorKeys.reduce(reduceArrayValue(i), __assign({}, props)));
    });
    return parallel_1.default.apply(void 0, actionList);
};
var reduceObjectValue = function (key) { return function (props, propKey) {
    props[propKey] = props[propKey][key];
    return props;
}; };
var createObjectVector = function (init, props, vectorKeys) {
    var firstVectorKey = vectorKeys[0];
    var actionMap = Object.keys(props[firstVectorKey]).reduce(function (map, key) {
        map[key] = convertToColorAction(init, vectorKeys.reduce(reduceObjectValue(key), __assign({}, props)));
        return map;
    }, {});
    return composite_1.default(actionMap);
};
var createColorVector = function (init, props) { return convertToColorAction(init, props); };
var vectorAction = function (init, typeTests) {
    var _a = createVectorTests(typeTests), test = _a.test, getVectorKeys = _a.getVectorKeys;
    return function (props) {
        var isVector = test(props);
        if (!isVector)
            return init(props);
        var vectorKeys = getVectorKeys(props);
        var testKey = vectorKeys[0];
        var testProp = props[testKey];
        if (Array.isArray(testProp)) {
            return createArrayVector(init, props, vectorKeys);
        }
        else if (typeof testProp === 'string' && isColor(testProp)) {
            return createColorVector(init, props, vectorKeys);
        }
        else {
            return createObjectVector(init, props, vectorKeys);
        }
    };
};
exports.default = vectorAction;
//# sourceMappingURL=vector.js.map
},{"style-value-types":208,"../compositors/composite":39,"../compositors/parallel":43,"../transformers":29}],192:[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var framesync_1 = require("framesync");
var action_1 = require("../../action");
var frame = function () { return action_1.default(function (_a) {
    var update = _a.update;
    var isActive = true;
    var startTime = framesync_1.currentTime();
    var nextFrame = function () {
        if (!isActive)
            return;
        update(Math.max(framesync_1.currentFrameTime() - startTime, 0));
        framesync_1.onFrameUpdate(nextFrame);
    };
    framesync_1.onFrameUpdate(nextFrame);
    return {
        stop: function () { return isActive = false; }
    };
}); };
exports.default = frame;
//# sourceMappingURL=index.js.map
},{"framesync":209,"../../action":188}],189:[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var framesync_1 = require("framesync");
var style_value_types_1 = require("style-value-types");
var action_1 = require("../../action");
var vector_1 = require("../../action/vector");
var every_frame_1 = require("../every-frame");
var decay = function (props) {
    if (props === void 0) { props = {}; }
    return action_1.default(function (_a) {
        var complete = _a.complete, update = _a.update;
        var _b = props.velocity, velocity = _b === void 0 ? 0 : _b, _c = props.from, from = _c === void 0 ? 0 : _c, _d = props.power, power = _d === void 0 ? 0.8 : _d, _e = props.timeConstant, timeConstant = _e === void 0 ? 350 : _e, _f = props.restDelta, restDelta = _f === void 0 ? 0.5 : _f, modifyTarget = props.modifyTarget;
        var elapsed = 0;
        var amplitude = power * velocity;
        var idealTarget = Math.round(from + amplitude);
        var target = (typeof modifyTarget === 'undefined')
            ? idealTarget
            : modifyTarget(idealTarget);
        var timer = every_frame_1.default().start(function () {
            elapsed += framesync_1.timeSinceLastFrame();
            var delta = -amplitude * Math.exp(-elapsed / timeConstant);
            var isMoving = (delta > restDelta || delta < -restDelta);
            var current = isMoving ? target + delta : target;
            update(current);
            if (!isMoving) {
                timer.stop();
                complete();
            }
        });
        return {
            stop: function () { return timer.stop(); }
        };
    });
};
exports.default = vector_1.default(decay, {
    from: style_value_types_1.number.test,
    modifyTarget: function (func) { return typeof func === 'function'; },
    velocity: style_value_types_1.number.test
});
//# sourceMappingURL=index.js.map
},{"framesync":209,"style-value-types":208,"../../action":188,"../../action/vector":201,"../every-frame":192}],28:[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DEFAULT_OVERSHOOT_STRENGTH = 1.525;
exports.createReversedEasing = function (easing) {
    return function (p) { return 1 - easing(1 - p); };
};
exports.createMirroredEasing = function (easing) {
    return function (p) { return (p <= 0.5) ? easing(2 * p) / 2 : (2 - easing(2 * (1 - p))) / 2; };
};
exports.linear = function (p) { return p; };
exports.createExpoIn = function (power) { return function (p) { return Math.pow(p, power); }; };
exports.easeIn = exports.createExpoIn(2);
exports.easeOut = exports.createReversedEasing(exports.easeIn);
exports.easeInOut = exports.createMirroredEasing(exports.easeIn);
exports.circIn = function (p) { return 1 - Math.sin(Math.acos(p)); };
exports.circOut = exports.createReversedEasing(exports.circIn);
exports.circInOut = exports.createMirroredEasing(exports.circOut);
exports.createBackIn = function (power) { return function (p) { return (p * p) * ((power + 1) * p - power); }; };
exports.backIn = exports.createBackIn(DEFAULT_OVERSHOOT_STRENGTH);
exports.backOut = exports.createReversedEasing(exports.backIn);
exports.backInOut = exports.createMirroredEasing(exports.backIn);
exports.createAnticipateEasing = function (power) {
    var backEasing = exports.createBackIn(power);
    return function (p) { return ((p *= 2) < 1) ? 0.5 * backEasing(p) : 0.5 * (2 - Math.pow(2, -10 * (p - 1))); };
};
exports.anticipate = exports.createAnticipateEasing(DEFAULT_OVERSHOOT_STRENGTH);
var NEWTON_ITERATIONS = 8;
var NEWTON_MIN_SLOPE = 0.001;
var SUBDIVISION_PRECISION = 0.0000001;
var SUBDIVISION_MAX_ITERATIONS = 10;
var K_SPLINE_TABLE_SIZE = 11;
var K_SAMPLE_STEP_SIZE = 1.0 / (K_SPLINE_TABLE_SIZE - 1.0);
var FLOAT_32_SUPPORTED = (typeof Float32Array !== 'undefined');
var a = function (a1, a2) { return 1.0 - 3.0 * a2 + 3.0 * a1; };
var b = function (a1, a2) { return 3.0 * a2 - 6.0 * a1; };
var c = function (a1) { return 3.0 * a1; };
var getSlope = function (t, a1, a2) { return 3.0 * a(a1, a2) * t * t + 2.0 * b(a1, a2) * t + c(a1); };
var calcBezier = function (t, a1, a2) { return ((a(a1, a2) * t + b(a1, a2)) * t + c(a1)) * t; };
function cubicBezier(mX1, mY1, mX2, mY2) {
    var sampleValues = FLOAT_32_SUPPORTED ? new Float32Array(K_SPLINE_TABLE_SIZE) : new Array(K_SPLINE_TABLE_SIZE);
    var _precomputed = false;
    var binarySubdivide = function (aX, aA, aB) {
        var i = 0;
        var currentX;
        var currentT;
        do {
            currentT = aA + (aB - aA) / 2.0;
            currentX = calcBezier(currentT, mX1, mX2) - aX;
            if (currentX > 0.0) {
                aB = currentT;
            }
            else {
                aA = currentT;
            }
        } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
        return currentT;
    };
    var newtonRaphsonIterate = function (aX, aGuessT) {
        var i = 0;
        var currentSlope = 0;
        var currentX;
        for (; i < NEWTON_ITERATIONS; ++i) {
            currentSlope = getSlope(aGuessT, mX1, mX2);
            if (currentSlope === 0.0) {
                return aGuessT;
            }
            currentX = calcBezier(aGuessT, mX1, mX2) - aX;
            aGuessT -= currentX / currentSlope;
        }
        return aGuessT;
    };
    var calcSampleValues = function () {
        for (var i = 0; i < K_SPLINE_TABLE_SIZE; ++i) {
            sampleValues[i] = calcBezier(i * K_SAMPLE_STEP_SIZE, mX1, mX2);
        }
    };
    var getTForX = function (aX) {
        var intervalStart = 0.0;
        var currentSample = 1;
        var lastSample = K_SPLINE_TABLE_SIZE - 1;
        var dist = 0.0;
        var guessForT = 0.0;
        var initialSlope = 0.0;
        for (; currentSample != lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
            intervalStart += K_SAMPLE_STEP_SIZE;
        }
        --currentSample;
        dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
        guessForT = intervalStart + dist * K_SAMPLE_STEP_SIZE;
        initialSlope = getSlope(guessForT, mX1, mX2);
        if (initialSlope >= NEWTON_MIN_SLOPE) {
            return newtonRaphsonIterate(aX, guessForT);
        }
        else if (initialSlope === 0.0) {
            return guessForT;
        }
        else {
            return binarySubdivide(aX, intervalStart, intervalStart + K_SAMPLE_STEP_SIZE);
        }
    };
    var precompute = function () {
        _precomputed = true;
        if (mX1 != mY1 || mX2 != mY2) {
            calcSampleValues();
        }
    };
    var resolver = function (aX) {
        var returnValue;
        if (!_precomputed) {
            precompute();
        }
        if (mX1 === mY1 && mX2 === mY2) {
            returnValue = aX;
        }
        else if (aX === 0) {
            returnValue = 0;
        }
        else if (aX === 1) {
            returnValue = 1;
        }
        else {
            returnValue = calcBezier(getTForX(aX), mY1, mY2);
        }
        return returnValue;
    };
    return resolver;
}
exports.cubicBezier = cubicBezier;
;
//# sourceMappingURL=easing.js.map
},{}],202:[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var style_value_types_1 = require("style-value-types");
var action_1 = require("../../action");
var vector_1 = require("../../action/vector");
var calc_1 = require("../../calc");
var easing_1 = require("../../easing");
var scrubber = function (_a) {
    var _b = _a.from, from = _b === void 0 ? 0 : _b, _c = _a.to, to = _c === void 0 ? 1 : _c, _d = _a.ease, ease = _d === void 0 ? easing_1.linear : _d;
    return action_1.default(function (_a) {
        var update = _a.update;
        return ({
            seek: function (progress) { return update(progress); }
        });
    }).pipe(ease, function (v) { return calc_1.getValueFromProgress(from, to, v); });
};
exports.default = vector_1.default(scrubber, {
    ease: function (func) { return typeof func === 'function'; },
    from: style_value_types_1.number.test,
    to: style_value_types_1.number.test
});
//# sourceMappingURL=scrubber.js.map
},{"style-value-types":208,"../../action":188,"../../action/vector":201,"../../calc":27,"../../easing":28}],195:[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var framesync_1 = require("framesync");
var action_1 = require("../../action");
var calc_1 = require("../../calc");
var easing_1 = require("../../easing");
var transformers_1 = require("../../transformers");
var every_frame_1 = require("../every-frame");
var scrubber_1 = require("./scrubber");
var clampProgress = transformers_1.clamp(0, 1);
var tween = function (props) {
    if (props === void 0) { props = {}; }
    return action_1.default(function (_a) {
        var update = _a.update, complete = _a.complete;
        var _b = props.duration, duration = _b === void 0 ? 300 : _b, _c = props.ease, ease = _c === void 0 ? easing_1.easeOut : _c, _d = props.flip, flip = _d === void 0 ? 0 : _d, _e = props.loop, loop = _e === void 0 ? 0 : _e, _f = props.yoyo, yoyo = _f === void 0 ? 0 : _f;
        var _g = props.from, from = _g === void 0 ? 0 : _g, _h = props.to, to = _h === void 0 ? 1 : _h, _j = props.elapsed, elapsed = _j === void 0 ? 0 : _j, _k = props.playDirection, playDirection = _k === void 0 ? 1 : _k, _l = props.flipCount, flipCount = _l === void 0 ? 0 : _l, _m = props.yoyoCount, yoyoCount = _m === void 0 ? 0 : _m, _o = props.loopCount, loopCount = _o === void 0 ? 0 : _o;
        var playhead = scrubber_1.default({ from: from, to: to, ease: ease }).start(update);
        var progress = 0;
        var tweenTimer;
        var isActive = false;
        var reverseTween = function () { return playDirection *= -1; };
        var isTweenComplete = function () {
            var isComplete = (playDirection === 1)
                ? isActive && elapsed >= duration
                : isActive && elapsed <= 0;
            if (!isComplete)
                return false;
            if (isComplete && !loop && !flip && !yoyo)
                return true;
            var isStepTaken = false;
            if (loop && loopCount < loop) {
                elapsed = 0;
                loopCount++;
                isStepTaken = true;
            }
            else if (flip && flipCount < flip) {
                elapsed = duration - elapsed;
                _a = [to, from], from = _a[0], to = _a[1];
                playhead = scrubber_1.default({ from: from, to: to, ease: ease }).start(update);
                flipCount++;
                isStepTaken = true;
            }
            else if (yoyo && yoyoCount < yoyo) {
                reverseTween();
                yoyoCount++;
                isStepTaken = true;
            }
            return !isStepTaken;
            var _a;
        };
        var updateTween = function () {
            progress = clampProgress(calc_1.getProgressFromValue(0, duration, elapsed));
            playhead.seek(progress);
        };
        var startTimer = function () {
            isActive = true;
            tweenTimer = every_frame_1.default().start(function (i) {
                elapsed += framesync_1.timeSinceLastFrame() * playDirection;
                updateTween();
                if (isTweenComplete() && complete) {
                    tweenTimer.stop();
                    framesync_1.onFrameUpdate(complete, true);
                }
            });
        };
        var stopTimer = function () {
            isActive = false;
            if (tweenTimer)
                tweenTimer.stop();
        };
        startTimer();
        return {
            isActive: function () { return isActive; },
            getElapsed: function () { return transformers_1.clamp(0, duration)(elapsed); },
            getProgress: function () { return progress; },
            stop: function () {
                stopTimer();
            },
            pause: function () {
                stopTimer();
                return this;
            },
            resume: function () {
                startTimer();
                return this;
            },
            seek: function (newProgress) {
                elapsed = calc_1.getValueFromProgress(0, duration, newProgress);
                framesync_1.onFrameUpdate(updateTween, true);
                return this;
            },
            reverse: function () {
                reverseTween();
                return this;
            }
        };
    });
};
exports.default = tween;
//# sourceMappingURL=index.js.map
},{"framesync":209,"../../action":188,"../../calc":27,"../../easing":28,"../../transformers":29,"../every-frame":192,"./scrubber":202}],190:[function(require,module,exports) {
"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var calc_1 = require("../../calc");
var easing_1 = require("../../easing");
var transformers_1 = require("../../transformers");
var tween_1 = require("../tween");
var scrubber_1 = require("../tween/scrubber");
var clampProgress = transformers_1.clamp(0, 1);
var defaultEasings = function (values, easing) {
    return values.map(function () { return easing || easing_1.easeOut; }).splice(0, values.length - 1);
};
var defaultTimings = function (values) {
    var numValues = values.length;
    return values.map(function (value, i) { return (i !== 0) ? i / (numValues - 1) : 0; });
};
var interpolateScrubbers = function (input, scrubbers, update) {
    var rangeLength = input.length;
    var finalInputIndex = rangeLength - 1;
    var finalScrubberIndex = finalInputIndex - 1;
    var subs = scrubbers.map(function (scrub) { return scrub.start(update); });
    return function (v) {
        if (v <= input[0]) {
            subs[0].seek(0);
        }
        if (v >= input[finalInputIndex]) {
            subs[finalScrubberIndex].seek(1);
        }
        var i = 1;
        for (; i < rangeLength; i++) {
            if (input[i] > v || i === finalInputIndex)
                break;
        }
        var progressInRange = calc_1.getProgressFromValue(input[i - 1], input[i], v);
        subs[i - 1].seek(clampProgress(progressInRange));
    };
};
var keyframes = function (_a) {
    var easings = _a.easings, _b = _a.ease, ease = _b === void 0 ? easing_1.linear : _b, times = _a.times, values = _a.values, tweenProps = __rest(_a, ["easings", "ease", "times", "values"]);
    easings = Array.isArray(easings)
        ? easings
        : defaultEasings(values, easings);
    times = times || defaultTimings(values);
    var scrubbers = easings.map(function (easing, i) { return scrubber_1.default({
        from: values[i],
        to: values[i + 1],
        ease: easing
    }); });
    return tween_1.default(__assign({}, tweenProps, { ease: ease })).applyMiddleware(function (update) { return interpolateScrubbers(times, scrubbers, update); });
};
exports.default = keyframes;
//# sourceMappingURL=index.js.map
},{"../../calc":27,"../../easing":28,"../../transformers":29,"../tween":195,"../tween/scrubber":202}],191:[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var framesync_1 = require("framesync");
var style_value_types_1 = require("style-value-types");
var action_1 = require("../../action");
var vector_1 = require("../../action/vector");
var calc_1 = require("../../calc");
var every_frame_1 = require("../every-frame");
var physics = function (props) {
    if (props === void 0) { props = {}; }
    return action_1.default(function (_a) {
        var complete = _a.complete, update = _a.update;
        var _b = props.acceleration, acceleration = _b === void 0 ? 0 : _b, _c = props.friction, friction = _c === void 0 ? 0 : _c, _d = props.velocity, velocity = _d === void 0 ? 0 : _d, springStrength = props.springStrength, to = props.to;
        var _e = props.restSpeed, restSpeed = _e === void 0 ? 0.001 : _e, _f = props.from, from = _f === void 0 ? 0 : _f;
        var current = from;
        var timer = every_frame_1.default().start(function () {
            var elapsed = Math.max(framesync_1.timeSinceLastFrame(), 16);
            if (acceleration)
                velocity += calc_1.speedPerFrame(acceleration, elapsed);
            if (friction)
                velocity *= Math.pow((1 - friction), (elapsed / 100));
            if (springStrength !== undefined && to !== undefined) {
                var distanceToTarget = to - current;
                velocity += distanceToTarget * calc_1.speedPerFrame(springStrength, elapsed);
            }
            current += calc_1.speedPerFrame(velocity, elapsed);
            update(current);
            var isComplete = (restSpeed !== false && (!velocity || Math.abs(velocity) <= restSpeed));
            if (isComplete) {
                timer.stop();
                complete();
            }
        });
        return {
            set: function (v) {
                current = v;
                return this;
            },
            setAcceleration: function (v) {
                acceleration = v;
                return this;
            },
            setFriction: function (v) {
                friction = v;
                return this;
            },
            setSpringStrength: function (v) {
                springStrength = v;
                return this;
            },
            setSpringTarget: function (v) {
                to = v;
                return this;
            },
            setVelocity: function (v) {
                velocity = v;
                return this;
            },
            stop: function () { return timer.stop(); }
        };
    });
};
exports.default = vector_1.default(physics, {
    acceleration: style_value_types_1.number.test,
    friction: style_value_types_1.number.test,
    velocity: style_value_types_1.number.test,
    from: style_value_types_1.number.test,
    to: style_value_types_1.number.test,
    springStrength: style_value_types_1.number.test
});
//# sourceMappingURL=index.js.map
},{"framesync":209,"style-value-types":208,"../../action":188,"../../action/vector":201,"../../calc":27,"../every-frame":192}],193:[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var framesync_1 = require("framesync");
var style_value_types_1 = require("style-value-types");
var action_1 = require("../../action");
var vector_1 = require("../../action/vector");
var calc_1 = require("../../calc");
var every_frame_1 = require("../every-frame");
var spring = function (props) {
    if (props === void 0) { props = {}; }
    return action_1.default(function (_a) {
        var update = _a.update, complete = _a.complete;
        var _b = props.velocity, velocity = _b === void 0 ? 0.0 : _b;
        var _c = props.from, from = _c === void 0 ? 0.0 : _c, _d = props.to, to = _d === void 0 ? 0.0 : _d, _e = props.stiffness, stiffness = _e === void 0 ? 100 : _e, _f = props.damping, damping = _f === void 0 ? 10 : _f, _g = props.mass, mass = _g === void 0 ? 1.0 : _g, _h = props.restSpeed, restSpeed = _h === void 0 ? 0.01 : _h, _j = props.restDelta, restDelta = _j === void 0 ? 0.01 : _j;
        var initialVelocity = velocity ? -(velocity / 1000) : 0.0;
        var t = 0;
        var delta = to - from;
        var position = from;
        var prevPosition = position;
        var springTimer = every_frame_1.default().start(function () {
            var timeDelta = framesync_1.timeSinceLastFrame();
            t += timeDelta;
            var dampingRatio = damping / (2 * Math.sqrt(stiffness * mass));
            var angularFreq = Math.sqrt(stiffness / mass) / 1000;
            prevPosition = position;
            if (dampingRatio < 1) {
                var envelope = Math.exp(-dampingRatio * angularFreq * t);
                var expoDecay = angularFreq * Math.sqrt(1.0 - dampingRatio * dampingRatio);
                position = to - envelope * ((initialVelocity + dampingRatio * angularFreq * delta)
                    / expoDecay * Math.sin(expoDecay * t)
                    + delta * Math.cos(expoDecay * t));
            }
            else {
                var envelope = Math.exp(-angularFreq * t);
                position = to - envelope * (delta + (initialVelocity + angularFreq * delta) * t);
            }
            velocity = calc_1.speedPerSecond(position - prevPosition, timeDelta);
            var isBelowVelocityThreshold = Math.abs(velocity) <= restSpeed;
            var isBelowDisplacementThreshold = Math.abs(to - position) <= restDelta;
            if (isBelowVelocityThreshold && isBelowDisplacementThreshold) {
                position = to;
                update(position);
                springTimer.stop();
                complete();
            }
            else {
                update(position);
            }
        });
        return {
            stop: function () { return springTimer.stop(); }
        };
    });
};
exports.default = vector_1.default(spring, {
    from: style_value_types_1.number.test,
    to: style_value_types_1.number.test,
    stiffness: style_value_types_1.number.test,
    damping: style_value_types_1.number.test,
    mass: style_value_types_1.number.test,
    velocity: style_value_types_1.number.test
});
//# sourceMappingURL=index.js.map
},{"framesync":209,"style-value-types":208,"../../action":188,"../../action/vector":201,"../../calc":27,"../every-frame":192}],194:[function(require,module,exports) {
"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var keyframes_1 = require("../keyframes");
var easing_1 = require("../../easing");
var composite_1 = require("../../compositors/composite");
var DEFAULT_DURATION = 300;
var flattenTimings = function (instructions) {
    var flatInstructions = [];
    var lastArg = instructions[instructions.length - 1];
    var isStaggered = typeof lastArg === 'number';
    var staggerDelay = isStaggered ? lastArg : 0;
    var segments = isStaggered ? instructions.slice(0, -1) : instructions;
    var numSegments = segments.length;
    var offset = 0;
    segments.forEach(function (item, i) {
        flatInstructions.push(item);
        if (i !== numSegments - 1) {
            var duration = item.duration || DEFAULT_DURATION;
            offset += staggerDelay;
            flatInstructions.push("-" + (duration - offset));
        }
    });
    return flatInstructions;
};
var flattenArrayInstructions = function (instructions, instruction) {
    Array.isArray(instruction)
        ? instructions.push.apply(instructions, flattenTimings(instruction)) : instructions.push(instruction);
    return instructions;
};
var convertDefToProps = function (props, def, i) {
    var duration = props.duration, easings = props.easings, times = props.times, values = props.values;
    var numValues = values.length;
    var prevTimeTo = times[numValues - 1];
    var timeFrom = def.at === 0 ? 0 : def.at / duration;
    var timeTo = (def.at + def.duration) / duration;
    if (i === 0) {
        values.push(def.from);
        times.push(timeFrom);
    }
    else {
        if (prevTimeTo !== timeFrom) {
            if (def.from !== undefined) {
                values.push(values[numValues - 1]);
                times.push(timeFrom);
                easings.push(easing_1.linear);
            }
            var from = def.from !== undefined ? def.from : values[numValues - 1];
            values.push(from);
            times.push(timeFrom);
            easings.push(easing_1.linear);
        }
        else if (def.from !== undefined) {
            values.push(def.from);
            times.push(timeFrom);
            easings.push(easing_1.linear);
        }
    }
    values.push(def.to);
    times.push(timeTo);
    easings.push(def.ease || easing_1.easeInOut);
    return props;
};
var timeline = function (instructions, _a) {
    var _b = _a === void 0 ? {} : _a, duration = _b.duration, elapsed = _b.elapsed, ease = _b.ease, loop = _b.loop, flip = _b.flip, yoyo = _b.yoyo;
    var playhead = 0;
    var calculatedDuration = 0;
    var flatInstructions = instructions.reduce(flattenArrayInstructions, []);
    var animationDefs = [];
    flatInstructions.forEach(function (instruction) {
        if (typeof instruction === 'string') {
            playhead += parseFloat(instruction);
        }
        else if (typeof instruction === 'number') {
            playhead = instruction;
        }
        else {
            var def = __assign({}, instruction, { at: playhead });
            def.duration = def.duration === undefined ? DEFAULT_DURATION : def.duration;
            animationDefs.push(def);
            playhead += def.duration;
            calculatedDuration = Math.max(calculatedDuration, def.at + def.duration);
        }
    });
    var tracks = {};
    var numDefs = animationDefs.length;
    for (var i = 0; i < numDefs; i++) {
        var def = animationDefs[i];
        var track = def.track;
        if (track === undefined) {
            throw new Error('No track defined');
        }
        if (!tracks.hasOwnProperty(track))
            tracks[track] = [];
        tracks[track].push(def);
    }
    var trackKeyframes = {};
    for (var key in tracks) {
        if (tracks.hasOwnProperty(key)) {
            var keyframeProps = tracks[key].reduce(convertDefToProps, {
                duration: calculatedDuration,
                easings: [],
                times: [],
                values: []
            });
            trackKeyframes[key] = keyframes_1.default(__assign({}, keyframeProps, { duration: duration || calculatedDuration, ease: ease,
                elapsed: elapsed,
                loop: loop,
                yoyo: yoyo,
                flip: flip }));
        }
    }
    return composite_1.default(trackKeyframes);
};
exports.default = timeline;
//# sourceMappingURL=index.js.map
},{"../keyframes":190,"../../easing":28,"../../compositors/composite":39}],197:[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var action_1 = require("../../action");
var listen = function (element, events, options) { return action_1.default(function (_a) {
    var update = _a.update;
    var eventNames = events.split(' ').map(function (eventName) {
        element.addEventListener(eventName, update, options);
        return eventName;
    });
    return {
        stop: function () { return eventNames.forEach(function (eventName) { return element.removeEventListener(eventName, update, options); }); }
    };
}); };
exports.default = listen;
//# sourceMappingURL=index.js.map
},{"../../action":188}],187:[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultPointerPos = function () { return ({
    clientX: 0,
    clientY: 0,
    pageX: 0,
    pageY: 0,
    x: 0,
    y: 0
}); };
exports.eventToPoint = function (e, point) {
    if (point === void 0) { point = exports.defaultPointerPos(); }
    point.clientX = point.x = e.clientX;
    point.clientY = point.y = e.clientY;
    point.pageX = e.pageX;
    point.pageY = e.pageY;
    return point;
};
//# sourceMappingURL=utils.js.map
},{}],196:[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var framesync_1 = require("framesync");
var action_1 = require("../../action");
var calc_1 = require("../../calc");
var listen_1 = require("../listen");
var utils_1 = require("../pointer/utils");
var points = [utils_1.defaultPointerPos()];
var isTouchDevice = false;
if (typeof document !== 'undefined') {
    var updatePointsLocation = function (_a) {
        var touches = _a.touches;
        isTouchDevice = true;
        var numTouches = touches.length;
        points.length = 0;
        for (var i = 0; i < numTouches; i++) {
            var thisTouch = touches[i];
            points.push(utils_1.eventToPoint(thisTouch));
        }
    };
    listen_1.default(document, 'touchstart touchmove', true)
        .start(updatePointsLocation);
}
var multitouch = function (_a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.preventDefault, preventDefault = _c === void 0 ? true : _c, _d = _b.scale, scale = _d === void 0 ? 1.0 : _d, _e = _b.rotate, rotate = _e === void 0 ? 0.0 : _e;
    return action_1.default(function (_a) {
        var update = _a.update;
        var output = {
            touches: points,
            scale: scale,
            rotate: rotate
        };
        var initialDistance = 0.0;
        var initialRotation = 0.0;
        var isGesture = points.length > 1;
        if (isGesture) {
            var firstTouch = points[0], secondTouch = points[1];
            initialDistance = calc_1.distance(firstTouch, secondTouch);
            initialRotation = calc_1.angle(firstTouch, secondTouch);
        }
        var updatePoint = function () {
            if (isGesture) {
                var firstTouch = points[0], secondTouch = points[1];
                var newDistance = calc_1.distance(firstTouch, secondTouch);
                var newRotation = calc_1.angle(firstTouch, secondTouch);
                output.scale = scale * (newDistance / initialDistance);
                output.rotate = rotate + (newRotation - initialRotation);
            }
            update(output);
        };
        var onMove = function (e) {
            if (preventDefault || e.touches.length > 1)
                e.preventDefault();
            framesync_1.onFrameUpdate(updatePoint);
        };
        var updateOnMove = listen_1.default(document, 'touchmove', { passive: !preventDefault })
            .start(onMove);
        if (isTouchDevice)
            framesync_1.onFrameUpdate(updatePoint);
        return {
            stop: function () {
                framesync_1.cancelOnFrameUpdate(updatePoint);
                updateOnMove.stop();
            }
        };
    });
};
exports.default = multitouch;
exports.getIsTouchDevice = function () { return isTouchDevice; };
//# sourceMappingURL=index.js.map
},{"framesync":209,"../../action":188,"../../calc":27,"../listen":197,"../pointer/utils":187}],46:[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var framesync_1 = require("framesync");
var action_1 = require("../../action");
var listen_1 = require("../listen");
var utils_1 = require("../pointer/utils");
var point = utils_1.defaultPointerPos();
var isMouseDevice = false;
if (typeof document !== 'undefined') {
    var updatePointLocation = function (e) {
        isMouseDevice = true;
        utils_1.eventToPoint(e, point);
    };
    listen_1.default(document, 'mousedown mousemove', true)
        .start(updatePointLocation);
}
var mouse = function (_a) {
    var _b = (_a === void 0 ? {} : _a).preventDefault, preventDefault = _b === void 0 ? true : _b;
    return action_1.default(function (_a) {
        var update = _a.update;
        var updatePoint = function () { return update(point); };
        var onMove = function (e) {
            if (preventDefault)
                e.preventDefault();
            framesync_1.onFrameUpdate(updatePoint);
        };
        var updateOnMove = listen_1.default(document, 'mousemove').start(onMove);
        if (isMouseDevice)
            framesync_1.onFrameUpdate(updatePoint);
        return {
            stop: function () {
                framesync_1.cancelOnFrameUpdate(updatePoint);
                updateOnMove.stop();
            }
        };
    });
};
exports.default = mouse;
//# sourceMappingURL=mouse.js.map
},{"framesync":209,"../../action":188,"../listen":197,"../pointer/utils":187}],198:[function(require,module,exports) {
"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var transformers_1 = require("../../transformers");
var multitouch_1 = require("../multitouch");
var mouse_1 = require("./mouse");
var getFirstTouch = function (_a) {
    var firstTouch = _a[0];
    return firstTouch;
};
var pointer = function (props) {
    if (props === void 0) { props = {}; }
    return multitouch_1.getIsTouchDevice()
        ? multitouch_1.default(props).pipe(function (_a) {
            var touches = _a.touches;
            return touches;
        }, getFirstTouch)
        : mouse_1.default(props);
};
exports.default = function (_a) {
    if (_a === void 0) { _a = {}; }
    var x = _a.x, y = _a.y, props = __rest(_a, ["x", "y"]);
    if (x !== undefined || y !== undefined) {
        var applyXOffset_1 = transformers_1.applyOffset(x || 0);
        var applyYOffset_1 = transformers_1.applyOffset(y || 0);
        var delta_1 = { x: 0, y: 0 };
        return pointer(props).pipe(function (point) {
            delta_1.x = applyXOffset_1(point.x);
            delta_1.y = applyYOffset_1(point.y);
            return delta_1;
        });
    }
    else {
        return pointer(props);
    }
};
//# sourceMappingURL=index.js.map
},{"../../transformers":29,"../multitouch":196,"./mouse":46}],38:[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var action_1 = require("../action");
var chain = function () {
    var actions = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        actions[_i] = arguments[_i];
    }
    return action_1.default(function (_a) {
        var update = _a.update, complete = _a.complete;
        var i = 0;
        var current;
        var playCurrent = function () {
            current = actions[i].start({
                complete: function () {
                    i++;
                    (i >= actions.length) ? complete() : playCurrent();
                },
                update: update
            });
        };
        playCurrent();
        return {
            stop: function () { return current && current.stop(); }
        };
    });
};
exports.default = chain;
//# sourceMappingURL=chain.js.map
},{"../action":188}],40:[function(require,module,exports) {
"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var action_1 = require("../action");
var calc_1 = require("../calc");
var parallel_1 = require("./parallel");
var crossfade = function (a, b) { return action_1.default(function (observer) {
    var balance = 0;
    var fadable = parallel_1.default(a, b).start(__assign({}, observer, { update: function (_a) {
            var va = _a[0], vb = _a[1];
            observer.update(calc_1.getValueFromProgress(va, vb, balance));
        } }));
    return {
        setBalance: function (v) { return balance = v; },
        stop: function () { return fadable.stop(); }
    };
}); };
exports.default = crossfade;
//# sourceMappingURL=crossfade.js.map
},{"../action":188,"../calc":27,"./parallel":43}],41:[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var action_1 = require("../action");
var delay = function (timeToDelay) { return action_1.default(function (_a) {
    var complete = _a.complete;
    var timeout = setTimeout(complete, timeToDelay);
    return {
        stop: function () { return clearTimeout(timeout); }
    };
}); };
exports.default = delay;
//# sourceMappingURL=delay.js.map
},{"../action":188}],42:[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var action_1 = require("../action");
var merge = function () {
    var actions = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        actions[_i] = arguments[_i];
    }
    return action_1.default(function (observer) {
        var subs = actions.map(function (thisAction) { return thisAction.start(observer); });
        return {
            stop: function () { return subs.forEach(function (sub) { return sub.stop(); }); }
        };
    });
};
exports.default = merge;
//# sourceMappingURL=merge.js.map
},{"../action":188}],44:[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var action_1 = require("../action");
var schedule = function (scheduler, schedulee) { return action_1.default(function (_a) {
    var update = _a.update, complete = _a.complete;
    var latest;
    var schedulerSub = scheduler.start({
        update: function () { return latest !== undefined && update(latest); },
        complete: complete
    });
    var scheduleeSub = schedulee.start({
        update: function (v) { return latest = v; },
        complete: complete
    });
    return {
        stop: function () {
            schedulerSub.stop();
            scheduleeSub.stop();
        }
    };
}); };
exports.default = schedule;
//# sourceMappingURL=schedule.js.map
},{"../action":188}],45:[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chain_1 = require("./chain");
var delay_1 = require("./delay");
var parallel_1 = require("./parallel");
var stagger = function (actions, interval) {
    var intervalIsNumber = typeof interval === 'number';
    var actionsWithDelay = actions.map(function (a, i) {
        var timeToDelay = intervalIsNumber ? interval * i : interval(i);
        return chain_1.default(delay_1.default(timeToDelay), a);
    });
    return parallel_1.default.apply(void 0, actionsWithDelay);
};
exports.default = stagger;
//# sourceMappingURL=stagger.js.map
},{"./chain":38,"./delay":41,"./parallel":43}],206:[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var framesync_1 = require("framesync");
var createStyler = function (_a) {
    var onRead = _a.onRead, onRender = _a.onRender, _b = _a.aliasMap, aliasMap = _b === void 0 ? {} : _b, _c = _a.useCache, useCache = _c === void 0 ? true : _c;
    return function (props) {
        var state = {};
        var changedValues = [];
        var hasChanged = false;
        var setValue = function (unmappedKey, value) {
            var key = aliasMap[unmappedKey] || unmappedKey;
            var currentValue = state[key];
            state[key] = value;
            if (state[key] !== currentValue) {
                hasChanged = true;
                if (changedValues.indexOf(key) === -1) {
                    changedValues.push(key);
                }
            }
            if (hasChanged)
                framesync_1.onFrameRender(render);
        };
        var render = function () {
            onRender(state, props, changedValues);
            hasChanged = false;
            changedValues.length = 0;
        };
        return {
            get: function (unmappedKey) {
                var key = aliasMap[unmappedKey] || unmappedKey;
                return (key)
                    ? (useCache && state[key] !== undefined)
                        ? state[key]
                        : onRead(key, props)
                    : state;
            },
            set: function (values, value) {
                if (typeof values === 'string') {
                    if (value !== undefined) {
                        setValue(values, value);
                    }
                    else {
                        return function (v) { return setValue(values, v); };
                    }
                }
                else {
                    for (var key in values) {
                        if (values.hasOwnProperty(key)) {
                            setValue(key, values[key]);
                        }
                    }
                }
                return this;
            },
            render: function (forceRender) {
                if (forceRender === void 0) { forceRender = false; }
                if (forceRender || hasChanged)
                    render();
                return this;
            },
        };
    };
};
exports.default = createStyler;
//# sourceMappingURL=index.js.map
},{"framesync":209}],218:[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CAMEL_CASE_PATTERN = /([a-z])([A-Z])/g;
var REPLACE_TEMPLATE = '$1-$2';
exports.camelToDash = function (str) { return str.replace(CAMEL_CASE_PATTERN, REPLACE_TEMPLATE).toLowerCase(); };
exports.setDomAttrs = function (element, attrs) {
    for (var key in attrs) {
        if (attrs.hasOwnProperty(key)) {
            element.setAttribute(key, attrs[key]);
        }
    }
};
//# sourceMappingURL=utils.js.map
},{}],215:[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../styler/utils");
var camelCache = {};
var dashCache = {};
var prefixes = ['Webkit', 'Moz', 'O', 'ms', ''];
var numPrefixes = prefixes.length;
var testElement;
var testPrefix = function (key) {
    testElement = testElement || document.createElement('div');
    for (var i = 0; i < numPrefixes; i++) {
        var prefix = prefixes[i];
        var noPrefix = (prefix === '');
        var prefixedPropertyName = noPrefix ? key : prefix + key.charAt(0).toUpperCase() + key.slice(1);
        if (prefixedPropertyName in testElement.style) {
            camelCache[key] = prefixedPropertyName;
            dashCache[key] = "" + (noPrefix ? '' : '-') + utils_1.camelToDash(prefixedPropertyName);
        }
    }
};
exports.default = function (key, asDashCase) {
    if (asDashCase === void 0) { asDashCase = false; }
    var cache = asDashCase ? dashCache : camelCache;
    if (!cache[key])
        testPrefix(key);
    return cache[key];
};
//# sourceMappingURL=prefixer.js.map
},{"../styler/utils":218}],216:[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var axes = ['', 'X', 'Y', 'Z'];
var order = ['translate', 'scale', 'rotate', 'skew', 'transformPerspective'];
var transformProps = order.reduce(function (acc, key) {
    return axes.reduce(function (axesAcc, axesKey) {
        axesAcc.push(key + axesKey);
        return axesAcc;
    }, acc);
}, ['x', 'y', 'z']);
var transformPropDictionary = transformProps.reduce(function (dict, key) {
    dict[key] = true;
    return dict;
}, {});
exports.isTransformProp = function (key) { return transformPropDictionary[key] === true; };
exports.sortTransformProps = function (a, b) { return transformProps.indexOf(a) - transformProps.indexOf(b); };
//# sourceMappingURL=transform-props.js.map
},{}],217:[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var style_value_types_1 = require("style-value-types");
var valueTypes = {
    color: style_value_types_1.color,
    backgroundColor: style_value_types_1.color,
    outlineColor: style_value_types_1.color,
    fill: style_value_types_1.color,
    stroke: style_value_types_1.color,
    borderColor: style_value_types_1.color,
    borderTopColor: style_value_types_1.color,
    borderRightColor: style_value_types_1.color,
    borderBottomColor: style_value_types_1.color,
    borderLeftColor: style_value_types_1.color,
    borderRadius: style_value_types_1.px,
    width: style_value_types_1.px,
    maxWidth: style_value_types_1.px,
    height: style_value_types_1.px,
    maxHeight: style_value_types_1.px,
    top: style_value_types_1.px,
    left: style_value_types_1.px,
    bottom: style_value_types_1.px,
    right: style_value_types_1.px,
    rotate: style_value_types_1.degrees,
    rotateX: style_value_types_1.degrees,
    rotateY: style_value_types_1.degrees,
    rotateZ: style_value_types_1.degrees,
    scale: style_value_types_1.scale,
    scaleX: style_value_types_1.scale,
    scaleY: style_value_types_1.scale,
    scaleZ: style_value_types_1.scale,
    skewX: style_value_types_1.degrees,
    skewY: style_value_types_1.degrees,
    distance: style_value_types_1.px,
    translateX: style_value_types_1.px,
    translateY: style_value_types_1.px,
    translateZ: style_value_types_1.px,
    perspective: style_value_types_1.px,
    opacity: style_value_types_1.alpha
};
exports.default = function (key) { return valueTypes[key]; };
//# sourceMappingURL=value-types.js.map
},{"style-value-types":208}],214:[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var transform_props_1 = require("./transform-props");
var prefixer_1 = require("./prefixer");
var value_types_1 = require("./value-types");
function buildStylePropertyString(element, state, changedValues, enableHardwareAcceleration) {
    var propertyString = '';
    var transformString = '';
    var hasTransform = false;
    var transformHasZ = false;
    var numChangedValues = changedValues.length;
    for (var i = 0; i < numChangedValues; i++) {
        var key = changedValues[i];
        if (transform_props_1.isTransformProp(key)) {
            hasTransform = true;
            for (var stateKey in state) {
                if (transform_props_1.isTransformProp(stateKey) && changedValues.indexOf(stateKey) === -1) {
                    changedValues.push(stateKey);
                }
            }
            break;
        }
    }
    changedValues.sort(transform_props_1.sortTransformProps);
    var totalNumChangedValues = changedValues.length;
    for (var i = 0; i < totalNumChangedValues; i++) {
        var key = changedValues[i];
        var value = state[key];
        var valueType = value_types_1.default(key);
        if (valueType && (typeof value === 'number' || typeof value === 'object') && valueType.transform) {
            value = valueType.transform(value);
        }
        if (transform_props_1.isTransformProp(key)) {
            transformString += key + '(' + value + ') ';
            transformHasZ = (key === 'translateZ') ? true : transformHasZ;
        }
        else {
            propertyString += ';' + prefixer_1.default(key, true) + ':' + value;
        }
    }
    if (hasTransform) {
        if (!transformHasZ && enableHardwareAcceleration) {
            transformString += 'translateZ(0)';
        }
        propertyString += ';' + prefixer_1.default('transform', true) + ':' + transformString;
    }
    element.style.cssText += propertyString;
}
exports.default = buildStylePropertyString;
//# sourceMappingURL=render.js.map
},{"./transform-props":216,"./prefixer":215,"./value-types":217}],212:[function(require,module,exports) {
"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var styler_1 = require("../styler");
var prefixer_1 = require("./prefixer");
var render_1 = require("./render");
var transform_props_1 = require("./transform-props");
var value_types_1 = require("./value-types");
var cssStyler = styler_1.default({
    onRead: function (key, _a) {
        var element = _a.element;
        var valueType = value_types_1.default(key);
        if (transform_props_1.isTransformProp(key)) {
            return (valueType)
                ? valueType.default || 0
                : 0;
        }
        else {
            var domValue = window.getComputedStyle(element, null).getPropertyValue(prefixer_1.default(key)) || 0;
            return (valueType && valueType.parse) ? valueType.parse(domValue) : domValue;
        }
    },
    onRender: function (state, _a, changedValues) {
        var element = _a.element, enableHardwareAcceleration = _a.enableHardwareAcceleration;
        render_1.default(element, state, changedValues, enableHardwareAcceleration);
    },
    aliasMap: {
        x: 'translateX',
        y: 'translateY',
        z: 'translateZ',
        originX: 'transform-origin-x',
        originY: 'transform-origin-y'
    }
});
exports.default = function (element, props) {
    return cssStyler(__assign({ element: element, enableHardwareAcceleration: true }, props));
};
//# sourceMappingURL=index.js.map
},{"../styler":206,"./prefixer":215,"./render":214,"./transform-props":216,"./value-types":217}],219:[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../styler/utils");
var transform_props_1 = require("../css/transform-props");
var ZERO_NOT_ZERO = 0.0000001;
var percentToPixels = function (percent, length) {
    return (percent / 100) * length + 'px';
};
var build = function (state, dimensions, isPath, pathLength) {
    var hasTransform = false;
    var hasDashArray = false;
    var props = {};
    var dashArrayStyles = isPath ? {
        pathLength: '0',
        pathSpacing: "" + pathLength
    } : undefined;
    var scale = state.scale !== undefined ? state.scale || ZERO_NOT_ZERO : state.scaleX || 1;
    var scaleY = state.scaleY !== undefined ? state.scaleY || ZERO_NOT_ZERO : scale || 1;
    var transformOriginX = dimensions.width * ((state.originX || 50) / 100) + dimensions.x;
    var transformOriginY = dimensions.height * ((state.originY || 50) / 100) + dimensions.y;
    var scaleTransformX = -transformOriginX * (scale * 1);
    var scaleTransformY = -transformOriginY * (scaleY * 1);
    var scaleReplaceX = transformOriginX / scale;
    var scaleReplaceY = transformOriginY / scaleY;
    var transform = {
        translate: "translate(" + state.translateX + ", " + state.translateY + ") ",
        scale: "translate(" + scaleTransformX + ", " + scaleTransformY + ") scale(" + scale + ", " + scaleY + ") translate(" + scaleReplaceX + ", " + scaleReplaceY + ") ",
        rotate: "rotate(" + state.rotate + ", " + transformOriginX + ", " + transformOriginY + ") ",
        skewX: "skewX(" + state.skewX + ") ",
        skewY: "skewY(" + state.skewY + ") "
    };
    for (var key in state) {
        if (state.hasOwnProperty(key)) {
            var value = state[key];
            if (transform_props_1.isTransformProp(key)) {
                hasTransform = true;
            }
            else if (isPath && (key === 'pathLength' || key === 'pathSpacing') && typeof value === 'number') {
                hasDashArray = true;
                dashArrayStyles[key] = percentToPixels(value, pathLength);
            }
            else if (isPath && key === 'pathOffset') {
                props['stroke-dashoffset'] = percentToPixels(-value, pathLength);
            }
            else {
                props[utils_1.camelToDash(key)] = value;
            }
        }
    }
    if (hasDashArray) {
        props['stroke-dasharray'] = dashArrayStyles.pathLength + ' ' + dashArrayStyles.pathSpacing;
    }
    if (hasTransform) {
        props.transform = '';
        for (var key in transform) {
            if (transform.hasOwnProperty(key)) {
                var defaultValue = (key === 'scale') ? '1' : '0';
                props.transform += transform[key].replace(/undefined/g, defaultValue);
            }
        }
    }
    return props;
};
exports.default = build;
//# sourceMappingURL=build.js.map
},{"../styler/utils":218,"../css/transform-props":216}],220:[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var style_value_types_1 = require("style-value-types");
var valueTypes = {
    fill: style_value_types_1.color,
    stroke: style_value_types_1.color,
    scale: style_value_types_1.scale,
    scaleX: style_value_types_1.scale,
    scaleY: style_value_types_1.scale,
    opacity: style_value_types_1.alpha,
    fillOpacity: style_value_types_1.alpha,
    strokeOpacity: style_value_types_1.alpha
};
exports.default = function (key) { return valueTypes[key]; };
//# sourceMappingURL=value-types.js.map
},{"style-value-types":208}],213:[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var transform_props_1 = require("../css/transform-props");
var styler_1 = require("../styler");
var utils_1 = require("../styler/utils");
var build_1 = require("./build");
var value_types_1 = require("./value-types");
var svgStyler = styler_1.default({
    onRead: function (key, _a) {
        var element = _a.element;
        if (!transform_props_1.isTransformProp(key)) {
            return element.getAttribute(key);
        }
        else {
            var valueType = value_types_1.default(key);
            return valueType ? valueType.default : 0;
        }
    },
    onRender: function (state, _a, changedValues) {
        var dimensions = _a.dimensions, element = _a.element, isPath = _a.isPath, pathLength = _a.pathLength;
        utils_1.setDomAttrs(element, build_1.default(state, dimensions, isPath, pathLength));
    },
    aliasMap: {
        x: 'translateX',
        y: 'translateY',
        background: 'fill'
    }
});
exports.default = function (element) {
    var _a = element.getBBox(), x = _a.x, y = _a.y, width = _a.width, height = _a.height;
    var props = {
        element: element,
        dimensions: { x: x, y: y, width: width, height: height },
        isPath: false
    };
    if (element.tagName === 'path') {
        props.isPath = true;
        props.pathLength = element.getTotalLength();
    }
    return svgStyler(props);
};
//# sourceMappingURL=index.js.map
},{"../css/transform-props":216,"../styler":206,"../styler/utils":218,"./build":219,"./value-types":220}],207:[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var css_1 = require("./css");
var styler_1 = require("./styler");
exports.createStyler = styler_1.default;
var svg_1 = require("./svg");
function default_1(nodeOrSelector) {
    var node = (typeof nodeOrSelector === 'string')
        ? document.querySelector(nodeOrSelector)
        : nodeOrSelector;
    return (node instanceof SVGElement) ? svg_1.default(node) : css_1.default(node);
}
exports.default = default_1;
//# sourceMappingURL=index.js.map
},{"./css":212,"./styler":206,"./svg":213}],25:[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var action_1 = require("./action");
exports.action = action_1.default;
var multicast_1 = require("./reactions/multicast");
exports.multicast = multicast_1.default;
var value_1 = require("./reactions/value");
exports.value = value_1.default;
var decay_1 = require("./animations/decay");
exports.decay = decay_1.default;
var every_frame_1 = require("./animations/every-frame");
exports.everyFrame = every_frame_1.default;
var keyframes_1 = require("./animations/keyframes");
exports.keyframes = keyframes_1.default;
var physics_1 = require("./animations/physics");
exports.physics = physics_1.default;
var spring_1 = require("./animations/spring");
exports.spring = spring_1.default;
var timeline_1 = require("./animations/timeline");
exports.timeline = timeline_1.default;
var tween_1 = require("./animations/tween");
exports.tween = tween_1.default;
var listen_1 = require("./input/listen");
exports.listen = listen_1.default;
var multitouch_1 = require("./input/multitouch");
exports.multitouch = multitouch_1.default;
var pointer_1 = require("./input/pointer");
exports.pointer = pointer_1.default;
var mouse_1 = require("./input/pointer/mouse");
exports.mouse = mouse_1.default;
var chain_1 = require("./compositors/chain");
exports.chain = chain_1.default;
var composite_1 = require("./compositors/composite");
exports.composite = composite_1.default;
var crossfade_1 = require("./compositors/crossfade");
exports.crossfade = crossfade_1.default;
var delay_1 = require("./compositors/delay");
exports.delay = delay_1.default;
var merge_1 = require("./compositors/merge");
exports.merge = merge_1.default;
var parallel_1 = require("./compositors/parallel");
exports.parallel = parallel_1.default;
var schedule_1 = require("./compositors/schedule");
exports.schedule = schedule_1.default;
var stagger_1 = require("./compositors/stagger");
exports.stagger = stagger_1.default;
var calc = require("./calc");
exports.calc = calc;
var easing = require("./easing");
exports.easing = easing;
var transform = require("./transformers");
exports.transform = transform;
var stylefire_1 = require("stylefire");
exports.styler = stylefire_1.default;
var css_1 = require("stylefire/css");
exports.css = css_1.default;
var svg_1 = require("stylefire/svg");
exports.svg = svg_1.default;
var valueTypes = require("style-value-types");
exports.valueTypes = valueTypes;
//# sourceMappingURL=index.js.map
},{"./action":188,"./reactions/multicast":36,"./reactions/value":37,"./animations/decay":189,"./animations/every-frame":192,"./animations/keyframes":190,"./animations/physics":191,"./animations/spring":193,"./animations/timeline":194,"./animations/tween":195,"./input/listen":197,"./input/multitouch":196,"./input/pointer":198,"./input/pointer/mouse":46,"./compositors/chain":38,"./compositors/composite":39,"./compositors/crossfade":40,"./compositors/delay":41,"./compositors/merge":42,"./compositors/parallel":43,"./compositors/schedule":44,"./compositors/stagger":45,"./calc":27,"./easing":28,"./transformers":29,"stylefire":207,"stylefire/css":212,"stylefire/svg":213,"style-value-types":208}],135:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj) {
	var type = typeof obj;
	return type === 'function' || type === 'object' && !!obj;
};
},{}],183:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
// quick reference variables for speed access
//-------------------------------------------

// Save bytes in the minified (but not gzipped) version:
const ArrayProto = exports.ArrayProto = Array.prototype;
const ObjProto = exports.ObjProto = Object.prototype;
const SymbolProto = exports.SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null;

// Create quick reference variables for speed access to core prototypes.
const push = exports.push = ArrayProto.push;
const slice = exports.slice = ArrayProto.slice;
const toString = exports.toString = ObjProto.toString;
const hasOwnProperty = exports.hasOwnProperty = ObjProto.hasOwnProperty;

// All **ECMAScript 5** native function implementations that we hope to use
// are declared here.
const nativeIsArray = exports.nativeIsArray = Array.isArray;
const nativeKeys = exports.nativeKeys = Object.keys;
const nativeCreate = exports.nativeCreate = Object.create;

// Naked function reference for surrogate-prototype-swapping.
const Ctor = exports.Ctor = function () {};
},{}],118:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj, key) {
	return obj != null && _quickaccess.hasOwnProperty.call(obj, key);
};

var _quickaccess = require('./_quickaccess');
},{"./_quickaccess":183}],61:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj, iteratee, context) {
	iteratee = (0, _internal.optimizeCb)(iteratee, context);
	let i, length;
	if ((0, _internal.isArrayLike)(obj)) {
		for (i = 0, length = obj.length; i < length; i++) {
			iteratee(obj[i], i, obj);
		}
	} else {
		var keys = (0, _keys3.default)(obj);
		for (i = 0, length = keys.length; i < length; i++) {
			iteratee(obj[keys[i]], keys[i], obj);
		}
	}
	return obj;
};

var _keys2 = require('./keys');

var _keys3 = _interopRequireDefault(_keys2);

var _internal = require('./_internal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./keys":143,"./_internal":199}],52:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _forEach = require('./forEach');

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_forEach).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./forEach":61}],89:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _internal = require('./_internal');

// Returns the first index on an array-like that passes a predicate test.
var _findIndex = (0, _internal.createPredicateIndexFinder)(1); // `_findIndex` : an array's function
// -----------------------------------

exports.default = _findIndex;
},{"./_internal":199}],100:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (array, obj, iteratee, context) {
	iteratee = (0, _internal.cb)(iteratee, context, 1);
	let value = iteratee(obj);
	let low = 0,
	    high = (0, _internal.getLength)(array);
	while (low < high) {
		let mid = Math.floor((low + high) / 2);
		if (iteratee(array[mid]) < value) low = mid + 1;else high = mid;
	}
	return low;
};

var _internal = require('./_internal');
},{"./_internal":199}],92:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports._indexOf = undefined;

var _findIndex2 = require('./findIndex');

var _findIndex3 = _interopRequireDefault(_findIndex2);

var _sortedIndex2 = require('./sortedIndex');

var _sortedIndex3 = _interopRequireDefault(_sortedIndex2);

var _internal = require('./_internal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Return the position of the first occurrence of an item in an array,
// or -1 if the item is not included in the array.
// If the array is large and already in sort order, pass `true`
// for **isSorted** to use binary search.
var _indexOf = exports._indexOf = (0, _internal.createIndexFinder)(1, _findIndex3.default, _sortedIndex3.default); // `_indexOf` : an array's function
// ---------------------------------

exports.default = _indexOf;
},{"./findIndex":89,"./sortedIndex":100,"./_internal":199}],150:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj) {
	let keys = (0, _keys3.default)(obj);
	let length = keys.length;
	let values = Array(length);
	for (let i = 0; i < length; i++) {
		values[i] = obj[keys[i]];
	}
	return values;
};

var _keys2 = require('./keys');

var _keys3 = _interopRequireDefault(_keys2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./keys":143}],66:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj, item, fromIndex, guard) {
	if (!(0, _internal.isArrayLike)(obj)) obj = (0, _values3.default)(obj);
	if (typeof fromIndex != 'number' || guard) fromIndex = 0;
	return (0, _indexOf3.default)(obj, item, fromIndex) >= 0;
};

var _indexOf2 = require('./indexOf');

var _indexOf3 = _interopRequireDefault(_indexOf2);

var _values2 = require('./values');

var _values3 = _interopRequireDefault(_values2);

var _internal = require('./_internal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./indexOf":92,"./values":150,"./_internal":199}],50:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _include = require('./include');

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_include).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./include":66}],120:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = exports._isArray = undefined;

var _quickaccess = require('./_quickaccess');

// Is a given value an array?
// Delegates to ECMA5's native Array.isArray
var _isArray = exports._isArray = _quickaccess.nativeIsArray || function (obj) {
	return _quickaccess.toString.call(obj) === '[object Array]';
}; // `_isArray` : an object's function
// ----------------------------------

exports.default = _isArray;
},{"./_quickaccess":183}],130:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = undefined;

var _quickaccess = require('./_quickaccess');

// Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
// IE 11 (#1621), Safari 8 (#1929), and PhantomJS (#2236).
function customFunction() {
	if (typeof /./ != 'function' && typeof Int8Array != 'object' && typeof document !== 'undefined' && typeof document.childNodes != 'function') {
		return obj => typeof obj == 'function' || false;
	}
	return null;
}

// Is a given value a function?
// `_isFunction` : an object's function
// -------------------------------------

var _isFunction = customFunction() || function (obj) {
	return _quickaccess.toString.call(obj) === '[object Function]';
};

exports.default = _isFunction;
},{"./_quickaccess":183}],121:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = undefined;

var _has2 = require('./has');

var _has3 = _interopRequireDefault(_has2);

var _quickaccess = require('./_quickaccess');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Define a fallback version of the method in browsers (ahem, IE < 9), where
// there isn't any inspectable "Arguments" type.
// `_isArguments` : an object's function
// --------------------------------------

function customArguments() {
	if (_quickaccess.toString.call(arguments) === '[object Arguments]') return null;
	return obj => (0, _has3.default)(obj, 'callee');
}

// Is a given value an arguments object?
var _isArguments = customArguments() || function (obj) {
	return _quickaccess.toString.call(obj) === '[object Arguments]';
};

exports.default = _isArguments;
},{"./has":118,"./_quickaccess":183}],134:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj) {
	return _quickaccess.toString.call(obj) === '[object Number]';
};

var _quickaccess = require('./_quickaccess');
},{"./_quickaccess":183}],132:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj) {
	return (0, _isNumber3.default)(obj) && isNaN(obj);
};

var _isNumber2 = require('./isNumber');

var _isNumber3 = _interopRequireDefault(_isNumber2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./isNumber":134}],119:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj) {
	let result = {};
	let keys = (0, _keys3.default)(obj);
	for (let i = 0, length = keys.length; i < length; i++) {
		result[obj[keys[i]]] = keys[i];
	}
	return result;
};

var _keys2 = require('./keys');

var _keys3 = _interopRequireDefault(_keys2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./keys":143}],170:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = undefined;
exports._setIteratee = _setIteratee;

var _isFunction2 = require('./isFunction');

var _isFunction3 = _interopRequireDefault(_isFunction2);

var _internal = require('./_internal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// External wrapper for our callback generator. Users may customize
// `_.iteratee` if they want additional predicate/iteratee shorthand styles.
// This abstraction hides the internal-only argCount argument.
// `_iteratee` : an utility's function
// ------------------------------------

var _iteratee = _internal.builtinIteratee;

function _setIteratee(fn) {
	exports.default = _iteratee = (0, _isFunction3.default)(fn) ? fn : _internal.builtinIteratee;
}
exports.default = _iteratee;
},{"./isFunction":130,"./_internal":199}],169:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (value) {
	return value;
};
},{}],115:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _keys2 = require('./keys');

var _keys3 = _interopRequireDefault(_keys2);

var _internal = require('./_internal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Extend a given object with the properties in passed-in object(s).
// `_extendOwn` : an object's function
// ------------------------------------

var _extendOwn = (0, _internal.createAssigner)(_keys3.default);

exports.default = _extendOwn;
},{"./keys":143,"./_internal":199}],131:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (object, attrs) {
	let keys = (0, _keys3.default)(attrs),
	    length = keys.length;
	if (object == null) return !length;
	let obj = Object(object);
	for (let i = 0; i < length; i++) {
		let key = keys[i];
		if (attrs[key] !== obj[key] || !(key in obj)) return false;
	}
	return true;
};

var _keys2 = require('./keys');

var _keys3 = _interopRequireDefault(_keys2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./keys":143}],172:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (attrs) {
	attrs = (0, _extendOwn3.default)({}, attrs);
	return obj => (0, _isMatch3.default)(obj, attrs);
};

var _extendOwn2 = require('./extendOwn');

var _extendOwn3 = _interopRequireDefault(_extendOwn2);

var _isMatch2 = require('./isMatch');

var _isMatch3 = _interopRequireDefault(_isMatch2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./extendOwn":115,"./isMatch":131}],171:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _matches = require('./matches');

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_matches).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./matches":172}],184:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
// `_` : base namespace and constructor for underscore's object
// ----------------------------------------------------------------------------------------------

// Baseline setup
function _(obj) {
	if (obj instanceof _) return obj;
	if (!(this instanceof _)) return new _(obj);
	this._wrapped = obj;
}
// Current version.
_.VERSION = '1.9.8';

exports.default = _; // @important: exportation of the function, not only it definition
},{}],199:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.escapeRegExp = exports.escapes = exports.noMatch = exports.unescapeMap = exports.escapeMap = exports.reStrSymbol = exports.nonEnumerableProps = exports.hasEnumBug = exports.isArrayLike = exports.getLength = exports.MAX_ARRAY_INDEX = undefined;
exports.optimizeCb = optimizeCb;
exports.builtinIteratee = builtinIteratee;
exports.cb = cb;
exports.restArgs = restArgs;
exports.baseCreate = baseCreate;
exports.property = property;
exports.createReduce = createReduce;
exports.group = group;
exports.flatten = flatten;
exports.createPredicateIndexFinder = createPredicateIndexFinder;
exports.createIndexFinder = createIndexFinder;
exports.executeBound = executeBound;
exports.collectNonEnumProps = collectNonEnumProps;
exports.createAssigner = createAssigner;
exports.keyInObj = keyInObj;
exports.eq = eq;
exports.deepEq = deepEq;
exports.createEscaper = createEscaper;
exports.escapeChar = escapeChar;

var _each2 = require('./each');

var _each3 = _interopRequireDefault(_each2);

var _contains2 = require('./contains');

var _contains3 = _interopRequireDefault(_contains2);

var _isArray2 = require('./isArray');

var _isArray3 = _interopRequireDefault(_isArray2);

var _isFunction2 = require('./isFunction');

var _isFunction3 = _interopRequireDefault(_isFunction2);

var _isObject2 = require('./isObject');

var _isObject3 = _interopRequireDefault(_isObject2);

var _isArguments2 = require('./isArguments');

var _isArguments3 = _interopRequireDefault(_isArguments2);

var _isNaN2 = require('./isNaN');

var _isNaN3 = _interopRequireDefault(_isNaN2);

var _invert2 = require('./invert');

var _invert3 = _interopRequireDefault(_invert2);

var _keys2 = require('./keys');

var _keys3 = _interopRequireDefault(_keys2);

var _has2 = require('./has');

var _has3 = _interopRequireDefault(_has2);

var _iteratee2 = require('./iteratee');

var _iteratee3 = _interopRequireDefault(_iteratee2);

var _identity2 = require('./identity');

var _identity3 = _interopRequireDefault(_identity2);

var _matcher2 = require('./matcher');

var _matcher3 = _interopRequireDefault(_matcher2);

var _base = require('./_base');

var _base2 = _interopRequireDefault(_base);

var _quickaccess = require('./_quickaccess');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Internal function that returns an efficient (for current engines) version
// of the passed-in callback, to be repeatedly applied in other Underscore
// functions.
function optimizeCb(func, context, argCount) {
	if (context === void 0) return func;
	switch (argCount == null ? 3 : argCount) {
		case 1:
			return value => func.call(context, value);
		// The 2-parameter case has been omitted only because no current consumers
		// made use of it.
		case 3:
			return (value, index, collection) => func.call(context, value, index, collection);
		case 4:
			return (accumulator, value, index, collection) => func.call(context, accumulator, value, index, collection);
	}
	return function () {
		return func.apply(context, arguments);
	};
}

// for callback generator.
// This abstraction is use to hide the internal-only argCount argument.
// Internal functions
//--------------------

function builtinIteratee(value, context) {
	return cb(value, context, Infinity);
}

// An internal function to generate callbacks that can be applied to each
// element in a collection, returning the desired result — either `identity`,
// an arbitrary callback, a property matcher, or a property accessor.
function cb(value, context, argCount) {
	if (_iteratee3.default !== builtinIteratee) return (0, _iteratee3.default)(value, context);
	if (value == null) return _identity3.default;
	if ((0, _isFunction3.default)(value)) return optimizeCb(value, context, argCount);
	if ((0, _isObject3.default)(value)) return (0, _matcher3.default)(value);
	return property(value);
}

// Similar to ES6's rest param (http://ariya.ofilabs.com/2013/03/es6-and-rest-parameter.html)
// This accumulates the arguments passed into an array, after a given index.
function restArgs(func, startIndex) {
	startIndex = startIndex == null ? func.length - 1 : +startIndex;
	return function () {
		let length = Math.max(arguments.length - startIndex, 0),
		    rest = Array(length),
		    index = 0;
		for (; index < length; index++) {
			rest[index] = arguments[index + startIndex];
		}
		switch (startIndex) {
			case 0:
				return func.call(this, rest);
			case 1:
				return func.call(this, arguments[0], rest);
			case 2:
				return func.call(this, arguments[0], arguments[1], rest);
		}
		var args = Array(startIndex + 1);
		for (index = 0; index < startIndex; index++) {
			args[index] = arguments[index];
		}
		args[startIndex] = rest;
		return func.apply(this, args);
	};
}

// An internal function for creating a new object that inherits from another.
// @TODO from quickaccess
function baseCreate(prototype) {
	if (!(0, _isObject3.default)(prototype)) return {};
	if (_quickaccess.nativeCreate) return (0, _quickaccess.nativeCreate)(prototype);
	_quickaccess.Ctor.prototype = prototype;
	var result = new _quickaccess.Ctor();
	_quickaccess.Ctor.prototype = null;
	return result;
}

// An internal function used for get key's value from an object.
function property(key) {
	return obj => obj == null ? void 0 : obj[key];
}

// Helper for collection methods to determine whether a collection
// should be iterated as an array or as an object.
// Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
// Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
const MAX_ARRAY_INDEX = exports.MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
var getLength = exports.getLength = property('length');
var isArrayLike = exports.isArrayLike = function (collection) {
	// @TODO simplify to function
	let length = getLength(collection);
	return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
};

// Create a reducing function iterating left or right.
function createReduce(dir) {
	// Wrap code that reassigns argument variables in a separate function than
	// the one that accesses `arguments.length` to avoid a perf hit. (#1991)
	let reducer = function (obj, iteratee, memo, initial) {
		let keys = !isArrayLike(obj) && (0, _keys3.default)(obj),
		    length = (keys || obj).length,
		    index = dir > 0 ? 0 : length - 1;
		if (!initial) {
			memo = obj[keys ? keys[index] : index];
			index += dir;
		}
		for (; index >= 0 && index < length; index += dir) {
			let currentKey = keys ? keys[index] : index;
			memo = iteratee(memo, obj[currentKey], currentKey, obj);
		}
		return memo;
	};

	return function (obj, iteratee, memo, context) {
		let initial = arguments.length >= 3;
		return reducer(obj, optimizeCb(iteratee, context, 4), memo, initial);
	};
}

// An internal function used for aggregate "group by" operations.
function group(behavior, partition) {
	return function (obj, iteratee, context) {
		let result = partition ? [[], []] : {};
		iteratee = cb(iteratee, context);
		(0, _each3.default)(obj, (value, index) => {
			let key = iteratee(value, index, obj);
			behavior(result, value, key);
		});
		return result;
	};
}

// Internal implementation of a recursive `flatten` function.
function flatten(input, shallow, strict, output) {
	output = output || [];
	let idx = output.length;
	for (let i = 0, length = getLength(input); i < length; i++) {
		var value = input[i];
		if (isArrayLike(value) && ((0, _isArray3.default)(value) || (0, _isArguments3.default)(value))) {
			// Flatten current level of array or arguments object.
			if (shallow) {
				let j = 0,
				    len = value.length;
				while (j < len) output[idx++] = value[j++];
			} else {
				flatten(value, shallow, strict, output);
				idx = output.length;
			}
		} else if (!strict) {
			output[idx++] = value;
		}
	}
	return output;
}

// Generator function to create the findIndex and findLastIndex functions.
function createPredicateIndexFinder(dir) {
	return function (array, predicate, context) {
		predicate = cb(predicate, context);
		let length = getLength(array);
		let index = dir > 0 ? 0 : length - 1;
		for (; index >= 0 && index < length; index += dir) {
			if (predicate(array[index], index, array)) return index;
		}
		return -1;
	};
}

// Generator function to create the indexOf and lastIndexOf functions.
function createIndexFinder(dir, predicateFind, sortedIndex) {
	return function (array, item, idx) {
		let i = 0,
		    length = getLength(array);
		if (typeof idx == 'number') {
			if (dir > 0) {
				i = idx >= 0 ? idx : Math.max(idx + length, i);
			} else {
				length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
			}
		} else if (sortedIndex && idx && length) {
			idx = sortedIndex(array, item);
			return array[idx] === item ? idx : -1;
		}
		if (item !== item) {
			idx = predicateFind(_quickaccess.slice.call(array, i, length), _isNaN3.default);
			return idx >= 0 ? idx + i : -1;
		}
		for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
			if (array[idx] === item) return idx;
		}
		return -1;
	};
}

// Determines whether to execute a function as a constructor
// or a normal function with the provided arguments.
function executeBound(sourceFunc, boundFunc, context, callingContext, args) {
	if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
	let self = baseCreate(sourceFunc.prototype);
	let result = sourceFunc.apply(self, args);
	if ((0, _isObject3.default)(result)) return result;
	return self;
}

// Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
// @TODO move to _quickaccess to prevent inappropriate cyclic dependency with `keys` and `allkeys`
// @FUTURE remove this hack when the will ignore IE<9 since the goal is now ES6 and beyond.
var hasEnumBug = exports.hasEnumBug = !{ toString: null }.propertyIsEnumerable('toString');
var nonEnumerableProps = exports.nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString', 'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];
// hack for enumerating bug
function collectNonEnumProps(obj, keys) {
	let nonEnumIdx = nonEnumerableProps.length;
	let constructor = obj.constructor;
	let proto = (0, _isFunction3.default)(constructor) && constructor.prototype || _quickaccess.ObjProto;

	// Constructor is a special case.
	let prop = 'constructor';
	if ((0, _has3.default)(obj, prop) && !(0, _contains3.default)(keys, prop)) keys.push(prop);

	while (nonEnumIdx--) {
		prop = nonEnumerableProps[nonEnumIdx];
		if (prop in obj && obj[prop] !== proto[prop] && !(0, _contains3.default)(keys, prop)) {
			keys.push(prop);
		}
	}
}

// An internal function for creating assigner functions.
function createAssigner(keysFunc, defaults) {
	return function (obj) {
		let length = arguments.length;
		if (defaults) obj = Object(obj);
		if (length < 2 || obj == null) return obj;
		for (let index = 1; index < length; index++) {
			let source = arguments[index],
			    keys = keysFunc(source),
			    l = keys.length;
			for (let i = 0; i < l; i++) {
				let key = keys[i];
				if ((0, _isObject3.default)(obj) && (!defaults || obj[key] === void 0)) obj[key] = source[key];
			}
		}
		return obj;
	};
}

// Internal pick helper function to determine if `obj` has key `key`.
function keyInObj(value, key, obj) {
	return key in obj;
}

// Internal recursive comparison function for `isEqual`.
function eq(a, b, aStack, bStack) {
	// Identical objects are equal. `0 === -0`, but they aren't identical.
	// See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
	if (a === b) return a !== 0 || 1 / a === 1 / b;
	// A strict comparison is necessary because `null == undefined`.
	if (a == null || b == null) return a === b;
	// `NaN`s are equivalent, but non-reflexive.
	if (a !== a) return b !== b;
	// Exhaust primitive checks
	let type = typeof a;
	if (type !== 'function' && type !== 'object' && typeof b != 'object') return false;
	return deepEq(a, b, aStack, bStack);
}

// Internal recursive comparison function for `isEqual`.
// @TODO from quickaccess
function deepEq(a, b, aStack, bStack) {
	// Unwrap any wrapped objects.
	if (a instanceof _base2.default) a = a._wrapped;
	if (b instanceof _base2.default) b = b._wrapped;
	// Compare `[[Class]]` names.
	let className = _quickaccess.toString.call(a);
	if (className !== _quickaccess.toString.call(b)) return false;
	switch (className) {
		// Strings, numbers, regular expressions, dates, and booleans are compared by value.
		case '[object RegExp]':
		// RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
		case '[object String]':
			// Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
			// equivalent to `new String("5")`.
			return '' + a === '' + b;
		case '[object Number]':
			// `NaN`s are equivalent, but non-reflexive.
			// Object(NaN) is equivalent to NaN.
			if (+a !== +a) return +b !== +b;
			// An `egal` comparison is performed for other numeric values.
			return +a === 0 ? 1 / +a === 1 / b : +a === +b;
		case '[object Date]':
		case '[object Boolean]':
			// Coerce dates and booleans to numeric primitive values. Dates are compared by their
			// millisecond representations. Note that invalid dates with millisecond representations
			// of `NaN` are not equivalent.
			return +a === +b;
		case '[object Symbol]':
			return _quickaccess.SymbolProto.valueOf.call(a) === _quickaccess.SymbolProto.valueOf.call(b);
	}

	let areArrays = className === '[object Array]';
	if (!areArrays) {
		if (typeof a != 'object' || typeof b != 'object') return false;

		// Objects with different constructors are not equivalent, but `Object`s or `Array`s
		// from different frames are.
		var aCtor = a.constructor,
		    bCtor = b.constructor;
		if (aCtor !== bCtor && !(_base2.default.isFunction(aCtor) && aCtor instanceof aCtor && _base2.default.isFunction(bCtor) && bCtor instanceof bCtor) && 'constructor' in a && 'constructor' in b) {
			return false;
		}
	}
	// Assume equality for cyclic structures. The algorithm for detecting cyclic
	// structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

	// Initializing stack of traversed objects.
	// It's done here since we only need them for objects and arrays comparison.
	aStack = aStack || [];
	bStack = bStack || [];
	let length = aStack.length;
	while (length--) {
		// Linear search. Performance is inversely proportional to the number of
		// unique nested structures.
		if (aStack[length] === a) return bStack[length] === b;
	}

	// Add the first object to the stack of traversed objects.
	aStack.push(a);
	bStack.push(b);

	// Recursively compare objects and arrays.
	if (areArrays) {
		// Compare array lengths to determine if a deep comparison is necessary.
		length = a.length;
		if (length !== b.length) return false;
		// Deep compare the contents, ignoring non-numeric properties.
		while (length--) {
			if (!eq(a[length], b[length], aStack, bStack)) return false;
		}
	} else {
		// Deep compare objects.
		let keys = _base2.default.keys(a),
		    key;
		length = keys.length;
		// Ensure that both objects contain the same number of properties before comparing deep equality.
		if (_base2.default.keys(b).length !== length) return false;
		while (length--) {
			// Deep compare each member
			key = keys[length];
			if (!(_base2.default.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
		}
	}
	// Remove the first object from the stack of traversed objects.
	aStack.pop();
	bStack.pop();
	return true;
}

// can be use to keep surrogate pair characters together (see `toArray` function for usage example)
var reStrSymbol = exports.reStrSymbol = /[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;

// List of HTML entities for escaping.
var escapeMap = exports.escapeMap = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#x27;',
	'`': '&#x60;'
};
var unescapeMap = exports.unescapeMap = (0, _invert3.default)(escapeMap);

// Functions for escaping and unescaping strings to/from HTML interpolation.
function createEscaper(map) {
	var escaper = match => map[match];
	// Regexes for identifying a key that needs to be escaped.
	var source = '(?:' + (0, _keys3.default)(map).join('|') + ')';
	var testRegexp = RegExp(source);
	var replaceRegexp = RegExp(source, 'g');
	return string => {
		string = string == null ? '' : '' + string;
		return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
	};
}

// When customizing `templateSettings`, if you don't want to define an
// interpolation, evaluation or escaping regex, we need one that is
// guaranteed not to match.
var noMatch = exports.noMatch = /(.)^/;
// Certain characters need to be escaped so that they can be put into a
// string literal.
var escapes = exports.escapes = {
	"'": "'",
	'\\': '\\',
	'\r': 'r',
	'\n': 'n',
	'\u2028': 'u2028',
	'\u2029': 'u2029'
};
var escapeRegExp = exports.escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;
// function to escaped some characters
function escapeChar(match) {
	return '\\' + escapes[match];
}
},{"./each":52,"./contains":50,"./isArray":120,"./isFunction":130,"./isObject":135,"./isArguments":121,"./isNaN":132,"./invert":119,"./keys":143,"./has":118,"./iteratee":170,"./identity":169,"./matcher":171,"./_base":184,"./_quickaccess":183}],143:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj) {
	if (!(0, _isObject3.default)(obj)) return [];
	if (_quickaccess.nativeKeys) return (0, _quickaccess.nativeKeys)(obj);
	let keys = [];
	for (let key in obj) if ((0, _has3.default)(obj, key)) keys.push(key);
	// Ahem, IE < 9.
	if (_internal.hasEnumBug) (0, _internal.collectNonEnumProps)(obj, keys);
	return keys;
};

var _isObject2 = require('./isObject');

var _isObject3 = _interopRequireDefault(_isObject2);

var _has2 = require('./has');

var _has3 = _interopRequireDefault(_has2);

var _quickaccess = require('./_quickaccess');

var _internal = require('./_internal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./isObject":135,"./has":118,"./_quickaccess":183,"./_internal":199}],47:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj, predicate, context) {
	predicate = (0, _internal.cb)(predicate, context);
	let keys = !(0, _internal.isArrayLike)(obj) && (0, _keys3.default)(obj),
	    length = (keys || obj).length;
	for (let index = 0; index < length; index++) {
		var currentKey = keys ? keys[index] : index;
		if (!predicate(obj[currentKey], currentKey, obj)) return false;
	}
	return true;
};

var _keys2 = require('./keys');

var _keys3 = _interopRequireDefault(_keys2);

var _internal = require('./_internal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./keys":143,"./_internal":199}],48:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj, predicate, context) {
	predicate = (0, _internal.cb)(predicate, context);
	let keys = !(0, _internal.isArrayLike)(obj) && (0, _keys3.default)(obj),
	    length = (keys || obj).length;
	for (let index = 0; index < length; index++) {
		let currentKey = keys ? keys[index] : index;
		if (predicate(obj[currentKey], currentKey, obj)) return true;
	}
	return false;
};

var _keys2 = require('./keys');

var _keys3 = _interopRequireDefault(_keys2);

var _internal = require('./_internal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./keys":143,"./_internal":199}],49:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj, iteratee, context) {
	iteratee = (0, _internal.cb)(iteratee, context);
	let keys = !(0, _internal.isArrayLike)(obj) && (0, _keys3.default)(obj),
	    length = (keys || obj).length,
	    results = Array(length);
	for (let index = 0; index < length; index++) {
		let currentKey = keys ? keys[index] : index;
		results[index] = iteratee(obj[currentKey], currentKey, obj);
	}
	return results;
};

var _keys2 = require('./keys');

var _keys3 = _interopRequireDefault(_keys2);

var _internal = require('./_internal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./keys":143,"./_internal":199}],51:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = undefined;

var _has2 = require('./has');

var _has3 = _interopRequireDefault(_has2);

var _internal = require('./_internal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Counts instances of an object that group by a certain criterion. Pass
// either a string attribute to count by, or a function that returns the
// criterion.
// `_countBy` : a collection's function
// -------------------------------------

var _countBy = (0, _internal.group)((result, value, key) => {
	if ((0, _has3.default)(result, key)) result[key]++;else result[key] = 1;
});

exports.default = _countBy;
},{"./has":118,"./_internal":199}],116:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj, predicate, context) {
	predicate = (0, _internal.cb)(predicate, context);
	let keys = (0, _keys3.default)(obj),
	    key;
	for (let i = 0, length = keys.length; i < length; i++) {
		key = keys[i];
		if (predicate(obj[key], key, obj)) return key;
	}
};

var _keys2 = require('./keys');

var _keys3 = _interopRequireDefault(_keys2);

var _internal = require('./_internal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./keys":143,"./_internal":199}],54:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj, predicate, context) {
	let keyFinder = (0, _internal.isArrayLike)(obj) ? _findIndex3.default : _findKey3.default;
	let key = keyFinder(obj, predicate, context);
	if (key !== void 0 && key !== -1) return obj[key];
};

var _findIndex2 = require('./findIndex');

var _findIndex3 = _interopRequireDefault(_findIndex2);

var _findKey2 = require('./findKey');

var _findKey3 = _interopRequireDefault(_findKey2);

var _internal = require('./_internal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./findIndex":89,"./findKey":116,"./_internal":199}],53:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _all = require('./all');

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_all).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./all":47}],78:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj, predicate, context) {
	let results = [];
	predicate = (0, _internal.cb)(predicate, context);
	(0, _each3.default)(obj, (value, index, list) => {
		if (predicate(value, index, list)) results.push(value);
	});
	return results;
};

var _each2 = require('./each');

var _each3 = _interopRequireDefault(_each2);

var _internal = require('./_internal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./each":52,"./_internal":199}],55:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _select = require('./select');

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_select).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./select":78}],56:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _detect = require('./detect');

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_detect).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./detect":54}],57:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj, attrs) {
	return (0, _find3.default)(obj, (0, _matcher3.default)(attrs));
};

var _find2 = require('./find');

var _find3 = _interopRequireDefault(_find2);

var _matcher2 = require('./matcher');

var _matcher3 = _interopRequireDefault(_matcher2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./find":56,"./matcher":171}],93:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (array, n, guard) {
	return _quickaccess.slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
};

var _quickaccess = require('./_quickaccess');
},{"./_quickaccess":183}],102:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (array, n, guard) {
	if (array == null || array.length < 1) return void 0;
	if (n == null || guard) return array[0];
	return (0, _initial3.default)(array, array.length - n);
};

var _initial2 = require('./initial');

var _initial3 = _interopRequireDefault(_initial2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./initial":93}],58:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _take = require('./take');

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_take).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./take":102}],67:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _internal = require('./_internal');

// **Reduce** builds up a single result from a list of values.
var _inject = (0, _internal.createReduce)(1); // `_inject` : a collection's function
// ------------------------------------

exports.default = _inject;
},{"./_internal":199}],59:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _inject = require('./inject');

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_inject).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./inject":67}],60:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _internal = require('./_internal');

// The right-associative version of reduce, also known as `foldr`
var _foldr = (0, _internal.createReduce)(-1); // `_foldr` : a collection's function
// -----------------------------------

exports.default = _foldr;
},{"./_internal":199}],62:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = undefined;

var _has2 = require('./has');

var _has3 = _interopRequireDefault(_has2);

var _internal = require('./_internal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Groups the object's values by a criterion. Pass either a string attribute
// to group by, or a function that returns the criterion.
// `_groupBy` : a collection's function
// -------------------------------------

var _groupBy = (0, _internal.group)((result, value, key) => {
	if ((0, _has3.default)(result, key)) result[key].push(value);else result[key] = [value];
});

exports.default = _groupBy;
},{"./has":118,"./_internal":199}],63:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _take = require('./take');

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_take).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./take":102}],64:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _include = require('./include');

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_include).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./include":66}],65:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = undefined;

var _internal = require('./_internal');

// Indexes the object's values by a criterion, similar to `groupBy`, but for
// when you know that your index values will be unique.
var _indexBy = (0, _internal.group)((result, value, key) => {
	result[key] = value;
}); // `_indexBy` : a collection's function
// ------------------------------------

exports.default = _indexBy;
},{"./_internal":199}],69:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _collect = require('./collect');

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_collect).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./collect":49}],68:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = undefined;

var _isFunction2 = require('./isFunction');

var _isFunction3 = _interopRequireDefault(_isFunction2);

var _map2 = require('./map');

var _map3 = _interopRequireDefault(_map2);

var _internal = require('./_internal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Invoke a method (with arguments) on every item in a collection.
var _invoke = (0, _internal.restArgs)((obj, method, args) => {
	let isFunc = (0, _isFunction3.default)(method);
	return (0, _map3.default)(obj, value => {
		let func = isFunc ? method : value[method];
		return func == null ? func : func.apply(value, args);
	});
}); // `_invoke` : a collection's function
// ------------------------------------

exports.default = _invoke;
},{"./isFunction":130,"./map":69,"./_internal":199}],70:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj, iteratee, context) {
	let result = -Infinity,
	    lastComputed = -Infinity,
	    value,
	    computed;
	if (iteratee == null || typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null) {
		obj = (0, _internal.isArrayLike)(obj) ? obj : (0, _values3.default)(obj);
		for (let i = 0, length = obj.length; i < length; i++) {
			value = obj[i];
			if (value != null && value > result) {
				result = value;
			}
		}
	} else {
		iteratee = (0, _internal.cb)(iteratee, context);
		(0, _each3.default)(obj, (v, index, list) => {
			computed = iteratee(v, index, list);
			if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
				result = v;
				lastComputed = computed;
			}
		});
	}
	return result;
};

var _values2 = require('./values');

var _values3 = _interopRequireDefault(_values2);

var _each2 = require('./each');

var _each3 = _interopRequireDefault(_each2);

var _internal = require('./_internal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./values":150,"./each":52,"./_internal":199}],71:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj, iteratee, context) {
	var result = Infinity,
	    lastComputed = Infinity,
	    value,
	    computed;
	if (iteratee == null || typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null) {
		obj = (0, _internal.isArrayLike)(obj) ? obj : (0, _values3.default)(obj);
		for (let i = 0, length = obj.length; i < length; i++) {
			value = obj[i];
			if (value != null && value < result) {
				result = value;
			}
		}
	} else {
		iteratee = (0, _internal.cb)(iteratee, context);
		(0, _each3.default)(obj, (v, index, list) => {
			computed = iteratee(v, index, list);
			if (computed < lastComputed || computed === Infinity && result === Infinity) {
				result = v;
				lastComputed = computed;
			}
		});
	}
	return result;
};

var _values2 = require('./values');

var _values3 = _interopRequireDefault(_values2);

var _each2 = require('./each');

var _each3 = _interopRequireDefault(_each2);

var _internal = require('./_internal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./values":150,"./each":52,"./_internal":199}],72:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = undefined;

var _internal = require('./_internal');

// Split a collection into two arrays: one whose elements all satisfy the given
// predicate, and one whose elements all do not satisfy the predicate.
var _partition = (0, _internal.group)((result, value, pass) => {
	result[pass ? 0 : 1].push(value);
}, true); // `_partition` : a collection's function
// ---------------------------------------

exports.default = _partition;
},{"./_internal":199}],175:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _internal = require('./_internal');

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function () {
    return _internal.property;
  }
});
},{"./_internal":199}],73:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj, key) {
	return (0, _map3.default)(obj, (0, _property3.default)(key));
};

var _map2 = require('./map');

var _map3 = _interopRequireDefault(_map2);

var _property2 = require('./property');

var _property3 = _interopRequireDefault(_property2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./map":69,"./property":175}],74:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _foldl = require('./foldl');

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_foldl).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./foldl":59}],75:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _foldr = require('./foldr');

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_foldr).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./foldr":60}],160:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (predicate) {
  return function () {
    return !predicate.apply(this, arguments);
  };
};
},{}],76:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj, predicate, context) {
	return (0, _filter3.default)(obj, (0, _negate3.default)((0, _internal.cb)(predicate)), context);
};

var _filter2 = require('./filter');

var _filter3 = _interopRequireDefault(_filter2);

var _negate2 = require('./negate');

var _negate3 = _interopRequireDefault(_negate2);

var _internal = require('./_internal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./filter":55,"./negate":160,"./_internal":199}],177:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (min, max) {
	if (max == null) {
		max = min;
		min = 0;
	}
	return min + Math.floor(Math.random() * (max - min + 1));
};
},{}],109:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj) {
	if (!(0, _isObject3.default)(obj)) return [];
	var keys = [];
	for (let key in obj) keys.push(key);
	// Ahem, IE < 9.
	if (_internal.hasEnumBug) (0, _internal.collectNonEnumProps)(obj, keys);
	return keys;
};

var _isObject2 = require('./isObject');

var _isObject3 = _interopRequireDefault(_isObject2);

var _internal = require('./_internal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./isObject":135,"./_internal":199}],114:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _allKeys2 = require('./allKeys');

var _allKeys3 = _interopRequireDefault(_allKeys2);

var _internal = require('./_internal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Extend a given object with all the properties in passed-in object(s).
// `_extend` : an object's function
// ---------------------------------

var _extend = (0, _internal.createAssigner)(_allKeys3.default);

exports.default = _extend;
},{"./allKeys":109,"./_internal":199}],111:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj) {
	if (!(0, _isObject3.default)(obj)) return obj;
	return (0, _isArray3.default)(obj) ? obj.slice() : (0, _extend3.default)({}, obj);
};

var _isObject2 = require('./isObject');

var _isObject3 = _interopRequireDefault(_isObject2);

var _isArray2 = require('./isArray');

var _isArray3 = _interopRequireDefault(_isArray2);

var _extend2 = require('./extend');

var _extend3 = _interopRequireDefault(_extend2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./isObject":135,"./isArray":120,"./extend":114}],77:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj, n, guard) {
	if (n == null || guard) {
		if (!(0, _internal.isArrayLike)(obj)) obj = (0, _values3.default)(obj);
		return obj[(0, _random3.default)(obj.length - 1)];
	}
	let levy = (0, _internal.isArrayLike)(obj) ? (0, _clone3.default)(obj) : (0, _values3.default)(obj);
	let length = (0, _internal.getLength)(levy);
	n = Math.max(Math.min(n, length), 0);
	let last = length - 1;
	for (let index = 0; index < n; index++) {
		let rand = (0, _random3.default)(index, last);
		let temp = levy[index];
		levy[index] = levy[rand];
		levy[rand] = temp;
	}
	return levy.slice(0, n);
};

var _values2 = require('./values');

var _values3 = _interopRequireDefault(_values2);

var _random2 = require('./random');

var _random3 = _interopRequireDefault(_random2);

var _clone2 = require('./clone');

var _clone3 = _interopRequireDefault(_clone2);

var _internal = require('./_internal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./values":150,"./random":177,"./clone":111,"./_internal":199}],79:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj) {
	return (0, _sample3.default)(obj, Infinity);
};

var _sample2 = require('./sample');

var _sample3 = _interopRequireDefault(_sample2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./sample":77}],80:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj) {
	if (obj == null) return 0;
	return (0, _internal.isArrayLike)(obj) ? obj.length : (0, _keys3.default)(obj).length;
};

var _keys2 = require('./keys');

var _keys3 = _interopRequireDefault(_keys2);

var _internal = require('./_internal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./keys":143,"./_internal":199}],81:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _any = require('./any');

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_any).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./any":48}],82:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj, iteratee, context) {
	var index = 0;
	iteratee = (0, _internal.cb)(iteratee, context);
	return (0, _pluck3.default)((0, _map3.default)(obj, (value, key, list) => {
		return {
			value: value,
			index: index++,
			criteria: iteratee(value, key, list)
		};
	}).sort((left, right) => {
		var a = left.criteria;
		var b = right.criteria;
		if (a !== b) {
			if (a > b || a === void 0) return 1;
			if (a < b || b === void 0) return -1;
		}
		return left.index - right.index;
	}), 'value');
};

var _pluck2 = require('./pluck');

var _pluck3 = _interopRequireDefault(_pluck2);

var _map2 = require('./map');

var _map3 = _interopRequireDefault(_map2);

var _internal = require('./_internal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./pluck":73,"./map":69,"./_internal":199}],139:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj) {
	return _quickaccess.toString.call(obj) === '[object String]';
};

var _quickaccess = require('./_quickaccess');
},{"./_quickaccess":183}],83:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj) {
	if (!obj) return [];
	if ((0, _isArray3.default)(obj)) return _quickaccess.slice.call(obj);
	if ((0, _isString3.default)(obj)) {
		// Keep surrogate pair characters together
		return obj.match(_internal.reStrSymbol);
	}
	if ((0, _internal.isArrayLike)(obj)) return (0, _map3.default)(obj, _identity3.default);
	return (0, _values3.default)(obj);
};

var _isArray2 = require('./isArray');

var _isArray3 = _interopRequireDefault(_isArray2);

var _isString2 = require('./isString');

var _isString3 = _interopRequireDefault(_isString2);

var _map2 = require('./map');

var _map3 = _interopRequireDefault(_map2);

var _identity2 = require('./identity');

var _identity3 = _interopRequireDefault(_identity2);

var _values2 = require('./values');

var _values3 = _interopRequireDefault(_values2);

var _quickaccess = require('./_quickaccess');

var _internal = require('./_internal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./isArray":120,"./isString":139,"./map":69,"./identity":169,"./values":150,"./_quickaccess":183,"./_internal":199}],84:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj, attrs) {
	return (0, _filter3.default)(obj, (0, _matcher3.default)(attrs));
};

var _filter2 = require('./filter');

var _filter3 = _interopRequireDefault(_filter2);

var _matcher2 = require('./matcher');

var _matcher3 = _interopRequireDefault(_matcher2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./filter":55,"./matcher":171}],30:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _all = require('./all');

Object.defineProperty(exports, '_all', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_all).default;
  }
});

var _any = require('./any');

Object.defineProperty(exports, '_any', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_any).default;
  }
});

var _collect = require('./collect');

Object.defineProperty(exports, '_collect', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_collect).default;
  }
});

var _contains = require('./contains');

Object.defineProperty(exports, '_contains', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_contains).default;
  }
});

var _countBy = require('./countBy');

Object.defineProperty(exports, '_countBy', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_countBy).default;
  }
});

var _each = require('./each');

Object.defineProperty(exports, '_each', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_each).default;
  }
});

var _detect = require('./detect');

Object.defineProperty(exports, '_detect', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_detect).default;
  }
});

var _every = require('./every');

Object.defineProperty(exports, '_every', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_every).default;
  }
});

var _filter = require('./filter');

Object.defineProperty(exports, '_filter', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_filter).default;
  }
});

var _find = require('./find');

Object.defineProperty(exports, '_find', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_find).default;
  }
});

var _findWhere = require('./findWhere');

Object.defineProperty(exports, '_findWhere', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_findWhere).default;
  }
});

var _first = require('./first');

Object.defineProperty(exports, '_first', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_first).default;
  }
});

var _foldl = require('./foldl');

Object.defineProperty(exports, '_foldl', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_foldl).default;
  }
});

var _foldr = require('./foldr');

Object.defineProperty(exports, '_foldr', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_foldr).default;
  }
});

var _forEach = require('./forEach');

Object.defineProperty(exports, '_forEach', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_forEach).default;
  }
});

var _groupBy = require('./groupBy');

Object.defineProperty(exports, '_groupBy', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_groupBy).default;
  }
});

var _head = require('./head');

Object.defineProperty(exports, '_head', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_head).default;
  }
});

var _include = require('./include');

Object.defineProperty(exports, '_include', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_include).default;
  }
});

var _includes = require('./includes');

Object.defineProperty(exports, '_includes', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_includes).default;
  }
});

var _indexBy = require('./indexBy');

Object.defineProperty(exports, '_indexBy', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_indexBy).default;
  }
});

var _inject = require('./inject');

Object.defineProperty(exports, '_inject', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_inject).default;
  }
});

var _invoke = require('./invoke');

Object.defineProperty(exports, '_invoke', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_invoke).default;
  }
});

var _map = require('./map');

Object.defineProperty(exports, '_map', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_map).default;
  }
});

var _max = require('./max');

Object.defineProperty(exports, '_max', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_max).default;
  }
});

var _min = require('./min');

Object.defineProperty(exports, '_min', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_min).default;
  }
});

var _partition = require('./partition');

Object.defineProperty(exports, '_partition', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_partition).default;
  }
});

var _pluck = require('./pluck');

Object.defineProperty(exports, '_pluck', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_pluck).default;
  }
});

var _reduce = require('./reduce');

Object.defineProperty(exports, '_reduce', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_reduce).default;
  }
});

var _reduceRight = require('./reduceRight');

Object.defineProperty(exports, '_reduceRight', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_reduceRight).default;
  }
});

var _reject = require('./reject');

Object.defineProperty(exports, '_reject', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_reject).default;
  }
});

var _sample = require('./sample');

Object.defineProperty(exports, '_sample', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_sample).default;
  }
});

var _select = require('./select');

Object.defineProperty(exports, '_select', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_select).default;
  }
});

var _shuffle = require('./shuffle');

Object.defineProperty(exports, '_shuffle', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_shuffle).default;
  }
});

var _size = require('./size');

Object.defineProperty(exports, '_size', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_size).default;
  }
});

var _some = require('./some');

Object.defineProperty(exports, '_some', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_some).default;
  }
});

var _sortBy = require('./sortBy');

Object.defineProperty(exports, '_sortBy', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_sortBy).default;
  }
});

var _toArray = require('./toArray');

Object.defineProperty(exports, '_toArray', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_toArray).default;
  }
});

var _where = require('./where');

Object.defineProperty(exports, '_where', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_where).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./all":47,"./any":48,"./collect":49,"./contains":50,"./countBy":51,"./each":52,"./detect":54,"./every":53,"./filter":55,"./find":56,"./findWhere":57,"./first":58,"./foldl":59,"./foldr":60,"./forEach":61,"./groupBy":62,"./head":63,"./include":66,"./includes":64,"./indexBy":65,"./inject":67,"./invoke":68,"./map":69,"./max":70,"./min":71,"./partition":72,"./pluck":73,"./reduce":74,"./reduceRight":75,"./reject":76,"./sample":77,"./select":78,"./shuffle":79,"./size":80,"./some":81,"./sortBy":82,"./toArray":83,"./where":84}],85:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (array, count) {
	if (count == null || count < 1) return [];
	let result = [];
	let i = 0,
	    length = array.length;
	while (i < length) {
		result.push(_quickaccess.slice.call(array, i, i += count));
	}
	return result;
};

var _quickaccess = require('./_quickaccess');
},{"./_quickaccess":183}],86:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (array) {
	return (0, _filter3.default)(array, Boolean);
};

var _filter2 = require('./filter');

var _filter3 = _interopRequireDefault(_filter2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./filter":55}],87:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = exports._difference = undefined;

var _filter2 = require('./filter');

var _filter3 = _interopRequireDefault(_filter2);

var _contains2 = require('./contains');

var _contains3 = _interopRequireDefault(_contains2);

var _internal = require('./_internal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Take the difference between one array and a number of other arrays.
// Only the elements present in just the first array will remain.
var _difference = exports._difference = (0, _internal.restArgs)((array, rest) => {
	rest = (0, _internal.flatten)(rest, true, true);
	return (0, _filter3.default)(array, value => {
		return !(0, _contains3.default)(rest, value);
	});
}); // `_difference` : an array's function
// ------------------------------------

exports.default = _difference;
},{"./filter":55,"./contains":50,"./_internal":199}],88:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (array, n, guard) {
	return _quickaccess.slice.call(array, n == null || guard ? 1 : n);
};

var _quickaccess = require('./_quickaccess');
},{"./_quickaccess":183}],90:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _internal = require('./_internal');

// Returns the last index on an array-like that passes a predicate test.
var _findLastIndex = (0, _internal.createPredicateIndexFinder)(-1); // `_findLastIndex` : an array's function
// ---------------------------------------

exports.default = _findLastIndex;
},{"./_internal":199}],91:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (array, shallow) {
	return (0, _internal.flatten)(array, shallow, false);
};

var _internal = require('./_internal');
},{"./_internal":199}],94:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (array) {
	let result = [];
	let argsLength = arguments.length;
	for (let i = 0, length = (0, _internal.getLength)(array); i < length; i++) {
		let item = array[i];
		if ((0, _contains3.default)(result, item)) continue;
		let j;
		for (j = 1; j < argsLength; j++) {
			if (!(0, _contains3.default)(arguments[j], item)) break;
		}
		if (j === argsLength) result.push(item);
	}
	return result;
};

var _contains2 = require('./contains');

var _contains3 = _interopRequireDefault(_contains2);

var _internal = require('./_internal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./contains":50,"./_internal":199}],99:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _drop = require('./drop');

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_drop).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./drop":88}],95:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (array, n, guard) {
	if (array == null || array.length < 1) return void 0;
	if (n == null || guard) return array[array.length - 1];
	return (0, _rest3.default)(array, Math.max(0, array.length - n));
};

var _rest2 = require('./rest');

var _rest3 = _interopRequireDefault(_rest2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./rest":99}],96:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _findLastIndex2 = require('./findLastIndex');

var _findLastIndex3 = _interopRequireDefault(_findLastIndex2);

var _internal = require('./_internal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Return the position of the last occurrence of an item in an array,
// or -1 if the item is not included in the array.
// If the array is large and already in sort order, pass `true`
// for **isSorted** to use binary search.
// `_lastIndexOf` : an array's function
// ---------------------------------

var _lastIndexOf = (0, _internal.createIndexFinder)(-1, _findLastIndex3.default);

exports.default = _lastIndexOf;
},{"./findLastIndex":90,"./_internal":199}],97:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (list, values) {
	let result = {};
	for (let i = 0, length = (0, _internal.getLength)(list); i < length; i++) {
		if (values) {
			result[list[i]] = values[i];
		} else {
			result[list[i][0]] = list[i][1];
		}
	}
	return result;
};

var _internal = require('./_internal');
},{"./_internal":199}],98:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (start, stop, step) {
	if (stop == null) {
		stop = start || 0;
		start = 0;
	}
	if (!step) {
		step = stop < start ? -1 : 1;
	}
	let length = Math.max(Math.ceil((stop - start) / step), 0);
	let range = Array(length);
	for (let idx = 0; idx < length; idx++, start += step) {
		range[idx] = start;
	}
	return range;
};
},{}],101:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _drop = require('./drop');

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_drop).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./drop":88}],123:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj) {
	return obj === true || obj === false || _quickaccess.toString.call(obj) === '[object Boolean]';
};

var _quickaccess = require('./_quickaccess');
},{"./_quickaccess":183}],105:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (array, isSorted, iteratee, context) {
	if (!(0, _isBoolean3.default)(isSorted)) {
		context = iteratee;
		iteratee = isSorted;
		isSorted = false;
	}
	if (iteratee != null) iteratee = (0, _internal.cb)(iteratee, context);
	let result = [];
	let seen = [];
	for (let i = 0, length = (0, _internal.getLength)(array); i < length; i++) {
		let value = array[i],
		    computed = iteratee ? iteratee(value, i, array) : value;
		if (isSorted) {
			if (!i || seen !== computed) result.push(value);
			seen = computed;
		} else if (iteratee) {
			if (!(0, _contains3.default)(seen, computed)) {
				seen.push(computed);
				result.push(value);
			}
		} else if (!(0, _contains3.default)(result, value)) {
			result.push(value);
		}
	}
	return result;
};

var _isBoolean2 = require('./isBoolean');

var _isBoolean3 = _interopRequireDefault(_isBoolean2);

var _contains2 = require('./contains');

var _contains3 = _interopRequireDefault(_contains2);

var _internal = require('./_internal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./isBoolean":123,"./contains":50,"./_internal":199}],104:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _unique = require('./unique');

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_unique).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./unique":105}],103:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = exports._union = undefined;

var _uniq2 = require('./uniq');

var _uniq3 = _interopRequireDefault(_uniq2);

var _internal = require('./_internal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Produce an array that contains the union: each distinct element from all of
// the passed-in arrays.
// `_union` : an array's function
// -------------------------------

var _union = exports._union = (0, _internal.restArgs)(arrays => {
	return (0, _uniq3.default)((0, _internal.flatten)(arrays, true, true));
});

exports.default = _union;
},{"./uniq":104,"./_internal":199}],106:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (array) {
	var length = array && (0, _max3.default)(array, _internal.getLength).length || 0;
	var result = Array(length);

	for (var index = 0; index < length; index++) {
		result[index] = (0, _pluck3.default)(array, index);
	}
	return result;
};

var _max2 = require('./max');

var _max3 = _interopRequireDefault(_max2);

var _pluck2 = require('./pluck');

var _pluck3 = _interopRequireDefault(_pluck2);

var _internal = require('./_internal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./max":70,"./pluck":73,"./_internal":199}],107:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = undefined;

var _difference2 = require('./difference');

var _difference3 = _interopRequireDefault(_difference2);

var _internal = require('./_internal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Return a version of the array that does not contain the specified value(s).
// `_without` : an array's function
// ---------------------------------

var _without = (0, _internal.restArgs)((array, otherArrays) => {
	return (0, _difference3.default)(array, otherArrays);
});

exports.default = _without;
},{"./difference":87,"./_internal":199}],108:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _unzip2 = require('./unzip');

var _unzip3 = _interopRequireDefault(_unzip2);

var _internal = require('./_internal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Zip together multiple lists into a single array -- elements that share
// an index go together.
// `_zip` : an array's function
// -----------------------------

var _zip = (0, _internal.restArgs)(_unzip3.default);

exports.default = _zip;
},{"./unzip":106,"./_internal":199}],31:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _chunk = require('./chunk');

Object.defineProperty(exports, '_chunk', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_chunk).default;
  }
});

var _compact = require('./compact');

Object.defineProperty(exports, '_compact', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_compact).default;
  }
});

var _difference = require('./difference');

Object.defineProperty(exports, '_difference', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_difference).default;
  }
});

var _drop = require('./drop');

Object.defineProperty(exports, '_drop', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_drop).default;
  }
});

var _findIndex = require('./findIndex');

Object.defineProperty(exports, '_findIndex', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_findIndex).default;
  }
});

var _findLastIndex = require('./findLastIndex');

Object.defineProperty(exports, '_findLastIndex', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_findLastIndex).default;
  }
});

var _flatten = require('./flatten');

Object.defineProperty(exports, '_flatten', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_flatten).default;
  }
});

var _indexOf = require('./indexOf');

Object.defineProperty(exports, '_indexOf', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_indexOf).default;
  }
});

var _initial = require('./initial');

Object.defineProperty(exports, '_initial', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_initial).default;
  }
});

var _intersection = require('./intersection');

Object.defineProperty(exports, '_intersection', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_intersection).default;
  }
});

var _last = require('./last');

Object.defineProperty(exports, '_last', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_last).default;
  }
});

var _lastIndexOf = require('./lastIndexOf');

Object.defineProperty(exports, '_lastIndexOf', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_lastIndexOf).default;
  }
});

var _object = require('./object');

Object.defineProperty(exports, '_object', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_object).default;
  }
});

var _range = require('./range');

Object.defineProperty(exports, '_range', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_range).default;
  }
});

var _rest = require('./rest');

Object.defineProperty(exports, '_rest', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_rest).default;
  }
});

var _sortedIndex = require('./sortedIndex');

Object.defineProperty(exports, '_sortedIndex', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_sortedIndex).default;
  }
});

var _tail = require('./tail');

Object.defineProperty(exports, '_tail', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_tail).default;
  }
});

var _take = require('./take');

Object.defineProperty(exports, '_take', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_take).default;
  }
});

var _union = require('./union');

Object.defineProperty(exports, '_union', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_union).default;
  }
});

var _uniq = require('./uniq');

Object.defineProperty(exports, '_uniq', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_uniq).default;
  }
});

var _unique = require('./unique');

Object.defineProperty(exports, '_unique', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_unique).default;
  }
});

var _unzip = require('./unzip');

Object.defineProperty(exports, '_unzip', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_unzip).default;
  }
});

var _without = require('./without');

Object.defineProperty(exports, '_without', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_without).default;
  }
});

var _zip = require('./zip');

Object.defineProperty(exports, '_zip', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_zip).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./chunk":85,"./compact":86,"./difference":87,"./drop":88,"./findIndex":89,"./findLastIndex":90,"./flatten":91,"./indexOf":92,"./initial":93,"./intersection":94,"./last":95,"./lastIndexOf":96,"./object":97,"./range":98,"./rest":99,"./sortedIndex":100,"./tail":101,"./take":102,"./union":103,"./uniq":104,"./unique":105,"./unzip":106,"./without":107,"./zip":108}],110:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extendOwn = require('./extendOwn');

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_extendOwn).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./extendOwn":115}],112:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (prototype, props) {
	var result = (0, _internal.baseCreate)(prototype);
	if (props) (0, _extendOwn3.default)(result, props);
	return result;
};

var _extendOwn2 = require('./extendOwn');

var _extendOwn3 = _interopRequireDefault(_extendOwn2);

var _internal = require('./_internal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./extendOwn":115,"./_internal":199}],113:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _allKeys2 = require('./allKeys');

var _allKeys3 = _interopRequireDefault(_allKeys2);

var _internal = require('./_internal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Fill in a given object with default properties.
// `_defaults` : an object's function
// -----------------------------------

var _defaults = (0, _internal.createAssigner)(_allKeys3.default, true);

exports.default = _defaults;
},{"./allKeys":109,"./_internal":199}],145:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj) {
	var names = [];
	for (var key in obj) {
		if ((0, _isFunction3.default)(obj[key])) names.push(key);
	}
	return names.sort();
};

var _isFunction2 = require('./isFunction');

var _isFunction3 = _interopRequireDefault(_isFunction2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./isFunction":130}],117:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _methods = require('./methods');

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_methods).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./methods":145}],122:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj) {
	if (obj == null) return true;
	if ((0, _internal.isArrayLike)(obj) && ((0, _isArray3.default)(obj) || (0, _isString3.default)(obj) || (0, _isArguments3.default)(obj))) return obj.length === 0;
	return (0, _keys3.default)(obj).length === 0;
};

var _isArray2 = require('./isArray');

var _isArray3 = _interopRequireDefault(_isArray2);

var _isString2 = require('./isString');

var _isString3 = _interopRequireDefault(_isString2);

var _isArguments2 = require('./isArguments');

var _isArguments3 = _interopRequireDefault(_isArguments2);

var _keys2 = require('./keys');

var _keys3 = _interopRequireDefault(_keys2);

var _internal = require('./_internal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./isArray":120,"./isString":139,"./isArguments":121,"./keys":143,"./_internal":199}],124:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj) {
	return _quickaccess.toString.call(obj) === '[object Date]';
};

var _quickaccess = require('./_quickaccess');
},{"./_quickaccess":183}],125:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj, eltName) {
	var isInstanceOk = (0, _isString3.default)(eltName) ? (0, _indexOf3.default)(['HTML', 'SVG'], eltName) != -1 ? _quickaccess.toString.call(obj).indexOf('[object ' + eltName) != -1 : _quickaccess.toString.call(obj) === '[object ' + eltName + 'Element]' : true;
	return !!(obj && obj.nodeType === 1 && isInstanceOk);
};

var _isString2 = require('./isString');

var _isString3 = _interopRequireDefault(_isString2);

var _indexOf2 = require('./indexOf');

var _indexOf3 = _interopRequireDefault(_indexOf2);

var _quickaccess = require('./_quickaccess');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./isString":139,"./indexOf":92,"./_quickaccess":183}],126:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (a, b) {
	return (0, _internal.eq)(a, b);
};

var _internal = require('./_internal');
},{"./_internal":199}],127:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj) {
	return _quickaccess.toString.call(obj) === '[object Error]';
};

var _quickaccess = require('./_quickaccess');
},{"./_quickaccess":183}],138:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj) {
	return _quickaccess.toString.call(obj) === '[object Symbol]';
};

var _quickaccess = require('./_quickaccess');
},{"./_quickaccess":183}],128:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj) {
	return !(0, _isSymbol3.default)(obj) && isFinite(obj) && !isNaN(parseFloat(obj));
};

var _isSymbol2 = require('./isSymbol');

var _isSymbol3 = _interopRequireDefault(_isSymbol2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./isSymbol":138}],129:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj) {
	return _quickaccess.toString.call(obj) === '[object Map]';
};

var _quickaccess = require('./_quickaccess');
},{"./_quickaccess":183}],133:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj) {
	return obj === null;
};

; // `_isNull` : an object's function
// ---------------------------------

// Is a given value equal to null?
},{}],136:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj) {
	return _quickaccess.toString.call(obj) === '[object RegExp]';
};

var _quickaccess = require('./_quickaccess');
},{"./_quickaccess":183}],137:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj) {
	return _quickaccess.toString.call(obj) === '[object Set]';
};

var _quickaccess = require('./_quickaccess');
},{"./_quickaccess":183}],140:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj) {
	return obj === void 0;
};
},{}],141:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj) {
	return _quickaccess.toString.call(obj) === '[object WeakMap]';
};

var _quickaccess = require('./_quickaccess');
},{"./_quickaccess":183}],142:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj) {
	return _quickaccess.toString.call(obj) === '[object WeakSet]';
};

var _quickaccess = require('./_quickaccess');
},{"./_quickaccess":183}],144:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj, iteratee, context) {
	iteratee = (0, _internal.cb)(iteratee, context);
	let keys = (0, _keys3.default)(obj),
	    length = keys.length,
	    results = {};
	for (let index = 0; index < length; index++) {
		let currentKey = keys[index];
		results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
	}
	return results;
};

var _keys2 = require('./keys');

var _keys3 = _interopRequireDefault(_keys2);

var _internal = require('./_internal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./keys":143,"./_internal":199}],148:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = undefined;

var _isFunction2 = require('./isFunction');

var _isFunction3 = _interopRequireDefault(_isFunction2);

var _allKeys2 = require('./allKeys');

var _allKeys3 = _interopRequireDefault(_allKeys2);

var _internal = require('./_internal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Return a copy of the object only containing the whitelisted properties.
var _pick = (0, _internal.restArgs)((obj, keys) => {
	let result = {},
	    iteratee = keys[0];
	if (obj == null) return result;
	if ((0, _isFunction3.default)(iteratee)) {
		if (keys.length > 1) iteratee = (0, _internal.optimizeCb)(iteratee, keys[1]);
		keys = (0, _allKeys3.default)(obj);
	} else {
		iteratee = _internal.keyInObj;
		keys = (0, _internal.flatten)(keys, false, false);
		obj = Object(obj);
	}
	for (let i = 0, length = keys.length; i < length; i++) {
		var key = keys[i];
		var value = obj[key];
		if (iteratee(value, key, obj)) result[key] = value;
	}
	return result;
}); // `_pick` : an object's function
// --------------------------------

exports.default = _pick;
},{"./isFunction":130,"./allKeys":109,"./_internal":199}],146:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = undefined;

var _isFunction2 = require('./isFunction');

var _isFunction3 = _interopRequireDefault(_isFunction2);

var _contains2 = require('./contains');

var _contains3 = _interopRequireDefault(_contains2);

var _negate2 = require('./negate');

var _negate3 = _interopRequireDefault(_negate2);

var _map2 = require('./map');

var _map3 = _interopRequireDefault(_map2);

var _pick2 = require('./pick');

var _pick3 = _interopRequireDefault(_pick2);

var _internal = require('./_internal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Return a copy of the object without the blacklisted properties.
// `_omit` : an object's function
// -------------------------------

var _omit = (0, _internal.restArgs)((obj, keys) => {
	let iteratee = keys[0],
	    context;
	if ((0, _isFunction3.default)(iteratee)) {
		iteratee = (0, _negate3.default)(iteratee);
		if (keys.length > 1) context = keys[1];
	} else {
		keys = (0, _map3.default)((0, _internal.flatten)(keys, false, false), String);
		iteratee = (value, key) => !(0, _contains3.default)(keys, key);
	}
	return (0, _pick3.default)(obj, iteratee, context);
});

exports.default = _omit;
},{"./isFunction":130,"./contains":50,"./negate":160,"./map":69,"./pick":148,"./_internal":199}],147:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj) {
	let keys = (0, _keys3.default)(obj);
	let length = keys.length;
	let pairs = Array(length);
	for (let i = 0; i < length; i++) {
		pairs[i] = [keys[i], obj[keys[i]]];
	}
	return pairs;
};

var _keys2 = require('./keys');

var _keys3 = _interopRequireDefault(_keys2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./keys":143}],149:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj, interceptor) {
	interceptor(obj);
	return obj;
};
},{}],32:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _allKeys = require('./allKeys');

Object.defineProperty(exports, '_allKeys', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_allKeys).default;
  }
});

var _assign = require('./assign');

Object.defineProperty(exports, '_assign', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_assign).default;
  }
});

var _clone = require('./clone');

Object.defineProperty(exports, '_clone', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_clone).default;
  }
});

var _create = require('./create');

Object.defineProperty(exports, '_create', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_create).default;
  }
});

var _defaults = require('./defaults');

Object.defineProperty(exports, '_defaults', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_defaults).default;
  }
});

var _extend = require('./extend');

Object.defineProperty(exports, '_extend', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_extend).default;
  }
});

var _extendOwn = require('./extendOwn');

Object.defineProperty(exports, '_extendOwn', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_extendOwn).default;
  }
});

var _findKey = require('./findKey');

Object.defineProperty(exports, '_findKey', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_findKey).default;
  }
});

var _functions = require('./functions');

Object.defineProperty(exports, '_functions', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_functions).default;
  }
});

var _has = require('./has');

Object.defineProperty(exports, '_has', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_has).default;
  }
});

var _invert = require('./invert');

Object.defineProperty(exports, '_invert', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_invert).default;
  }
});

var _isArguments = require('./isArguments');

Object.defineProperty(exports, '_isArguments', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_isArguments).default;
  }
});

var _isArray = require('./isArray');

Object.defineProperty(exports, '_isArray', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_isArray).default;
  }
});

var _isEmpty = require('./isEmpty');

Object.defineProperty(exports, '_isEmpty', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_isEmpty).default;
  }
});

var _isBoolean = require('./isBoolean');

Object.defineProperty(exports, '_isBoolean', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_isBoolean).default;
  }
});

var _isDate = require('./isDate');

Object.defineProperty(exports, '_isDate', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_isDate).default;
  }
});

var _isElement = require('./isElement');

Object.defineProperty(exports, '_isElement', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_isElement).default;
  }
});

var _isEqual = require('./isEqual');

Object.defineProperty(exports, '_isEqual', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_isEqual).default;
  }
});

var _isError = require('./isError');

Object.defineProperty(exports, '_isError', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_isError).default;
  }
});

var _isFinite = require('./isFinite');

Object.defineProperty(exports, '_isFinite', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_isFinite).default;
  }
});

var _isFunction = require('./isFunction');

Object.defineProperty(exports, '_isFunction', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_isFunction).default;
  }
});

var _isMap = require('./isMap');

Object.defineProperty(exports, '_isMap', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_isMap).default;
  }
});

var _isMatch = require('./isMatch');

Object.defineProperty(exports, '_isMatch', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_isMatch).default;
  }
});

var _isNaN = require('./isNaN');

Object.defineProperty(exports, '_isNaN', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_isNaN).default;
  }
});

var _isNull = require('./isNull');

Object.defineProperty(exports, '_isNull', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_isNull).default;
  }
});

var _isNumber = require('./isNumber');

Object.defineProperty(exports, '_isNumber', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_isNumber).default;
  }
});

var _isObject = require('./isObject');

Object.defineProperty(exports, '_isObject', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_isObject).default;
  }
});

var _isRegExp = require('./isRegExp');

Object.defineProperty(exports, '_isRegExp', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_isRegExp).default;
  }
});

var _isSet = require('./isSet');

Object.defineProperty(exports, '_isSet', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_isSet).default;
  }
});

var _isString = require('./isString');

Object.defineProperty(exports, '_isString', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_isString).default;
  }
});

var _isSymbol = require('./isSymbol');

Object.defineProperty(exports, '_isSymbol', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_isSymbol).default;
  }
});

var _isUndefined = require('./isUndefined');

Object.defineProperty(exports, '_isUndefined', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_isUndefined).default;
  }
});

var _isWeakMap = require('./isWeakMap');

Object.defineProperty(exports, '_isWeakMap', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_isWeakMap).default;
  }
});

var _isWeakSet = require('./isWeakSet');

Object.defineProperty(exports, '_isWeakSet', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_isWeakSet).default;
  }
});

var _keys = require('./keys');

Object.defineProperty(exports, '_keys', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_keys).default;
  }
});

var _mapObject = require('./mapObject');

Object.defineProperty(exports, '_mapObject', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_mapObject).default;
  }
});

var _methods = require('./methods');

Object.defineProperty(exports, '_methods', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_methods).default;
  }
});

var _omit = require('./omit');

Object.defineProperty(exports, '_omit', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_omit).default;
  }
});

var _pairs = require('./pairs');

Object.defineProperty(exports, '_pairs', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_pairs).default;
  }
});

var _pick = require('./pick');

Object.defineProperty(exports, '_pick', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_pick).default;
  }
});

var _tap = require('./tap');

Object.defineProperty(exports, '_tap', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_tap).default;
  }
});

var _values = require('./values');

Object.defineProperty(exports, '_values', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_values).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./allKeys":109,"./assign":110,"./clone":111,"./create":112,"./defaults":113,"./extend":114,"./extendOwn":115,"./findKey":116,"./functions":117,"./has":118,"./invert":119,"./isArguments":121,"./isArray":120,"./isEmpty":122,"./isBoolean":123,"./isDate":124,"./isElement":125,"./isEqual":126,"./isError":127,"./isFinite":128,"./isFunction":130,"./isMap":129,"./isMatch":131,"./isNaN":132,"./isNull":133,"./isNumber":134,"./isObject":135,"./isRegExp":136,"./isSet":137,"./isString":139,"./isSymbol":138,"./isUndefined":140,"./isWeakMap":141,"./isWeakSet":142,"./keys":143,"./mapObject":144,"./methods":145,"./omit":146,"./pairs":147,"./pick":148,"./tap":149,"./values":150}],151:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (times, func) {
  return function () {
    if (--times < 1) {
      return func.apply(this, arguments);
    }
  };
};
},{}],152:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (times, func) {
  var memo;
  return function () {
    if (--times > 0) {
      memo = func.apply(this, arguments);
    }
    if (times <= 1) func = null;
    return memo;
  };
};
},{}],153:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _isFunction2 = require('./isFunction');

var _isFunction3 = _interopRequireDefault(_isFunction2);

var _internal = require('./_internal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Create a function bound to a given object (assigning `this`, and arguments,
// optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
// available.
// `_bind` : (ahem) a function's function
// ---------------------------------------

var _bind = (0, _internal.restArgs)((func, context, args) => {
  if (!(0, _isFunction3.default)(func)) throw new TypeError('Bind must be called on a function');
  var bound = (0, _internal.restArgs)(function (callArgs) {
    return (0, _internal.executeBound)(func, bound, context, this, args.concat(callArgs));
  });
  return bound;
});

exports.default = _bind;
},{"./isFunction":130,"./_internal":199}],154:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _bind2 = require('./bind');

var _bind3 = _interopRequireDefault(_bind2);

var _internal = require('./_internal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Bind a number of an object's methods to that object. Remaining arguments
// are the method names to be bound. Useful for ensuring that all callbacks
// defined on an object belong to it.
// `_bindAll` : (ahem) a function's function
// -------------------------------------------

var _bindAll = (0, _internal.restArgs)((obj, keys) => {
  keys = (0, _internal.flatten)(keys, false, false);
  let index = keys.length;
  if (index < 1) throw new Error('bindAll must be passed function names');
  while (index--) {
    let key = keys[index];
    obj[key] = (0, _bind3.default)(obj[key], obj);
  }
});

exports.default = _bindAll;
},{"./bind":153,"./_internal":199}],155:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  let args = arguments;
  let start = args.length - 1;
  return function () {
    let i = start;
    let result = args[start].apply(this, arguments);
    while (i--) result = args[i].call(this, result);
    return result;
  };
};
},{}],162:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _base = require('./_base');

var _base2 = _interopRequireDefault(_base);

var _internal = require('./_internal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Partially apply a function by creating a version that has had some of its
// arguments pre-filled, without changing its dynamic `this` context. _ acts
// as a placeholder by default, allowing any combination of arguments to be
// pre-filled. Set `_.partial.placeholder` for a custom placeholder argument.
// `_partial` : (ahem) a function's function
// ------------------------------------------

var _partial = (0, _internal.restArgs)((func, boundArgs) => {
  let placeholder = _partial.placeholder;
  var bound = function () {
    let position = 0,
        length = boundArgs.length;
    let args = Array(length);
    for (let i = 0; i < length; i++) {
      args[i] = boundArgs[i] === placeholder ? arguments[position++] : boundArgs[i];
    }
    while (position < arguments.length) args.push(arguments[position++]);
    return (0, _internal.executeBound)(func, bound, this, this, args);
  };
  return bound;
});
_partial.placeholder = _base2.default;

exports.default = _partial;
},{"./_base":184,"./_internal":199}],158:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _internal = require('./_internal');

// Delays a function for the given number of milliseconds, and then calls
// it with the arguments supplied.
var _delay = (0, _internal.restArgs)((func, wait, args) => {
  return setTimeout(() => {
    return func.apply(null, args);
  }, wait);
}); // `_delay` : (ahem) a function's function
// ----------------------------------------

exports.default = _delay;
},{"./_internal":199}],156:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _partial2 = require('./partial');

var _partial3 = _interopRequireDefault(_partial2);

var _delay2 = require('./delay');

var _delay3 = _interopRequireDefault(_delay2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Defers a function, scheduling it to run after the current call stack has cleared.
// `_defer` : (ahem) a function's function
// ----------------------------------------

var _defer = (0, _partial3.default)(_delay3.default, _partial3.default.placeholder, 1);

exports.default = _defer;
},{"./partial":162,"./delay":158}],157:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (func, wait, immediate) {
  let timeout, result;

  let later = function (context, args) {
    timeout = null;
    if (args) result = func.apply(context, args);
  };

  let debounced = (0, _internal.restArgs)(function (args) {
    if (timeout) clearTimeout(timeout);
    if (immediate) {
      var callNow = !timeout;
      timeout = setTimeout(later, wait);
      if (callNow) result = func.apply(this, args);
    } else {
      timeout = (0, _delay3.default)(later, wait, this, args);
    }

    return result;
  });

  debounced.cancel = function () {
    clearTimeout(timeout);
    timeout = null;
  };

  return debounced;
};

var _delay2 = require('./delay');

var _delay3 = _interopRequireDefault(_delay2);

var _internal = require('./_internal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./delay":158,"./_internal":199}],159:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (func, hasher) {
  let memoize = function (key) {
    let cache = memoize.cache;
    let address = '' + (hasher ? hasher.apply(this, arguments) : key);
    if (!(0, _has3.default)(cache, address)) cache[address] = func.apply(this, arguments);
    return cache[address];
  };
  memoize.cache = {};
  return memoize;
};

var _has2 = require('./has');

var _has3 = _interopRequireDefault(_has2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./has":118}],161:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _partial2 = require('./partial');

var _partial3 = _interopRequireDefault(_partial2);

var _before2 = require('./before');

var _before3 = _interopRequireDefault(_before2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Returns a function that will be executed at most one time, no matter how
// often you call it. Useful for lazy initialization.
// `_once` : (ahem) a function's function
// ---------------------------------------

var _once = (0, _partial3.default)(_before3.default, 2);

exports.default = _once;
},{"./partial":162,"./before":152}],163:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _internal = require('./_internal');

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function () {
    return _internal.restArgs;
  }
});
},{"./_internal":199}],174:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
// `_now` : an utility's function
// -------------------------------

// A (possibly faster) way to get the current timestamp as an integer.
var _now = Date.now || function () {
	return new Date().getTime();
};

exports.default = _now;
},{}],164:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (func, wait, options) {
  let timeout, context, args, result;
  let previous = 0;
  if (!options) options = {};

  let later = function () {
    previous = options.leading === false ? 0 : (0, _now3.default)();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };

  let throttled = function () {
    let now = (0, _now3.default)();
    if (!previous && options.leading === false) previous = now;
    let remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };

  throttled.cancel = function () {
    clearTimeout(timeout);
    previous = 0;
    timeout = context = args = null;
  };

  return throttled;
};

var _now2 = require('./now');

var _now3 = _interopRequireDefault(_now2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./now":174}],165:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj) {
	let Chainhub = function () {
		let value = obj;
		this.do = function () {
			let args = arguments;
			let context = args[0];
			if (!(0, _isFunction3.default)(context)) args = (0, _drop3.default)(args);else context = this;
			let func = args[0] || _identity3.default;
			args = (0, _drop3.default)(args);
			args.unshift(value);
			value = func.apply(context, args);
			return this;
		};
		this.value = () => value;
		return this;
	};

	return new Chainhub();
};

var _isFunction2 = require('./isFunction.js');

var _isFunction3 = _interopRequireDefault(_isFunction2);

var _identity2 = require('./identity');

var _identity3 = _interopRequireDefault(_identity2);

var _drop2 = require('./drop');

var _drop3 = _interopRequireDefault(_drop2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./isFunction.js":130,"./identity":169,"./drop":88}],166:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (func, wrapper) {
  return (0, _partial3.default)(wrapper, func);
};

var _partial2 = require('./partial');

var _partial3 = _interopRequireDefault(_partial2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./partial":162}],33:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _after = require('./after');

Object.defineProperty(exports, '_after', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_after).default;
  }
});

var _before = require('./before');

Object.defineProperty(exports, '_before', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_before).default;
  }
});

var _bind = require('./bind');

Object.defineProperty(exports, '_bind', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_bind).default;
  }
});

var _bindAll = require('./bindAll');

Object.defineProperty(exports, '_bindAll', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_bindAll).default;
  }
});

var _compose = require('./compose');

Object.defineProperty(exports, '_compose', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_compose).default;
  }
});

var _defer = require('./defer');

Object.defineProperty(exports, '_defer', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_defer).default;
  }
});

var _debounce = require('./debounce');

Object.defineProperty(exports, '_debounce', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_debounce).default;
  }
});

var _delay = require('./delay');

Object.defineProperty(exports, '_delay', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_delay).default;
  }
});

var _memoize = require('./memoize');

Object.defineProperty(exports, '_memoize', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_memoize).default;
  }
});

var _negate = require('./negate');

Object.defineProperty(exports, '_negate', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_negate).default;
  }
});

var _once = require('./once');

Object.defineProperty(exports, '_once', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_once).default;
  }
});

var _partial = require('./partial');

Object.defineProperty(exports, '_partial', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_partial).default;
  }
});

var _restArgs = require('./restArgs');

Object.defineProperty(exports, '_restArgs', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_restArgs).default;
  }
});

var _throttle = require('./throttle');

Object.defineProperty(exports, '_throttle', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_throttle).default;
  }
});

var _use = require('./use');

Object.defineProperty(exports, '_use', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_use).default;
  }
});

var _wrap = require('./wrap');

Object.defineProperty(exports, '_wrap', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_wrap).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./after":151,"./before":152,"./bind":153,"./bindAll":154,"./compose":155,"./defer":156,"./debounce":157,"./delay":158,"./memoize":159,"./negate":160,"./once":161,"./partial":162,"./restArgs":163,"./throttle":164,"./use":165,"./wrap":166}],167:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (value) {
	return function () {
		return value;
	};
};
},{}],168:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _internal = require('./_internal');

// Functions for escaping strings to/from HTML interpolation.
var _escape = (0, _internal.createEscaper)(_internal.escapeMap); // `_escape` : an utility's function
// ----------------------------------

exports.default = _escape;
},{"./_internal":199}],173:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {};
},{}],176:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (obj) {
	return obj == null ? () => {} : key => obj[key];
};
},{}],178:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (object, prop, fallback) {
	let value = object == null ? void 0 : object[prop];
	if (value === void 0) {
		value = fallback;
	}
	return (0, _isFunction3.default)(value) ? value.call(object) : value;
};

var _isFunction2 = require('./isFunction');

var _isFunction3 = _interopRequireDefault(_isFunction2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./isFunction":130}],179:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = undefined;

var _defaults2 = require('./defaults');

var _defaults3 = _interopRequireDefault(_defaults2);

var _escape2 = require('./escape');

var _escape3 = _interopRequireDefault(_escape2);

var _base = require('./_base');

var _base2 = _interopRequireDefault(_base);

var _internal = require('./_internal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// JavaScript micro-templating, similar to John Resig's implementation.
// Underscore templating handles arbitrary delimiters, preserves whitespace,
// and correctly escapes quotes within interpolated code.
// NB: `oldSettings` only exists for backwards compatibility.
// `_template` : an utility's function
// ------------------------------------

function _template(text, settings, oldSettings) {
	if (!settings && oldSettings) settings = oldSettings;
	settings = (0, _defaults3.default)({}, settings, _template.settings);

	// Combine delimiters into one regular expression via alternation.
	let matcher = RegExp([(settings.escape || _internal.noMatch).source, (settings.interpolate || _internal.noMatch).source, (settings.evaluate || _internal.noMatch).source].join('|') + '|$', 'g');

	// Compile the template source, escaping string literals appropriately.
	let index = 0;
	let source = "__p+='";
	text.replace(matcher, (match, escape, interpolate, evaluate, offset) => {
		source += text.slice(index, offset).replace(_internal.escapeRegExp, _internal.escapeChar);
		index = offset + match.length;

		if (escape) {
			source += "'+\n((__t=(" + escape + "))==null?'':(typeof _escape == 'function')?_escape(__t):_.escape(__t))+\n'";
		} else if (interpolate) {
			source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
		} else if (evaluate) {
			source += "';\n" + evaluate + "\n__p+='";
		}

		// Adobe VMs need the match returned to produce the correct offset.
		return match;
	});
	source += "';\n";

	// If a variable is not specified, place data values in local scope.
	if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

	source = "var __t,__p='',__j=Array.prototype.join," + "print=function(){__p+=__j.call(arguments,'');};\n" + source + 'return __p;\n';

	let render;
	try {
		render = new Function(settings.variable || 'obj', '_', source);
	} catch (e) {
		e.source = source;
		throw e;
	}

	let template = function (data) {
		return render.call(this, data, _base2.default);
	};

	// Provide the compiled source as a convenience for precompilation.
	let argument = settings.variable || 'obj';
	template.source = 'function(' + argument + '){\n' + source + '}';

	return template;
}
// By default, Underscore uses ERB-style template delimiters, change the
// following template settings to use alternative delimiters.
_template.settings = {
	evaluate: /<%([\s\S]+?)%>/g,
	interpolate: /<%=([\s\S]+?)%>/g,
	escape: /<%-([\s\S]+?)%>/g
};

exports.default = _template;
},{"./defaults":113,"./escape":168,"./_base":184,"./_internal":199}],180:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (n, iteratee, context) {
	let accum = Array(Math.max(0, n));
	iteratee = (0, _internal.optimizeCb)(iteratee, context, 1);
	for (let i = 0; i < n; i++) accum[i] = iteratee(i);
	return accum;
};

var _internal = require('./_internal');
},{"./_internal":199}],181:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _internal = require('./_internal');

// Functions for unescaping strings to/from HTML interpolation.
var _unescape = (0, _internal.createEscaper)(_internal.unescapeMap); // `_unescape` : an utility's function
// ------------------------------------

exports.default = _unescape;
},{"./_internal":199}],182:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (prefix) {
	let id = ++idCounter + '';
	return prefix ? prefix + id : id;
};

// `_uniqueId` : an utility's function
// ------------------------------------

// Generate a unique integer id (unique within the entire client session).
// Useful for temporary DOM ids.
let idCounter = 0;
},{}],34:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _constant = require('./constant');

Object.defineProperty(exports, '_constant', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_constant).default;
  }
});

var _escape = require('./escape');

Object.defineProperty(exports, '_escape', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_escape).default;
  }
});

var _identity = require('./identity');

Object.defineProperty(exports, '_identity', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_identity).default;
  }
});

var _iteratee = require('./iteratee');

Object.defineProperty(exports, '_iteratee', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_iteratee).default;
  }
});
Object.defineProperty(exports, '_setIteratee', {
  enumerable: true,
  get: function () {
    return _iteratee._setIteratee;
  }
});

var _matcher = require('./matcher');

Object.defineProperty(exports, '_matcher', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_matcher).default;
  }
});

var _matches = require('./matches');

Object.defineProperty(exports, '_matches', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_matches).default;
  }
});

var _noop = require('./noop');

Object.defineProperty(exports, '_noop', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_noop).default;
  }
});

var _now = require('./now');

Object.defineProperty(exports, '_now', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_now).default;
  }
});

var _property = require('./property');

Object.defineProperty(exports, '_property', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_property).default;
  }
});

var _propertyOf = require('./propertyOf');

Object.defineProperty(exports, '_propertyOf', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_propertyOf).default;
  }
});

var _random = require('./random');

Object.defineProperty(exports, '_random', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_random).default;
  }
});

var _result = require('./result');

Object.defineProperty(exports, '_result', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_result).default;
  }
});

var _template = require('./template');

Object.defineProperty(exports, '_template', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_template).default;
  }
});

var _times = require('./times');

Object.defineProperty(exports, '_times', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_times).default;
  }
});

var _unescape = require('./unescape');

Object.defineProperty(exports, '_unescape', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_unescape).default;
  }
});

var _uniqueId = require('./uniqueId');

Object.defineProperty(exports, '_uniqueId', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_uniqueId).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./constant":167,"./escape":168,"./identity":169,"./iteratee":170,"./matcher":171,"./matches":172,"./noop":173,"./now":174,"./property":175,"./propertyOf":176,"./random":177,"./result":178,"./template":179,"./times":180,"./unescape":181,"./uniqueId":182}],35:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = undefined;

var _quickaccess = require('./_quickaccess');

var _collections = require('./_collections');

var collectionTools = _interopRequireWildcard(_collections);

var _arrays = require('./_arrays');

var arrayTools = _interopRequireWildcard(_arrays);

var _objects = require('./_objects');

var objectTools = _interopRequireWildcard(_objects);

var _functions = require('./_functions');

var functionTools = _interopRequireWildcard(_functions);

var _utilities = require('./_utilities');

var utilityTools = _interopRequireWildcard(_utilities);

var _base = require('./_base');

var _base2 = _interopRequireDefault(_base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// Baseline setup
// --------------
var _ = _base2.default;
// will help to add underscore's natives functions to the Underscore object.
// each native function start with _ so it will be removed 
// because the gold is to have `_[.function]` not `_[._function]`
//     Underscore.js for ES6 and beyond usage !
//     http://underscorejs.org
//     (c) 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//		 (c) 2016 Tindo N. Arsel <devtnga@gmail.com>


let natifyMixin = function (obj) {
	collectionTools._each(objectTools._functions(obj), name => {
		_[name.slice(1)] = obj[name];
	});
	return _;
};
// Add underscore's natives functions to the Underscore object.
natifyMixin(collectionTools);
natifyMixin(arrayTools);
natifyMixin(objectTools);
natifyMixin(functionTools);
natifyMixin(utilityTools);

// Add a "chain" function. Start chaining a wrapped Underscore object.
_.chain = function (obj) {
	let instance = _(obj);
	instance._chain = true;
	return instance;
};

// OOP
// ---------------
// If Underscore is called as a function, it returns a wrapped object that
// can be used OO-style. This wrapper holds altered versions of all the
// underscore functions. Wrapped objects may be chained.

// Helper function to continue chaining intermediate results.
var chainResult = (instance, obj) => instance._chain ? _(obj).chain() : obj;

// Add your own custom functions to the Underscore object.
_.mixin = function (obj) {
	_.each(_.functions(obj), name => {
		let func = _[name] = obj[name];
		_.prototype[name] = function () {
			let args = [this._wrapped];
			_quickaccess.push.apply(args, arguments);
			return chainResult(this, func.apply(_, args));
		};
	});
	return _;
};

// Add all of the Underscore functions to the wrapper object.
_.mixin(_);

// Add all mutator Array functions to the wrapper.
_.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], name => {
	var method = Array.prototype[name];
	_.prototype[name] = function () {
		var obj = this._wrapped;
		method.apply(obj, arguments);
		if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
		return chainResult(this, obj);
	};
});

// Add all accessor Array functions to the wrapper.
_.each(['concat', 'join', 'slice'], name => {
	var method = Array.prototype[name];
	_.prototype[name] = function () {
		return chainResult(this, method.apply(this._wrapped, arguments));
	};
});

// Extracts the result from a wrapped and chained object.
_.prototype.value = function () {
	return this._wrapped;
};

// Provide unwrapping proxy for some methods used in engine operations
// such as arithmetic and JSON stringification.
_.prototype.valueOf = _.prototype.toJSON = _.prototype.value;
// Provide toString
_.prototype.toString = function () {
	return String(this._wrapped);
};

// Create a safe reference to the Underscore object for use below.
exports.default = _;
},{"./_quickaccess":183,"./_collections":30,"./_arrays":31,"./_objects":32,"./_functions":33,"./_utilities":34,"./_base":184}],26:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _collections = require('./_collections');

Object.keys(_collections).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _collections[key];
    }
  });
});

var _arrays = require('./_arrays');

Object.keys(_arrays).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _arrays[key];
    }
  });
});

var _objects = require('./_objects');

Object.keys(_objects).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _objects[key];
    }
  });
});

var _functions = require('./_functions');

Object.keys(_functions).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _functions[key];
    }
  });
});

var _utilities = require('./_utilities');

Object.keys(_utilities).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _utilities[key];
    }
  });
});

var _namespace = require('./_namespace');

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_namespace).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./_collections":30,"./_arrays":31,"./_objects":32,"./_functions":33,"./_utilities":34,"./_namespace":35}],200:[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var styler_1 = require("../styler");
var domScrollStyler = styler_1.default({
    useCache: false,
    onRead: function (key, _a) {
        var element = _a.element;
        return (key === 'top') ? element.scrollTop : element.scrollLeft;
    },
    onRender: function (_a, _b) {
        var top = _a.top, left = _a.left;
        var element = _b.element;
        element.scrollLeft = left;
        element.scrollTop = top;
    }
});
var viewportScrollStyler = styler_1.default({
    useCache: false,
    onRead: function (key) {
        if (typeof window === 'undefined')
            return 0;
        return (key === 'top') ? window.pageXOffset : window.pageXOffset;
    },
    onRender: function (_a) {
        var _b = _a.top, top = _b === void 0 ? 0 : _b, _c = _a.left, left = _c === void 0 ? 0 : _c;
        if (typeof window !== 'undefined' && typeof top === 'number' && typeof left === 'number') {
            window.scrollTo(left, top);
        }
    }
});
exports.default = function (element) { return element
    ? domScrollStyler({ element: element })
    : viewportScrollStyler(); };
//# sourceMappingURL=index.js.map
},{"../styler":206}],19:[function(require,module,exports) {
'use strict';

var _popmotion = require('popmotion');

var _underscoreEs = require('underscore-es');

var _underscoreEs2 = _interopRequireDefault(_underscoreEs);

var _scroll = require('stylefire/scroll');

var _scroll2 = _interopRequireDefault(_scroll);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const waveString = document.querySelector('h1');
const waveArray = Array.from(waveString.children).map(_popmotion.styler);
let playing = false;
const waveHandle = e => {
  (0, _popmotion.stagger)([...waveArray.map((el, index) => {
    return (0, _popmotion.spring)({
      from: { x: 0, y: 100 },
      to: { x: 0, y: 0 },
      velocity: (0, _popmotion.value)({ x: 0, y: 0 }, el.set).getVelocity(),
      stiffness: 1000,
      mass: 2,
      damping: 10
    });
  })], 200).start({
    complete: () => {
      console.log('wave complete'), playing = false;
    },
    error: () => {},
    update: values => values.forEach((v, i) => {
      (0, _popmotion.value)({ x: 0, y: 0 }, waveArray[i].set({ x: v.x, y: v.y / ((i + 2) * 0.5) }));
    })
  });
};
(0, _popmotion.listen)(document, 'scroll', false).filter(e => waveString.getBoundingClientRect().top < window.innerHeight && waveString.getBoundingClientRect().bottom > 0)
// .start(waveHandle)
.start({
  complete: () => console.log('scroll complete'),
  error: () => console.log('scroll error'),
  update: v => {
    if (playing) return;
    waveHandle(v);
    playing = true;
  }
});
},{"popmotion":25,"underscore-es":26,"stylefire/scroll":200}],221:[function(require,module,exports) {

var global = (1, eval)('this');
var OldModule = module.bundle.Module;
function Module() {
  OldModule.call(this);
  this.hot = {
    accept: function (fn) {
      this._acceptCallback = fn || function () {};
    },
    dispose: function (fn) {
      this._disposeCallback = fn;
    }
  };
}

module.bundle.Module = Module;

if (!module.bundle.parent && typeof WebSocket !== 'undefined') {
  var hostname = '' || location.hostname;
  var ws = new WebSocket('ws://' + hostname + ':' + '62651' + '/');
  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      data.assets.forEach(function (asset) {
        hmrApply(global.require, asset);
      });

      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.require, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + 'data.error.stack');
    }
  };
}

function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(+k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  if (cached && cached.hot._disposeCallback) {
    cached.hot._disposeCallback();
  }

  delete bundle.cache[id];
  bundle(id);

  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallback) {
    cached.hot._acceptCallback();
    return true;
  }

  return getParents(global.require, id).some(function (id) {
    return hmrAccept(global.require, id);
  });
}
},{}]},{},[221,19])
//# sourceMappingURL=/dist/2dc332800a5f369bb4d975d27aa13eef.map