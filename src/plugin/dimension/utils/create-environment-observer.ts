import keys from "../../../utils/keys";
import EventListener from "../../../utils/event-listener";
import defer from "../../../utils/defer";
import createSubscriptionManager from "../../../utils/create-subscription-manager";
import setStyle from "../../../utils/set-style";
import {SubscriptionManager} from "../../../types/subscription-manager";
import {EnvironmentObserver, EnvironmentPresetAttribute, EnvironmentPresetKey, EnvironmentPresetValues} from "../types";
import {DEVICE_POSTURE_MEDIA_QUERY_LIST, ENV_PRESETS} from "../constants";
import createHiddenElement from "../../../utils/create-hidden-element";

declare global {
    interface Navigator {
        readonly virtualKeyboard?: VirtualKeyboard;
        readonly devicePosture?: DevicePosture;
    }

    var viewport: BrowsingContextViewport | undefined;
}

interface DevicePosture extends EventTarget {
    readonly type: 'continuous' | 'folded';
    onchange: ((this: DevicePosture, ev: Event) => any) | null;
}

interface VirtualKeyboardEventMap {
    geometrychange: Event;
}

interface VirtualKeyboard extends EventTarget {
    readonly boundingRect: DOMRect;

    overlaysContent: boolean;

    show(): void;

    hide(): void;

    addEventListener<K extends keyof VirtualKeyboardEventMap>(type: K, listener: (this: VirtualKeyboard, ev: VirtualKeyboardEventMap[K]) => any, options?: AddEventListenerOptions): void;

    removeEventListener<K extends keyof VirtualKeyboardEventMap>(type: K, listener: (this: VirtualKeyboard, ev: VirtualKeyboardEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
}

interface BrowsingContextViewportEventMap {
    change: Event;
}

interface BrowsingContextViewport extends EventTarget {
    readonly segments: ReadonlyArray<DOMRectReadOnly> | null;

    addEventListener<K extends keyof BrowsingContextViewportEventMap>(type: K, listener: (this: BrowsingContextViewport, ev: BrowsingContextViewportEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;

    removeEventListener<K extends keyof BrowsingContextViewportEventMap>(type: K, listener: (this: BrowsingContextViewport, ev: BrowsingContextViewportEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
}

interface SegmentRowCol {
    rows: number;
    cols: number;
}

const MAX_SEGMENTS_PER_AXIS: number = 4;

function noop(): void {
}

function getSupportedEnvironment(): string | undefined {
    if (typeof globalThis.CSS !== 'undefined' && typeof globalThis.CSS.supports === 'function') {
        if (globalThis.CSS.supports('x: env(x)')) return 'env';
        if (globalThis.CSS.supports('x: constant(x)')) return 'constant';
    }

    return undefined;
}

function getSegmentGrid(): SegmentRowCol {
    if (typeof globalThis.matchMedia !== 'function') return {rows: 1, cols: 1};

    let cols: number = 1;
    let rows: number = 1;

    for (let i: number = MAX_SEGMENTS_PER_AXIS; i >= 2; i--) {
        if (globalThis.matchMedia('(horizontal-viewport-segments: ' + i + ')').matches) {
            cols = i;
            break;
        }
    }

    for (let i: number = MAX_SEGMENTS_PER_AXIS; i >= 2; i--) {
        if (globalThis.matchMedia('(vertical-viewport-segments: ' + i + ')').matches) {
            rows = i;
            break;
        }
    }

    return {rows: rows, cols: cols};
}

function buildSegmentMediaQueryLists(): MediaQueryList[] {
    if (typeof globalThis.matchMedia !== 'function') return [];

    const mediaQueryLists: MediaQueryList[] = [];

    for (let i: number = 2; i <= MAX_SEGMENTS_PER_AXIS; i++) {
        mediaQueryLists.push(globalThis.matchMedia('(horizontal-viewport-segments: ' + i + ')'));
        mediaQueryLists.push(globalThis.matchMedia('(vertical-viewport-segments: ' + i + ')'));
    }

    return mediaQueryLists;
}

function createViewportSegmentObserver(): EnvironmentObserver<'viewport-segment'> {
    const viewport: BrowsingContextViewport | undefined = globalThis.viewport;
    const visualViewport: VisualViewport | null | undefined = globalThis.visualViewport;
    const devicePosture: DevicePosture | undefined = globalThis.navigator.devicePosture;
    const hasSegmentsAPI: boolean = typeof viewport !== 'undefined';
    const hasLegacySegmentsAPI: boolean = !hasSegmentsAPI && typeof visualViewport !== 'undefined' && visualViewport !== null && typeof visualViewport.segments !== 'undefined';
    const hasDevicePosture: boolean = typeof devicePosture !== 'undefined';
    const onChangeSubscriptionManager: SubscriptionManager<EnvironmentPresetValues<'viewport-segment'>[]> = createSubscriptionManager(attachOnChange, detachOnChange);
    const support: string | undefined = getSupportedEnvironment();
    let cachedDiv: HTMLDivElement | null = null;
    let segmentMediaQueryLists: MediaQueryList[] = [];
    let previousSegments: EnvironmentPresetValues<'viewport-segment'>[] | null = null;

    function attachCSSFallbackListeners(): void {
        segmentMediaQueryLists = buildSegmentMediaQueryLists();

        for (let i: number = 0; i < segmentMediaQueryLists.length; i++) EventListener.add(segmentMediaQueryLists[i], {type: 'change', callback: onSegmentChange});

        if (DEVICE_POSTURE_MEDIA_QUERY_LIST.media !== 'not all') EventListener.add(DEVICE_POSTURE_MEDIA_QUERY_LIST, {type: 'change', callback: onSegmentChange});
    }

    function detachCSSFallbackListeners(): void {
        for (let i: number = 0; i < segmentMediaQueryLists.length; i++) EventListener.remove(segmentMediaQueryLists[i], {type: 'change', callback: onSegmentChange});

        segmentMediaQueryLists = [];

        if (DEVICE_POSTURE_MEDIA_QUERY_LIST.media !== 'not all') EventListener.remove(DEVICE_POSTURE_MEDIA_QUERY_LIST, {type: 'change', callback: onSegmentChange});
    }

    function attachDevicePostureChangeListener(): void {
        if (hasDevicePosture) EventListener.add(devicePosture, {type: 'change', callback: onSegmentChange});
        attachCSSFallbackListeners();
    }

    function detachDevicePostureChangeListener(): void {
        if (hasDevicePosture) EventListener.remove(devicePosture, {type: 'change', callback: onSegmentChange});
        detachCSSFallbackListeners();
    }

    function attachVisualViewportResizeListener(): void {
        EventListener.add(visualViewport!, {type: 'resize', callback: onSegmentChange, options: {passive: true}});
    }

    function detachVisualViewportResizeListener(): void {
        EventListener.remove(visualViewport!, {type: 'resize', callback: onSegmentChange, options: {passive: true}});
    }

    function attachOnChange(): void {
        EventListener.add(globalThis, {type: 'resize', callback: onSegmentChange});

        if (hasSegmentsAPI) {
            attachDevicePostureChangeListener();
        } else if (hasLegacySegmentsAPI) {
            attachVisualViewportResizeListener();
            attachDevicePostureChangeListener();
        } else {
            getOrCreateCachedDiv();
            attachVisualViewportResizeListener();
        }
    }

    function detachOnChange(): void {
        EventListener.remove(globalThis, {type: 'resize', callback: onSegmentChange});

        if (hasSegmentsAPI) {
            detachDevicePostureChangeListener();
        } else if (hasLegacySegmentsAPI) {
            detachVisualViewportResizeListener();
            detachDevicePostureChangeListener();
        } else {
            detachVisualViewportResizeListener();
            releaseDiv();
        }
    }

    function segmentsEqual(segments1: EnvironmentPresetValues<'viewport-segment'>[], segments2: EnvironmentPresetValues<'viewport-segment'>[]): boolean {
        if (segments1.length !== segments2.length) return false;

        for (let i: number = 0; i < segments1.length; i++) {
            const segment1: EnvironmentPresetValues<'viewport-segment'> = segments1[i];
            const segment2: EnvironmentPresetValues<'viewport-segment'> = segments2[i];

            if (segment1.width !== segment2.width || segment1.height !== segment2.height || segment1.top !== segment2.top || segment1.left !== segment2.left || segment1.bottom !== segment2.bottom || segment1.right !== segment2.right) return false;
        }

        return true;
    }

    function onSegmentChange(): void {
        const next: EnvironmentPresetValues<'viewport-segment'>[] = getValue();

        if (previousSegments !== null && segmentsEqual(previousSegments, next)) return;

        previousSegments = next;
        onChangeSubscriptionManager.emit(next);
    }

    function buildDiv(): HTMLDivElement {
        const div: HTMLDivElement = createHiddenElement('div');

        div.setAttribute('data-viewport-segment-observer', '');
        div.style.setProperty('position', 'fixed', 'important');
        div.style.setProperty('top', '0', 'important');
        div.style.setProperty('left', '0', 'important');
        div.style.setProperty('visibility', 'hidden', 'important');
        div.style.setProperty('pointer-events', 'none', 'important');
        div.style.setProperty('z-index', '-1', 'important');
        div.style.setProperty('box-sizing', 'content-box', 'important');
        div.style.setProperty('padding', '0', 'important');
        div.style.setProperty('margin', '0', 'important');
        div.style.setProperty('border', '0', 'important');
        div.style.setProperty('width', '0', 'important');
        div.style.setProperty('height', '0', 'important');
        div.style.setProperty('min-width', '0', 'important');
        div.style.setProperty('min-height', '0', 'important');
        div.style.setProperty('max-width', 'none', 'important');
        div.style.setProperty('max-height', 'none', 'important');
        div.style.setProperty('transition', 'none', 'important');
        div.style.setProperty('animation', 'none', 'important');
        div.style.setProperty('display', 'block', 'important');
        div.style.setProperty('float', 'none', 'important');
        div.style.setProperty('transform', 'none', 'important');

        return div;
    }

    function getOrCreateCachedDiv(): HTMLDivElement {
        if (cachedDiv !== null) return cachedDiv;

        cachedDiv = buildDiv();
        globalThis.document.body.appendChild(cachedDiv);

        return cachedDiv;
    }

    function releaseDiv(): void {
        if (cachedDiv !== null) {
            if (cachedDiv.parentNode !== null) cachedDiv.parentNode.removeChild(cachedDiv);

            cachedDiv = null;
        }
    }

    function readFromSegmentsAPI(): EnvironmentPresetValues<'viewport-segment'>[] {
        let segments: ReadonlyArray<DOMRectReadOnly> | DOMRectReadOnly[] | null | undefined;

        if (hasSegmentsAPI) segments = viewport!.segments;
        else segments = visualViewport!.segments;

        if (segments === null || typeof segments === 'undefined') return [];

        const results: EnvironmentPresetValues<'viewport-segment'>[] = [];

        for (let i: number = 0; i < segments.length; i++) {
            const segment: DOMRectReadOnly = segments[i];

            results.push({
                width: segment.width,
                height: segment.height,
                top: segment.top,
                left: segment.left,
                bottom: segment.bottom,
                right: segment.right,
            });
        }

        return results;
    }

    function buildFullViewportSegment(): EnvironmentPresetValues<'viewport-segment'> {
        const width: number = globalThis.innerWidth;
        const height: number = globalThis.innerHeight;

        return {
            width: width,
            height: height,
            top: 0,
            left: 0,
            bottom: height,
            right: width,
        };
    }

    function readFromCSSEnv(div: HTMLDivElement): EnvironmentPresetValues<'viewport-segment'>[] {
        const grid: SegmentRowCol = getSegmentGrid();

        if (grid.rows === 1 && grid.cols === 1) return [buildFullViewportSegment()];
        if (typeof support === 'undefined' || typeof div.style.setProperty === 'undefined') return [buildFullViewportSegment()];

        const results: EnvironmentPresetValues<'viewport-segment'>[] = [];

        for (let row: number = 0; row < grid.rows; row++) {
            for (let col: number = 0; col < grid.cols; col++) {
                div.style.setProperty('width', support + '(viewport-segment-width ' + row + ' ' + col + ', -1px)', 'important');
                div.style.setProperty('height', support + '(viewport-segment-height ' + row + ' ' + col + ', -1px)', 'important');
                div.style.setProperty('margin-top', support + '(viewport-segment-top ' + row + ' ' + col + ', -1px)', 'important');
                div.style.setProperty('margin-left', support + '(viewport-segment-left ' + row + ' ' + col + ', -1px)', 'important');
                div.style.setProperty('margin-bottom', support + '(viewport-segment-bottom ' + row + ' ' + col + ', -1px)', 'important');
                div.style.setProperty('margin-right', support + '(viewport-segment-right ' + row + ' ' + col + ', -1px)', 'important');

                const computed: CSSStyleDeclaration = globalThis.getComputedStyle(div);
                const top: number = globalThis.parseFloat(computed.marginTop);

                if (top < 0) continue;

                const left: number = globalThis.parseFloat(computed.marginLeft);
                const bottom: number = globalThis.parseFloat(computed.marginBottom);
                const right: number = globalThis.parseFloat(computed.marginRight);
                const width: number = globalThis.parseFloat(computed.width);
                const height: number = globalThis.parseFloat(computed.height);

                results.push({
                    width: width,
                    height: height,
                    top: top,
                    left: left,
                    bottom: bottom,
                    right: right,
                });
            }
        }

        return results;
    }

    function getValue(): EnvironmentPresetValues<'viewport-segment'>[] {
        if (hasSegmentsAPI || hasLegacySegmentsAPI) return readFromSegmentsAPI();
        if (cachedDiv !== null) return readFromCSSEnv(cachedDiv);

        const div: HTMLDivElement = buildDiv();

        globalThis.document.body.appendChild(div);

        const results: EnvironmentPresetValues<'viewport-segment'>[] = readFromCSSEnv(div);

        globalThis.document.body.removeChild(div);

        return results;
    }

    function useCssVariable(prefix: string): () => void {
        if (typeof globalThis.document === 'undefined') return noop;

        const attributes: EnvironmentPresetAttribute<'viewport-segment'>[] = keys(ENV_PRESETS['viewport-segment']) as EnvironmentPresetAttribute<'viewport-segment'>[];
        const element: HTMLElement = globalThis.document.documentElement;
        let lastCount: number = 0;

        function applySegments(segments: EnvironmentPresetValues<'viewport-segment'>[]): void {
            for (let i: number = segments.length; i < lastCount; i++) {
                for (let j: number = 0; j < attributes.length; j++) {
                    element.style.removeProperty('--' + prefix + '-' + i + '-' + attributes[j]);
                }
            }

            lastCount = segments.length;

            for (let i: number = 0; i < segments.length; i++) {
                const segment: EnvironmentPresetValues<'viewport-segment'> = segments[i];

                for (let j: number = 0; j < attributes.length; j++) {
                    const attribute: typeof attributes[number] = attributes[j];

                    element.style.setProperty('--' + prefix + '-' + i + '-' + attribute, segment[attribute] + 'px');
                }
            }
        }

        applySegments(getValue());

        const unsubscribe: () => void = onChangeSubscriptionManager.subscribe(function (segments: EnvironmentPresetValues<'viewport-segment'>[]): void {
            applySegments(segments);
        });

        return function (): void {
            unsubscribe();

            for (let i: number = 0; i < lastCount; i++) for (let j: number = 0; j < attributes.length; j++) element.style.removeProperty('--' + prefix + '-' + i + '-' + attributes[j]);

            lastCount = 0;
        };
    }

    return {
        get value(): EnvironmentPresetValues<'viewport-segment'>[] {
            return getValue();
        },
        onChange: onChangeSubscriptionManager.subscribe,
        useCssVariable: useCssVariable,
    };
}

function createVirtualKeyboardObserver(): EnvironmentObserver<'keyboard-inset'> {
    const onChangeSubscriptionManager: SubscriptionManager<EnvironmentPresetValues<'keyboard-inset'>> = createSubscriptionManager(attachOnChange, detachOnChange);

    function attachOnChange(): void {
        EventListener.add(globalThis.navigator.virtualKeyboard, {type: 'geometrychange', callback: onGeometryChange, options: {passive: true}});
    }

    function detachOnChange(): void {
        EventListener.remove(globalThis.navigator.virtualKeyboard, {type: 'geometrychange', callback: onGeometryChange, options: {passive: true}});
    }

    function onGeometryChange(): void {
        onChangeSubscriptionManager.emit(getValue());
    }

    function getValue(): EnvironmentPresetValues<'keyboard-inset'> {
        const rect: DOMRect = globalThis.navigator.virtualKeyboard!.boundingRect;
        const left: number = rect.x;
        const top: number = rect.y;
        const width: number = rect.width;
        const height: number = rect.height;

        let right: number;
        if (width === 0) right = 0;
        else right = Math.max(0, globalThis.innerWidth - (left + width));

        let bottom: number;
        if (height === 0) bottom = 0;
        else bottom = Math.max(0, globalThis.innerHeight - (top + height));

        return {
            top: top,
            right: right,
            bottom: bottom,
            left: left,
            width: width,
            height: height,
        };
    }

    function useCssVariable(prefix: string): () => void {
        if (typeof globalThis.document === 'undefined') return noop;

        const attributes: EnvironmentPresetAttribute<'keyboard-inset'>[] = keys(ENV_PRESETS['keyboard-inset']) as EnvironmentPresetAttribute<'keyboard-inset'>[];
        const element: HTMLElement = globalThis.document.documentElement;

        function applyValues(values: EnvironmentPresetValues<'keyboard-inset'>): void {
            for (let i: number = 0; i < attributes.length; i++) {
                const attribute: typeof attributes[number] = attributes[i];

                element.style.setProperty('--' + prefix + '-' + attribute, values[attribute] + 'px');
            }
        }

        applyValues(getValue());

        const unsubscribe: () => void = onChangeSubscriptionManager.subscribe(function (values: EnvironmentPresetValues<'keyboard-inset'>): void {
            applyValues(values);
        });

        return function (): void {
            unsubscribe();

            for (let i: number = 0; i < attributes.length; i++) element.style.removeProperty('--' + prefix + '-' + attributes[i]);
        };
    }

    return {
        get value(): EnvironmentPresetValues<'keyboard-inset'> {
            return getValue();
        },
        onChange: onChangeSubscriptionManager.subscribe,
        useCssVariable: useCssVariable,
    };
}

export default function createEnvironmentObserver<K extends EnvironmentPresetKey>(preset: K): EnvironmentObserver<K> {
    if (preset === 'keyboard-inset' && typeof globalThis.navigator.virtualKeyboard !== 'undefined') return createVirtualKeyboardObserver() as EnvironmentObserver<K>;
    if (preset === 'viewport-segment') return createViewportSegmentObserver() as EnvironmentObserver<K>;

    const environmentMap: typeof ENV_PRESETS[K] = ENV_PRESETS[preset];
    const attributes: EnvironmentPresetAttribute<K>[] = keys(environmentMap) as EnvironmentPresetAttribute<K>[];
    const support: string | undefined = getSupportedEnvironment();
    const parentReadyCallbacks: (() => void)[] = [];
    const onChangeSubscriptionManager: SubscriptionManager<EnvironmentPresetValues<K>> = createSubscriptionManager<EnvironmentPresetValues<K>>(attachOnChange, detachOnChange);
    let elementComputedStyle: Record<string, number> = {};
    let passiveEvents: AddEventListenerOptions | undefined = undefined;
    let parentDiv: HTMLElement | null = null;
    let pendingChange: boolean = false;
    let lastEmittedValues: EnvironmentPresetValues<K> | null = null;

    function attachOnChange(): void {
        if (typeof support === 'undefined') return;
        if (parentDiv === null) init();
    }

    function detachOnChange(): void {
        removeDetector();
    }

    function isSameValues(a: EnvironmentPresetValues<K>, b: EnvironmentPresetValues<K>): boolean {
        for (let i: number = 0; i < attributes.length; i++) {
            const key: EnvironmentPresetAttribute<K> = attributes[i];

            if (a[key] !== b[key]) return false;
        }

        return true;
    }

    try {
        const options: {} = Object.defineProperty({}, 'passive', {
            get: function (): void {
                passiveEvents = {passive: true};
            },
        });

        EventListener.add(globalThis, {type: 'test', callback: noop, options: options});
    } catch (_: unknown) {
    }

    function attributeChange(): void {
        if (pendingChange) return;

        pendingChange = true;

        defer(function flush(): void {
            pendingChange = false;

            const nextValues: EnvironmentPresetValues<K> = readValues();

            if (lastEmittedValues !== null && isSameValues(lastEmittedValues, nextValues)) return;

            lastEmittedValues = nextValues;
            onChangeSubscriptionManager.emit(nextValues);
        });
    }

    function parentReady(callback?: () => void): void {
        if (typeof callback !== 'undefined') parentReadyCallbacks.push(callback);
        else for (let i: number = 0; i < parentReadyCallbacks.length; i++) parentReadyCallbacks[i]();
    }

    function addChild(parent: HTMLElement, attribute: EnvironmentPresetAttribute<K>): void {
        const envVar: string = environmentMap[attribute] as string;

        const p1: HTMLElement = globalThis.document.createElement('div');
        const p2: HTMLElement = globalThis.document.createElement('div');
        const c1: HTMLElement = globalThis.document.createElement('div');
        const c2: HTMLElement = globalThis.document.createElement('div');

        const parentStyle: Record<string, string> = {
            position: 'absolute',
            width: '100px',
            height: '200px',
            boxSizing: 'border-box',
            overflow: 'hidden',
            paddingBottom: support + '(' + envVar + ')',
        };

        const child1Style: Record<string, string> = {
            transition: '0s',
            animation: 'none',
            width: '400px',
            height: '400px',
        };

        const child2Style: Record<string, string> = {
            transition: '0s',
            animation: 'none',
            width: '250%',
            height: '250%',
        };

        setStyle(p1, parentStyle);
        setStyle(p2, parentStyle);
        setStyle(c1, child1Style);
        setStyle(c2, child2Style);

        p1.appendChild(c1);
        p2.appendChild(c2);
        parent.appendChild(p1);
        parent.appendChild(p2);

        parentReady(function (): void {
            p1.scrollTop = p2.scrollTop = 10000;

            let p1LastScrollTop: number = p1.scrollTop;
            let p2LastScrollTop: number = p2.scrollTop;

            function onScroll(this: HTMLElement): void {
                let lastScrollTop: number;

                if (this === p1) lastScrollTop = p1LastScrollTop;
                else lastScrollTop = p2LastScrollTop;

                if (this.scrollTop === lastScrollTop) return;

                p1.scrollTop = p2.scrollTop = 10000;
                p1LastScrollTop = p1.scrollTop;
                p2LastScrollTop = p2.scrollTop;

                attributeChange();
            }

            EventListener.add(p1, {type: 'scroll', callback: onScroll, options: passiveEvents});
            EventListener.add(p2, {type: 'scroll', callback: onScroll, options: passiveEvents});
        });

        const computedStyle: CSSStyleDeclaration = globalThis.getComputedStyle(p1);

        Object.defineProperty(elementComputedStyle, attribute, {
            configurable: true,
            get(): number {
                return globalThis.parseFloat(computedStyle.paddingBottom);
            },
        });
    }

    function init(): void {
        if (typeof support === 'undefined') {
            for (let i: number = 0; i < attributes.length; i++) elementComputedStyle[attributes[i] as string] = 0;

            return;
        }

        elementComputedStyle = {};

        parentDiv = globalThis.document.createElement('div');
        parentDiv.setAttribute('data-' + preset + '-observer', '');

        setStyle(parentDiv, {
            position: 'absolute',
            left: '0',
            top: '0',
            width: '0',
            height: '0',
            zIndex: '-1',
            overflow: 'hidden',
            visibility: 'hidden',
        });

        for (let i: number = 0; i < attributes.length; i++) {
            addChild(parentDiv, attributes[i]);
        }

        globalThis.document.body.appendChild(parentDiv);
        lastEmittedValues = readValues();
        parentReady();
    }

    function removeDetector(): void {
        if (parentDiv !== null) {
            if (parentDiv.parentNode !== null) parentDiv.parentNode.removeChild(parentDiv);
            parentDiv = null;
        }

        parentReadyCallbacks.length = 0;
        elementComputedStyle = {};
        lastEmittedValues = null;
    }

    function getAttribute(attribute: string): number {
        return elementComputedStyle[attribute];
    }

    function readValues(): EnvironmentPresetValues<K> {
        const result: EnvironmentPresetValues<K> = {} as EnvironmentPresetValues<K>;

        for (let i: number = 0; i < attributes.length; i++) {
            const attribute: EnvironmentPresetAttribute<K> = attributes[i];

            result[attribute] = getAttribute(attribute as string);
        }

        return result;
    }

    function useCssVariable(prefix: string): () => void {
        if (typeof support === 'undefined' || typeof globalThis.document === 'undefined') return noop;

        const element: HTMLElement = globalThis.document.documentElement;

        function applyValues(values: EnvironmentPresetValues<K>): void {
            for (let i: number = 0; i < attributes.length; i++) {
                const attribute: EnvironmentPresetAttribute<K> = attributes[i];

                element.style.setProperty('--' + prefix + '-' + String(attributes[i]), values[attribute] + 'px');
            }
        }

        const unsubscribe: () => void = onChangeSubscriptionManager.subscribe(function (values: EnvironmentPresetValues<K>): void {
            applyValues(values);
        });

        applyValues(readValues());

        return function (): void {
            unsubscribe();

            for (let i: number = 0; i < attributes.length; i++) element.style.removeProperty('--' + prefix + '-' + String(attributes[i]));
        };
    }

    return {
        get value(): EnvironmentPresetValues<K> {
            if (parentDiv !== null) return readValues();

            init();
            const result: EnvironmentPresetValues<K> = readValues();
            removeDetector();

            return result;
        },
        onChange: function (callback: (value: EnvironmentPresetValues<K>) => void, options: AddEventListenerOptions = {}): () => void {
            if (typeof support === 'undefined') return noop;

            return onChangeSubscriptionManager.subscribe(callback as (value: EnvironmentPresetValues<K>) => void, options);
        },
        useCssVariable: useCssVariable
    } as EnvironmentObserver<K>;
}
