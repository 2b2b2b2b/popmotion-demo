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