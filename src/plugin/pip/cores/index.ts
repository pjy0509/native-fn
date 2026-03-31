import {PipEventPayload, PipInstance} from "../types";
import createSubscriptionManager from "../../../utils/create-subscription-manager";
import EventListener from "../../../utils/event-listener";
import {SubscriptionManager} from "../../../types/subscription-manager";
import {NotSupportedError} from "../../../errors/not-supported-error";
import {InvalidStateError} from "../../../errors/invalid-state-error";

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

let lastPipVideo: HTMLVideoElement | null = null;
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
        return getEnabled();
    },
    get element(): HTMLVideoElement | null {
        return getElement();
    },
    get isPip(): boolean {
        return getIsPip();
    },
    request: request,
    exit: exit,
    onChange: onChangeSubscriptionManager.subscribe,
    onError: onErrorSubscriptionManager.subscribe,
    Constants: {},
    Errors: {
        NotSupportedError: NotSupportedError,
        InvalidStateError: InvalidStateError,
    },
};

function hasStandardApi(): boolean {
    return typeof globalThis.document.pictureInPictureEnabled !== 'undefined';
}

function getDefaultTarget(): HTMLVideoElement | undefined {
    const video: HTMLVideoElement | null = globalThis.document.querySelector('video');

    return video !== null ? video : undefined;
}

function createPipEventPayload(nativeEvent: Event, element: HTMLVideoElement, isPip: boolean): PipEventPayload {
    return {
        nativeEvent: nativeEvent,
        element: element,
        isPip: isPip
    };
}

function emitChange(nativeEvent: Event, element: HTMLVideoElement, isPip: boolean): void {
    onChangeSubscriptionManager.emit(createPipEventPayload(nativeEvent, element, isPip));
}

function emitError(nativeEvent: Event, element: HTMLVideoElement, isPip: boolean): void {
    onErrorSubscriptionManager.emit(createPipEventPayload(nativeEvent, element, isPip));
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

    if (target instanceof globalThis.HTMLVideoElement) emitError(event, target, getIsPip());
}

function onWebkitPresentationModeChanged(this: HTMLVideoElement, event: Event): void {
    if (this.webkitPresentationMode === PIP_PRESENTATION_MODE) {
        lastPipVideo = this;
        emitChange(event, this, true);
        return;
    }

    if (this.webkitPresentationMode === INLINE_PRESENTATION_MODE && lastPipVideo === this) {
        lastPipVideo = null;
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

    if (hasStandardApi()) return;

    bridgeWebkitVideoEvents();

    if (typeof globalThis.MutationObserver === 'undefined') return;

    const observer: MutationObserver = new globalThis.MutationObserver(function (records: MutationRecord[]): void {
        if (lastPipVideo !== null) {
            let removed: boolean = false;

            for (let i: number = 0; i < records.length; i++) {
                const removedNodes: NodeList = records[i].removedNodes;

                for (let j: number = 0; j < removedNodes.length; j++) {
                    const node: Node = removedNodes[j];

                    if (node === lastPipVideo || (node.nodeType === Node.ELEMENT_NODE && (node as Element).contains(lastPipVideo))) {
                        removed = true;
                        break;
                    }
                }

                if (removed) break;
            }

            if (removed && !globalThis.document.contains(lastPipVideo)) lastPipVideo = null;
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

function getEnabled(): boolean {
    if (typeof globalThis.document.pictureInPictureEnabled === 'boolean') return globalThis.document.pictureInPictureEnabled;

    let video: HTMLVideoElement;
    const selected: HTMLVideoElement | null = globalThis.document.querySelector('video');

    if (selected !== null) video = selected;
    else video = globalThis.document.createElement('video');

    return typeof video.webkitSupportsPresentationMode === 'function' && video.webkitSupportsPresentationMode(PIP_PRESENTATION_MODE);
}

function getElement(): HTMLVideoElement | null {
    const currentElement: Element | null | undefined = globalThis.document.pictureInPictureElement;

    if (currentElement !== null && typeof currentElement !== 'undefined') return currentElement as HTMLVideoElement;
    if (lastPipVideo !== null && lastPipVideo.webkitPresentationMode === PIP_PRESENTATION_MODE) return lastPipVideo;

    return null;
}

function getIsPip(): boolean {
    return getElement() !== null;
}

function request(this: PipInstance, target?: HTMLVideoElement): Promise<void> {
    return new Promise(function (resolve: () => void, reject: (error: Error) => void): void {
        if (typeof target === 'undefined') target = getDefaultTarget();
        if (typeof target === 'undefined') return reject(new NotSupportedError('Failed to enter Picture-in-Picture mode.'));

        const tagName: string = target.tagName.toLowerCase();

        if (tagName !== 'video') return reject(new NotSupportedError('The "' + tagName + '" element does not support Picture-in-Picture requests.'));

        const method: PipRequestMethod | undefined = target.requestPictureInPicture as PipRequestMethod | undefined;
        const isWebkitPipActive: boolean = lastPipVideo !== null && lastPipVideo.webkitPresentationMode === PIP_PRESENTATION_MODE;

        if (typeof method === 'function' && !isWebkitPipActive) {
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
                if (!hasStandardApi()) bridgeSingleVideoNode(target as BridgedHTMLVideoElement);

                target.webkitSetPresentationMode(PIP_PRESENTATION_MODE);

                if (target.webkitPresentationMode !== PIP_PRESENTATION_MODE) return reject(new InvalidStateError('Picture-in-Picture transition is already in progress.'));

                lastPipVideo = target;

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

        if (typeof method === 'function') {
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
            if (lastPipVideo !== null && typeof lastPipVideo.webkitSetPresentationMode === 'function' && lastPipVideo.webkitPresentationMode === PIP_PRESENTATION_MODE) {
                lastPipVideo.webkitSetPresentationMode(INLINE_PRESENTATION_MODE);
                lastPipVideo = null;

                return resolve();
            }

            const videos: NodeListOf<HTMLVideoElement> = globalThis.document.querySelectorAll('video');

            for (let i: number = 0; i < videos.length; i++) {
                const video: HTMLVideoElement = videos[i];

                if (typeof video.webkitSetPresentationMode === 'function' && video.webkitPresentationMode === PIP_PRESENTATION_MODE) {
                    video.webkitSetPresentationMode(INLINE_PRESENTATION_MODE);
                    lastPipVideo = null;

                    return resolve();
                }
            }

            if (globalThis.document.pictureInPictureElement === null || typeof globalThis.document.pictureInPictureElement === 'undefined') return resolve();

            reject(new NotSupportedError('Failed to exit Picture-in-Picture mode.'));
        }

        fallbackToWebkit();
    });
}

bridgeEvents();

export default Pip;
