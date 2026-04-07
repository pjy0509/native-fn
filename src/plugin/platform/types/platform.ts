import {Browsers, Devices, Engines, OS} from "../constants";
import {Writeable} from "../../../types";

export declare type VersionResolver = undefined | string | ((string: string | undefined) => string);

export declare interface PlatformInstance {
    get ready(): Promise<void>;

    get userAgent(): string;

    set userAgent(value: any);

    get os(): NameVersionPair<OS>;

    get engine(): NameVersionPair<Engines>;

    get browser(): NameVersionPair<Browsers>;

    get device(): Devices;

    get locale(): Locale;

    get gpu(): GPU;

    get isNode(): boolean;

    get isStandalone(): boolean;

    get isWebview(): boolean;

    readonly Constants: {
        readonly OS: typeof OS;
        readonly Engines: typeof Engines;
        readonly Browsers: typeof Browsers;
        readonly Devices: typeof Devices;
    };
    readonly Errors: {};
}

export declare interface NameVersionPair<T> {
    readonly name: T;
    readonly version: string;
}

export declare interface Locale {
    readonly language: string | null;
    readonly languages: readonly string[];
    readonly timezone: string | null;
    readonly offset: number;
    readonly isRTL: boolean;
}

export interface GPUAdapterInfo {
    readonly vendor?: string;
    readonly architecture?: string;
    readonly device?: string;
    readonly description?: string;
}

export declare type GPU = Writeable<GPUAdapterInfo>;
