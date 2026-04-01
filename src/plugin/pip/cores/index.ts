import {PipEventPayload, PipInstance} from "../types";
import createSubscriptionManager from "../../../utils/create-subscription-manager";
import EventListener from "../../../utils/event-listener";
import {SubscriptionManager} from "../../../types/subscription-manager";
import {NotSupportedError} from "../../../errors/not-supported-error";
import {InvalidStateError} from "../../../errors/invalid-state-error";
import Platform, {Browsers, OS} from "../../platform";

declare global {
    interface HTMLVideoElement {
        webkitSupportsPresentationMode?(mode: string): boolean;

        webkitSetPresentationMode?(mode: string): void;

        webkitPresentationMode?: string;
        onwebkitpresentationmodechanged?: ((this: Element, ev: Event) => any) | null;
    }

    var __nativeFnPipBridgeKey__: symbol | undefined;
}

interface BridgedHTMLVideoElement extends HTMLVideoElement {
    [key: string | symbol]: unknown;
}

type PipRequestMethod = (this: HTMLVideoElement) => Promise<PictureInPictureWindow> | void;
type PipExitMethod = (this: Document) => Promise<void> | void;

const PIP_PRESENTATION_MODE: string = 'picture-in-picture';
const INLINE_PRESENTATION_MODE: string = 'inline';

let videoElement: HTMLVideoElement | null = null;
let lastFallbackVideoElement: HTMLVideoElement | null = null;
let eventsBridged: boolean = false;

const PIP_BRIDGE_KEY: string | symbol = (function (): string | symbol {
    if (typeof Symbol === 'function') {
        const existing: unknown = globalThis.__nativeFnPipBridgeKey__;

        if (typeof existing === 'symbol') return existing;

        return globalThis.__nativeFnPipBridgeKey__ = Symbol('native.fn.pip.bridged');
    }

    return '__nativeFnPipBridged__';
}());

const onChangeSubscriptionManager: SubscriptionManager<PipInstance, PipEventPayload> = createSubscriptionManager<PipInstance, PipEventPayload>(attachOnChange, detachOnChange);
const onErrorSubscriptionManager: SubscriptionManager<PipInstance, PipEventPayload> = createSubscriptionManager<PipInstance, PipEventPayload>(attachOnError, detachOnError);

const Pip: PipInstance = {
    get supported(): boolean {
        return getSupported();
    },
    get element(): HTMLVideoElement | null {
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
    return typeof globalThis.document.pictureInPictureEnabled !== 'undefined';
}

function hasWebkitApi(): boolean {
    return typeof getHTMLVideoElement().webkitSetPresentationMode === 'function';
}

function getDefaultTarget(): HTMLVideoElement | undefined {
    const video: HTMLVideoElement | null = globalThis.document.querySelector('video');

    if (video !== null) return video;
    return undefined;
}

function createPipEventPayload(nativeEvent: Event, element: HTMLVideoElement, isActive: boolean): PipEventPayload {
    return {
        nativeEvent: nativeEvent,
        element: element,
        isActive: isActive
    };
}

function emitChange(nativeEvent: Event, element: HTMLVideoElement, isActive: boolean): void {
    onChangeSubscriptionManager.emit(createPipEventPayload(nativeEvent, element, isActive));
}

function emitError(nativeEvent: Event, element: HTMLVideoElement, isActive: boolean): void {
    onErrorSubscriptionManager.emit(createPipEventPayload(nativeEvent, element, isActive));
}

function onEnterPictureInPicture(event: Event): void {
    const target: EventTarget | null = event.target;

    if (target instanceof globalThis.HTMLVideoElement) emitChange(event, target, true);
}

function onLeavePictureInPicture(event: Event): void {
    const target: EventTarget | null = event.target;

    if (target instanceof globalThis.HTMLVideoElement) emitChange(event, target, false);
}

function onPictureInPictureError(event: Event): void {
    const target: EventTarget | null = event.target;

    if (target instanceof globalThis.HTMLVideoElement) emitError(event, target, getIsActive());
}

function onWebkitPresentationModeChanged(this: HTMLVideoElement, event: Event): void {
    if (this.webkitPresentationMode === PIP_PRESENTATION_MODE) {
        lastFallbackVideoElement = this;
        emitChange(event, this, true);
        return;
    }

    if (this.webkitPresentationMode === INLINE_PRESENTATION_MODE && lastFallbackVideoElement === this) {
        lastFallbackVideoElement = null;
        emitChange(event, this, false);
    }
}

function bridgeSingleVideoNode(video: BridgedHTMLVideoElement): void {
    if (video[PIP_BRIDGE_KEY]) return;
    if (typeof video.webkitSetPresentationMode === 'undefined' && typeof video.onwebkitpresentationmodechanged === 'undefined') return;

    EventListener.add(video, {type: 'webkitpresentationmodechanged', callback: onWebkitPresentationModeChanged, options: false});

    video[PIP_BRIDGE_KEY] = true;
}

function bridgeWebkitVideoEvents(): void {
    const videos: NodeListOf<HTMLVideoElement> = globalThis.document.querySelectorAll('video');

    for (let i: number = 0; i < videos.length; i++) bridgeSingleVideoNode(videos[i] as BridgedHTMLVideoElement);
}

function bridgeEvents(): void {
    if (eventsBridged) return;

    eventsBridged = true;

    if (hasStandardApi() && !hasWebkitApi()) return;

    bridgeWebkitVideoEvents();

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
    if (hasStandardApi()) {
        EventListener.add(globalThis.document, {type: 'enterpictureinpicture', callback: onEnterPictureInPicture, options: false});
        EventListener.add(globalThis.document, {type: 'leavepictureinpicture', callback: onLeavePictureInPicture, options: false});
        return;
    }

    bridgeWebkitVideoEvents();
}

function detachOnChange(): void {
    if (hasStandardApi()) {
        EventListener.remove(globalThis.document, {type: 'enterpictureinpicture', callback: onEnterPictureInPicture, options: false});
        EventListener.remove(globalThis.document, {type: 'leavepictureinpicture', callback: onLeavePictureInPicture, options: false});
        return;
    }

    const videos: NodeListOf<HTMLVideoElement> = globalThis.document.querySelectorAll('video');

    for (let i: number = 0; i < videos.length; i++) {
        EventListener.remove(videos[i], {type: 'webkitpresentationmodechanged', callback: onWebkitPresentationModeChanged, options: false});
        (videos[i] as BridgedHTMLVideoElement)[PIP_BRIDGE_KEY] = false;
    }
}

function attachOnError(): void {
    EventListener.add(globalThis.document, {type: 'pictureinpictureerror', callback: onPictureInPictureError, options: false});
}

function detachOnError(): void {
    EventListener.remove(globalThis.document, {type: 'pictureinpictureerror', callback: onPictureInPictureError, options: false});
}

function getSupported(): boolean {
    if (typeof globalThis.document.pictureInPictureEnabled === 'boolean') return globalThis.document.pictureInPictureEnabled;

    let video: HTMLVideoElement = getHTMLVideoElement();

    return typeof video.webkitSupportsPresentationMode === 'function' && video.webkitSupportsPresentationMode(PIP_PRESENTATION_MODE);
}

function getElement(): HTMLVideoElement | null {
    const currentElement: Element | null | undefined = globalThis.document.pictureInPictureElement;

    if (currentElement !== null && typeof currentElement !== 'undefined') return currentElement as HTMLVideoElement;
    if (lastFallbackVideoElement !== null && lastFallbackVideoElement.webkitPresentationMode === PIP_PRESENTATION_MODE) return lastFallbackVideoElement;

    return null;
}

function getIsActive(): boolean {
    return getElement() !== null;
}

function request(this: PipInstance, target?: HTMLVideoElement): Promise<void> {
    return new Promise(function (resolve: () => void, reject: (error: Error) => void): void {
        if (typeof target === 'undefined') target = getDefaultTarget();
        if (typeof target === 'undefined') return reject(new NotSupportedError('Failed to enter Picture-in-Picture mode.'));
        if (getIsActive() && getElement() !== target && Platform.browser.name === Browsers.Safari && Platform.os.name === OS.iOS) return reject(new NotSupportedError('There is already a Picture-in-Picture element in this document.'));

        const tagName: string = target.tagName.toLowerCase();

        if (tagName !== 'video') return reject(new NotSupportedError('The "' + tagName + '" element does not support Picture-in-Picture requests.'));

        const method: PipRequestMethod | undefined = target.requestPictureInPicture as PipRequestMethod | undefined;
        const isWebkitPipActive: boolean = lastFallbackVideoElement !== null && lastFallbackVideoElement.webkitPresentationMode === PIP_PRESENTATION_MODE;

        if (typeof method === 'function' && !hasWebkitApi() && !isWebkitPipActive) {
            const result: void | Promise<PictureInPictureWindow> = method.call(target);

            if (typeof result !== 'undefined' && typeof result.then === 'function') {
                result
                    .then(resolve)
                    .catch(function (): void {
                        try {
                            fallbackToWebkit();
                        } catch (e: unknown) {
                            reject(new NotSupportedError('The "' + tagName + '" element does not support Picture-in-Picture requests.'));
                        }
                    });
                return;
            }

            return resolve();
        }

        function fallbackToWebkit(): void {
            if (typeof target !== 'undefined' && typeof target.webkitSupportsPresentationMode === 'function' && target.webkitSupportsPresentationMode(PIP_PRESENTATION_MODE) && typeof target.webkitSetPresentationMode === 'function') {
                if (target.disablePictureInPicture) return reject(new NotSupportedError('Picture-in-Picture is disabled on this element.'));

                bridgeSingleVideoNode(target as BridgedHTMLVideoElement);
                target.webkitSetPresentationMode(PIP_PRESENTATION_MODE);

                return resolve();
            }

            reject(new NotSupportedError('The "' + tagName + '" element does not support Picture-in-Picture requests.'));
        }

        fallbackToWebkit();
    });
}

function exit(this: PipInstance): Promise<void> {
    return new Promise(function (resolve: () => void, reject: (error: Error) => void): void {
        const method: PipExitMethod | undefined = globalThis.document.exitPictureInPicture as PipExitMethod | undefined;

        if (typeof method === 'function' && !hasWebkitApi()) {
            const result: void | Promise<void> = method.call(globalThis.document);

            if (typeof result !== 'undefined' && typeof result.then === 'function') {
                result
                    .then(resolve)
                    .catch(function (): void {
                        try {
                            fallbackToWebkit();
                        } catch (e: unknown) {
                            reject(new NotSupportedError('Failed to exit Picture-in-Picture mode.'));
                        }
                    });
                return;
            }

            return resolve();
        }

        function fallbackToWebkit(): void {
            if (lastFallbackVideoElement !== null && typeof lastFallbackVideoElement.webkitSetPresentationMode === 'function') {
                lastFallbackVideoElement.webkitSetPresentationMode(INLINE_PRESENTATION_MODE);

                return resolve();
            }

            const videos: NodeListOf<HTMLVideoElement> = globalThis.document.querySelectorAll('video');

            for (let i: number = 0; i < videos.length; i++) {
                const video: HTMLVideoElement = videos[i];

                if (typeof video.webkitSetPresentationMode === 'function' && video.webkitPresentationMode === PIP_PRESENTATION_MODE) {
                    video.webkitSetPresentationMode(INLINE_PRESENTATION_MODE);

                    return resolve();
                }
            }

            return resolve();
        }

        fallbackToWebkit();
    });
}

function toggle(this: PipInstance, target?: HTMLVideoElement): Promise<void> {
    const current: HTMLVideoElement | null = getElement();

    if (typeof target !== 'undefined') {
        if (current === target) return this.exit();
        else return this.request(target);
    }

    if (current !== null) return this.exit();
    else return this.request(target);
}

function onChange(this: PipInstance, listener: (payload: PipEventPayload) => void, options?: AddEventListenerOptions): () => void;
function onChange(this: PipInstance, target: HTMLVideoElement, listener: (payload: PipEventPayload) => void, options?: AddEventListenerOptions): () => void;
function onChange(this: PipInstance, targetOrListener: HTMLVideoElement | ((payload: PipEventPayload) => void), listenerOrOptions?: ((payload: PipEventPayload) => void) | AddEventListenerOptions, options?: AddEventListenerOptions): () => void {
    if (typeof targetOrListener === 'function') return onChangeSubscriptionManager.subscribe(targetOrListener, listenerOrOptions as AddEventListenerOptions | undefined);

    const target: HTMLVideoElement = targetOrListener;
    const listener: (payload: PipEventPayload) => void = listenerOrOptions as (payload: PipEventPayload) => void;

    function wrappedListener(payload: PipEventPayload) {
        if (payload.element === target) listener(payload);
    }

    return onChangeSubscriptionManager.subscribe(wrappedListener, options);
}

function onError(listener: (payload: PipEventPayload) => void, options?: AddEventListenerOptions): () => void;
function onError(target: HTMLVideoElement, listener: (payload: PipEventPayload) => void, options?: AddEventListenerOptions): () => void;
function onError(targetOrListener: HTMLVideoElement | ((payload: PipEventPayload) => void), listenerOrOptions?: ((payload: PipEventPayload) => void) | AddEventListenerOptions, options?: AddEventListenerOptions): () => void {
    if (typeof targetOrListener === 'function') return onErrorSubscriptionManager.subscribe(targetOrListener, listenerOrOptions as AddEventListenerOptions | undefined);

    const target: HTMLVideoElement = targetOrListener;
    const listener: (payload: PipEventPayload) => void = listenerOrOptions as (payload: PipEventPayload) => void;

    function wrappedListener(payload: PipEventPayload) {
        if (payload.element === target) listener(payload);
    }

    return onErrorSubscriptionManager.subscribe(wrappedListener, options);
}

bridgeEvents();

export default Pip;
