import { Dimensions } from "../types";
export declare enum Orientation {
    Portrait = "portrait",
    Landscape = "landscape",
    Unknown = "unknown"
}
export declare const ENV_PRESETS: {
    readonly 'safe-area-inset': {
        readonly top: "safe-area-inset-top";
        readonly right: "safe-area-inset-right";
        readonly bottom: "safe-area-inset-bottom";
        readonly left: "safe-area-inset-left";
    };
    readonly 'safe-area-max-inset': {
        readonly top: "safe-area-max-inset-top";
        readonly right: "safe-area-max-inset-right";
        readonly bottom: "safe-area-max-inset-bottom";
        readonly left: "safe-area-max-inset-left";
    };
    readonly 'titlebar-area': {
        readonly x: "titlebar-area-x";
        readonly y: "titlebar-area-y";
        readonly width: "titlebar-area-width";
        readonly height: "titlebar-area-height";
    };
    readonly 'keyboard-inset': {
        readonly top: "keyboard-inset-top";
        readonly right: "keyboard-inset-right";
        readonly bottom: "keyboard-inset-bottom";
        readonly left: "keyboard-inset-left";
        readonly width: "keyboard-inset-width";
        readonly height: "keyboard-inset-height";
    };
    readonly 'viewport-segment': {
        readonly width: "viewport-segment-width";
        readonly height: "viewport-segment-height";
        readonly top: "viewport-segment-top";
        readonly right: "viewport-segment-right";
        readonly bottom: "viewport-segment-bottom";
        readonly left: "viewport-segment-left";
    };
};
export declare const FALLBACK_DIMENSION: Dimensions;
export declare let MEDIA_QUERY_LIST: MediaQueryList;
