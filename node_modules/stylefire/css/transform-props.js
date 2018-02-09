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