import React from "react";
import styled, {css, keyframes} from "styled-components";

interface Rect {
    x: number;
    width: number;
    y: number;
    height: number;
}

type OnSelectElement = (cssPath: string) => any;

type DevtoolsHighlighterButtonProps = {
    onSelectElement?: OnSelectElement;
};

type StyledButtonProps = {
    active: boolean;
};

type IconWrapProps = {
    active: boolean;
};

type DotProps = {
    active: boolean;
};

const pulseRing = keyframes`
    0% {
        box-shadow: 0 0 0 0 rgba(74, 144, 217, 0.45);
    }
    70% {
        box-shadow: 0 0 0 6px rgba(74, 144, 217, 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(74, 144, 217, 0);
    }
`;

const scanline = keyframes`
    0% {
        top: 0;
        opacity: 0.6;
    }
    100% {
        top: 100%;
        opacity: 0;
    }
`;

const blink = keyframes`
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.3;
    }
`;

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
`;

const StyledButton = styled.button<StyledButtonProps>`
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 9.375rem;
    flex-shrink: 0;
    align-self: center;
    padding: 0.4375rem 0;
    border-radius: 0.375rem;
    border: 1px solid ${({theme, active}: StyledButtonProps & { theme: any }): string => active ? theme.colors.borderActive : theme.colors.border};
    background: ${({theme, active}: StyledButtonProps & { theme: any }): string => active ? theme.colors.surfaceHover : theme.colors.surface};
    color: ${({theme}: { theme: any }): string => theme.colors.text};
    font-family: inherit;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    overflow: hidden;
    transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease;
    outline: none;
    user-select: none;

    ${({active, theme}: StyledButtonProps & { theme: any }) =>
            active
            && css`
                animation: ${pulseRing} 1.6s ease-out infinite;
                color: ${theme.colors.accent};
            `
    }
    &:hover {
        border-color: ${({theme}: { theme: any }): string => theme.colors.borderActive};
        background: ${({theme}: { theme: any }): string => theme.colors.surfaceHover};
    }

    &:focus-visible {
        outline: 2px solid ${({theme}: { theme: any }): string => theme.colors.accent};
        outline-offset: 2px;
    }
`;

const Scanline = styled.span`
    position: absolute;
    left: 0;
    width: 100%;
    height: 40%;
    background: linear-gradient(to bottom, transparent, ${({theme}: { theme: any }): string => theme.colors.scanColor}, transparent);
    pointer-events: none;
    animation: ${scanline} 1.4s linear infinite;
`;

const IconWrap = styled.span<IconWrapProps>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
    color: ${({theme, active}: IconWrapProps & { theme: any }): string => active ? theme.colors.accent : theme.colors.textMuted};
    transition: color 0.2s ease;

    svg {
        width: 100%;
        height: 100%;
    }

    ${({active}: IconWrapProps) =>
            active
            && css`
                animation: ${blink} 1.2s ease-in-out infinite;
            `
    }
`;

const Dot = styled.span<DotProps>`
    width: 0.375rem;
    height: 0.375rem;
    border-radius: 50%;
    background: ${({theme, active}: DotProps & { theme: any }): string => active ? theme.colors.accent : theme.colors.textMuted};
    flex-shrink: 0;
    transition: background 0.2s ease;

    ${({active, theme}: DotProps & { theme: any }) =>
            active
            && css`
                box-shadow: 0 0 0 3px ${theme.colors.accentGlow};
            `
    }
`;

const delegate = {
    isActive: (): boolean => false,
    onSelect: (cssPath: string): void => {
        void cssPath;
    },
    deactivate: (): void => {},
};

let highlighterInstalled: boolean = false;

function ensureInstalled(): void {
    if (highlighterInstalled) return;
    highlighterInstalled = true;

    installDevtoolsHighlighter(
        (): boolean => delegate.isActive(),
        (cssPath: string): void => delegate.onSelect(cssPath)
    );
}

function installDevtoolsHighlighter(isActive: () => boolean, onSelectElement: OnSelectElement): void {
    const style: HTMLStyleElement = document.createElement("style");
    const svgNS: string = "http://www.w3.org/2000/svg";
    const id: string = "devtool-overlay";
    const svg: SVGSVGElement = document.createElementNS(svgNS, "svg") as SVGSVGElement;

    style.textContent = "body { webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; }";
    svg.id = id;
    svg.style.cssText = "position: fixed; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none; z-index: 2147483647; opacity: 0;";

    const marginPath: SVGPathElement = document.createElementNS(svgNS, "path") as SVGPathElement;
    const borderPath: SVGPathElement = document.createElementNS(svgNS, "path") as SVGPathElement;
    const paddingPath: SVGPathElement = document.createElementNS(svgNS, "path") as SVGPathElement;
    const contentRect: SVGRectElement = document.createElementNS(svgNS, "rect") as SVGRectElement;

    marginPath.setAttribute("fill", "rgba(246, 178, 107, 0.66)");
    marginPath.setAttribute("fill-rule", "evenodd");
    borderPath.setAttribute("fill", "rgba(255, 229, 153, 0.66)");
    borderPath.setAttribute("fill-rule", "evenodd");
    paddingPath.setAttribute("fill", "rgba(147, 196, 125, 0.66)");
    paddingPath.setAttribute("fill-rule", "evenodd");
    contentRect.setAttribute("fill", "rgba(111, 168, 220, 0.66)");

    svg.appendChild(marginPath);
    svg.appendChild(borderPath);
    svg.appendChild(paddingPath);
    svg.appendChild(contentRect);

    document.documentElement.appendChild(svg);

    let armed: boolean = false;
    let activeElement: Element | null = null;
    let lastTouchId: number | null = null;

    function px(value: string): number {
        const parsed: number = Number.parseFloat(value);

        return Number.isFinite(parsed) ? parsed : 0;
    }

    function isOverlayOrDescendant(element: Element | null): boolean {
        return element !== null && (element.id === id || svg.contains(element));
    }

    function hide(): void {
        svg.style.opacity = "0";
        activeElement = null;
        if (document.head.contains(style)) document.head.removeChild(style);
    }

    function drawFor(element: Element): void {
        if (!element || element.nodeType !== 1 || isOverlayOrDescendant(element)) return;

        const computedStyle: CSSStyleDeclaration = window.getComputedStyle(element);
        const rect: DOMRect = element.getBoundingClientRect();
        const marginTop: number = px(computedStyle.marginTop);
        const marginRight: number = px(computedStyle.marginRight);
        const marginBottom: number = px(computedStyle.marginBottom);
        const marginLeft: number = px(computedStyle.marginLeft);
        const borderTop: number = px(computedStyle.borderTopWidth);
        const borderRight: number = px(computedStyle.borderRightWidth);
        const borderBottom: number = px(computedStyle.borderBottomWidth);
        const borderLeft: number = px(computedStyle.borderLeftWidth);
        const paddingTop: number = px(computedStyle.paddingTop);
        const paddingRight: number = px(computedStyle.paddingRight);
        const paddingBottom: number = px(computedStyle.paddingBottom);
        const paddingLeft: number = px(computedStyle.paddingLeft);
        const marginBox: Rect = {x: rect.left - marginLeft, y: rect.top - marginTop, width: rect.width + marginLeft + marginRight, height: rect.height + marginTop + marginBottom};
        const borderBox: Rect = {x: rect.left, y: rect.top, width: rect.width, height: rect.height};
        const paddingBox: Rect = {x: rect.left + borderLeft, y: rect.top + borderTop, width: Math.max(0, rect.width - borderLeft - borderRight), height: Math.max(0, rect.height - borderTop - borderBottom)};
        const contentBox: Rect = {
            x: rect.left + borderLeft + paddingLeft,
            y: rect.top + borderTop + paddingTop,
            width: Math.max(0, rect.width - borderLeft - borderRight - paddingLeft - paddingRight),
            height: Math.max(0, rect.height - borderTop - borderBottom - paddingTop - paddingBottom)
        };

        marginPath.setAttribute("d", "M" + marginBox.x + "," + marginBox.y + "h" + marginBox.width + "v" + marginBox.height + "h-" + marginBox.width + "z" + "M" + borderBox.x + "," + borderBox.y + "h" + borderBox.width + "v" + borderBox.height + "h-" + borderBox.width + "z");
        borderPath.setAttribute("d", "M" + borderBox.x + "," + borderBox.y + "h" + borderBox.width + "v" + borderBox.height + "h-" + borderBox.width + "z" + "M" + paddingBox.x + "," + paddingBox.y + "h" + paddingBox.width + "v" + paddingBox.height + "h-" + paddingBox.width + "z");
        paddingPath.setAttribute("d", "M" + paddingBox.x + "," + paddingBox.y + "h" + paddingBox.width + "v" + paddingBox.height + "h-" + paddingBox.width + "z" + "M" + contentBox.x + "," + contentBox.y + "h" + contentBox.width + "v" + contentBox.height + "h-" + contentBox.width + "z");
        contentRect.setAttribute("x", String(contentBox.x));
        contentRect.setAttribute("y", String(contentBox.y));
        contentRect.setAttribute("width", String(contentBox.width));
        contentRect.setAttribute("height", String(contentBox.height));

        svg.style.opacity = "1";
        activeElement = element;
    }

    function pickTargetFromEvent(event: MouseEvent): HTMLElement | null {
        const target: EventTarget | null = event.target;

        if (target !== null && target instanceof HTMLElement && target.nodeType === 1 && !isOverlayOrDescendant(target)) return target;

        return null;
    }

    document.addEventListener("mousemove", (event: MouseEvent): void => {
        if (!armed || !isActive()) return;

        const element: HTMLElement | null = pickTargetFromEvent(event);

        if (element) drawFor(element);
    }, true);

    document.addEventListener("mousedown", (event: MouseEvent): void => {
        if (!isActive()) return;

        if (!document.head.contains(style)) document.head.appendChild(style);
        armed = true;

        const element: HTMLElement | null = pickTargetFromEvent(event);

        if (element) drawFor(element);
    }, true);

    document.addEventListener("mouseup", (): void => {
        if (!armed) return;

        armed = false;

        if (activeElement !== null) onSelectElement(getCssPath(activeElement));

        hide();
    }, true);

    document.addEventListener("touchstart", (event: TouchEvent): void => {
        if (!isActive()) return;

        if (!document.head.contains(style)) document.head.appendChild(style);
        armed = true;

        const touch: Touch | undefined = event.changedTouches?.[0];

        if (!touch) return;

        lastTouchId = touch.identifier;

        const element: Element | null = document.elementFromPoint(touch.clientX, touch.clientY);

        if (element) drawFor(element);
    }, {capture: true, passive: true});

    document.addEventListener("touchmove", (event: TouchEvent): void => {
        if (!armed || !isActive()) return;

        const touches: Touch[] = Array.from(event.changedTouches || []);
        const touch: Touch | undefined = touches.find((x: Touch): boolean => x.identifier === lastTouchId) || touches[0];

        if (!touch) return;

        const element: Element | null = document.elementFromPoint(touch.clientX, touch.clientY);

        if (element) drawFor(element);
    }, {capture: true, passive: true});

    document.addEventListener("touchend", (): void => {
        if (!armed) return;

        armed = false;

        if (activeElement !== null) onSelectElement(getCssPath(activeElement));

        hide();

        lastTouchId = null;
    }, {capture: true, passive: true});

    document.addEventListener("touchcancel", (): void => {
        armed = false;

        hide();

        lastTouchId = null;
    }, {capture: true, passive: true});

    window.addEventListener("scroll", (): void => {
        if (armed && activeElement && isActive()) drawFor(activeElement);
    }, true);

    window.addEventListener("resize", (): void => {
        if (armed && activeElement && isActive()) drawFor(activeElement);
    }, true);

    delegate.deactivate = (): void => {
        armed = false;
        hide();
    };

    hide();
}

function getCssPath(element: Element | null): string {
    if (element === null || element.nodeType !== 1) return "";

    const parts: string[] = [];

    while (element !== null && element.nodeType === 1) {
        if (element.id !== "") {
            parts.unshift("#" + CSS.escape(element.id));
            break;
        }

        let selector: string = element.tagName.toLowerCase();
        const classList: DOMTokenList = element.classList;

        if (classList.length > 0) selector += "." + Array.from(classList).map(CSS.escape).join(".");

        const parent: HTMLElement | null = element.parentElement;

        if (parent !== null) {
            const siblings: Element[] = Array.from(parent.children).filter((s: Element): boolean => element !== null && s.tagName === element.tagName);

            if (siblings.length > 1) selector += ":nth-of-type(" + (siblings.indexOf(element) + 1) + ")";
        }

        parts.unshift(selector);
        element = element.parentElement;
    }

    return parts.join(" > ");
}

function CursorIcon(): React.JSX.Element {
    return (
        <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 2L13 7.5L8.5 9L7 13.5L3 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
        </svg>
    );
}

export default function InspectButton({onSelectElement}: DevtoolsHighlighterButtonProps): React.JSX.Element {
    const [active, setActive] = React.useState<boolean>(false);
    const activeRef = React.useRef<boolean>(false);
    const onSelectElementRef = React.useRef<OnSelectElement | undefined>(onSelectElement);

    React.useEffect((): void => {
        onSelectElementRef.current = onSelectElement;
    }, [onSelectElement]);

    React.useEffect(ensureInstalled, []);

    React.useEffect((): (() => void) => {
        return (): void => {
            if (activeRef.current) {
                activeRef.current = false;
                delegate.isActive = (): boolean => false;
                delegate.onSelect = (): void => {
                };
                delegate.deactivate();
            }
        };
    }, []);

    function toggle(): void {
        const next: boolean = !activeRef.current;

        activeRef.current = next;

        if (next) {
            delegate.isActive = (): boolean => activeRef.current;
            delegate.onSelect = (cssPath: string): void => {
                onSelectElementRef.current?.(cssPath);
                activeRef.current = false;
                setActive(false);
            };
        } else {
            delegate.isActive = (): boolean => false;
            delegate.onSelect = (): void => {
            };
            delegate.deactivate();
        }

        setActive(next);
    }

    return (
        <Wrapper>
            <StyledButton
                onClick={toggle}
                type="button"
                active={active}
            >
                {
                    active
                    && <Scanline/>
                }

                <IconWrap active={active}>
                    <CursorIcon/>
                </IconWrap>

                <span>{active ? "Inspecting…" : "Inspect"}</span>

                <Dot active={active}/>
            </StyledButton>
        </Wrapper>
    );
}
