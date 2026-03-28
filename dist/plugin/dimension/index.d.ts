declare enum Orientation {
    Portrait = "portrait",
    Landscape = "landscape",
    Unknown = "unknown"
}
declare const ENV_PRESETS: {
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
declare const FALLBACK_DIMENSION: Dimensions;
declare let MEDIA_QUERY_LIST: MediaQueryList;

type EnvironmentPresetKey = keyof typeof ENV_PRESETS;
type EnvironmentPresetAttr<K extends EnvironmentPresetKey> = keyof typeof ENV_PRESETS[K];
type EnvironmentPresetValues<K extends EnvironmentPresetKey> = {
    [P in EnvironmentPresetAttr<K>]: number;
};
declare interface DimensionInstance {
    get value(): Dimensions;
    environment: Environment;
    onChange(listener: (dimension: Dimensions) => void, options?: AddEventListenerOptions): () => void;
    Constants: {
        Orientation: typeof Orientation;
    };
    Errors: {};
}
declare interface Dimensions {
    outerWidth: number;
    outerHeight: number;
    innerWidth: number;
    innerHeight: number;
    scale: number;
    orientation: Orientation;
}
declare interface EnvironmentPreset<K extends EnvironmentPresetKey> {
    get value(): EnvironmentPresetValues<K>;
    onChange(listener: (value: EnvironmentPresetValues<K>) => void, options?: AddEventListenerOptions): () => void;
}
declare interface Environment {
    safeAreaInset: EnvironmentPreset<'safe-area-inset'>;
    safeAreaMaxInset: EnvironmentPreset<'safe-area-max-inset'>;
    keyboardInset: EnvironmentPreset<'keyboard-inset'>;
    titlebarArea: EnvironmentPreset<'titlebar-area'>;
    viewportSegment: EnvironmentPreset<'viewport-segment'>;
}

declare const Dimension: DimensionInstance;

export { ENV_PRESETS, FALLBACK_DIMENSION, MEDIA_QUERY_LIST, Orientation, Dimension as default };
export type { DimensionInstance, Dimensions, Environment, EnvironmentPreset, EnvironmentPresetAttr, EnvironmentPresetKey, EnvironmentPresetValues };
