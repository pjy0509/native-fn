import { Browsers, Devices, Engines, OS } from "../constants";
import { Writeable } from "../../../types";
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
    Constants: {
        OS: typeof OS;
        Engines: typeof Engines;
        Browsers: typeof Browsers;
        Devices: typeof Devices;
    };
    Errors: {};
}
export declare interface NameVersionPair<T> {
    name: T;
    version: string;
}
export declare interface Locale {
    language: string | null;
    languages: string[];
    timezone: string | null;
    offset: number;
    isRTL: boolean;
}
export interface GPUAdapterInfo {
    readonly vendor?: string;
    readonly architecture?: string;
    readonly device?: string;
    readonly description?: string;
}
export declare type GPU = Writeable<GPUAdapterInfo>;
