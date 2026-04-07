declare enum Orientation {
    PortraitPrimary = "portrait-primary",
    PortraitSecondary = "portrait-secondary",
    LandscapePrimary = "landscape-primary",
    LandscapeSecondary = "landscape-secondary"
}
declare namespace Orientation {
    function isLandscape(orientation: Orientation): boolean;
    function isPortrait(orientation: Orientation): boolean;
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
declare let ORIENTATION_MEDIA_QUERY_LIST: MediaQueryList;
declare let DEVICE_POSTURE_MEDIA_QUERY_LIST: MediaQueryList;

declare const NotSupportedError: ErrorConstructor;

declare const PermissionNotGrantedError: ErrorConstructor;

type EnvironmentPresetKey = keyof typeof ENV_PRESETS;
type EnvironmentPresetAttribute<K extends EnvironmentPresetKey> = keyof typeof ENV_PRESETS[K];
type EnvironmentPresetValues<K extends EnvironmentPresetKey> = {
    [P in EnvironmentPresetAttribute<K>]: number;
};
declare interface Environment {
    readonly safeAreaInset: EnvironmentObserver<'safe-area-inset'>;
    readonly safeAreaMaxInset: EnvironmentObserver<'safe-area-max-inset'>;
    readonly keyboardInset: EnvironmentObserver<'keyboard-inset'>;
    readonly titlebarArea: EnvironmentObserver<'titlebar-area'>;
    readonly viewportSegment: EnvironmentObserver<'viewport-segment'>;
}
declare interface SegmentsObserver {
    get value(): EnvironmentPresetValues<'viewport-segment'>[];
    onChange(listener: (value: EnvironmentPresetValues<'viewport-segment'>[]) => void, options?: AddEventListenerOptions): () => void;
    useCssVariable(prefix: string): () => void;
}
declare type EnvironmentObserver<K extends EnvironmentPresetKey> = K extends 'viewport-segment' ? SegmentsObserver : {
    get value(): EnvironmentPresetValues<K>;
    onChange(listener: (value: EnvironmentPresetValues<K>) => void, options?: AddEventListenerOptions): () => void;
    useCssVariable(prefix: string): () => void;
};
declare interface Dimensions {
    readonly outerWidth: number;
    readonly outerHeight: number;
    readonly innerWidth: number;
    readonly innerHeight: number;
    readonly scale: number;
}
declare interface DeviceOrientationValue {
    readonly alpha: number | null;
    readonly beta: number | null;
    readonly gamma: number | null;
    readonly absolute: boolean;
}
declare interface DeviceOrientationInstance {
    get supported(): boolean;
    readonly value: Promise<DeviceOrientationValue>;
    onChange(listener: (value: DeviceOrientationValue) => void, options?: AddEventListenerOptions): () => void;
}
declare interface ScreenOrientationInstance {
    get supported(): boolean;
    readonly value: Orientation;
    onChange(listener: (value: Orientation) => void, options?: AddEventListenerOptions): () => void;
}
declare interface DimensionInstance {
    get value(): Dimensions;
    readonly environment: Environment;
    readonly screenOrientation: ScreenOrientationInstance;
    readonly deviceOrientation: DeviceOrientationInstance;
    onChange(listener: (dimension: Dimensions) => void, options?: AddEventListenerOptions): () => void;
    readonly Constants: {
        readonly Orientation: typeof Orientation;
    };
    readonly Errors: {
        readonly NotSupportedError: typeof NotSupportedError;
        readonly PermissionNotGrantedError: typeof PermissionNotGrantedError;
    };
}

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
declare const Dimension: DimensionInstance;

export { DEVICE_POSTURE_MEDIA_QUERY_LIST, ENV_PRESETS, ORIENTATION_MEDIA_QUERY_LIST, Orientation, Dimension as default };
export type { DeviceOrientationInstance, DeviceOrientationValue, DimensionInstance, Dimensions, Environment, EnvironmentObserver, EnvironmentPresetAttribute, EnvironmentPresetKey, EnvironmentPresetValues, ScreenOrientationInstance, SegmentsObserver };
