import {IS_IE_MOBILE, IS_WINDOWS_PHONE} from "../constants";
import type {ThemeInstance} from "../types";

let metaElement: HTMLMetaElement | null = null;

const Theme: ThemeInstance = {
    get value(): string | undefined {
        return getThemeColor();
    },
    set value(color: string | undefined) {
        if (typeof color === 'undefined') removeThemeColor();
        else setThemeColor(color);
    },
    Constants: {},
    Errors: {},
};

function getMetaName(): string {
    if (IS_IE_MOBILE) return 'msapplication-navbutton-color';
    if (IS_WINDOWS_PHONE) return 'msapplication-TileColor';
    return 'theme-color';
}

function getMeta(): HTMLMetaElement | null {
    if (metaElement !== null && metaElement.isConnected) return metaElement;

    return metaElement = globalThis.document.querySelector('meta[name="' + getMetaName() + '"]');
}

function createMeta(): HTMLMetaElement {
    const meta: HTMLMetaElement = globalThis.document.createElement('meta');

    meta.setAttribute('name', getMetaName());
    globalThis.document.head.prepend(meta);

    return metaElement = meta;
}

function setThemeColor(color: string): void {
    let meta: HTMLMetaElement | null = getMeta();

    if (meta === null) meta = createMeta();

    meta.setAttribute('content', color);
}

function getThemeColor(): string | undefined {
    const meta: HTMLMetaElement | null = getMeta();

    if (!meta) return undefined;

    const attribute: string | null = meta.getAttribute('content');

    if (typeof attribute == 'string') return attribute;
    return undefined;
}

function removeThemeColor(): void {
    const meta: HTMLMetaElement | null = getMeta();

    if (meta) {
        meta.remove();
        metaElement = null;
    }
}

export default Theme;
