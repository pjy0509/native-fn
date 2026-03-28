export default function defer(task: () => void): void {
    if (typeof globalThis.queueMicrotask !== 'undefined') {
        globalThis.queueMicrotask(task);
        return;
    }

    if (typeof globalThis.Promise === 'function') {
        Promise.resolve().then(task);
        return;
    }

    globalThis.setTimeout(task, 0);
}
