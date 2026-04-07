import {ENV_PRESETS, Orientation} from "../constants";
import {NotSupportedError} from "../../../errors/not-supported-error";
import {PermissionNotGrantedError} from "../../../errors/permission-not-granted-error";

export type EnvironmentPresetKey = keyof typeof ENV_PRESETS;
export type EnvironmentPresetAttribute<K extends EnvironmentPresetKey> = keyof typeof ENV_PRESETS[K];
export type EnvironmentPresetValues<K extends EnvironmentPresetKey> = { [P in EnvironmentPresetAttribute<K>]: number; };

export declare interface Environment {
    readonly safeAreaInset: EnvironmentObserver<'safe-area-inset'>;
    readonly safeAreaMaxInset: EnvironmentObserver<'safe-area-max-inset'>;
    readonly keyboardInset: EnvironmentObserver<'keyboard-inset'>;
    readonly titlebarArea: EnvironmentObserver<'titlebar-area'>;
    readonly viewportSegment: EnvironmentObserver<'viewport-segment'>;
}

export declare interface SegmentsObserver {
    get value(): EnvironmentPresetValues<'viewport-segment'>[];

    onChange(listener: (value: EnvironmentPresetValues<'viewport-segment'>[]) => void, options?: AddEventListenerOptions): () => void;

    useCssVariable(prefix: string): () => void;
}

export declare type EnvironmentObserver<K extends EnvironmentPresetKey> =
    K extends 'viewport-segment'
        ? SegmentsObserver
        : {
            get value(): EnvironmentPresetValues<K>;

            onChange(listener: (value: EnvironmentPresetValues<K>) => void, options?: AddEventListenerOptions): () => void;

            useCssVariable(prefix: string): () => void;
        };

export declare interface Dimensions {
    readonly outerWidth: number;
    readonly outerHeight: number;
    readonly innerWidth: number;
    readonly innerHeight: number;
    readonly scale: number;
}

export declare interface DeviceOrientationValue {
    readonly alpha: number | null;
    readonly beta: number | null;
    readonly gamma: number | null;
    readonly absolute: boolean;
}

export declare interface DeviceOrientationInstance {
    get supported(): boolean;

    readonly value: Promise<DeviceOrientationValue>;

    onChange(listener: (value: DeviceOrientationValue) => void, options?: AddEventListenerOptions): () => void;
}

export declare interface ScreenOrientationInstance {
    get supported(): boolean;

    readonly value: Orientation;

    onChange(listener: (value: Orientation) => void, options?: AddEventListenerOptions): () => void;
}

export declare interface DimensionInstance {
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
