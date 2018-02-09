/*

  Types
  ==================

 */

export type Transformer = (v: any) => any;

export type ValueType = {
  test: (v: any) => boolean,
  parse: (v: any) => any,
  transform?: Transformer,
  createTransformer?: (template: string) => Transformer
  default?: any
};

export type NumberMap = {
  [key: string]: number
};

export type RGBA = {
  red: number,
  green: number,
  blue: number,
  alpha?: number
};

export type HSLA = {
  hue: number,
  saturation: number,
  lightness: number,
  alpha?: number
};

export type Color = HSLA | RGBA;

/*

  Utils
  ==================

 */

const clamp = (min: number, max: number) => (v: number) => Math.max(Math.min(v, max), min);

/**
 *  Returns a function that will check any argument for `term`
 * `contains('needle')('haystack')`
 */
const contains = (term: string) => (v: string) => (typeof term === 'string' && v.indexOf(term) !== -1);

const createUnitType = (unit: string): ValueType => ({
  test: contains(unit),
  parse: parseFloat,
  transform: (v: number | string) => `${v}${unit}`
});

/**
 *  Returns a function that will check to see if an argument is
 *  the first characters in the provided `term`
 * `isFirstChars('needle')('haystack')`
 */
const isFirstChars = (term: string) => (v: string) => (typeof term === 'string' && v.indexOf(term) === 0);

/*
  Get value from function string
  "translateX(20px)" -> "20px"
*/
export const getValueFromFunctionString = (value: string) => value.substring(value.indexOf('(') + 1, value.lastIndexOf(')'));

/*
  Split comma-delimited string

  "foo,bar" -> ["foo", "bar"]

  @param [string]
  @return [array]
*/
export const splitCommaDelimited = (value: string) => typeof value === 'string' ? value.split(/,\s*/) : [value];

/**
 * Creates a function that will split color
 * values from string into an object of properties
 * `mapArrayToObject(['red', 'green', 'blue'])('rgba(0,0,0)')`
 */
export function splitColorValues(terms: string[]) {
  const numTerms = terms.length;

  return function (v: string) {
    const values: NumberMap = {};
    const valuesArray = splitCommaDelimited(getValueFromFunctionString(v));

    for (let i = 0; i < numTerms; i++) {
      values[terms[i]] = (valuesArray[i] !== undefined) ? parseFloat(valuesArray[i]) : 1;
    }

    return values;
  };
}

/*

  Value types
  ==================

 */

export const number: ValueType = {
  test: (v): boolean => typeof v === 'number',
  parse: parseFloat,
  transform: (v) => v
};

export const alpha: ValueType = {
  ...number,
  transform: clamp(0, 1)
};

export const degrees = createUnitType('deg');
export const percent = createUnitType('%');
export const px = createUnitType('px');

export const scale: ValueType = {
  ...number,
  default: 1
};

type TokenMap = { [key: string]: number };
const FLOAT_REGEX = /(-)?(\d[\d\.]*)/g;
const generateToken = (token: string) => '${' + token + '}';
export const complex: ValueType = {
  test: (v) => {
    const matches = v.match && v.match(FLOAT_REGEX);
    return (matches !== undefined && matches.constructor === Array && matches.length > 1);
  },
  parse: (v) => {
    const parsedValue: TokenMap = {};
    v.match(FLOAT_REGEX).forEach((value: string, i: number) => parsedValue[i] = parseFloat(value));
    return parsedValue;
  },
  createTransformer: (prop: string) => {
    let counter = 0;
    const template = prop.replace(FLOAT_REGEX, () => generateToken(`${counter++}`));

    return (v: TokenMap) => {
      let output = template;

      for (let key in v) {
        if (v.hasOwnProperty(key)) {
          output = output.replace(generateToken(key), v[key].toString());
        }
      }

      return output;
    };
  }
};

/*

  Color types
  ==================

 */

const clampRgbUnit = clamp(0, 255);
export const rgbUnit: ValueType = {
  ...number,
  transform: (v: number) => Math.round(clampRgbUnit(v))
};

const rgbaTemplate = ({ red, green, blue, alpha = 1 }: RGBA) =>
  `rgba(${red}, ${green}, ${blue}, ${alpha})`;

export const rgba = {
  test: isFirstChars('rgb'),
  parse: splitColorValues(['red', 'green', 'blue', 'alpha']),
  transform: ({ red, green, blue, alpha }: RGBA) => rgbaTemplate({
    red: rgbUnit.transform(red),
    green: rgbUnit.transform(green),
    blue: rgbUnit.transform(blue),
    alpha
  })
};

const hslaTemplate = ({ hue, saturation, lightness, alpha = 1 }: HSLA) =>
  `hsla(${hue}, ${saturation}, ${lightness}, ${alpha})`;

export const hsla = {
  test: isFirstChars('hsl'),
  parse: splitColorValues(['hue', 'saturation', 'lightness', 'alpha']),
  transform: ({ hue, saturation, lightness, alpha }: HSLA) => hslaTemplate({
    hue: Math.round(hue),
    saturation: percent.transform(saturation),
    lightness: percent.transform(lightness),
    alpha
  })
};

export const hex = {
  ...rgba,
  test: isFirstChars('#'),
  parse: (v: string): RGBA => {
    let r, g, b;

    // If we have 6 characters, ie #FF0000
    if (v.length > 4) {
      r = v.substr(1, 2);
      g = v.substr(3, 2);
      b = v.substr(5, 2);

    // Or we have 3 characters, ie #F00
    } else {
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
  }
};

const isRgba = (v: Color): v is RGBA => (<RGBA>v).red !== undefined;
const isHsla = (v: Color): v is HSLA => (<HSLA>v).hue !== undefined;

export const color = {
  test: (v: any) => rgba.test(v) || hsla.test(v) || hex.test(v),
  parse: (v: any) => {
    if (rgba.test(v)) {
      return rgba.parse(v);
    } else if (hsla.test(v)) {
      return hsla.parse(v);
    } else if (hex.test(v)) {
      return hex.parse(v);
    }

    return v;
  },
  transform: (v: Color) => {
    if (isRgba(v)) {
      return rgba.transform(v);
    } else if (isHsla(v)) {
      return hsla.transform(v);
    }

    return v;
  }
};
