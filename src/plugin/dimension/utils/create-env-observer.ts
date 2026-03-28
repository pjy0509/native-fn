import keys from "../../../utils/keys";
import EventListener from "../../../utils/event-listener";
import defer from "../../../utils/defer";
import createSubscriptionManager from "../../../utils/create-subscription-manager";
import setStyle from "../../../utils/set-style";
import {SubscriptionManager} from "../../../types/subscription-manager";
import {EnvironmentPresetAttr, EnvironmentPresetKey, EnvironmentPresetValues} from "../types";
import {ENV_PRESETS} from "../constants";

declare global {
    interface Navigator {
        readonly virtualKeyboard?: VirtualKeyboard;
    }
}

type ChangeCallback<K extends EnvironmentPresetKey> = (values: EnvironmentPresetValues<K>) => void;

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

export type EnvObserver<K extends EnvironmentPresetKey> = {
    get(): EnvironmentPresetValues<K>;
    onChange(callback: ChangeCallback<K>, options?: AddEventListenerOptions): () => void;
};

function noop(): void {
}

function createVirtualKeyboardObserver(): EnvObserver<'keyboard-inset'> {
    const onChangeSubscriptionManager: SubscriptionManager<void, EnvironmentPresetValues<'keyboard-inset'>> = createSubscriptionManager(attachOnChange, detachOnChange);

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
        const right: number = (function (): number {
            if (width === 0) return 0;
            return Math.max(0, globalThis.innerWidth - (left + width));
        })();
        const bottom: number = (function (): number {
            if (height === 0) return 0;
            return Math.max(0, globalThis.innerHeight - (top + height));
        })();

        return {
            top: top,
            right: right,
            bottom: bottom,
            left: left,
            width: width,
            height: height,
        };
    }

    return {
        get: getValue,
        onChange: onChangeSubscriptionManager.subscribe,
    }
}

export default function createEnvObserver<K extends EnvironmentPresetKey>(preset: K): EnvObserver<K> {
    if (preset === 'keyboard-inset' && typeof globalThis.navigator.virtualKeyboard !== 'undefined') return createVirtualKeyboardObserver() as EnvObserver<K>;

    const envMap: typeof ENV_PRESETS[K] = ENV_PRESETS[preset];
    const attributes: EnvironmentPresetAttr<K>[] = keys(envMap) as EnvironmentPresetAttr<K>[];
    const support: string | undefined = getSupportedEnv();
    const parentReadyCallbacks: (() => void)[] = [];
    const onChangeSubscriptionManager: SubscriptionManager<void, EnvironmentPresetValues<K>> = createSubscriptionManager<void, EnvironmentPresetValues<K>>(attachOnChange, detachOnChange);
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

    function getSupportedEnv(): string | undefined {
        if (typeof globalThis.CSS !== 'undefined' && typeof globalThis.CSS.supports === 'function') {
            if (globalThis.CSS.supports('x: env(x)')) return 'env';
            if (globalThis.CSS.supports('x: constant(x)')) return 'constant';
        }

        return undefined;
    }

    function isSameValues(a: EnvironmentPresetValues<K>, b: EnvironmentPresetValues<K>): boolean {
        for (let i: number = 0; i < attributes.length; i++) {
            const key: EnvironmentPresetAttr<K> = attributes[i];

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

    function addChild(parent: HTMLElement, attribute: EnvironmentPresetAttr<K>): void {
        const envVar: string = envMap[attribute] as string;

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
            for (let i: number = 0; i < attributes.length; i++) {
                elementComputedStyle[attributes[i] as string] = 0;
            }

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
            const attribute: EnvironmentPresetAttr<K> = attributes[i];
            result[attribute] = getAttribute(attribute as string);
        }

        return result;
    }

    return {
        get: function (): EnvironmentPresetValues<K> {
            if (parentDiv !== null) return readValues();

            init();
            const result: EnvironmentPresetValues<K> = readValues();
            removeDetector();

            return result;
        },

        onChange: function (callback: ChangeCallback<K>, options: AddEventListenerOptions = {}): () => void {
            if (typeof support === 'undefined') return noop;

            return onChangeSubscriptionManager.subscribe(callback, options);
        }
    };
}
