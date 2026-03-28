import {Dimensions} from "../types";
import {FALLBACK_MEDIA_QUERY_LIST} from "../../../constants";

export enum Orientation {
    Portrait = 'portrait',
    Landscape = 'landscape',
    Unknown = 'unknown',
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

export const FALLBACK_DIMENSION: Dimensions = {
    innerWidth: -1,
    innerHeight: -1,
    outerWidth: -1,
    outerHeight: -1,
    scale: 1,
    orientation: Orientation.Unknown,
};

export let MEDIA_QUERY_LIST: MediaQueryList;

if (typeof globalThis.matchMedia !== 'undefined') MEDIA_QUERY_LIST = globalThis.matchMedia('(orientation: portrait)');
else MEDIA_QUERY_LIST = FALLBACK_MEDIA_QUERY_LIST;
