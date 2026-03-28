import {ClipboardInstance} from "../types";
import isSecureContext from "../../../utils/is-secure-context";
import createHiddenElement from "../../../utils/create-hidden-element";
import EventListener from "../../../utils/event-listener";

interface LegacyClipboardData {
    setData(format: string, data: string): boolean;

    getData(format: string): string;
}

type WindowWithClipboardData = typeof globalThis & { clipboardData?: LegacyClipboardData };

const Clipboard: ClipboardInstance = {
    copy: copy,
    paste: paste,
    Constants: {},
    Errors: {},
};

function isObject(item: unknown): item is Record<any, any> {
    return item !== null && typeof item === 'object';
}

function isArray(item: unknown): item is any[] {
    return Array.isArray(item);
}

function isSerializable(item: unknown): item is Record<any, any> | any[] {
    return isObject(item) || isArray(item);
}

function isElement(item: any): item is Element {
    if (item == null || (typeof item !== "object" && typeof item !== "function")) return false;
    if (item.nodeType !== 1) return false;
    if (typeof item.nodeName !== "string") return false;
    return typeof item.getAttribute === "function";
}

function isSelection(item: unknown): item is Selection {
    return Object.prototype.toString.call(item) === '[object Selection]';
}

function convertToString(item: unknown): string {
    if (isElement(item)) {
        const textContent: string | null = item.textContent;

        if (textContent !== null) return textContent;
        return '';
    }

    if (isSelection(item)) return item.toString();

    if (isSerializable(item)) {
        try {
            return JSON.stringify(item);
        } catch (_: unknown) {
            return '' + item;
        }
    } else if (typeof item !== 'string') {
        return '' + item;
    }

    return item;
}

function convertToHTML(item: unknown): string | undefined {
    let html: string | null = null;

    if (isElement(item)) html = item.outerHTML;

    if (isSelection(item) && item.rangeCount > 0) {
        const div: HTMLDivElement = globalThis.document.createElement('div');

        for (let i: number = 0; i < item.rangeCount; i++) div.appendChild(item.getRangeAt(i).cloneContents());

        html = div.innerHTML;
    }

    if (html === null) return;

    return html;
}

function supportsClipboardAPI(): boolean {
    return (isSecureContext() && typeof globalThis.navigator.clipboard !== 'undefined');
}

function supportsClipboardWriteAPI(): boolean {
    return supportsClipboardAPI() && (typeof globalThis.navigator.clipboard.write !== 'undefined' || typeof globalThis.navigator.clipboard.writeText !== 'undefined');
}

function supportsClipboardReadAPI(): boolean {
    return supportsClipboardAPI() && (typeof globalThis.navigator.clipboard.read !== 'undefined' || typeof globalThis.navigator.clipboard.readText !== 'undefined');
}

function copy(this: ClipboardInstance, item: unknown): Promise<boolean> {
    const text: string = convertToString(item);
    const html: string | undefined = convertToHTML(item);

    if (supportsClipboardWriteAPI()) {
        return copyViaClipboardAPI(text, html)
            .then(function (success: boolean): boolean {
                if (success) return true;
                return copyViaLegacy(text, html);
            })
            .catch(function (): boolean {
                return copyViaLegacy(text, html);
            });
    }

    return Promise.resolve(copyViaLegacy(text, html));
}

function copyViaClipboardAPI(text: string, html?: string): Promise<boolean> {
    try {
        if (typeof globalThis.ClipboardItem !== 'undefined' && typeof globalThis.navigator.clipboard.write !== 'undefined') {
            const items: Record<string, Blob> = {};

            if (typeof html !== 'undefined') items['text/html'] = new Blob([html], {type: 'text/html'});
            items['text/plain'] = new Blob([text], {type: 'text/plain'});

            return globalThis.navigator.clipboard.write([new ClipboardItem(items)])
                .then(function (): boolean {
                    return true;
                })
                .catch(function (): boolean {
                    return false;
                });
        } else if (typeof globalThis.navigator.clipboard.writeText !== 'undefined') {
            return globalThis.navigator.clipboard.writeText(text)
                .then(function (): boolean {
                    return true;
                })
                .catch(function (): boolean {
                    return false;
                });
        }
    } catch (_: unknown) {
        return Promise.resolve(false);
    }

    return Promise.resolve(false);
}

function copyViaSelection(text: string, html?: string): boolean {
    if (typeof globalThis.getSelection === 'undefined' || typeof globalThis.document.createRange === 'undefined') return false;

    const div: HTMLDivElement = createHiddenElement('div');

    div.contentEditable = 'true';
    if (typeof html !== 'undefined') div.innerHTML = html;
    else div.textContent = text;
    div.style.whiteSpace = 'pre';
    div.style.userSelect = 'text';
    div.style.setProperty('-webkit-user-select', 'text');
    div.style.setProperty('-moz-user-select', 'text');
    div.style.setProperty('-ms-user-select', 'text');

    globalThis.document.body.appendChild(div);

    const selection: Selection | null = globalThis.getSelection();
    const range: Range = globalThis.document.createRange();

    const onCopy: (this: Document, event: ClipboardEvent) => void = function (event: ClipboardEvent): void {
        try {
            if (event.clipboardData !== null && typeof event.clipboardData.setData === 'function') {
                event.preventDefault();

                if (typeof html !== 'undefined') event.clipboardData.setData('text/html', html);
                event.clipboardData.setData('text/plain', text);
            }
        } catch (_: unknown) {
        }
    };

    EventListener.add(globalThis.document, {type: 'copy', callback: onCopy, options: {once: true, capture: true}});

    try {
        if (selection === null) {
            cleanupSelection(div, selection, onCopy);
            return false;
        }

        selection.removeAllRanges();
        range.selectNodeContents(div);
        selection.addRange(range);

        const success: boolean = globalThis.document.execCommand('copy');

        cleanupSelection(div, selection, onCopy);
        return success;
    } catch (_: unknown) {
        cleanupSelection(div, selection, onCopy);
        return false;
    }
}

function copyViaClipboardData(text: string, html?: string): boolean {
    const windowWithClipboardData: WindowWithClipboardData = globalThis;
    const clipboardData: LegacyClipboardData | undefined = windowWithClipboardData.clipboardData;

    if (typeof clipboardData !== 'undefined' && typeof clipboardData.setData === 'function') {
        try {
            if (typeof html !== 'undefined') clipboardData.setData('HTML', html);
            return clipboardData.setData('Text', text);
        } catch (_: unknown) {
            return false;
        }
    }

    return false;
}

function copyViaLegacy(text: string, html?: string): boolean {
    return copyViaSelection(text, html) || copyViaClipboardData(text, html);
}

function paste(this: ClipboardInstance): Promise<string> {
    if (supportsClipboardReadAPI()) {
        return pasteViaClipboardAPI()
            .then(function (text: string | null): string {
                if (text !== null) return text;
                return pasteViaLegacy();
            })
            .catch(function (): string {
                return pasteViaLegacy();
            });
    }

    return Promise.resolve(pasteViaLegacy());
}

function pasteViaClipboardAPI(): Promise<string | null> {
    try {
        if (typeof globalThis.ClipboardItem !== 'undefined' && typeof globalThis.navigator.clipboard.read !== 'undefined') {
            return globalThis.navigator.clipboard.read()
                .then(function (items: readonly ClipboardItem[]): Promise<string | null> {
                    if (items.length === 0) return Promise.resolve(null);

                    for (let i: number = 0; i < items.length; i++) {
                        const item: ClipboardItem = items[i];
                        const types: readonly string[] = item.types;

                        for (let j: number = 0; j < types.length; j++) {
                            if (types[j] === 'text/html') {
                                return item.getType('text/html')
                                    .then(function (blob: Blob): Promise<string> {
                                        return blob.text();
                                    })
                                    .catch(function (): null {
                                        return null;
                                    });
                            }
                        }
                    }

                    for (let i: number = 0; i < items.length; i++) {
                        const item: ClipboardItem = items[i];
                        const types: readonly string[] = item.types;

                        for (let j: number = 0; j < types.length; j++) {
                            if (types[j] === 'text/plain') {
                                return item.getType('text/plain')
                                    .then(function (blob: Blob): Promise<string> {
                                        return blob.text();
                                    })
                                    .catch(function (): null {
                                        return null;
                                    });
                            }
                        }
                    }

                    return Promise.resolve(null);
                })
                .catch(function (): null {
                    return null;
                });
        } else if (typeof globalThis.navigator.clipboard.readText !== 'undefined') {
            return globalThis.navigator.clipboard.readText()
                .then(function (text: string): string | null {
                    return text;
                })
                .catch(function (): null {
                    return null;
                });
        }
    } catch (_: unknown) {
        return Promise.resolve(null);
    }

    return Promise.resolve(null);
}

function pasteViaSelection(): string | null {
    const div: HTMLDivElement = createHiddenElement('div');

    div.contentEditable = 'true';

    globalThis.document.body.appendChild(div);
    div.focus();

    let pastedText: string | null = null;

    const onPaste: (this: Document, event: ClipboardEvent) => void = function (event: ClipboardEvent): void {
        try {
            if (event.clipboardData !== null && typeof event.clipboardData.getData === 'function') {
                event.preventDefault();

                const html: string = event.clipboardData.getData('text/html');
                const plain: string = event.clipboardData.getData('text/plain');

                if (html !== '') pastedText = html;
                if (plain !== '') pastedText = plain;
            }
        } catch (_: unknown) {
        }
    };

    EventListener.add(globalThis.document, {type: 'paste', callback: onPaste, options: {once: true, capture: true}});

    try {
        const success: boolean = globalThis.document.execCommand('paste');

        if (!success && pastedText === null) {
            const innerHTML: string = div.innerHTML;

            if (innerHTML !== '') {
                pastedText = innerHTML;
            } else {
                const textContent: string | null = div.textContent;

                if (textContent !== null && textContent !== '') pastedText = textContent;
            }
        }

        cleanupPaste(div, onPaste);
        return pastedText;
    } catch (_: unknown) {
        cleanupPaste(div, onPaste);
        return null;
    }
}

function pasteViaClipboardData(): string | null {
    const windowWithClipboardData: WindowWithClipboardData = globalThis;
    const clipboardData: LegacyClipboardData | undefined = windowWithClipboardData.clipboardData;

    if (typeof clipboardData !== 'undefined' && typeof clipboardData.getData === 'function') {
        try {
            const text: string = clipboardData.getData('Text');

            if (text !== '') return text;
            return null;
        } catch (_: unknown) {
            return null;
        }
    }

    return null;
}

function pasteViaLegacy(): string {
    const fromSelection: string | null = pasteViaSelection();

    if (fromSelection !== null) return fromSelection;

    const fromClipboardData: string | null = pasteViaClipboardData();

    if (fromClipboardData !== null) return fromClipboardData;

    return '';
}

function cleanupSelection(span: HTMLElement, selection: Selection | null, onCopy: (this: Document, event: ClipboardEvent) => void): void {
    if (selection !== null) selection.removeAllRanges();

    globalThis.document.body.removeChild(span);
    EventListener.remove(globalThis.document, {type: 'copy', callback: onCopy});
}

function cleanupPaste(div: HTMLElement, onPaste: (this: Document, event: ClipboardEvent) => void): void {
    globalThis.document.body.removeChild(div);
    EventListener.remove(globalThis.document, {type: 'paste', callback: onPaste});
}

export default Clipboard;
