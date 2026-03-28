export default function setStyle(element: HTMLElement, styles: { [K in keyof CSSStyleDeclaration]?: string }): void {
    const elementStyle: CSSStyleDeclaration = element.style;

    for (const key in styles) {
        const style: string | undefined = styles[key];

        if (typeof style !== 'undefined') elementStyle[key] = style;
    }
}
