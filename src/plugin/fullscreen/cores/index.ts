import {FullscreenInstance} from "../types";
import Platform from "../../platform/cores";
import {OS} from "../../platform/constants";
import createSubscriptionManager from "../../../utils/create-subscription-manager";
import EventListener from "../../../utils/event-listener";
import {SubscriptionManager} from "../../../types/subscription-manager";
import {NotSupportedError} from "../../../errors/not-supported-error";

declare global {
    interface HTMLVideoElement {
        webkitEnterFullscreen?: () => void;
        webkitExitFullscreen?: () => void;
        webkitSupportsFullscreen?: boolean;
        webkitDisplayingFullscreen?: boolean;
        onwebkitbeginfullscreen?: ((this: HTMLVideoElement, ev: Event) => any) | null;
        onwebkitendfullscreen?: ((this: HTMLVideoElement, ev: Event) => any) | null;

        [key: symbol]: boolean | undefined;
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

const FS_BRIDGED_KEY: unique symbol = Symbol('fsBridged');

type FullscreenRequestMethod = (this: any, options?: FullscreenOptions) => Promise<void> | void;
type FullscreenExitMethod = (this: Document) => Promise<void> | void;

interface PendingEntry {
    operation: 'request' | 'exit';
    target: Element | undefined;
    options: FullscreenOptions | undefined;
    resolve: () => void;
    reject: (error: Error) => void;
}

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

function createFullscreen(): FullscreenInstance {
    let lastIOSVideo: HTMLVideoElement | null = null;
    let eventsBridged: boolean = false;
    let activeOperation: Promise<void> | null = null;
    let pendingQueue: PendingEntry[] = [];
    let lastIntendedOperation: 'request' | 'exit' = 'exit';

    const onChangeSubscriptionManager: SubscriptionManager<FullscreenInstance, Event> = createSubscriptionManager<FullscreenInstance, Event>(attachOnChange, detachOnChange);
    const onErrorSubscriptionManager: SubscriptionManager<FullscreenInstance, Event> = createSubscriptionManager<FullscreenInstance, Event>(attachOnError, detachOnError);

    function getDefaultTarget(): Element | undefined {
        if (Platform.os.name === OS.iOS) {
            const video: HTMLVideoElement | null = globalThis.document.querySelector('video');

            if (video === null) return undefined;

            return video;
        }

        return globalThis.document.documentElement;
    }

    function bridgeEvents(): void {
        if (eventsBridged) return;

        eventsBridged = true;

        if (Platform.os.name === OS.iOS) {
            bridgeIOSVideoEvents();

            if (typeof globalThis.MutationObserver !== 'undefined') {
                const observer = new MutationObserver(function (): void {
                    bridgeIOSVideoEvents();
                });

                observer.observe(globalThis.document.documentElement, {
                    childList: true,
                    subtree: true,
                });
            }
        }
    }

    function bridgeIOSVideoEvents(): void {
        if (typeof globalThis.document === 'undefined') return;

        const videos: NodeListOf<HTMLVideoElement> = globalThis.document.querySelectorAll('video');

        videos.forEach(function (video: HTMLVideoElement): void {
            if (video[FS_BRIDGED_KEY] === true || !(typeof video.webkitEnterFullscreen !== 'undefined' || typeof video.onwebkitbeginfullscreen !== 'undefined')) return;

            EventListener.add(video, {
                type: 'webkitbeginfullscreen',
                callback: onChangeSubscriptionManager.emit,
                options: false,
            });

            EventListener.add(video, {
                type: 'webkitendfullscreen',
                callback: onChangeSubscriptionManager.emit,
                options: false,
            });

            video[FS_BRIDGED_KEY] = true;
        });
    }

    function attachOnChange(): void {
        const events: string[] = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'];

        for (let i: number = 0; i < events.length; i++) {
            EventListener.add(globalThis.document, {
                type: events[i],
                callback: onChangeSubscriptionManager.emit,
                options: false,
            });
        }
    }

    function detachOnChange(): void {
        const events: string[] = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'];

        for (let i: number = 0; i < events.length; i++) {
            EventListener.remove(globalThis.document, {
                type: events[i],
                callback: onChangeSubscriptionManager.emit,
                options: false,
            });
        }
    }

    function attachOnError(): void {
        const events: string[] = ['fullscreenerror', 'webkitfullscreenerror', 'mozfullscreenerror', 'MSFullscreenError'];

        for (let i: number = 0; i < events.length; i++) {
            EventListener.add(globalThis.document, {
                type: events[i],
                callback: onErrorSubscriptionManager.emit,
                options: false,
            });
        }
    }

    function detachOnError(): void {
        const events: string[] = ['fullscreenerror', 'webkitfullscreenerror', 'mozfullscreenerror', 'MSFullscreenError'];

        for (let i: number = 0; i < events.length; i++) {
            EventListener.remove(globalThis.document, {
                type: events[i],
                callback: onErrorSubscriptionManager.emit,
                options: false,
            });
        }
    }

    function getEnabled(): boolean {
        if (api === null) return (Platform.os.name === OS.iOS && globalThis.HTMLVideoElement.prototype.webkitSupportsFullscreen === true);

        return globalThis.document[api.enabled] === true;
    }

    function getElement(): Element | null {
        if (api === null) {
            if (lastIOSVideo !== null && lastIOSVideo.webkitDisplayingFullscreen === true) return lastIOSVideo;

            return null;
        }

        const currentElement: Document[keyof Document] = globalThis.document[api.element];

        if (typeof currentElement !== 'undefined') return currentElement as Element;

        return null;
    }

    function getIsFullscreen(): boolean {
        return getElement() !== null;
    }

    function drainPendingOperation(): void {
        const entry: PendingEntry | undefined = pendingQueue.shift();

        if (typeof entry === 'undefined') {
            activeOperation = null;
            return;
        }

        let next: Promise<void>;

        if (entry.operation === 'request') next = requestImmediately(entry.target, entry.options);
        else next = exitImmediately();

        activeOperation = next
            .then(function (): void {
                entry.resolve();
                drainPendingOperation();
            })
            .catch(function (error: Error): void {
                entry.reject(error);
                drainPendingOperation();
            });
    }

    function request(target?: Element, options?: FullscreenOptions): Promise<void> {
        lastIntendedOperation = 'request';

        if (activeOperation === null) {
            const next: Promise<void> = requestImmediately(target, options);

            activeOperation = next
                .then(drainPendingOperation)
                .catch(drainPendingOperation);

            return next;
        }

        return new Promise<void>(function (resolve: () => void, reject: () => void): void {
            pendingQueue.push({
                operation: 'request',
                target: target,
                options: options,
                resolve: resolve,
                reject: reject,
            });
        });
    }

    function exit(): Promise<void> {
        lastIntendedOperation = 'exit';

        if (activeOperation === null) {
            const next: Promise<void> = exitImmediately();

            activeOperation = next
                .then(drainPendingOperation)
                .catch(drainPendingOperation);

            return next;
        }

        return new Promise<void>(function (resolve: () => void, reject: () => void): void {
            pendingQueue.push({
                operation: 'exit',
                target: undefined,
                options: undefined,
                resolve: resolve,
                reject: reject,
            });
        });
    }

    function requestImmediately(target?: Element, options?: FullscreenOptions): Promise<void> {
        return new Promise(function (resolve: () => void, reject: (error: Error) => void): void {
            if (typeof target === 'undefined') target = getDefaultTarget();
            if (typeof target === 'undefined') return reject(new NotSupportedError('Failed to enter fullscreen mode.'));

            const tagName: string = target.tagName.toLowerCase();

            function fallbackToIOSVideo(): void {
                if (Platform.os.name === OS.iOS && typeof target !== 'undefined' && target.tagName.toUpperCase() === 'VIDEO') {
                    const video: HTMLVideoElement = target as HTMLVideoElement;

                    if (video.webkitSupportsFullscreen === true && typeof video.webkitEnterFullscreen === 'function') {
                        lastIOSVideo = video;
                        bridgeIOSVideoEvents();
                        video.webkitEnterFullscreen();
                        return resolve();
                    }
                }

                reject(new NotSupportedError('The "' + tagName + '" element does not support fullscreen requests.'));
            }

            if (api !== null) {
                const method: FullscreenRequestMethod | undefined = target[api.request] as FullscreenRequestMethod | undefined;

                if (typeof method === 'function') {
                    const result: void | Promise<void> = method.call(target, options);

                    if (typeof result !== 'undefined' && typeof result.then === 'function') {
                        result
                            .then(resolve)
                            .catch(function (): void {
                                if (Platform.os.name !== OS.iOS) return reject(new NotSupportedError('The "' + tagName + '" element does not support fullscreen requests.'));

                                fallbackToIOSVideo();
                            });
                        return;
                    }

                    return resolve();
                }
            }

            fallbackToIOSVideo();
        });
    }

    function exitImmediately(): Promise<void> {
        return new Promise(function (resolve: () => void, reject: (error: Error) => void): void {

            if (getElement() === null && lastIOSVideo === null) return resolve();

            function fallbackToIOSVideo(): void {
                if (Platform.os.name === OS.iOS) {
                    let candidates: HTMLVideoElement[] | NodeListOf<HTMLVideoElement>;

                    if (lastIOSVideo !== null) candidates = [lastIOSVideo];
                    else candidates = globalThis.document.querySelectorAll<HTMLVideoElement>('video')

                    for (let i: number = 0; i < candidates.length; i++) {
                        const video: HTMLVideoElement = candidates[i];

                        if (typeof video.webkitExitFullscreen === 'function' && video.webkitDisplayingFullscreen === true) {
                            video.webkitExitFullscreen();
                            lastIOSVideo = null;
                            return resolve();
                        }
                    }
                }

                reject(new NotSupportedError('Failed to exit fullscreen mode.'));
            }

            if (api !== null) {
                const method: FullscreenExitMethod | undefined = globalThis.document[api.exit] as FullscreenExitMethod | undefined;

                if (typeof method === 'function') {
                    const result: void | Promise<void> = method.call(globalThis.document);

                    if (typeof result !== 'undefined' && typeof result.then === 'function') {
                        result
                            .then(resolve)
                            .catch(function (): void {
                                if (Platform.os.name !== OS.iOS) return reject(new NotSupportedError('Failed to exit fullscreen mode.'));

                                fallbackToIOSVideo();
                            });
                        return;
                    }

                    return resolve();
                }
            }

            fallbackToIOSVideo();
        });
    }

    function toggle(target?: Element, options?: FullscreenOptions): Promise<void> {
        if (lastIntendedOperation === 'request') return exit();
        return request(target, options);
    }

    bridgeEvents();

    return {
        get supported(): boolean {
            return getEnabled();
        },
        get element(): Element | null {
            return getElement();
        },
        get isFullscreen(): boolean {
            return getIsFullscreen();
        },
        request: request,
        exit: exit,
        toggle: toggle,
        onChange: onChangeSubscriptionManager.subscribe,
        onError: onErrorSubscriptionManager.subscribe,
        Constants: {},
        Errors: {
            NotSupportedError: NotSupportedError,
        },
    };
}

export default createFullscreen();
