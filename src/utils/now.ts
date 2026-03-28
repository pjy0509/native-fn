export default function now(): number {
    if (typeof Date.now === 'function') return Date.now();
    return (new Date).getTime();
}
