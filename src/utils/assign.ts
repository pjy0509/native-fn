export default function assign(...args: any[]) {
    const to: any = Object(args[0]);

    for (let i: number = 1; i < args.length; i++) {
        const src: any = args[i];

        if (src == null) continue;

        for (const key in src) {
            if (!Object.prototype.hasOwnProperty.call(src, key) || key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
            to[key] = src[key];
        }
    }
    return to;
};
