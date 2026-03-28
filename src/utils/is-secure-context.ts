export default function isSecureContext(): boolean {
    if (typeof globalThis.isSecureContext !== 'undefined') return globalThis.isSecureContext;

    const protocol: string = location.protocol;
    const hostname: string = location.hostname;

    return protocol === 'https:' ||
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '[::1]';
}
