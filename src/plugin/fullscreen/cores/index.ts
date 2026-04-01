import {FullscreenEventPayload, FullscreenInstance} from "../types";
import Platform from "../../platform/cores";
import {Browsers, OS} from "../../platform";
import createSubscriptionManager from "../../../utils/create-subscription-manager";
import EventListener from "../../../utils/event-listener";
import {SubscriptionManager} from "../../../types/subscription-manager";
import {NotSupportedError} from "../../../errors/not-supported-error";
import {InvalidStateError} from "../../../errors/invalid-state-error";

declare global {
    interface HTMLVideoElement {
        webkitEnterFullscreen?: () => void;
        webkitExitFullscreen?: () => void;
        webkitSupportsFullscreen?: boolean;
        webkitDisplayingFullscreen?: boolean;
        onwebkitbeginfullscreen?: ((this: HTMLVideoElement, ev: Event) => any) | null;
        onwebkitendfullscreen?: ((this: HTMLVideoElement, ev: Event) => any) | null;
    }

    interface Document {
        readonly fullscreenEnabled: boolean;
        fullscreenElement?: Element | null;
        exitFullscreen: () => Promise<void>;

        readonly webkitFullscreenEnabled?: boolean;
        webkitFullscreenElement?: Element | null;
        webkitCurrentFullScreenElement?: Element | null;
        webkitExitFullscreen?: () => Promise<void>;
        webkitCancelFullScreen?: () => Promise<void>;

        readonly mozFullScreenEnabled?: boolean;
        mozFullScreenElement?: Element | null;
        mozCancelFullScreen?: () => Promise<void>;

        readonly msFullscreenEnabled?: boolean;
        msFullscreenElement?: Element | null;
        msExitFullscreen?: () => Promise<void>;
    }

    interface Element {
        requestFullscreen: (options?: FullscreenOptions) => Promise<void>;
        webkitRequestFullscreen?: (options?: FullscreenOptions) => Promise<void>;
        webkitRequestFullScreen?: (options?: FullscreenOptions) => Promise<void>;
        mozRequestFullScreen?: () => Promise<void>;
        msRequestFullscreen?: () => Promise<void>;
    }

    var __nativeFnFsBridgeKey__: symbol | undefined;
}

interface BridgedHTMLVideoElement extends HTMLVideoElement {
    [key: string | symbol]: unknown;
}

interface FullscreenApiMap {
    enabled: keyof Document;
    element: keyof Document;
    request: keyof Element;
    exit: keyof Document;
    events: {
        change: string;
        error: string;
    };
}

interface FullscreenApiVariants {
    standard: FullscreenApiMap;
    webkit: FullscreenApiMap;
    moz: FullscreenApiMap;
    ms: FullscreenApiMap;
}

type FullscreenRequestMethod = (this: any, options?: FullscreenOptions) => Promise<void> | void;
type FullscreenExitMethod = (this: Document) => Promise<void> | void;

let videoElement: HTMLVideoElement | null = null;
let lastFallbackVideoElement: HTMLVideoElement | null = null;
let eventsBridged: boolean = false;

const FS_BRIDGE_KEY: string | symbol = (function (): string | symbol {
    if (typeof Symbol === 'function') {
        const existing: unknown = globalThis.__nativeFnFsBridgeKey__;

        if (typeof existing === 'symbol') return existing;

        return globalThis.__nativeFnFsBridgeKey__ = Symbol('native.fn.fs.bridged');
    }

    return '__nativeFnFsBridged__';
}());

const API_VARIANTS: FullscreenApiVariants = {
    standard: {
        enabled: 'fullscreenEnabled',
        element: 'fullscreenElement',
        request: 'requestFullscreen',
        exit: 'exitFullscreen',
        events: {change: 'fullscreenchange', error: 'fullscreenerror'},
    },
    webkit: {
        enabled: 'webkitFullscreenEnabled',
        element: 'webkitFullscreenElement',
        request: 'webkitRequestFullscreen',
        exit: 'webkitExitFullscreen',
        events: {change: 'webkitfullscreenchange', error: 'webkitfullscreenerror'},
    },
    moz: {
        enabled: 'mozFullScreenEnabled',
        element: 'mozFullScreenElement',
        request: 'mozRequestFullScreen',
        exit: 'mozCancelFullScreen',
        events: {change: 'mozfullscreenchange', error: 'mozfullscreenerror'},
    },
    ms: {
        enabled: 'msFullscreenEnabled',
        element: 'msFullscreenElement',
        request: 'msRequestFullscreen',
        exit: 'msExitFullscreen',
        events: {change: 'MSFullscreenChange', error: 'MSFullscreenError'},
    },
};

const api: FullscreenApiMap | null = detectApi();
const onChangeSubscriptionManager: SubscriptionManager<FullscreenInstance, FullscreenEventPayload> = createSubscriptionManager<FullscreenInstance, FullscreenEventPayload>(attachOnChange, detachOnChange);
const onErrorSubscriptionManager: SubscriptionManager<FullscreenInstance, FullscreenEventPayload> = createSubscriptionManager<FullscreenInstance, FullscreenEventPayload>(attachOnError, detachOnError);

const Fullscreen: FullscreenInstance = {
    get supported(): boolean {
        return getSupported();
    },
    get element(): Element | null {
        return getElement();
    },
    get isActive(): boolean {
        return getIsActive();
    },
    request: request,
    exit: exit,
    toggle: toggle,
    onChange: onChange,
    onError: onError,
    Constants: {},
    Errors: {
        NotSupportedError: NotSupportedError,
        InvalidStateError: InvalidStateError,
    },
};

function getHTMLVideoElement(): HTMLVideoElement {
    const selected: HTMLVideoElement | null = globalThis.document.querySelector('video');

    if (selected !== null) return selected;
    if (videoElement === null) return videoElement = globalThis.document.createElement('video');
    return videoElement;
}

function hasStandardApi(): boolean {
    return api !== null;
}

function detectApi(): FullscreenApiMap | null {
    const element: Element = globalThis.document.documentElement;

    if (typeof globalThis.document.fullscreenEnabled !== 'undefined' || typeof globalThis.document.exitFullscreen !== 'undefined') return API_VARIANTS.standard;

    const keys: Array<keyof FullscreenApiVariants> = ['webkit', 'moz', 'ms'];

    for (let i: number = 0; i < keys.length; i++) {
        const key: keyof FullscreenApiVariants = keys[i];
        const variant: FullscreenApiMap = API_VARIANTS[key];

        if (typeof globalThis.document[variant.enabled] !== 'undefined' || typeof globalThis.document[variant.element] !== 'undefined' || typeof globalThis.document[variant.exit] !== 'undefined') {
            if (key === 'webkit' && typeof element.webkitRequestFullScreen !== 'undefined') variant.request = 'webkitRequestFullScreen';

            return variant;
        }
    }

    return null;
}

function getDefaultTarget(): Element | undefined {
    if (Platform.os.name === OS.iOS) {
        const video: HTMLVideoElement | null = globalThis.document.querySelector('video');

        if (video !== null) return video;
        return undefined;
    }

    return globalThis.document.documentElement;
}

function getSupported(): boolean {
    if (api !== null) return globalThis.document[api.enabled] === true;

    if (Platform.os.name !== OS.iOS) return false;

    let video: HTMLVideoElement = getHTMLVideoElement();

    return video.webkitSupportsFullscreen === true || typeof video.webkitEnterFullscreen === 'function';
}

function getElement(): Element | null {
    if (api === null) {
        if (lastFallbackVideoElement !== null && lastFallbackVideoElement.webkitDisplayingFullscreen === true) return lastFallbackVideoElement;

        return null;
    }

    const currentElement: Document[keyof Document] = globalThis.document[api.element];

    if (typeof currentElement !== 'undefined') return currentElement as Element;

    return null;
}

function getIsActive(): boolean {
    return getElement() !== null;
}

function createEventPayload(nativeEvent: Event, element: Element, isActive: boolean): FullscreenEventPayload {
    return {
        nativeEvent: nativeEvent,
        element: element,
        isActive: isActive,
    };
}

function emitChange(nativeEvent: Event, element: Element, isActive: boolean): void {
    onChangeSubscriptionManager.emit(createEventPayload(nativeEvent, element, isActive));
}

function emitError(nativeEvent: Event, element: Element, isActive: boolean): void {
    onErrorSubscriptionManager.emit(createEventPayload(nativeEvent, element, isActive));
}

function onFullscreenChange(event: Event): void {
    const target: EventTarget | null = event.target;

    if (target instanceof globalThis.Element) emitChange(event, target, getIsActive());
    if (target instanceof globalThis.Document) emitChange(event, globalThis.document.documentElement, getIsActive());
}

function onFullscreenError(event: Event): void {
    const target: EventTarget | null = event.target;

    if (target instanceof globalThis.Element) emitError(event, target, getIsActive());
    if (target instanceof globalThis.Document) emitError(event, globalThis.document.documentElement, getIsActive());
}

function onIOSBeginFullscreen(this: HTMLVideoElement, event: Event): void {
    lastFallbackVideoElement = this;
    emitChange(event, this, true);
}

function onIOSEndFullscreen(this: HTMLVideoElement, event: Event): void {
    if (lastFallbackVideoElement === this) lastFallbackVideoElement = null;
    emitChange(event, this, false);
}

function bridgeSingleVideoNode(video: BridgedHTMLVideoElement): void {
    if (video[FS_BRIDGE_KEY]) return;
    if (typeof video.webkitEnterFullscreen === 'undefined' && typeof video.onwebkitbeginfullscreen === 'undefined') return;

    EventListener.add(video, {type: 'webkitbeginfullscreen', callback: onIOSBeginFullscreen, options: false});
    EventListener.add(video, {type: 'webkitendfullscreen', callback: onIOSEndFullscreen, options: false});

    video[FS_BRIDGE_KEY] = true;
}

function bridgeIOSVideoEvents(): void {
    const videos: NodeListOf<HTMLVideoElement> = globalThis.document.querySelectorAll('video');

    for (let i: number = 0; i < videos.length; i++) bridgeSingleVideoNode(videos[i] as BridgedHTMLVideoElement);
}

function bridgeEvents(): void {
    if (eventsBridged) return;

    eventsBridged = true;

    if (Platform.os.name !== OS.iOS) return;

    bridgeIOSVideoEvents();

    if (typeof globalThis.MutationObserver === 'undefined') return;

    const observer: MutationObserver = new globalThis.MutationObserver(function (records: MutationRecord[]): void {
        if (lastFallbackVideoElement !== null) {
            let removed: boolean = false;

            for (let i: number = 0; i < records.length; i++) {
                const removedNodes: NodeList = records[i].removedNodes;

                for (let j: number = 0; j < removedNodes.length; j++) {
                    const node: Node = removedNodes[j];

                    if (node === lastFallbackVideoElement || (node.nodeType === Node.ELEMENT_NODE && (node as Element).contains(lastFallbackVideoElement))) {
                        removed = true;
                        break;
                    }
                }

                if (removed) break;
            }

            if (removed && !globalThis.document.contains(lastFallbackVideoElement)) lastFallbackVideoElement = null;
        }

        for (let i: number = 0; i < records.length; i++) {
            const addedNodes: NodeList = records[i].addedNodes;

            for (let j: number = 0; j < addedNodes.length; j++) {
                const node: Node = addedNodes[j];

                if (node.nodeType !== Node.ELEMENT_NODE) continue;

                const element: Element = node as Element;

                if (element.tagName === 'VIDEO') {
                    bridgeSingleVideoNode(element as BridgedHTMLVideoElement);
                    continue;
                }

                const nested: NodeListOf<HTMLVideoElement> = element.querySelectorAll('video');

                for (let k: number = 0; k < nested.length; k++) bridgeSingleVideoNode(nested[k] as BridgedHTMLVideoElement);
            }
        }
    });

    observer.observe(globalThis.document.documentElement, {childList: true, subtree: true});
}

function attachOnChange(): void {
    if (api != null) EventListener.add(globalThis.document, {type: api.events.change, callback: onFullscreenChange, options: false});

    if (Platform.os.name === OS.iOS) bridgeIOSVideoEvents();
}

function detachOnChange(): void {
    if (api != null) EventListener.remove(globalThis.document, {type: api.events.change, callback: onFullscreenChange, options: false});

    if (Platform.os.name !== OS.iOS) return;

    const videos: NodeListOf<HTMLVideoElement> = globalThis.document.querySelectorAll('video');

    for (let i: number = 0; i < videos.length; i++) {
        EventListener.remove(videos[i], {type: 'webkitbeginfullscreen', callback: onIOSBeginFullscreen, options: false});
        EventListener.remove(videos[i], {type: 'webkitendfullscreen', callback: onIOSEndFullscreen, options: false});
        (videos[i] as BridgedHTMLVideoElement)[FS_BRIDGE_KEY] = false;
    }
}

function attachOnError(): void {
    if (api != null) EventListener.add(globalThis.document, {type: api.events.error, callback: onFullscreenError, options: false});
}

function detachOnError(): void {
    if (api != null) EventListener.remove(globalThis.document, {type: api.events.error, callback: onFullscreenError, options: false});
}

function request(this: FullscreenInstance, target?: Element, options?: FullscreenOptions): Promise<void> {
    return new Promise(function (resolve: () => void, reject: (error: Error) => void): void {
        if (typeof target === 'undefined') target = getDefaultTarget();
        if (typeof target === 'undefined') return reject(new NotSupportedError('Failed to enter fullscreen mode.'));
        if (getIsActive() && getElement() !== target && Platform.browser.name === Browsers.Safari && Platform.os.name === OS.iOS) return reject(new NotSupportedError('There is already a Fullscreen element in this document.'));

        const tagName: string = target.tagName.toLowerCase();
        const isIOSFullscreenActive: boolean = lastFallbackVideoElement !== null && lastFallbackVideoElement.webkitDisplayingFullscreen === true;

        if (api !== null) {
            const method: FullscreenRequestMethod | undefined = target[api.request] as FullscreenRequestMethod | undefined;

            if (typeof method === 'function' && !isIOSFullscreenActive) {
                const result: void | Promise<void> = method.call(target, options);

                if (typeof result !== 'undefined' && typeof result.then === 'function') {
                    result
                        .then(resolve)
                        .catch(function (): void {
                            try {
                                if (Platform.os.name !== OS.iOS) return reject(new NotSupportedError('The "' + tagName + '" element does not support fullscreen requests.'));
                                fallbackToIOSVideo();
                            } catch (e: unknown) {
                                reject(new NotSupportedError('The "' + tagName + '" element does not support fullscreen requests.'));
                            }
                        });
                    return;
                }

                return resolve();
            }
        }

        function fallbackToIOSVideo(): void {
            if (Platform.os.name === OS.iOS && typeof target !== 'undefined' && target.tagName.toUpperCase() === 'VIDEO') {
                const video: HTMLVideoElement = target as HTMLVideoElement;

                if (video.webkitSupportsFullscreen && typeof video.webkitEnterFullscreen === 'function') {
                    if (!hasStandardApi()) bridgeSingleVideoNode(video as BridgedHTMLVideoElement);

                    if (video.played.length === 0) {
                        video.play()
                            .then(function (): void {
                                try {
                                    if (video.webkitSupportsFullscreen && typeof video.webkitEnterFullscreen === 'function') video.webkitEnterFullscreen();
                                } catch (e: unknown) {
                                    return reject(new InvalidStateError('The object is in an invalid state.'));
                                }
                            });
                    } else {
                        try {
                            video.webkitEnterFullscreen();
                        } catch (e: unknown) {
                            return reject(new InvalidStateError('The object is in an invalid state.'));
                        }
                    }

                    lastFallbackVideoElement = video;
                    return resolve();
                }
            }

            reject(new NotSupportedError('The "' + tagName + '" element does not support fullscreen requests.'));
        }

        fallbackToIOSVideo();
    });
}

function exit(this: FullscreenInstance): Promise<void> {
    return new Promise(function (resolve: () => void, reject: (error: Error) => void): void {
        if (api !== null) {
            const method: FullscreenExitMethod | undefined = globalThis.document[api.exit] as FullscreenExitMethod | undefined;

            if (typeof method === 'function') {
                const result: void | Promise<void> = method.call(globalThis.document);

                if (typeof result !== 'undefined' && typeof result.then === 'function') {
                    result
                        .then(resolve)
                        .catch(resolve);
                    return;
                }

                return resolve();
            }
        }

        function fallbackToIOSVideo(): void {
            if (Platform.os.name !== OS.iOS) {
                reject(new NotSupportedError('Failed to exit fullscreen mode.'));
                return;
            }

            const target: HTMLVideoElement | null = lastFallbackVideoElement;

            if (target !== null && typeof target.webkitExitFullscreen === 'function' && target.webkitDisplayingFullscreen === true) {
                target.webkitExitFullscreen();

                if (target.webkitDisplayingFullscreen) return reject(new NotSupportedError('Failed to exit fullscreen mode.'));

                lastFallbackVideoElement = null;

                return resolve();
            }

            const videos: NodeListOf<HTMLVideoElement> = globalThis.document.querySelectorAll('video');

            for (let i: number = 0; i < videos.length; i++) {
                const video: HTMLVideoElement = videos[i];

                if (typeof video.webkitExitFullscreen === 'function' && video.webkitDisplayingFullscreen === true) {
                    video.webkitExitFullscreen();

                    if (video.webkitDisplayingFullscreen) return reject(new NotSupportedError('Failed to exit fullscreen mode.'));

                    lastFallbackVideoElement = null;

                    return resolve();
                }
            }

            if (getElement() === null) return resolve();

            reject(new NotSupportedError('Failed to exit fullscreen mode.'));
        }

        fallbackToIOSVideo();
    });
}

function toggle(this: FullscreenInstance, target?: Element, options?: FullscreenOptions): Promise<void> {
    const current: Element | null = getElement();

    if (typeof target !== 'undefined') {
        if (current === target) return this.exit();
        return this.request(target, options);
    }

    if (current !== null) return this.exit();
    return this.request(undefined, options);
}

function onChange(listener: (payload: FullscreenEventPayload) => void, options?: AddEventListenerOptions): () => void;
function onChange(target: Element, listener: (payload: FullscreenEventPayload) => void, options?: AddEventListenerOptions): () => void;
function onChange(targetOrListener: Element | ((payload: FullscreenEventPayload) => void), listenerOrOptions?: ((payload: FullscreenEventPayload) => void) | AddEventListenerOptions, options?: AddEventListenerOptions): () => void {
    if (typeof targetOrListener === 'function') return onChangeSubscriptionManager.subscribe(targetOrListener, listenerOrOptions as AddEventListenerOptions | undefined);

    const target: Element = targetOrListener;
    const listener: (payload: FullscreenEventPayload) => void = listenerOrOptions as (payload: FullscreenEventPayload) => void;

    function wrappedListener(payload: FullscreenEventPayload): void {
        if (payload.element === target) listener(payload);
    }

    return onChangeSubscriptionManager.subscribe(wrappedListener, options);
}

function onError(listener: (payload: FullscreenEventPayload) => void, options?: AddEventListenerOptions): () => void;
function onError(target: Element, listener: (payload: FullscreenEventPayload) => void, options?: AddEventListenerOptions): () => void;
function onError(targetOrListener: Element | ((payload: FullscreenEventPayload) => void), listenerOrOptions?: ((payload: FullscreenEventPayload) => void) | AddEventListenerOptions, options?: AddEventListenerOptions): () => void {
    if (typeof targetOrListener === 'function') return onErrorSubscriptionManager.subscribe(targetOrListener, listenerOrOptions as AddEventListenerOptions | undefined);

    const target: Element = targetOrListener;
    const listener: (payload: FullscreenEventPayload) => void = listenerOrOptions as (payload: FullscreenEventPayload) => void;

    function wrappedListener(payload: FullscreenEventPayload): void {
        if (payload.element === target) listener(payload);
    }

    return onErrorSubscriptionManager.subscribe(wrappedListener, options);
}

bridgeEvents();

export default Fullscreen;
