import {DimensionInstance, Environment, EnvironmentPresetKey, EnvironmentPresetValues} from "../types";
import type {Dimensions} from "../types";
import {FALLBACK_DIMENSION, MEDIA_QUERY_LIST, Orientation} from "../constants";
import EventListener from "../../../utils/event-listener";
import {SubscriptionManager} from "../../../types/subscription-manager";
import createSubscriptionManager from "../../../utils/create-subscription-manager";
import createEnvObserver, {EnvObserver} from "../utils/create-env-observer";

const safeAreaInsetObserver: EnvObserver<'safe-area-inset'> = createEnvObserver('safe-area-inset');
const safeAreaMaxInsetObserver: EnvObserver<'safe-area-max-inset'> = createEnvObserver('safe-area-max-inset');
const keyboardInsetObserver: EnvObserver<'keyboard-inset'> = createEnvObserver('keyboard-inset');
const titlebarAreaObserver: EnvObserver<'titlebar-area'> = createEnvObserver('titlebar-area');
const viewportSegmentObserver: EnvObserver<'viewport-segment'> = createEnvObserver('viewport-segment');
const onChangeSubscriptionManager: SubscriptionManager<DimensionInstance, Dimensions> = createSubscriptionManager<DimensionInstance, Dimensions>(attachOnChange, detachOnChange);
let dimensionRef: Dimensions | null = null;

const Dimension: DimensionInstance = {
    get value(): Dimensions {
        return getDimension();
    },
    environment: getEnvironment(),
    onChange: onChangeSubscriptionManager.subscribe,
    Constants: {
        Orientation: Orientation,
    },
    Errors: {},
};

function getOrientation(): Orientation {
    if (typeof globalThis.screen !== 'undefined') {
        switch (globalThis.screen.orientation.type) {
            case 'portrait-primary':
            case 'portrait-secondary':
                return Orientation.Portrait;
            case 'landscape-primary':
            case 'landscape-secondary':
                return Orientation.Landscape;
        }
    }

    if (typeof globalThis.orientation !== 'undefined') {
        switch (globalThis.orientation) {
            case 0:
            case 180:
                return Orientation.Portrait;
            case 90:
            case 270:
                return Orientation.Landscape;
        }
    }

    if (MEDIA_QUERY_LIST.media === 'not all') return Orientation.Unknown;
    else if (MEDIA_QUERY_LIST.matches) return Orientation.Portrait;
    else return Orientation.Landscape;
}

function getScale(): number {
    if (typeof globalThis.devicePixelRatio !== 'undefined') return globalThis.devicePixelRatio;
    return -1;
}

function getEnvironment(): Environment {
    return {
        safeAreaInset: {
            get value(): EnvironmentPresetValues<'safe-area-inset'> {
                return safeAreaInsetObserver.get();
            },
            onChange: safeAreaInsetObserver.onChange,
        },
        safeAreaMaxInset: {
            get value(): EnvironmentPresetValues<'safe-area-max-inset'> {
                return safeAreaMaxInsetObserver.get();
            },
            onChange: safeAreaMaxInsetObserver.onChange,
        },
        keyboardInset: {
            get value(): EnvironmentPresetValues<'keyboard-inset'> {
                return keyboardInsetObserver.get();
            },
            onChange: keyboardInsetObserver.onChange,
        },
        titlebarArea: {
            get value(): EnvironmentPresetValues<'titlebar-area'> {
                return titlebarAreaObserver.get();
            },
            onChange: titlebarAreaObserver.onChange,
        },
        viewportSegment: {
            get value(): EnvironmentPresetValues<'viewport-segment'> {
                return viewportSegmentObserver.get();
            },
            onChange: viewportSegmentObserver.onChange,
        },
    };
}

function getDimension(): Dimensions {
    if (typeof globalThis.innerWidth !== 'undefined') {
        return {
            innerWidth: globalThis.innerWidth,
            innerHeight: globalThis.innerHeight,
            outerWidth: globalThis.outerWidth,
            outerHeight: globalThis.outerHeight,
            scale: getScale(),
            orientation: getOrientation(),
        };
    }

    return FALLBACK_DIMENSION;
}

function attachOnChange(): void {
    dimensionRef = getDimension();

    EventListener.add(globalThis, {type: 'resize', callback: onResize});

    if (typeof globalThis.screen.orientation.addEventListener === 'function') EventListener.add(globalThis.screen.orientation, {type: 'change', callback: onResize});
    else if (typeof globalThis.orientation !== 'undefined') EventListener.add(globalThis, {type: 'orientationChange', callback: onResize});
    else if (MEDIA_QUERY_LIST.media !== 'not all') EventListener.add(MEDIA_QUERY_LIST, {type: 'change', callback: onResize});
}

function detachOnChange(): void {
    dimensionRef = null;

    EventListener.remove(globalThis, {type: 'resize', callback: onResize});

    if (typeof globalThis.screen.orientation.removeEventListener === 'function') EventListener.remove(globalThis.screen.orientation, {type: 'change', callback: onResize});
    else if (typeof globalThis.orientation !== 'undefined') EventListener.remove(globalThis, {type: 'orientationChange', callback: onResize});
    else if (MEDIA_QUERY_LIST.media !== 'not all') EventListener.remove(MEDIA_QUERY_LIST, {type: 'change', callback: onResize});
}

function onResize(): void {
    const dimension: Dimensions = getDimension();

    if (dimensionRef === null || dimension.innerWidth !== dimensionRef.innerWidth || dimension.innerHeight !== dimensionRef.innerHeight || dimension.outerWidth !== dimensionRef.outerWidth || dimension.outerHeight !== dimensionRef.outerHeight || dimension.scale !== dimensionRef.scale || dimension.orientation !== dimensionRef.orientation) onChangeSubscriptionManager.emit(dimensionRef = dimension);
}

export default Dimension;
