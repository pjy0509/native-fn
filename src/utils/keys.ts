export default function keys(object: object): string[] {
    const keys: string[] = [];

    for (const key in object) if (object.hasOwnProperty(key)) keys.push(key);

    return keys;
}
