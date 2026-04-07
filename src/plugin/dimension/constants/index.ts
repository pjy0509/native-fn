import {FALLBACK_MEDIA_QUERY_LIST} from "../../../constants";

export enum Orientation {
    PortraitPrimary = 'portrait-primary',
    PortraitSecondary = 'portrait-secondary',
    LandscapePrimary = 'landscape-primary',
    LandscapeSecondary = 'landscape-secondary',
}

export namespace Orientation {
    export function isLandscape(orientation: Orientation): boolean {
        return orientation === Orientation.LandscapePrimary || orientation === Orientation.LandscapeSecondary;
    }

    export function isPortrait(orientation: Orientation): boolean {
        return orientation === Orientation.PortraitPrimary || orientation === Orientation.PortraitSecondary;
    }
}

export const ENV_PRESETS = {
    'safe-area-inset': {
        top: 'safe-area-inset-top',
        right: 'safe-area-inset-right',
        bottom: 'safe-area-inset-bottom',
        left: 'safe-area-inset-left',
    },
    'safe-area-max-inset': {
        top: 'safe-area-max-inset-top',
        right: 'safe-area-max-inset-right',
        bottom: 'safe-area-max-inset-bottom',
        left: 'safe-area-max-inset-left',
    },
    'titlebar-area': {
        x: 'titlebar-area-x',
        y: 'titlebar-area-y',
        width: 'titlebar-area-width',
        height: 'titlebar-area-height',
    },
    'keyboard-inset': {
        top: 'keyboard-inset-top',
        right: 'keyboard-inset-right',
        bottom: 'keyboard-inset-bottom',
        left: 'keyboard-inset-left',
        width: 'keyboard-inset-width',
        height: 'keyboard-inset-height',
    },
    'viewport-segment': {
        width: 'viewport-segment-width',
        height: 'viewport-segment-height',
        top: 'viewport-segment-top',
        right: 'viewport-segment-right',
        bottom: 'viewport-segment-bottom',
        left: 'viewport-segment-left',
    },
} as const;

export let ORIENTATION_MEDIA_QUERY_LIST: MediaQueryList;

if (typeof globalThis.matchMedia !== 'undefined') ORIENTATION_MEDIA_QUERY_LIST = globalThis.matchMedia('(orientation: portrait)');
else ORIENTATION_MEDIA_QUERY_LIST = FALLBACK_MEDIA_QUERY_LIST;

export let DEVICE_POSTURE_MEDIA_QUERY_LIST: MediaQueryList;

if (typeof globalThis.matchMedia !== 'undefined') DEVICE_POSTURE_MEDIA_QUERY_LIST = globalThis.matchMedia('(device-posture: folded)');
else DEVICE_POSTURE_MEDIA_QUERY_LIST = FALLBACK_MEDIA_QUERY_LIST;
