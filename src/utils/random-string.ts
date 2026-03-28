export default function randomString(length: number) {
    const chars: string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result: string = '';
    let seed: number = new Date().getTime();

    for (let i: number = 0; i < length; i++) {
        seed = (seed * 9301 + 49297) % 233280;
        result += chars.charAt(seed % 62);
    }

    return result;
}
