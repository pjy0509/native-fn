export default function createHiddenElement<K extends keyof HTMLElementTagNameMap>(tagName: K, focusable?: boolean): HTMLElementTagNameMap[K];
