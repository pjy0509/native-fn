export default function padStart(string: any, length: number, pad: string) {
    length = length >> 0;

    if (typeof string !== 'string') string = String(string);

    if (string.length >= length) return string;

    length = length - string.length;

    if (length > pad.length) pad += pad.repeat(length / pad.length);

    return pad.slice(0, length) + string;
}
