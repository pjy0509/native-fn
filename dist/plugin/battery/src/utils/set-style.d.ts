export default function setStyle(element: HTMLElement, styles: {
    [K in keyof CSSStyleDeclaration]?: string;
}): void;
