import React from "react";
import ReactDOM from "react-dom";
import styled, {keyframes} from "styled-components";
import Field from "./Field";
import FieldLabel from "./FieldLabel";
import ErrorMessage from "./ErrorMessage";
import HintMessage from "./HintMessage";
import {createId} from "../../utils/createId";
import toRGBA, {RGB, RGBA} from "../../utils/toRGBA";

export interface ColorPickerProps {
    label?: string;
    hint?: string;
    error?: string;
    value?: string;
    id?: string;
    disabled?: boolean;
    onChange?: (hex: string) => void;
    showAlpha?: boolean;
}

interface ColorPickerState {
    hsv: HSV;
    alpha: number;
    hex6: string;
}

interface SaturationValue {
    s: number;
    v: number;
}

interface HSV {
    h: number;
    s: number;
    v: number;
}

function hexToRgb(hex: string): RGB {
    const c = hex.replace("#", "");
    const full = c.length === 3 ? c.split("").map((x) => x + x).join("") : c;
    const n = parseInt(full, 16);
    return {red: (n >> 16) & 255, green: (n >> 8) & 255, blue: n & 255};
}

function rgbToHex(red: number, green: number, blue: number): string {
    return "#" + [red, green, blue]
        .map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0"))
        .join("");
}

function rgbToHsv(red: number, green: number, blue: number): HSV {
    const R = red / 255, G = green / 255, B = blue / 255;
    const max = Math.max(R, G, B), min = Math.min(R, G, B), d = max - min;
    let h = 0;
    if (d !== 0) {
        if (max === R) h = ((G - B) / d + 6) % 6;
        else if (max === G) h = (B - R) / d + 2;
        else h = (R - G) / d + 4;
        h = (h / 6) * 360;
    }
    return {h, s: max === 0 ? 0 : d / max, v: max};
}

function hsvToRgb(h: number, s: number, v: number): RGB {
    const c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c;
    let r = 0, g = 0, b = 0;
    if (h < 60) {
        r = c;
        g = x;
    } else if (h < 120) {
        r = x;
        g = c;
    } else if (h < 180) {
        g = c;
        b = x;
    } else if (h < 240) {
        g = x;
        b = c;
    } else if (h < 300) {
        r = x;
        b = c;
    } else {
        r = c;
        b = x;
    }

    return {red: (r + m) * 255, green: (g + m) * 255, blue: (b + m) * 255};
}

function clamp01(v: number): number {
    return Math.max(0, Math.min(1, v));
}

function hsvToHex(hsv: HSV): string {
    const {red, green, blue} = hsvToRgb(hsv.h, hsv.s, hsv.v);
    return rgbToHex(red, green, blue);
}

const CHECKER_IMAGE = `repeating-conic-gradient(#b0b0b0 0% 25%, #ffffff 0% 50%)`;
const CHECKER = `${CHECKER_IMAGE} 0 0 / 8px 8px`;

function buildSwatchBackground(displayColor: string): string {
    return `linear-gradient(${displayColor}, ${displayColor}), ${CHECKER}`;
}

function buildDisplayColor(hex6: string, alpha: number): string {
    if (alpha >= 1) return hex6;

    const {red, green, blue} = hexToRgb(hex6);

    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function buildOutputHex(hex6: string, alpha: number, showAlpha: boolean): string {
    if (!showAlpha || alpha >= 1) return hex6;
    return hex6 + Math.round(alpha * 255).toString(16).padStart(2, "0");
}

function parseAnyColor(raw: string): ColorPickerState | null {
    const rgba: RGBA | null = toRGBA(raw);

    if (!rgba) return null;

    return {
        hsv: rgbToHsv(rgba.red, rgba.green, rgba.blue),
        hex6: rgbToHex(rgba.red, rgba.green, rgba.blue),
        alpha: rgba.alpha,
    };
}

const popDown = keyframes`
    from {
        opacity: 0;
        transform: translateY(5px) scale(0.97);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
`;

const popUp = keyframes`
    from {
        opacity: 0;
        transform: translateY(-5px) scale(0.97);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
`;

const TriggerRow = styled.div.withConfig({shouldForwardProp: (prop: string) => !["hasError", "isDisabled"].includes(prop),})<{ hasError: boolean; isDisabled: boolean }>`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.375rem 0.5rem;
    background: ${({theme}) => theme.colors.pathBg};
    border: 1.5px solid ${({hasError, theme}) => hasError ? "#f85149" : theme.colors.border};
    border-radius: 0.5rem;
    cursor: ${({isDisabled}) => isDisabled ? "not-allowed" : "pointer"};
    opacity: ${({isDisabled}) => isDisabled ? 0.4 : 1};
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    user-select: none;

    &:hover {
        border-color: ${({hasError, isDisabled, theme}) => isDisabled ? undefined : hasError ? "#f85149" : theme.colors.textMuted};
    }
`;

const SwatchBadge = styled.span`
    width: 1.25rem;
    height: 1.25rem;
    flex-shrink: 0;
    border-radius: 0.3125rem;
    border: 1px solid rgba(0, 0, 0, 0.18);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
`;

const HexLabel = styled.span`
    flex: 1;
    font-size: 0.8125rem;
    font-weight: 500;
    color: ${({theme}) => theme.colors.textStrong};
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.3px;
`;

const Caret = styled.span<{ open: boolean }>`
    display: flex;
    align-items: center;
    color: ${({theme}) => theme.colors.textMuted};
    transform: rotate(${({open}) => open ? "180deg" : "0"});
    transition: transform 0.18s ease;
`;

const PortalPanel = styled.div.withConfig({shouldForwardProp: (prop: string) => prop !== "upward"})<{ upward: boolean }>`
    position: fixed;
    top: 0;
    left: 0;
    width: 224px;
    z-index: 9999;
    background: ${({theme}) => theme.colors.surface};
    border: 1.5px solid ${({theme}) => theme.colors.border};
    border-radius: 0.75rem;
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.28), 0 2px 8px rgba(0, 0, 0, 0.14);
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    animation: ${({upward}) => upward ? popUp : popDown} 0.18s ease forwards;
`;

const CanvasWrap = styled.div`
    position: relative;
    width: 100%;
    aspect-ratio: 3 / 2;
    border-radius: 0.4375rem;
    overflow: hidden;
    cursor: crosshair;
    user-select: none;
    touch-action: none;
    flex-shrink: 0;
`;

const CanvasLayer = styled.div`
    position: absolute;
    inset: 0;
    pointer-events: none;
`;

const CanvasThumb = styled.div.withConfig({shouldForwardProp: (prop: string) => !["x", "y"].includes(prop)})<{ x: number; y: number }>`
    position: absolute;
    width: 13px;
    height: 13px;
    border-radius: 50%;
    border: 2px solid #fff;
    box-shadow: 0 0 0 1.5px rgba(0, 0, 0, 0.4), 0 2px 5px rgba(0, 0, 0, 0.3);
    left: ${({x}) => x}%;
    top: ${({y}) => y}%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    will-change: left, top;
    transition: left 0.05s linear, top 0.05s linear;
`;

const SlidersBlock = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const SliderSwatch = styled.span`
    width: 1.375rem;
    height: 1.375rem;
    flex-shrink: 0;
    border-radius: 0.3125rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
    align-self: center;
`;

const TracksCol = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 0;
`;

const TrackBase = styled.div`
    width: 100%;
    height: 10px;
    flex-shrink: 0;
    border-radius: 9999px;
    position: relative;
    overflow: visible;
    cursor: pointer;
`;

const HueTrack = styled(TrackBase)`
    background: linear-gradient(to right,
    #f00 0%, #ff0 16.67%, #0f0 33.33%,
    #0ff 50%, #00f 66.67%, #f0f 83.33%, #f00 100%);
`;

const AlphaTrack = styled(TrackBase).withConfig({shouldForwardProp: (prop: string) => prop !== "hue"})<{ hue: number }>`
    background: linear-gradient(to right, transparent, hsl(${({hue}) => hue}, 100%, 50%)),
    ${CHECKER};
`;

const RangeInput = styled.input.withConfig({shouldForwardProp: (prop: string) => prop !== "thumbColor"})<{ thumbColor: string }>`
    -webkit-appearance: none;
    appearance: none;
    position: absolute;
    inset: -5px 0;
    width: 100%;
    height: calc(100% + 10px);
    background: transparent;
    outline: none;
    cursor: pointer;
    margin: 0;

    &::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: ${({thumbColor}) => thumbColor};
        border: 2.5px solid #fff;
        box-shadow: 0 0 0 1.5px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.25);
        cursor: pointer;
    }

    &::-moz-range-thumb {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: ${({thumbColor}) => thumbColor};
        box-shadow: 0 0 0 1.5px rgba(0, 0, 0, 0.3);
        cursor: pointer;
        border: none;
    }
`;

const InputRow = styled.div`
    display: flex;
    gap: 0.375rem;
    align-items: center;
`;

const HexInputField = styled.input.withConfig({shouldForwardProp: (prop: string) => prop !== "invalid"})<{ invalid: boolean }>`
    flex: 1;
    min-width: 0;
    padding: 0.375rem 0.5rem;
    background: ${({theme}) => theme.colors.pathBg};
    border: 1.5px solid ${({invalid, theme}) => invalid ? "#f85149" : theme.colors.border};
    border-radius: 0.375rem;
    color: ${({theme}) => theme.colors.textStrong};
    font-family: "JetBrains Mono", "Fira Code", monospace;
    font-size: 0.75rem;
    outline: none;
    transition: border-color 0.18s ease, box-shadow 0.18s ease;
    letter-spacing: 0.5px;

    &:focus {
        border-color: ${({invalid, theme}) => invalid ? "#f85149" : theme.colors.borderActive};
        box-shadow: 0 0 0 3px ${({invalid, theme}) => invalid ? "rgba(248,81,73,0.15)" : theme.colors.accentGlow};
    }
`;

const IconBtn = styled.button.withConfig({shouldForwardProp: (prop: string) => prop !== "active"})<{ active?: boolean }>`
    width: 1.875rem;
    height: 1.875rem;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: ${({active, theme}) => active ? theme.colors.accentGlow : theme.colors.pathBg};
    border: 1.5px solid ${({active, theme}) => active ? theme.colors.borderActive : theme.colors.border};
    border-radius: 0.375rem;
    color: ${({active, theme}) => active ? theme.colors.accent : theme.colors.textMuted};
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
        background: ${({theme}) => theme.colors.surfaceHover};
        border-color: ${({theme}) => theme.colors.borderActive};
        color: ${({theme}) => theme.colors.accent};
    }

    svg {
        display: block;
    }
`;

const SwatchGrid = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.3125rem;
`;

const RecentSwatch = styled.button.withConfig({shouldForwardProp: (prop: string) => prop !== "active"})<{ active: boolean }>`
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 0.25rem;
    border: 1.5px solid ${({active, theme}) => active ? theme.colors.borderActive : "rgba(0,0,0,0.15)"};
    cursor: pointer;
    flex-shrink: 0;
    outline: none;
    transition: transform 0.12s ease, border-color 0.12s ease;

    &:hover {
        transform: scale(1.18);
    }
`;

const SectionLabel = styled.span`
    font-size: 0.5625rem;
    font-weight: 700;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    color: ${({theme}) => theme.colors.textMuted};
    user-select: none;
`;

const Divider = styled.hr`
    border: none;
    border-top: 1px solid ${({theme}) => theme.colors.border};
    margin: 0;
`;

function EyedropperIcon(): React.JSX.Element {
    return <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <path d="M9 1.5l2.5 2.5-6.5 6.5L2 12l1.5-3L9 1.5z"
              stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="none"/>
        <path d="M7.5 3l2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>;
}

function ChevronIcon(): React.JSX.Element {
    return <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round"/>
    </svg>;
}

declare global {
    interface Window {
        EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> };
    }
}

const isEyedropperSupported = typeof window !== "undefined" && "EyeDropper" in window;
const PANEL_W = 224;
const PANEL_H = 380;
const GAP = 6;
const MARGIN = 8;

interface PanelPos {
    top: number;
    left: number;
    upward: boolean;
}

function calcPanelPos(trigger: HTMLElement, panelHeight: number = PANEL_H): PanelPos {
    const rect: DOMRect = trigger.getBoundingClientRect();
    const upward: boolean = window.innerHeight - rect.bottom < panelHeight && rect.top > panelHeight;

    return {
        top: upward ? rect.top - panelHeight - GAP : rect.bottom + GAP,
        left: Math.min(rect.left, window.innerWidth - PANEL_W - MARGIN),
        upward
    };
}

const STORAGE_KEY = "recent-colors";
const MAX_RECENT = 8;

function loadRecentColors(): string[] {
    if (typeof window === "undefined") return [];

    try {
        const raw: string | null = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];

        const parsed: any = JSON.parse(raw);

        return Array.isArray(parsed)
            ? parsed.filter((value): value is string => typeof value === "string")
            : [];
    } catch {
        return [];
    }
}

function saveRecentColors(colors: string[]): void {
    if (typeof globalThis === "undefined") return;

    try {
        globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(colors));
    } catch {
    }
}

function mergeRecentColor(colors: string[], color: string): string[] {
    const normalized: string = color.trim().toLowerCase();

    return [normalized, ...colors.filter((color: string) => color.trim().toLowerCase() !== normalized)].slice(0, MAX_RECENT);
}

export default function ColorPicker({label, hint, error, value = "#ffffff", id = createId("cp"), disabled = false, onChange, showAlpha = false}: ColorPickerProps): React.JSX.Element {
    const initState: () => ColorPickerState = (): ColorPickerState => {
        const parsed: ColorPickerState | null = parseAnyColor(value);

        if (parsed !== null) return parsed;

        return {
            hsv: {h: 217, s: 0.91, v: 0.965},
            alpha: 1,
            hex6: "#3b82f6"
        };
    };

    const init: ColorPickerState = initState();
    const [hsv, setHsv]: [HSV, React.Dispatch<React.SetStateAction<HSV>>] = React.useState<HSV>(init.hsv);
    const [alpha, setAlpha]: [number, React.Dispatch<React.SetStateAction<number>>] = React.useState<number>(showAlpha ? init.alpha : 1);
    const [hexInput, setHexInput]: [string, React.Dispatch<React.SetStateAction<string>>] = React.useState<string>(buildOutputHex(init.hex6, init.alpha, showAlpha));
    const [hexInvalid, setHexInvalid]: [boolean, React.Dispatch<React.SetStateAction<boolean>>] = React.useState<boolean>(false);
    const [open, setOpen]: [boolean, React.Dispatch<React.SetStateAction<boolean>>] = React.useState<boolean>(false);
    const [panelPos, setPanelPos]: [PanelPos, React.Dispatch<React.SetStateAction<PanelPos>>] = React.useState<PanelPos>({top: 0, left: 0, upward: false});
    const [eyedrop, setEyedrop]: [boolean, React.Dispatch<React.SetStateAction<boolean>>] = React.useState<boolean>(false);
    const [recentColors, setRecentColors] = React.useState<string[]>(loadRecentColors());

    const hsvRef: React.RefObject<HSV> = React.useRef<HSV>(hsv);
    const alphaRef: React.RefObject<number> = React.useRef<number>(alpha);
    const triggerRef: React.RefObject<HTMLDivElement | null> = React.useRef<HTMLDivElement>(null);
    const panelRef: React.RefObject<HTMLDivElement | null> = React.useRef<HTMLDivElement>(null);
    const canvasRef: React.RefObject<HTMLDivElement | null> = React.useRef<HTMLDivElement>(null);
    const wasOpenRef: React.RefObject<boolean> = React.useRef<boolean>(false);

    React.useEffect(() => {
        if (wasOpenRef.current && !open) {
            const hex6: string = hsvToHex(hsvRef.current);

            pushRecentColor(buildOutputHex(hex6, showAlpha ? alphaRef.current : 1, showAlpha));
        }

        wasOpenRef.current = open;
    }, [open]);

    React.useEffect(() => {
        hsvRef.current = hsv;
    }, [hsv]);

    React.useEffect(() => {
        alphaRef.current = alpha;
    }, [alpha]);

    React.useEffect(() => {
        const parsed: ColorPickerState | null = parseAnyColor(value);

        if (!parsed) return;

        setHsv(parsed.hsv);
        hsvRef.current = parsed.hsv;

        const newAlpha: number = showAlpha ? parsed.alpha : 1;

        setAlpha(newAlpha);
        alphaRef.current = newAlpha;
        setHexInput(buildOutputHex(parsed.hex6, newAlpha, showAlpha));
        setHexInvalid(false);
    }, [value, showAlpha]);

    React.useEffect(() => {
        if (!open) return;

        function onDown(e: MouseEvent): void {
            const target = e.target as Node;

            if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;

            setOpen(false);
        }

        document.addEventListener("mousedown", onDown);

        return () => document.removeEventListener("mousedown", onDown);
    }, [open]);

    React.useEffect(() => {
        if (!open) return;

        let rafId: number;

        function loop(): void {
            const trigger: HTMLDivElement | null = triggerRef.current;
            const panel: HTMLDivElement | null = panelRef.current;

            if (trigger && panel) {
                const rect: DOMRect = trigger.getBoundingClientRect();

                if (rect.bottom < 0 || rect.top > window.innerHeight || rect.right < 0 || rect.left > window.innerWidth) {
                    setOpen(false);
                    return;
                }

                const actualHeight: number = panel.offsetHeight || PANEL_H;
                const pos: PanelPos = calcPanelPos(trigger, actualHeight);

                panel.style.top = `${pos.top}px`;
                panel.style.left = `${pos.left}px`;
            }

            rafId = requestAnimationFrame(loop);
        }

        rafId = requestAnimationFrame(loop);

        return () => cancelAnimationFrame(rafId);
    }, [open]);

    function commit(nextHsv: HSV, nextAlpha: number): void {
        const hex6: string = hsvToHex(nextHsv);

        setHsv(nextHsv);
        hsvRef.current = nextHsv;
        setAlpha(nextAlpha);
        alphaRef.current = nextAlpha;

        const out: string = buildOutputHex(hex6, nextAlpha, showAlpha);

        setHexInput(out);
        setHexInvalid(false);

        onChange?.(out);
    }

    function pushRecentColor(color: string): void {
        setRecentColors((prev: string[]) => {
            const next: string[] = mergeRecentColor(prev, color);

            saveRecentColors(next);

            return next;
        });
    }

    function getSVFromPointer(event: { clientX: number; clientY: number }): SaturationValue | null {
        const element: HTMLDivElement | null = canvasRef.current;

        if (element === null) return null;

        const rect: DOMRect = element.getBoundingClientRect();

        return {
            s: clamp01((event.clientX - rect.left) / rect.width),
            v: clamp01(1 - (event.clientY - rect.top) / rect.height),
        };
    }

    function onCanvasPointerDown(event: React.PointerEvent<HTMLDivElement>): void {
        event.currentTarget.setPointerCapture(event.pointerId);

        const saturationValue: SaturationValue | null = getSVFromPointer(event);

        if (saturationValue === null) return;

        commit({...hsvRef.current, ...saturationValue}, alphaRef.current);
    }

    function onCanvasPointerMove(event: React.PointerEvent<HTMLDivElement>): void {
        if (event.buttons === 0) return;

        const saturationValue: SaturationValue | null = getSVFromPointer(event);

        if (saturationValue === null) return;

        commit({...hsvRef.current, ...saturationValue}, alphaRef.current);
    }

    function onHueChange(event: React.ChangeEvent<HTMLInputElement>): void {
        commit({...hsvRef.current, h: Number(event.target.value)}, alphaRef.current);
    }

    function onAlphaChange(event: React.ChangeEvent<HTMLInputElement>): void {
        commit(hsvRef.current, Number(event.target.value));
    }

    function onHexInputChange(event: React.ChangeEvent<HTMLInputElement>): void {
        const raw: string = event.target.value;

        setHexInput(raw);

        const parsed: ColorPickerState | null = parseAnyColor(raw);

        if (parsed) {
            const newAlpha: number = showAlpha ? parsed.alpha : 1;

            setHsv(parsed.hsv);
            hsvRef.current = parsed.hsv;
            setAlpha(newAlpha);
            alphaRef.current = newAlpha;
            setHexInvalid(false);
            onChange?.(buildOutputHex(parsed.hex6, newAlpha, showAlpha));
        } else {
            setHexInvalid(true);
        }
    }

    async function handleEyedropper(): Promise<void> {
        if (!isEyedropperSupported || !window.EyeDropper) return;

        setEyedrop(true);

        try {
            const result: { sRGBHex: string } = await new window.EyeDropper().open();
            const parsed: ColorPickerState | null = parseAnyColor(result.sRGBHex);

            if (!parsed) return;

            commit(parsed.hsv, showAlpha ? parsed.alpha : 1);
        } catch (_) {
        } finally {
            setEyedrop(false);
        }
    }

    function togglePanel(): void {
        if (disabled) return;
        if (!open && triggerRef.current) setPanelPos(calcPanelPos(triggerRef.current));

        setOpen((open: boolean) => !open);
    }

    function pickRecent(raw: string): void {
        const parsed: ColorPickerState | null = parseAnyColor(raw);

        if (!parsed) return;

        commit(parsed.hsv, showAlpha ? parsed.alpha : 1);
    }

    const hex6: string = hsvToHex(hsv);
    const displayColor: string = buildDisplayColor(hex6, showAlpha ? alpha : 1);
    const outputHex: string = buildOutputHex(hex6, showAlpha ? alpha : 1, showAlpha);
    const hueHex: string = hsvToHex({h: hsv.h, s: 1, v: 1});
    const hueThumb: string = `hsl(${hsv.h}, 100%, 50%)`;
    const thumbX: number = hsv.s * 100;
    const thumbY: number = (1 - hsv.v) * 100;
    const alphaThumbColor: string = buildDisplayColor(hex6, alpha);
    const swatchBg: string = buildSwatchBackground(displayColor);

    return (
        <Field>
            {
                label
                && <FieldLabel htmlFor={id}>{label}</FieldLabel>
            }

            <TriggerRow
                ref={triggerRef}
                hasError={error !== undefined}
                isDisabled={disabled}
                onClick={togglePanel}
                role="button"
                tabIndex={disabled ? -1 : 0}
                id={id}
                aria-haspopup="dialog"
                aria-expanded={open}
                onKeyDown={(event: React.KeyboardEvent) => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        togglePanel();
                    }

                    if (event.key === "Escape") setOpen(false);
                }}
            >
                <SwatchBadge style={{background: swatchBg}}/>
                <HexLabel>{outputHex.toUpperCase()}</HexLabel>
                <Caret open={open}><ChevronIcon/></Caret>
            </TriggerRow>

            {
                open
                && ReactDOM.createPortal(
                    <PortalPanel
                        ref={panelRef}
                        upward={panelPos.upward}
                        style={{top: panelPos.top, left: panelPos.left}}
                        role="dialog"
                        aria-label="Color picker"
                    >
                        <CanvasWrap
                            ref={canvasRef}
                            onPointerDown={onCanvasPointerDown}
                            onPointerMove={onCanvasPointerMove}
                        >
                            <CanvasLayer style={{background: hueHex}}/>
                            <CanvasLayer style={{background: "linear-gradient(to right, #fff, transparent)"}}/>
                            <CanvasLayer style={{background: "linear-gradient(to top, #000, transparent)"}}/>
                            <CanvasThumb x={thumbX} y={thumbY}/>
                        </CanvasWrap>

                        <SlidersBlock>
                            <SliderSwatch style={{background: swatchBg}}/>
                            <TracksCol>
                                <HueTrack>
                                    <RangeInput
                                        type="range" min={0} max={360} step={1}
                                        value={hsv.h}
                                        onChange={onHueChange}
                                        thumbColor={hueThumb}
                                        aria-label="Hue"
                                    />
                                </HueTrack>
                                {
                                    showAlpha
                                    && <AlphaTrack hue={hsv.h}>
										<RangeInput
											type="range" min={0} max={1} step={0.01}
											value={alpha}
											onChange={onAlphaChange}
											thumbColor={alphaThumbColor}
											aria-label="Alpha"
										/>
									</AlphaTrack>
                                }
                            </TracksCol>
                        </SlidersBlock>

                        <Divider/>

                        <InputRow>
                            <HexInputField
                                value={hexInput}
                                invalid={hexInvalid}
                                onChange={onHexInputChange}
                                spellCheck={false}
                                aria-label="Colour value"
                                placeholder="#rrggbb"
                            />

                            {
                                isEyedropperSupported
                                && <IconBtn
									type="button"
									active={eyedrop}
									onClick={() => void handleEyedropper()}
									title="화면에서 색상 추출"
									aria-label="Open eyedropper"
								>
									<EyedropperIcon/>
								</IconBtn>
                            }
                        </InputRow>

                        {
                            recentColors.length > 0
                            && <>
								<Divider/>
								<SectionLabel>Recent</SectionLabel>
								<SwatchGrid>
                                    {
                                        recentColors.slice(0, 8)
                                            .map((color: string) => {
                                                const colorPickerState: ColorPickerState | null = parseAnyColor(color);
                                                const displayColor: string = colorPickerState ? buildDisplayColor(colorPickerState.hex6, colorPickerState.alpha) : color;

                                                return <RecentSwatch
                                                    key={color}
                                                    type="button"
                                                    style={{background: buildSwatchBackground(displayColor)}}
                                                    active={outputHex.toLowerCase() === color.toLowerCase()}
                                                    onClick={() => pickRecent(color)}
                                                    title={color}
                                                    aria-label={`Select colour ${color}`}
                                                />;
                                            })
                                    }
								</SwatchGrid>
							</>
                        }
                    </PortalPanel>,
                    document.body,
                )
            }

            {
                error !== undefined
                    ? <ErrorMessage>{error}</ErrorMessage>
                    : hint !== undefined
                        ? <HintMessage>{hint}</HintMessage>
                        : undefined
            }
        </Field>
    );
}
