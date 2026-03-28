import setStyle from "./set-style";

interface HTMLPresentationAttributes {
    width?: string;
    height?: string;
    border?: string;
    frameBorder?: string;
    scrolling?: string;
    cellPadding?: string;
    cellSpacing?: string;
    frame?: string;
    rules?: string;
    noWrap?: boolean;
}

export default function createHiddenElement<K extends keyof HTMLElementTagNameMap>(tagName: K, focusable: boolean = true): HTMLElementTagNameMap[K] {
    const element: HTMLElementTagNameMap[K] & HTMLPresentationAttributes = globalThis.document.createElement(tagName) as HTMLElementTagNameMap[K] & HTMLPresentationAttributes;

    if (typeof element.width !== 'undefined') element.width = '0';
    if (typeof element.height !== 'undefined') element.height = '0';
    if (typeof element.border !== 'undefined') element.border = '0';
    if (typeof element.frameBorder !== 'undefined') element.frameBorder = '0';
    if (typeof element.scrolling !== 'undefined') element.scrolling = 'no';
    if (typeof element.cellPadding !== 'undefined') element.cellPadding = '0';
    if (typeof element.cellSpacing !== 'undefined') element.cellSpacing = '0';
    if (typeof element.frame !== 'undefined') element.frame = 'void';
    if (typeof element.rules !== 'undefined') element.rules = 'none';
    if (typeof element.noWrap !== 'undefined') element.noWrap = true;

    element.tabIndex = -1;
    element.setAttribute('role', 'presentation');

    if (focusable) {
        setStyle(element, {
            width: '1px',
            height: '1px',
        });
    } else {
        element.setAttribute('aria-hidden', 'true');

        setStyle(element, {
            width: '0',
            height: '0',
            zIndex: '-9999',
            display: 'none',
            visibility: 'hidden',
            pointerEvents: 'none',
        });
    }

    setStyle(element, {
        position: 'absolute',
        top: '0',
        left: '0',
        padding: '0',
        margin: '0',
        border: 'none',
        outline: 'hidden',
        clip: 'rect(1px, 1px, 1px, 1px)',
        clipPath: 'inset(50%)',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
    });

    return element;
}
