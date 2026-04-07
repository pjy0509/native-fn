import {DimensionInstance, Environment, EnvironmentObserver, DeviceOrientationInstance, DeviceOrientationValue, ScreenOrientationInstance} from "../types";
import type {Dimensions} from "../types";
import {ORIENTATION_MEDIA_QUERY_LIST, Orientation} from "../constants";
import EventListener from "../../../utils/event-listener";
import {SubscriptionManager} from "../../../types/subscription-manager";
import createSubscriptionManager from "../../../utils/create-subscription-manager";
import createEnvironmentObserver from "../utils/create-environment-observer";
import {PermissionNotGrantedError} from "../../../errors/permission-not-granted-error";
import {NotSupportedError} from "../../../errors/not-supported-error";

declare global {
    interface DOMRectReadOnly {
        readonly x: number;
        readonly y: number;
        readonly width: number;
        readonly height: number;
        readonly top: number;
        readonly right: number;
        readonly bottom: number;
        readonly left: number;
    }

    interface VisualViewport {
        readonly segments?: DOMRectReadOnly[];
    }
}

type DeviceOrientationEventWithPermission = typeof DeviceOrientationEvent & {
    requestPermission?: () => Promise<'denied' | 'granted' | 'prompt'>;
};

const safeAreaInsetObserver: EnvironmentObserver<'safe-area-inset'> = createEnvironmentObserver('safe-area-inset');
const safeAreaMaxInsetObserver: EnvironmentObserver<'safe-area-max-inset'> = createEnvironmentObserver('safe-area-max-inset');
const keyboardInsetObserver: EnvironmentObserver<'keyboard-inset'> = createEnvironmentObserver('keyboard-inset');
const titlebarAreaObserver: EnvironmentObserver<'titlebar-area'> = createEnvironmentObserver('titlebar-area');
const viewportSegmentObserver: EnvironmentObserver<'viewport-segment'> = createEnvironmentObserver('viewport-segment');

const onDimensionChangeSubscriptionManager: SubscriptionManager<Dimensions> = createSubscriptionManager<Dimensions>(attachOnDimensionChange, detachOnDimensionChange);
const onScreenOrientationChangeSubscriptionManager: SubscriptionManager<Orientation> = createSubscriptionManager<Orientation>(attachOnScreenOrientationChange, detachOnScreenOrientationChange);
const onDeviceOrientationChangeSubscriptionManager: SubscriptionManager<DeviceOrientationValue> = createSubscriptionManager<DeviceOrientationValue>(attachOnDeviceOrientationChange, detachOnDeviceOrientationChange);

let dimensionRef: Dimensions | null = null;
let screenOrientationRef: Orientation | null = null;
let deviceOrientationRef: DeviceOrientationValue | null = null;

const Dimension: DimensionInstance = {
    get value(): Dimensions {
        return getDimension();
    },
    environment: getEnvironment(),
    screenOrientation: getScreenOrientation(),
    deviceOrientation: getDeviceOrientation(),
    onChange: onDimensionChangeSubscriptionManager.subscribe,
    Constants: {
        Orientation: Orientation,
    },
    Errors: {
        NotSupportedError: NotSupportedError,
        PermissionNotGrantedError: PermissionNotGrantedError,
    },
};

function getOrientation(): Orientation {
    if (typeof globalThis.screen !== 'undefined' && typeof globalThis.screen.orientation !== 'undefined' && typeof globalThis.screen.orientation.type !== 'undefined') {
        switch (globalThis.screen.orientation.type) {
            case 'portrait-primary':
                return Orientation.PortraitPrimary;
            case 'portrait-secondary':
                return Orientation.PortraitSecondary;
            case 'landscape-primary':
                return Orientation.LandscapePrimary;
            case 'landscape-secondary':
                return Orientation.LandscapeSecondary;
        }
    }

    if (typeof globalThis.orientation !== 'undefined') {
        switch (globalThis.orientation) {
            case 0:
                return Orientation.PortraitPrimary;
            case 180:
                return Orientation.PortraitSecondary;
            case 90:
                return Orientation.LandscapePrimary;
            case -90:
            case 270:
                return Orientation.LandscapeSecondary;
        }
    }

    if (ORIENTATION_MEDIA_QUERY_LIST.media === 'not all') throw new NotSupportedError('\'screen.orientation\', \'window.orientation\', and the orientation media query are all unsupported');
    if (ORIENTATION_MEDIA_QUERY_LIST.matches) return Orientation.PortraitPrimary;
    else return Orientation.LandscapePrimary;
}

function getScale(): number {
    if (typeof globalThis.devicePixelRatio !== 'undefined') return globalThis.devicePixelRatio;
    return -1;
}

function getEnvironment(): Environment {
    return {
        safeAreaInset: safeAreaInsetObserver,
        safeAreaMaxInset: safeAreaMaxInsetObserver,
        keyboardInset: keyboardInsetObserver,
        titlebarArea: titlebarAreaObserver,
        viewportSegment: viewportSegmentObserver,
    };
}

function getScreenOrientation(): ScreenOrientationInstance {
    return {
        get supported(): boolean {
            return screenOrientationSupported();
        },
        get value(): Orientation {
            return getOrientation();
        },
        onChange: onScreenOrientationChangeSubscriptionManager.subscribe,
    }
}

function getDeviceOrientation(): DeviceOrientationInstance {
    return {
        get supported(): boolean {
            return deviceOrientationSupported();
        },
        get value(): Promise<DeviceOrientationValue> {
            return getDeviceOrientationValue();
        },
        onChange: onDeviceOrientationChangeSubscriptionManager.subscribe,
    }
}

function getDimension(): Dimensions {
    let innerWidth: number = 0;
    let innerHeight: number = 0;
    let outerWidth: number = 0;
    let outerHeight: number = 0;
    const scale: number = getScale();

    if (typeof globalThis.innerWidth !== 'undefined') {
        innerWidth = globalThis.innerWidth;
        innerHeight = globalThis.innerHeight;
        outerWidth = globalThis.outerWidth;
        outerHeight = globalThis.outerHeight;
    }

    return {
        innerWidth: innerWidth,
        innerHeight: innerHeight,
        outerWidth: outerWidth,
        outerHeight: outerHeight,
        scale: scale,
    };
}

function attachOnDimensionChange(): void {
    dimensionRef = getDimension();

    EventListener.add(globalThis, {type: 'resize', callback: onDimensionChange});
}

function detachOnDimensionChange(): void {
    dimensionRef = null;

    EventListener.remove(globalThis, {type: 'resize', callback: onDimensionChange});
}

function onDimensionChange(): void {
    const dimension: Dimensions = getDimension();

    if (dimensionRef === null || dimension.innerWidth !== dimensionRef.innerWidth || dimension.innerHeight !== dimensionRef.innerHeight || dimension.outerWidth !== dimensionRef.outerWidth || dimension.outerHeight !== dimensionRef.outerHeight || dimension.scale !== dimensionRef.scale) onDimensionChangeSubscriptionManager.emit(dimensionRef = dimension);
}

function screenOrientationSupported(): boolean {
    if (typeof globalThis.screen !== 'undefined' && typeof globalThis.screen.orientation !== 'undefined' && typeof globalThis.screen.orientation.type !== 'undefined') return true;
    if (typeof globalThis.orientation !== 'undefined') return true;
    return ORIENTATION_MEDIA_QUERY_LIST.media !== 'not all';
}

function attachOnScreenOrientationChange(): void {
    if (typeof globalThis.screen !== 'undefined' && typeof globalThis.screen.orientation !== 'undefined' && typeof globalThis.screen.orientation.addEventListener === 'function') return EventListener.add(globalThis.screen.orientation, {
        type: 'change',
        callback: onScreenOrientationChange
    });
    else if (typeof globalThis.orientation !== 'undefined') return EventListener.add(globalThis, {type: 'orientationchange', callback: onScreenOrientationChange});
    else if (ORIENTATION_MEDIA_QUERY_LIST.media !== 'not all') return EventListener.add(ORIENTATION_MEDIA_QUERY_LIST, {type: 'change', callback: onScreenOrientationChange});

    throw new NotSupportedError('\'screen.orientation\', \'window.orientation\', and the orientation media query are all unsupported');
}

function detachOnScreenOrientationChange(): void {
    if (typeof globalThis.screen !== 'undefined' && typeof globalThis.screen.orientation !== 'undefined' && typeof globalThis.screen.orientation.removeEventListener === 'function') return EventListener.remove(globalThis.screen.orientation, {
        type: 'change',
        callback: onScreenOrientationChange
    });
    else if (typeof globalThis.orientation !== 'undefined') return EventListener.remove(globalThis, {type: 'orientationchange', callback: onScreenOrientationChange});
    else if (ORIENTATION_MEDIA_QUERY_LIST.media !== 'not all') return EventListener.remove(ORIENTATION_MEDIA_QUERY_LIST, {type: 'change', callback: onScreenOrientationChange});

    throw new NotSupportedError('\'screen.orientation\', \'window.orientation\', and the orientation media query are all unsupported');
}

function onScreenOrientationChange(): void {
    const orientation: Orientation = getOrientation();

    if (screenOrientationRef === null || orientation !== screenOrientationRef) onScreenOrientationChangeSubscriptionManager.emit(screenOrientationRef = orientation);
}

function deviceOrientationSupported(): boolean {
    return typeof globalThis.DeviceOrientationEvent !== 'undefined';
}

function attachOnDeviceOrientationChange(): Promise<void> {
    return new Promise(function (resolve: () => void, reject: (error: Error) => void): void {
        if (!deviceOrientationSupported()) return reject(new NotSupportedError('\'window.DeviceOrientationEvent\' does not supported.'));

        const DeviceOrientationEventWithPermission: DeviceOrientationEventWithPermission = DeviceOrientationEvent as DeviceOrientationEventWithPermission;

        if (typeof DeviceOrientationEventWithPermission.requestPermission === 'function') {
            DeviceOrientationEventWithPermission.requestPermission().then(function (permission: PermissionState): void {
                if (permission === 'granted') {
                    EventListener.add(globalThis, {type: 'deviceorientation', callback: onDeviceOrientationChange});
                    return resolve();
                }

                return reject(new PermissionNotGrantedError('\'deviceorientation\' permission is not granted.'));
            }).catch(function (_: unknown): void {
                return reject(new NotSupportedError('\'window.DeviceOrientationEvent\' does not supported.'));
            });
        } else {
            EventListener.add(globalThis, {type: 'deviceorientation', callback: onDeviceOrientationChange});
            return resolve();
        }
    })
}

function detachOnDeviceOrientationChange(): void {
    EventListener.remove(globalThis, {type: 'deviceorientation', callback: onDeviceOrientationChange});
}

function onDeviceOrientationChange(event: DeviceOrientationEvent): void {
    deviceOrientationRef = {
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma,
        absolute: event.absolute,
    };

    onDeviceOrientationChangeSubscriptionManager.emit(deviceOrientationRef);
}

function getDeviceOrientationValue(): Promise<DeviceOrientationValue> {
    return new Promise(function (resolve: (value: DeviceOrientationValue) => void, reject: (error: Error) => void): void {
        if (deviceOrientationRef !== null) return resolve(deviceOrientationRef);
        if (!deviceOrientationSupported()) return reject(new NotSupportedError('\'window.DeviceOrientationEvent\' does not supported.'));

        const DeviceOrientationEventWithPermission: DeviceOrientationEventWithPermission = DeviceOrientationEvent as DeviceOrientationEventWithPermission;

        const callback: (event: DeviceOrientationEvent) => void = function (event: DeviceOrientationEvent): void {
            const value: DeviceOrientationValue = {
                alpha: event.alpha,
                beta: event.beta,
                gamma: event.gamma,
                absolute: event.absolute,
            };

            deviceOrientationRef = value;
            EventListener.remove(globalThis, {type: 'deviceorientation', callback});
            return resolve(value);
        };

        if (typeof DeviceOrientationEventWithPermission.requestPermission === 'function') {
            DeviceOrientationEventWithPermission.requestPermission().then(function (permission: PermissionState): void {
                if (permission === 'granted') {
                    EventListener.add(globalThis, {type: 'deviceorientation', callback});
                    return;
                }

                return reject(new PermissionNotGrantedError('\'deviceorientation\' permission is not granted.'));
            }).catch(function (_: unknown): void {
                return reject(new NotSupportedError('\'window.DeviceOrientationEvent\' does not supported.'));
            });
        } else {
            EventListener.add(globalThis, {type: 'deviceorientation', callback});
            return;
        }
    });
}

export default Dimension;
