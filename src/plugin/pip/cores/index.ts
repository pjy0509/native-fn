import {PipInstance} from "../types";
import createSubscriptionManager from "../../../utils/create-subscription-manager";
import EventListener from "../../../utils/event-listener";
import {SubscriptionManager} from "../../../types/subscription-manager";
import {NotSupportedError} from "../../../errors/not-supported-error";

declare global {
    interface HTMLVideoElement {
        webkitSupportsPresentationMode?: (mode: string) => boolean;
        webkitSetPresentationMode?: (mode: string) => void;
        webkitPresentationMode?: string;
        onwebkitpresentationmodechanged?: ((this: HTMLVideoElement, ev: Event) => any) | null;

        [key: symbol]: boolean | undefined;
    }
}

const PIP_BRIDGED_KEY: unique symbol = Symbol('pipBridged');

type PipRequestMethod = (this: HTMLVideoElement) => Promise<PictureInPictureWindow> | void;
type PipExitMethod = (this: Document) => Promise<void> | void;

interface PendingEntry {
    operation: 'request' | 'exit';
    target: HTMLVideoElement | undefined;
    resolve: () => void;
    reject: (error: Error) => void;
}

const PIP_PRESENTATION_MODE: string = 'picture-in-picture';
const INLINE_PRESENTATION_MODE: string = 'inline';

function hasStandardPipEvents(): boolean {
    return typeof globalThis.document.pictureInPictureEnabled !== 'undefined';
}

function createPip(): PipInstance {
    let lastPipVideo: HTMLVideoElement | null = null;
    let eventsBridged: boolean = false;
    let activeOperation: Promise<void> | null = null;
    let pendingQueue: PendingEntry[] = [];
    let lastIntendedOperation: 'request' | 'exit' = 'exit';

    const onChangeSubscriptionManager: SubscriptionManager<PipInstance, Event> = createSubscriptionManager<PipInstance, Event>(attachOnChange, detachOnChange);
    const onErrorSubscriptionManager: SubscriptionManager<PipInstance, Event> = createSubscriptionManager<PipInstance, Event>(attachOnError, detachOnError);

    function getEnabled(): boolean {
        if (typeof globalThis.document.pictureInPictureEnabled === 'boolean') return globalThis.document.pictureInPictureEnabled;
        if (typeof HTMLVideoElement === 'undefined') return false;

        const videos: NodeListOf<HTMLVideoElement> = globalThis.document.querySelectorAll('video');

        for (let i: number = 0; i < videos.length; i++) {
            const video: HTMLVideoElement = videos[i];

            if (typeof video.webkitSupportsPresentationMode === 'function' && video.webkitSupportsPresentationMode(PIP_PRESENTATION_MODE)) return true;
        }

        return false;
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

    function getDefaultTarget(): HTMLVideoElement | undefined {
        const video: HTMLVideoElement | null = globalThis.document.querySelector('video');

        if (video === null) return undefined;

        return video;
    }

    function onWebkitPresentationModeChanged(this: HTMLVideoElement, event: Event): void {
        if (this.webkitPresentationMode === PIP_PRESENTATION_MODE || (this.webkitPresentationMode === INLINE_PRESENTATION_MODE && lastPipVideo === this)) onChangeSubscriptionManager.emit(event);
    }

    function bridgeEvents(): void {
        if (eventsBridged) return;

        eventsBridged = true;

        if (!hasStandardPipEvents()) {
            bridgeWebkitVideoEvents();

            if (typeof globalThis.MutationObserver !== 'undefined') {
                const observer = new MutationObserver(function (): void {
                    bridgeWebkitVideoEvents();
                });

                observer.observe(globalThis.document.documentElement, {
                    childList: true,
                    subtree: true,
                });
            }
        }
    }

    function bridgeWebkitVideoEvents(): void {
        if (typeof globalThis.document === 'undefined') return;

        const videos: NodeListOf<HTMLVideoElement> = globalThis.document.querySelectorAll('video');

        videos.forEach(function (video: HTMLVideoElement): void {
            if (video[PIP_BRIDGED_KEY] === true || !(typeof video.webkitSetPresentationMode !== 'undefined' || typeof video.onwebkitpresentationmodechanged !== 'undefined')) return;

            EventListener.add(video, {
                type: 'webkitpresentationmodechanged',
                callback: onWebkitPresentationModeChanged,
                options: false,
            });

            video[PIP_BRIDGED_KEY] = true;
        });
    }

    function attachOnChange(): void {
        if (hasStandardPipEvents()) {
            const changeEvents: string[] = ['enterpictureinpicture', 'leavepictureinpicture'];

            for (let i: number = 0; i < changeEvents.length; i++) {
                EventListener.add(globalThis.document, {
                    type: changeEvents[i],
                    callback: onChangeSubscriptionManager.emit,
                    options: false,
                });
            }

            return;
        }

        bridgeWebkitVideoEvents();
    }

    function detachOnChange(): void {
        if (hasStandardPipEvents()) {
            const changeEvents: string[] = ['enterpictureinpicture', 'leavepictureinpicture'];

            for (let i: number = 0; i < changeEvents.length; i++) {
                EventListener.remove(globalThis.document, {
                    type: changeEvents[i],
                    callback: onChangeSubscriptionManager.emit,
                    options: false,
                });
            }

            return;
        }

        const videos: NodeListOf<HTMLVideoElement> = globalThis.document.querySelectorAll('video');

        videos.forEach(function (video: HTMLVideoElement): void {
            EventListener.remove(video, {
                type: 'webkitpresentationmodechanged',
                callback: onWebkitPresentationModeChanged,
                options: false,
            });

            try {
                delete video[PIP_BRIDGED_KEY];
            } catch (_: unknown) {
                video[PIP_BRIDGED_KEY] = undefined;
            }
        });
    }

    function attachOnError(): void {
        EventListener.add(globalThis.document, {
            type: 'pictureinpictureerror',
            callback: onErrorSubscriptionManager.emit,
            options: false,
        });
    }

    function detachOnError(): void {
        EventListener.remove(globalThis.document, {
            type: 'pictureinpictureerror',
            callback: onErrorSubscriptionManager.emit,
            options: false,
        });
    }

    function drainPendingOperation(): void {
        const entry: PendingEntry | undefined = pendingQueue.shift();

        if (typeof entry === 'undefined') {
            activeOperation = null;
            return;
        }

        let next: Promise<void>;

        if (entry.operation === 'request') next = requestImmediately(entry.target);
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

    function request(target?: HTMLVideoElement): Promise<void> {
        lastIntendedOperation = 'request';

        if (activeOperation === null) {
            const next: Promise<void> = requestImmediately(target);

            activeOperation = next
                .then(drainPendingOperation)
                .catch(drainPendingOperation);

            return next;
        }

        return new Promise<void>(function (resolve: () => void, reject: () => void): void {
            pendingQueue.push({
                operation: 'request',
                target: target,
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
                resolve,
                reject,
            });
        });
    }

    function requestImmediately(target?: HTMLVideoElement): Promise<void> {
        return new Promise(function (resolve: () => void, reject: (error: Error) => void): void {
            if (typeof target === 'undefined') target = getDefaultTarget();
            if (typeof target === 'undefined') return reject(new NotSupportedError('Failed to enter Picture-in-Picture mode.'));

            const tagName: string = target.tagName.toLowerCase();

            if (tagName !== 'video') return reject(new NotSupportedError('The "' + tagName + '" element does not support Picture-in-Picture requests.'));

            function fallbackToWebkitVideo(): void {
                if (typeof target !== 'undefined' && typeof target.webkitSupportsPresentationMode === 'function' && target.webkitSupportsPresentationMode(PIP_PRESENTATION_MODE) && typeof target.webkitSetPresentationMode === 'function') {
                    if (target.disablePictureInPicture) return reject(new NotSupportedError('Picture-in-Picture is disabled on this video element.'));

                    lastPipVideo = target;
                    bridgeWebkitVideoEvents();
                    target.webkitSetPresentationMode(PIP_PRESENTATION_MODE);
                    return resolve();
                }

                reject(new NotSupportedError('The "' + tagName + '" element does not support Picture-in-Picture requests.'));
            }

            const method: PipRequestMethod | undefined = target.requestPictureInPicture as PipRequestMethod | undefined;

            if (typeof method === 'function') {
                const result: void | Promise<PictureInPictureWindow> = method.call(target);

                if (typeof result !== 'undefined' && typeof result.then === 'function') {
                    result
                        .then(function (): void {
                            resolve();
                        })
                        .catch(function (): void {
                            fallbackToWebkitVideo();
                        });
                    return;
                }

                return resolve();
            }

            fallbackToWebkitVideo();
        });
    }

    function exitImmediately(): Promise<void> {
        return new Promise(function (resolve: () => void, reject: (error: Error) => void): void {

            if (getElement() === null && lastPipVideo === null) return resolve();

            function fallbackToWebkitVideo(): void {
                let candidates: HTMLVideoElement[] | NodeListOf<HTMLVideoElement>;

                if (lastPipVideo !== null && lastPipVideo.webkitPresentationMode === PIP_PRESENTATION_MODE) candidates = [lastPipVideo];
                else candidates = globalThis.document.querySelectorAll<HTMLVideoElement>('video')

                for (let i: number = 0; i < candidates.length; i++) {
                    const video: HTMLVideoElement = candidates[i];

                    if (typeof video.webkitSetPresentationMode === 'function' && video.webkitPresentationMode === PIP_PRESENTATION_MODE) {
                        video.webkitSetPresentationMode(INLINE_PRESENTATION_MODE);
                        lastPipVideo = null;
                        return resolve();
                    }
                }

                if (getElement() === null) return resolve();

                reject(new NotSupportedError('Failed to exit Picture-in-Picture mode.'));
            }

            const method: PipExitMethod | undefined = globalThis.document.exitPictureInPicture as PipExitMethod | undefined;

            if (typeof method === 'function') {
                const result: void | Promise<void> = method.call(globalThis.document);

                if (typeof result !== 'undefined' && typeof result.then === 'function') {
                    result
                        .then(resolve)
                        .catch(function (): void {
                            fallbackToWebkitVideo();
                        });
                    return;
                }

                return resolve();
            }

            fallbackToWebkitVideo();
        });
    }

    function toggle(target?: HTMLVideoElement): Promise<void> {
        if (lastIntendedOperation === 'request') return exit();
        return request(target);
    }

    bridgeEvents();

    return {
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
        toggle: toggle,
        onChange: onChangeSubscriptionManager.subscribe,
        onError: onErrorSubscriptionManager.subscribe,
        Constants: {},
        Errors: {
            NotSupportedError: NotSupportedError,
        },
    };
}

export default createPip();
