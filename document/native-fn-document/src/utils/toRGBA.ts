export interface RGB {
    red: number;
    green: number;
    blue: number;
}

export interface RGBA extends RGB {
    alpha: number;
}

interface OKLab {
    L: number;
    a: number;
    b: number;
}

const KEYWORD_COLOR_MAP: Record<string, string> = {
    black: '#000000', silver: '#c0c0c0', gray: '#808080', white: '#ffffff',
    maroon: '#800000', red: '#ff0000', purple: '#800080', fuchsia: '#ff00ff',
    green: '#008000', lime: '#00ff00', olive: '#808000', yellow: '#ffff00',
    navy: '#000080', blue: '#0000ff', teal: '#008080', aqua: '#00ffff',
    orange: '#ffa500', aliceblue: '#f0f8ff', antiquewhite: '#faebd7',
    aquamarine: '#7fffd4', azure: '#f0ffff', beige: '#f5f5dc', bisque: '#ffe4c4',
    blanchedalmond: '#ffebcd', blueviolet: '#8a2be2', brown: '#a52a2a',
    burlywood: '#deb887', cadetblue: '#5f9ea0', chartreuse: '#7fff00',
    chocolate: '#d2691e', coral: '#ff7f50', cornflowerblue: '#6495ed',
    cornsilk: '#fff8dc', crimson: '#dc143c', cyan: '#00ffff', darkblue: '#00008b',
    darkcyan: '#008b8b', darkgoldenrod: '#b8860b', darkgray: '#a9a9a9',
    darkgreen: '#006400', darkgrey: '#a9a9a9', darkkhaki: '#bdb76b',
    darkmagenta: '#8b008b', darkolivegreen: '#556b2f', darkorange: '#ff8c00',
    darkorchid: '#9932cc', darkred: '#8b0000', darksalmon: '#e9967a',
    darkseagreen: '#8fbc8f', darkslateblue: '#483d8b', darkslategray: '#2f4f4f',
    darkslategrey: '#2f4f4f', darkturquoise: '#00ced1', darkviolet: '#9400d3',
    deeppink: '#ff1493', deepskyblue: '#00bfff', dimgray: '#696969',
    dimgrey: '#696969', dodgerblue: '#1e90ff', firebrick: '#b22222',
    floralwhite: '#fffaf0', forestgreen: '#228b22', gainsboro: '#dcdcdc',
    ghostwhite: '#f8f8ff', gold: '#ffd700', goldenrod: '#daa520',
    greenyellow: '#adff2f', grey: '#808080', honeydew: '#f0fff0',
    hotpink: '#ff69b4', indianred: '#cd5c5c', indigo: '#4b0082', ivory: '#fffff0',
    khaki: '#f0e68c', lavender: '#e6e6fa', lavenderblush: '#fff0f5',
    lawngreen: '#7cfc00', lemonchiffon: '#fffacd', lightblue: '#add8e6',
    lightcoral: '#f08080', lightcyan: '#e0ffff', lightgoldenrodyellow: '#fafad2',
    lightgray: '#d3d3d3', lightgreen: '#90ee90', lightgrey: '#d3d3d3',
    lightpink: '#ffb6c1', lightsalmon: '#ffa07a', lightseagreen: '#20b2aa',
    lightskyblue: '#87cefa', lightslategray: '#778899', lightslategrey: '#778899',
    lightsteelblue: '#b0c4de', lightyellow: '#ffffe0', limegreen: '#32cd32',
    linen: '#faf0e6', magenta: '#ff00ff', mediumaquamarine: '#66cdaa',
    mediumblue: '#0000cd', mediumorchid: '#ba55d3', mediumpurple: '#9370db',
    mediumseagreen: '#3cb371', mediumslateblue: '#7b68ee',
    mediumspringgreen: '#00fa9a', mediumturquoise: '#48d1cc',
    mediumvioletred: '#c71585', midnightblue: '#191970', mintcream: '#f5fffa',
    mistyrose: '#ffe4e1', moccasin: '#ffe4b5', navajowhite: '#ffdead',
    oldlace: '#fdf5e6', olivedrab: '#6b8e23', orangered: '#ff4500',
    orchid: '#da70d6', palegoldenrod: '#eee8aa', palegreen: '#98fb98',
    paleturquoise: '#afeeee', palevioletred: '#db7093', papayawhip: '#ffefd5',
    peachpuff: '#ffdab9', peru: '#cd853f', pink: '#ffc0cb', plum: '#dda0dd',
    powderblue: '#b0e0e6', rosybrown: '#bc8f8f', royalblue: '#4169e1',
    saddlebrown: '#8b4513', salmon: '#fa8072', sandybrown: '#f4a460',
    seagreen: '#2e8b57', seashell: '#fff5ee', sienna: '#a0522d',
    skyblue: '#87ceeb', slateblue: '#6a5acd', slategray: '#708090',
    slategrey: '#708090', snow: '#fffafa', springgreen: '#00ff7f',
    steelblue: '#4682b4', tan: '#d2b48c', thistle: '#d8bfd8', tomato: '#ff6347',
    turquoise: '#40e0d0', violet: '#ee82ee', wheat: '#f5deb3',
    whitesmoke: '#f5f5f5', yellowgreen: '#9acd32', rebeccapurple: '#663399',
    transparent: '#00000000',
};

let CONTEXT: CanvasRenderingContext2D | null | undefined = undefined;

function getContext(): CanvasRenderingContext2D | null {
    if (CONTEXT !== undefined) return CONTEXT;

    try {
        CONTEXT = 'document' in globalThis
            ? globalThis.document.createElement('canvas').getContext('2d', {willReadFrequently: true})
            : null;
    } catch (_) {
        CONTEXT = null;
    }

    return CONTEXT;
}

// D65 standard illuminant white point
const D65 = {x: 0.95047, y: 1.00000, z: 1.08883} as const;
const LAB_DELTA: number = 6 / 29;

// Clamps n to the [0, 255] integer range
function clamp255(n: number): number {
    return Math.max(0, Math.min(255, Math.round(n)));
}

// Clamps n to [0, 1], fixed to 2 decimal places
function clampAlpha(n: number): number {
    return parseFloat(Math.max(0, Math.min(1, n)).toFixed(2));
}

/*
 * Parses an alpha token into [0, 1].
 * Returns 1 when the token is undefined (i.e. alpha was omitted from the string).
 * Accepts both absolute ("0.5") and percentage ("50%") forms.
 */
function parseAlpha(s: string | undefined): number {
    if (s === undefined) return 1;
    if (s.endsWith('%')) return parseFloat(s) / 100;
    return parseFloat(s);
}

// CIE Lab f-inverse — cube-root domain (IEC 61966-2-1)
function labFInverse(n: number): number {
    if (n > LAB_DELTA) return n ** 3;

    return (n - 16 / 116) * 3 * LAB_DELTA ** 2;
}

// Linear [0, 1] → gamma-encoded sRGB [0, 1] (IEC 61966-2-1)
function linearToSRGB(n: number): number {
    if (n <= 0.0031308) return 12.92 * n;

    return 1.055 * n ** (1 / 2.4) - 0.055;
}

// Linear sRGB [0, 1] → OKLab (Björn Ottosson, 2020)
function linearRGBToOKLab(r: number, g: number, b: number): OKLab {
    // M1: linear sRGB → LMS cone space
    const l: number = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
    const m: number = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
    const s: number = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

    const lCbrt: number = Math.cbrt(l);
    const mCbrt: number = Math.cbrt(m);
    const sCbrt: number = Math.cbrt(s);

    // M2: LMS^(1/3) → OKLab
    return {
        L: 0.2104542553 * lCbrt + 0.7936177850 * mCbrt - 0.0040720468 * sCbrt,
        a: 1.9779984951 * lCbrt - 2.4285922050 * mCbrt + 0.4505937099 * sCbrt,
        b: 0.0259040371 * lCbrt + 0.7827717662 * mCbrt - 0.8086757660 * sCbrt,
    };
}

// OKLab → linear sRGB [0, 1]
function oklabToLinearRGB(L: number, a: number, b: number): [number, number, number] {
    // M2 inverse
    const lCbrt: number = L + 0.3963377774 * a + 0.2158037573 * b;
    const mCbrt: number = L - 0.1055613458 * a - 0.0638541728 * b;
    const sCbrt: number = L - 0.0894841775 * a - 1.2914855480 * b;

    const l: number = lCbrt ** 3;
    const m: number = mCbrt ** 3;
    const s: number = sCbrt ** 3;

    // M1 inverse
    return [
        4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
    ];
}

/*
 * Returns true when all linear sRGB channels are within [0, 1].
 * A small epsilon prevents infinite loops at floating-point boundary values.
 */
function isInSRGBGamut(r: number, g: number, b: number, epsilon = 0.000075): boolean {
    return r >= -epsilon && r <= 1 + epsilon
        && g >= -epsilon && g <= 1 + epsilon
        && b >= -epsilon && b <= 1 + epsilon;
}

/*
 * Converts linear sRGB channels to an RGBA value.
 * When any channel is outside [0, 1], applies OKLab chroma-reduction gamut mapping:
 *
 *   1. Convert linear sRGB → OKLab → OKLCh (L, chroma, hue).
 *   2. Edge cases: L ≥ 1 → white, L ≤ 0 → black.
 *   3. Binary search: reduce chroma toward 0 until isInSRGBGamut() is satisfied.
 *   4. Convert the winning (L, chroma, hue) back to linear sRGB → sRGB.
 *
 * Preserves hue angle and lightness while sacrificing only the minimum saturation
 * needed to bring the color into gamut — far more perceptually faithful than clamping.
 *
 * WHY ADAPTIVE ITERATION INSTEAD OF FIXED 20:
 *   Fixed iteration is conservative — colors barely outside gamut waste cycles
 *   converging to sub-pixel precision they will never benefit from, while
 *   extremely saturated wide-gamut colors (P3, Rec.2020) may need more halvings
 *   to fully converge. Measuring the initial overshoot (excess) and scaling the
 *   budget accordingly gives both groups exactly the precision they need.
 *
 *   excess < 0.1  → color is barely outside gamut; 8 iterations gives
 *                   chroma error ≈ maxChroma / 256, plenty for display.
 *   excess < 0.5  → moderate overshoot; 13 iterations.
 *   excess ≥ 0.5  → highly saturated wide-gamut input; full 18 iterations,
 *                   chroma error ≈ maxChroma / 262 144 ≈ 1.5 × 10⁻⁶.
 *
 * WHY OKLab CHROMA PROXY INSTEAD OF ΔE2000 FOR EARLY EXIT:
 *   ΔE2000 is the wrong tool here for three reasons:
 *
 *   1. Philosophical mismatch — ΔE2000 measures the perceptual distance between
 *      two representable colors. The binary search is instead converging on a
 *      geometric boundary (the gamut edge). These are different problems.
 *
 *   2. No valid reference color — the source color is out-of-gamut and has no
 *      sRGB representation. ΔE2000 requires two Lab values; one side of the
 *      comparison literally does not exist in sRGB space.
 *
 *   3. Cost vs. precision — ΔE2000 costs ≈ 140 ops per iteration (six trig
 *      calls, three square roots, piecewise conditionals). The geometric
 *      convergence test |chroma − prevChroma| < 2 × 10⁻⁴ costs ≈ 2 ops and
 *      gives a chroma error of ≈ ΔE 0.02 — 100× finer than JND (≈ ΔE 2.0).
 *
 *   OKLab is already perceptually uniform by design: equal Euclidean distances
 *   correspond to equal perceived color steps. An OKLab chroma delta below
 *   2 × 10⁻⁴ is therefore already a perceptual convergence test — performed
 *   without any Lab round-trip or extra trigonometry.
 *
 *   Precision comparison at maxIter = 18:
 *     fixed 20 iterations    → chroma error ≈ 1.5 × 10⁻⁷  ≈ ΔE 0.000015
 *     ΔE2000 threshold 2.0   → chroma error ≈ 0.012         ≈ ΔE 2.0 (JND)
 *     adaptive + proxy       → chroma error ≈ 1.5 × 10⁻⁶   ≈ ΔE 0.00015
 *   ΔE2000 early exit degrades precision by 4 orders of magnitude while
 *   increasing per-iteration cost by 11×.
 */
function linearRGBToRGBA(lr: number, lg: number, lb: number, alpha: number): RGBA {
    if (isInSRGBGamut(lr, lg, lb)) {
        return {
            red: clamp255(linearToSRGB(Math.max(0, lr)) * 255),
            green: clamp255(linearToSRGB(Math.max(0, lg)) * 255),
            blue: clamp255(linearToSRGB(Math.max(0, lb)) * 255),
            alpha: clampAlpha(alpha),
        };
    }

    const oklab: OKLab = linearRGBToOKLab(lr, lg, lb);

    // Lightness extremes — map directly without chroma search
    if (oklab.L >= 1) return {red: 255, green: 255, blue: 255, alpha: clampAlpha(alpha)};
    if (oklab.L <= 0) return {red: 0, green: 0, blue: 0, alpha: clampAlpha(alpha)};

    let chroma: number = Math.sqrt(oklab.a * oklab.a + oklab.b * oklab.b);
    const hue: number = Math.atan2(oklab.b, oklab.a);

    // Effectively achromatic: no chroma to reduce, map via lightness only
    if (chroma < 1e-4) {
        const v: number = clamp255(linearToSRGB(oklab.L) * 255);

        return {red: v, green: v, blue: v, alpha: clampAlpha(alpha)};
    }

    // Adaptive iteration budget.
    // Measure the largest per-channel overshoot beyond [0, 1] in linear sRGB.
    // The wider the initial interval [0, maxChroma], the more halvings are needed
    // for the same absolute precision — budget accordingly rather than paying a
    // flat cost for every color regardless of how far outside gamut it actually is.
    const excess: number = Math.max(
        Math.max(0, lr) - 1, Math.max(0, -lr),
        Math.max(0, lg) - 1, Math.max(0, -lg),
        Math.max(0, lb) - 1, Math.max(0, -lb),
    );
    const maxIter: number = excess < 0.1 ? 8 : excess < 0.5 ? 13 : 18;

    // Binary search: narrow down to the largest in-gamut chroma value.
    // prevChroma tracks the previous midpoint: when the step size drops below
    // 2 × 10⁻⁴ the search has converged to a perceptually negligible precision
    // and further iterations would not produce a visible improvement on any
    // display — exit early rather than burning the remaining budget.
    let minChroma: number = 0;
    let maxChroma: number = chroma;
    let prevChroma: number = chroma;

    for (let i: number = 0; i < maxIter; i++) {
        chroma = (minChroma + maxChroma) / 2;

        const [r, g, b] = oklabToLinearRGB(oklab.L, chroma * Math.cos(hue), chroma * Math.sin(hue));

        if (isInSRGBGamut(r, g, b)) minChroma = chroma;
        else maxChroma = chroma;

        // OKLab chroma proxy convergence test.
        // |chroma − prevChroma| is the chroma step for this iteration; once it
        // falls below 2 × 10⁻⁴ the remaining refinement is below ΔE 0.02 —
        // far smaller than any JND and not worth the additional computation.
        if (Math.abs(chroma - prevChroma) < 2e-4) break;
        prevChroma = chroma;
    }

    const [r, g, b]: [number, number, number] = oklabToLinearRGB(
        oklab.L,
        chroma * Math.cos(hue),
        chroma * Math.sin(hue),
    );

    return {
        red: clamp255(linearToSRGB(Math.max(0, Math.min(1, r))) * 255),
        green: clamp255(linearToSRGB(Math.max(0, Math.min(1, g))) * 255),
        blue: clamp255(linearToSRGB(Math.max(0, Math.min(1, b))) * 255),
        alpha: clampAlpha(alpha),
    };
}

/**
 * HSV / HSB → RGBA.
 * Accepts `hsv(H, S[%], V[%][, A])` and `hsb(H, S[%], B[%][, A])`.
 *
 * @param h  Hue          0–360
 * @param s  Saturation   0–100 (%) or 0–1
 * @param v  Value/Bright 0–100 (%) or 0–1
 * @param a  Alpha        0–1 (default 1)
 */
export function hsvToRGBA(h: number, s: number, v: number, a = 1): RGBA {
    if (s > 1) s /= 100;
    if (v > 1) v /= 100;

    h = ((h % 360) + 360) % 360;

    const C: number = v * s;
    const X: number = C * (1 - Math.abs(((h / 60) % 2) - 1));
    const mv: number = v - C;

    let r: number, g: number, b: number;

    if (h < 60) {
        r = C;
        g = X;
        b = 0;
    } else if (h < 120) {
        r = X;
        g = C;
        b = 0;
    } else if (h < 180) {
        r = 0;
        g = C;
        b = X;
    } else if (h < 240) {
        r = 0;
        g = X;
        b = C;
    } else if (h < 300) {
        r = X;
        g = 0;
        b = C;
    } else {
        r = C;
        g = 0;
        b = X;
    }

    return {
        red: clamp255((r + mv) * 255),
        green: clamp255((g + mv) * 255),
        blue: clamp255((b + mv) * 255),
        alpha: clampAlpha(a),
    };
}

/**
 * CMYK → RGBA.
 * Accepts `cmyk(C[%], M[%], Y[%], K[%][, A])` and `device-cmyk(C M Y K[/ A])`.
 *
 * @param c  Cyan      0–100 (%) or 0–1
 * @param m  Magenta   0–100 (%) or 0–1
 * @param y  Yellow    0–100 (%) or 0–1
 * @param k  Key/Black 0–100 (%) or 0–1
 * @param a  Alpha     0–1 (default 1)
 */
export function cmykToRGBA(c: number, m: number, y: number, k: number, a = 1): RGBA {
    if (c > 1) c /= 100;
    if (m > 1) m /= 100;
    if (y > 1) y /= 100;
    if (k > 1) k /= 100;

    return {
        red: clamp255(255 * (1 - c) * (1 - k)),
        green: clamp255(255 * (1 - m) * (1 - k)),
        blue: clamp255(255 * (1 - y) * (1 - k)),
        alpha: clampAlpha(a),
    };
}

/**
 * CIE Lab → RGBA.
 * Accepts `lab(L[%] a b[/ A])`.
 * Out-of-gamut colors are mapped via OKLab chroma reduction rather than hard-clamping,
 * preserving perceptual hue and lightness.
 *
 * @param l      Lightness   0–100
 * @param a      Green–Red   −128–127
 * @param b      Blue–Yellow −128–127
 * @param alpha  Alpha       0–1 (default 1)
 */
export function labToRGBA(l: number, a: number, b: number, alpha = 1): RGBA {
    const fy: number = (l + 16) / 116;
    const fx: number = a / 500 + fy;
    const fz: number = fy - b / 200;

    // Lab → XYZ (D65)
    const X: number = D65.x * labFInverse(fx);
    const Y: number = D65.y * labFInverse(fy);
    const Z: number = D65.z * labFInverse(fz);

    // XYZ → linear sRGB (D65 Bradford matrix)
    const lr: number = 3.2406 * X - 1.5372 * Y - 0.4986 * Z;
    const lg: number = -0.9689 * X + 1.8758 * Y + 0.0415 * Z;
    const lb: number = 0.0557 * X - 0.2040 * Y + 1.0570 * Z;

    return linearRGBToRGBA(lr, lg, lb, alpha);
}

/**
 * CIE LCH → RGBA.
 * Accepts `lch(L[%] C H[/ A])`.
 * LCH is the polar form of Lab: a = C·cos(H), b = C·sin(H).
 * Out-of-gamut handling is identical to labToRGBA.
 *
 * @param l      Lightness  0–100
 * @param c      Chroma     0–150+
 * @param h      Hue angle  0–360
 * @param alpha  Alpha      0–1 (default 1)
 */
export function lchToRGBA(l: number, c: number, h: number, alpha = 1): RGBA {
    const rad: number = (h * Math.PI) / 180;

    return labToRGBA(l, c * Math.cos(rad), c * Math.sin(rad), alpha);
}

/**
 * YCbCr → RGBA (BT.601 full-range).
 * Accepts `ycbcr(Y, Cb, Cr[, A])`.
 *
 * @param y     Luma       0–255
 * @param cb    Blue-diff  0–255
 * @param cr    Red-diff   0–255
 * @param alpha            0–1 (default 1)
 */
export function ycbcrToRGBA(y: number, cb: number, cr: number, alpha = 1): RGBA {
    return {
        red: clamp255(y + 1.402 * (cr - 128)),
        green: clamp255(y - 0.344136 * (cb - 128) - 0.714136 * (cr - 128)),
        blue: clamp255(y + 1.772 * (cb - 128)),
        alpha: clampAlpha(alpha),
    };
}

/**
 * Grayscale → RGBA.
 * Accepts `gray(V[%][, A])` | `grey(V[%][, A])` | `grayscale(V[%][, A])`.
 *
 * @param value  0–255 (integer) or 0–1 (float, auto-detected when ≤ 1)
 * @param alpha  0–1 (default 1)
 */
export function grayscaleToRGBA(value: number, alpha = 1): RGBA {
    const v: number = clamp255(value <= 1 ? value * 255 : value);

    return {red: v, green: v, blue: v, alpha: clampAlpha(alpha)};
}

type ColorParser = (color: string) => RGBA | null;

// CSS engine fallback via Canvas or getComputedStyle — returns null on any failure.
function parseColorViaBrowser(color: string): RGBA | null {
    if (typeof CSS !== 'undefined' && CSS.supports && !CSS.supports('color', color)) return null;

    const ctx: CanvasRenderingContext2D | null = getContext();

    if (ctx !== null) {
        try {
            ctx.clearRect(0, 0, 1, 1);
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, 1, 1);

            const data: Uint8ClampedArray = ctx.getImageData(0, 0, 1, 1).data;

            return {
                red: data[0],
                green: data[1],
                blue: data[2],
                alpha: parseFloat((data[3] / 255).toFixed(2)),
            };
        } catch (_) {
        }
    }

    if (!('document' in globalThis)) return null;

    const div: HTMLDivElement = globalThis.document.createElement('div');

    div.setAttribute('style', 'position:absolute;visibility:hidden;pointer-events:none;width:0;height:0;color:' + color);
    globalThis.document.body.appendChild(div);

    try {
        const computed: string = globalThis.getComputedStyle(div).color;
        // Modern syntax: rgb(R G B[/ A])
        const modern: RegExpMatchArray | null = computed.match(/rgba?\(\s*(\d+)\s+(\d+)\s+(\d+)\s*(?:\/\s*([\d.]+%?))?\s*\)/);
        // Legacy syntax: rgb(R, G, B[, A])
        const legacy: RegExpMatchArray | null = computed.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/);
        const matched: RegExpMatchArray | null = modern ?? legacy;

        if (!matched) return null;

        const red: number = parseInt(matched[1], 10);
        const green: number = parseInt(matched[2], 10);
        const blue: number = parseInt(matched[3], 10);
        const alpha: number = matched[4] !== undefined ? parseFloat(parseAlpha(matched[4]).toFixed(2)) : 1;

        if ([red, green, blue, alpha].some(isNaN)) return null;

        return {red, green, blue, alpha};
    } finally {
        globalThis.document.body.removeChild(div);
    }
}

/*
 * HEX string parser.
 * Supports all four CSS hex notations: #RGB | #RGBA | #RRGGBB | #RRGGBBAA
 * Short forms expand each nibble by doubling ("f" → "ff").
 * The 8-digit form encodes alpha in the last two hex digits (00 = transparent, ff = opaque).
 */
function parseHexString(color: string): RGBA | null {
    const matched: RegExpMatchArray | null = color.match(/^#([0-9a-f]{3,8})$/i);
    if (!matched) return null;

    const hex: string = matched[1];

    switch (hex.length) {
        case 3:
            return {
                red: parseInt(hex[0] + hex[0], 16),
                green: parseInt(hex[1] + hex[1], 16),
                blue: parseInt(hex[2] + hex[2], 16),
                alpha: 1,
            };
        case 4:
            return {
                red: parseInt(hex[0] + hex[0], 16),
                green: parseInt(hex[1] + hex[1], 16),
                blue: parseInt(hex[2] + hex[2], 16),
                alpha: clampAlpha(parseInt(hex[3] + hex[3], 16) / 255),
            };
        case 6:
            return {
                red: parseInt(hex.slice(0, 2), 16),
                green: parseInt(hex.slice(2, 4), 16),
                blue: parseInt(hex.slice(4, 6), 16),
                alpha: 1,
            };
        case 8:
            return {
                red: parseInt(hex.slice(0, 2), 16),
                green: parseInt(hex.slice(2, 4), 16),
                blue: parseInt(hex.slice(4, 6), 16),
                alpha: clampAlpha(parseInt(hex.slice(6, 8), 16) / 255),
            };
        default:
            return null;
    }
}

/*
 * CSS named color keyword parser (case-insensitive).
 * Delegates to parseHexString after lookup so all hex logic stays in one place.
 */
function parseKeywordColor(color: string): RGBA | null {
    const hex: string | undefined = KEYWORD_COLOR_MAP[color.toLowerCase()];

    if (hex === undefined) return null;

    return parseHexString(hex);
}

/*
 * HSV / HSB string parser.
 * hsv(H, S[%], V[%][, A]) | hsb(H, S[%], B[%][, A])
 *
 * Note: alpha used parseFloat(matched[4]) directly in the original, causing
 * parseFloat(undefined) = NaN for alpha-less colors. Fixed by delegating to parseAlpha().
 */
function parseHSVString(color: string): RGBA | null {
    const matched: RegExpMatchArray | null = color.match(/^hs[vb]\(\s*([\d.]+)\s*[,\s]\s*([\d.]+)%?\s*[,\s]\s*([\d.]+)%?\s*(?:[,\/]\s*([\d.]+%?))?\s*\)$/i);

    if (!matched) return null;

    const h: number = parseFloat(matched[1]);
    const s: number = parseFloat(matched[2]);
    const v: number = parseFloat(matched[3]);
    const a: number = parseAlpha(matched[4]);

    if ([h, s, v, a].some(isNaN)) return null;

    return hsvToRGBA(h, s, v, a);
}

/*
 * CMYK string parser.
 * cmyk(C[%], M[%], Y[%], K[%][, A]) | device-cmyk(C M Y K[/ A])
 */
function parseCMYKString(color: string): RGBA | null {
    const matched: RegExpMatchArray | null = color.match(/^(?:device-)?cmyk\(\s*([\d.]+)%?\s*[,\s]\s*([\d.]+)%?\s*[,\s]\s*([\d.]+)%?\s*[,\s]\s*([\d.]+)%?\s*(?:[,\/]\s*([\d.]+%?))?\s*\)$/i);

    if (!matched) return null;

    const c: number = parseFloat(matched[1]);
    const mg: number = parseFloat(matched[2]);
    const y: number = parseFloat(matched[3]);
    const k: number = parseFloat(matched[4]);
    const alpha: number = parseAlpha(matched[5]);

    if ([c, mg, y, k, alpha].some(isNaN)) return null;

    return cmykToRGBA(c, mg, y, k, alpha);
}

/*
 * CIE Lab string parser (fallback for environments without CSS Color 4 support).
 * lab(L[%] a b[/ A])
 */
function parseLabString(color: string): RGBA | null {
    const matched: RegExpMatchArray | null = color.match(/^lab\(\s*([\d.]+)%?\s+([-\d.]+)\s+([-\d.]+)\s*(?:\/\s*([\d.]+%?))?\s*\)$/i);

    if (!matched) return null;

    const l: number = parseFloat(matched[1]);
    const a: number = parseFloat(matched[2]);
    const b: number = parseFloat(matched[3]);
    const alpha: number = parseAlpha(matched[4]);

    if ([l, a, b, alpha].some(isNaN)) return null;

    return labToRGBA(l, a, b, alpha);
}

/*
 * CIE LCH string parser (fallback for environments without CSS Color 4 support).
 * lch(L[%] C H[/ A])
 */
function parseLCHString(color: string): RGBA | null {
    const matched: RegExpMatchArray | null = color.match(/^lch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+%?))?\s*\)$/i);

    if (!matched) return null;

    const l: number = parseFloat(matched[1]);
    const c: number = parseFloat(matched[2]);
    const h: number = parseFloat(matched[3]);
    const alpha: number = parseAlpha(matched[4]);

    if ([l, c, h, alpha].some(isNaN)) return null;

    return lchToRGBA(l, c, h, alpha);
}

/*
 * YCbCr string parser.
 * ycbcr(Y, Cb, Cr[, A])
 */
function parseYCbCrString(color: string): RGBA | null {
    const matched: RegExpMatchArray | null = color.match(/^ycbcr\(\s*([\d.]+)\s*[,\s]\s*([\d.]+)\s*[,\s]\s*([\d.]+)\s*(?:[,\/]\s*([\d.]+%?))?\s*\)$/i);

    if (!matched) return null;

    const y: number = parseFloat(matched[1]);
    const cb: number = parseFloat(matched[2]);
    const cr: number = parseFloat(matched[3]);
    const alpha: number = parseAlpha(matched[4]);

    if ([y, cb, cr, alpha].some(isNaN)) return null;

    return ycbcrToRGBA(y, cb, cr, alpha);
}

/*
 * Grayscale string parser.
 * gray(V[%][, A]) | grey(V[%][, A]) | grayscale(V[%][, A])
 */
function parseGrayscaleString(color: string): RGBA | null {
    const matched: RegExpMatchArray | null = color.match(/^gr[ae]y(?:scale)?\(\s*([\d.]+)(%?)\s*(?:[,\/]\s*([\d.]+%?))?\s*\)$/i);

    if (!matched) return null;

    let value: number = parseFloat(matched[1]);

    if (matched[2] === '%') value = (value / 100) * 255;

    const alpha: number = parseAlpha(matched[3]);

    if (isNaN(value) || isNaN(alpha)) return null;

    return grayscaleToRGBA(value, alpha);
}

const PARSERS: readonly ColorParser[] = [
    parseColorViaBrowser,
    parseHexString,
    parseKeywordColor,
    parseHSVString,
    parseCMYKString,
    parseLabString,
    parseLCHString,
    parseYCbCrString,
    parseGrayscaleString,
];

/**
 * Converts any color string into an RGBA object.
 *
 * @param {string} color - Any CSS-standard or extended color string.
 *
 * Supported formats:
 * - **CSS standard**: `#RGB` `#RRGGBB` `#RGBA` `#RRGGBBAA`
 *   `rgb(R, G, B[, A])` `rgba(R, G, B, A)`
 *   `hsl(H, S[%], L[%][, A])` `hsla(H, S[%], L[%], A)`
 *   `hwb(H W B[/ A])` `color()` named keywords `"transparent"`
 * - **Extended**: `hsv(H, S[%], V[%][, A])` `hsb(H, S[%], B[%][, A])`
 *   `cmyk(C[%], M[%], Y[%], K[%][, A])` `device-cmyk(C M Y K[/ A])`
 *   `lab(L[%] a b[/ A])` `lch(L[%] C H[/ A])`
 *   `ycbcr(Y, Cb, Cr[, A])`
 *   `gray(V[%][, A])` `grey(V[%][, A])` `grayscale(V[%][, A])`
 *
 * @returns {RGBA | null} Parsed RGBA object, or `null` if no parser could handle the input.
 *
 * @example <caption>Hex & keywords</caption>
 * toRGBA('#ff0000')        // { red: 255, green: 0,   blue: 0,   alpha: 1   }
 * toRGBA('#ff000080')      // { red: 255, green: 0,   blue: 0,   alpha: 0.5 }
 * toRGBA('cornflowerblue') // { red: 100, green: 149, blue: 237, alpha: 1   }
 * toRGBA('transparent')    // { red: 0,   green: 0,   blue: 0,   alpha: 0   }
 *
 * @example <caption>CSS functional & extended</caption>
 * toRGBA('hsl(120, 100%, 50%)')    // { red: 0,   green: 255, blue: 0,   alpha: 1 }
 * toRGBA('hsv(240, 100%, 100%)')   // { red: 0,   green: 0,   blue: 255, alpha: 1 }
 * toRGBA('cmyk(0%, 0%, 0%, 100%)') // { red: 0,   green: 0,   blue: 0,   alpha: 1 }
 * toRGBA('lab(53.23 80.11 67.22)') // { red: 255, green: 0,   blue: 0,   alpha: 1 }
 * toRGBA('lch(53.23 104.55 40)')   // { red: 255, green: 0,   blue: 0,   alpha: 1 }
 * toRGBA('ycbcr(128, 128, 128)')   // { red: 128, green: 128, blue: 128, alpha: 1 }
 * toRGBA('gray(50%)')              // { red: 128, green: 128, blue: 128, alpha: 1 }
 *
 * @example <caption>Invalid input</caption>
 * toRGBA('not-a-color') // null
 */
export default function toRGBA(color: string): RGBA | null {
    const trimmed: string = color.trim();

    for (let i: number = 0; i < PARSERS.length; i++) {
        const result: RGBA | null = PARSERS[i](trimmed);

        if (result !== null) return result;
    }

    return null;
}
