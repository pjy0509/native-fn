import {ENV_PRESETS, Orientation} from "../constants";

export type EnvironmentPresetKey = keyof typeof ENV_PRESETS;
export type EnvironmentPresetAttr<K extends EnvironmentPresetKey> = keyof typeof ENV_PRESETS[K];
export type EnvironmentPresetValues<K extends EnvironmentPresetKey> = { [P in EnvironmentPresetAttr<K>]: number; };

export declare interface DimensionInstance {
    get value(): Dimensions;

    environment: Environment,

    onChange(listener: (dimension: Dimensions) => void, options?: AddEventListenerOptions): () => void;

    Constants: {
        Orientation: typeof Orientation,
    };
    Errors: {};
}

export declare interface Dimensions {
    outerWidth: number;
    outerHeight: number;
    innerWidth: number;
    innerHeight: number;
    scale: number;
    orientation: Orientation;
}

export declare interface EnvironmentPreset<K extends EnvironmentPresetKey> {
    get value(): EnvironmentPresetValues<K>;

    onChange(listener: (value: EnvironmentPresetValues<K>) => void, options?: AddEventListenerOptions): () => void;
}

export declare interface Environment {
    safeAreaInset: EnvironmentPreset<'safe-area-inset'>;
    safeAreaMaxInset: EnvironmentPreset<'safe-area-max-inset'>;
    keyboardInset: EnvironmentPreset<'keyboard-inset'>;
    titlebarArea: EnvironmentPreset<'titlebar-area'>;
    viewportSegment: EnvironmentPreset<'viewport-segment'>;
}
