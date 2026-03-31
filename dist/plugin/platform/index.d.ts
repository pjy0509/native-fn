declare enum OS {
    Unknown = "Unknown",
    Android = "Android",
    iOS = "iOS",
    Windows = "Windows",
    MacOS = "MacOS"
}
declare enum Devices {
    Unknown = "Unknown",
    Mobile = "Mobile",
    Desktop = "Desktop"
}
declare enum Engines {
    Unknown = "Unknown",
    EdgeHTML = "EdgeHTML",
    ArkWeb = "ArkWeb",
    Blink = "Blink",
    Presto = "Presto",
    WebKit = "WebKit",
    Trident = "Trident",
    NetFront = "NetFront",
    KHTML = "KHTML",
    Tasman = "Tasman",
    Gecko = "Gecko"
}
declare enum Browsers {
    Unknown = "Unknown",
    Chrome = "Chrome",
    Safari = "Safari",
    Edge = "Edge",
    Firefox = "Firefox",
    Opera = "Opera",
    IE = "IE",
    SamsungInternet = "SamsungInternet"
}
declare const USER_AGENT: string;
declare const HIGH_ENTROPY_BRAND_NAME_MAP: Record<string, string>;
declare const RTL_LANGUAGES: string[];
declare const OS_RESOLVER_MAP: [RegExp, OS, VersionResolver?][];
declare const ENGINE_RESOLVER_MAP: [RegExp, Engines, VersionResolver?][];
declare const BROWSER_RESOLVER_MAP: [RegExp, Browsers, VersionResolver?][];

declare global {
    interface Navigator {
        getBattery(): Promise<BatteryManager>;
    }
}
interface BatteryManager extends EventTarget {
    readonly charging: boolean;
    readonly chargingTime: number;
    readonly dischargingTime: number;
    readonly level: number;
    onChange: ((this: BatteryManager, ev: Event) => any) | null;
    onchargingchange: ((this: BatteryManager, ev: Event) => any) | null;
    onchargingtimechange: ((this: BatteryManager, ev: Event) => any) | null;
    ondischargingtimechange: ((this: BatteryManager, ev: Event) => any) | null;
    onlevelchange: ((this: BatteryManager, ev: Event) => any) | null;
}

declare global {
    interface HTMLVideoElement {
        webkitEnterFullscreen?: () => void;
        webkitExitFullscreen?: () => void;
        webkitSupportsFullscreen?: boolean;
        webkitDisplayingFullscreen?: boolean;
        onwebkitbeginfullscreen?: ((this: HTMLVideoElement, ev: Event) => any) | null;
        onwebkitendfullscreen?: ((this: HTMLVideoElement, ev: Event) => any) | null;
    }
    interface Document {
        readonly fullscreenEnabled: boolean;
        fullscreenElement?: Element | null;
        exitFullscreen: () => Promise<void>;
        readonly webkitFullscreenEnabled?: boolean;
        webkitFullscreenElement?: Element | null;
        webkitCurrentFullScreenElement?: Element | null;
        webkitExitFullscreen?: () => Promise<void>;
        webkitCancelFullScreen?: () => Promise<void>;
        readonly mozFullScreenEnabled?: boolean;
        mozFullScreenElement?: Element | null;
        mozCancelFullScreen?: () => Promise<void>;
        readonly msFullscreenEnabled?: boolean;
        msFullscreenElement?: Element | null;
        msExitFullscreen?: () => Promise<void>;
    }
    interface Element {
        requestFullscreen: (options?: FullscreenOptions) => Promise<void>;
        webkitRequestFullscreen?: (options?: FullscreenOptions) => Promise<void>;
        webkitRequestFullScreen?: (options?: FullscreenOptions) => Promise<void>;
        mozRequestFullScreen?: () => Promise<void>;
        msRequestFullscreen?: () => Promise<void>;
    }
    var __nativeFnFsBridgeKey__: symbol | undefined;
}

interface Contact {
    name?: string[];
    email?: string[];
    tel?: string[];
    address?: ContactAddress[];
    icon?: Blob[];
}
interface ContactAddress {
    country?: string;
    region?: string;
    city?: string;
    dependentLocality?: string;
    postalCode?: string;
    sortingCode?: string;
    organization?: string;
    recipient?: string;
    addressLine?: string[];
}

declare global {
    interface Document {
        webkitVisibilityState?: 'hidden' | 'visible';
        mozVisibilityState?: 'hidden' | 'visible';
        msVisibilityState?: 'hidden' | 'visible';
        webkitHidden?: boolean;
        mozHidden?: boolean;
        msHidden?: boolean;
    }
    interface Navigator {
        contacts?: ContactsManager;
    }
    interface FileSystemDirectoryHandle {
        entries(): AsyncIterator<[string, FileSystemHandle]>;
    }
    var showOpenFilePicker: (options?: OpenFilePickerOptions) => Promise<FileSystemFileHandle[]>;
    var showDirectoryPicker: (options?: OpenDirectoryPickerOptions) => Promise<FileSystemDirectoryHandle>;
    var cordova: object | undefined;
}
interface AsyncIterator<T, TReturn = any, TNext = undefined> {
    next(...args: [] | [TNext]): Promise<IteratorResult<T, TReturn>>;
    return?(value?: TReturn | PromiseLike<TReturn>): Promise<IteratorResult<T, TReturn>>;
    throw?(e?: any): Promise<IteratorResult<T, TReturn>>;
}
type IteratorResult<T, TReturn = any> = IteratorYieldResult<T> | IteratorReturnResult<TReturn>;
interface IteratorYieldResult<TYield> {
    done?: false;
    value: TYield;
}
interface IteratorReturnResult<TReturn> {
    done: true;
    value: TReturn;
}
interface OpenFilePickerOptions {
    excludeAcceptAllOption?: boolean;
    id?: string;
    multiple?: boolean;
    startIn?: 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos';
    types?: {
        description?: string;
        accept: Record<string, string[]>;
    }[];
}
interface OpenDirectoryPickerOptions {
    id?: string;
    mode?: 'read' | 'readwrite';
    startIn?: 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos';
}
interface ContactsManager {
    select(properties: string[], options?: Record<string, any>): Promise<Contact[]>;
    getProperties(): Promise<string[]>;
}

declare global {
    interface Navigator {
        getUserMedia?(constraints?: MediaStreamConstraints): Promise<MediaStream>;
        webkitGetUserMedia?(constraints: MediaStreamConstraints, successCallback: (stream: MediaStream) => void, errorCallback: (error: DOMException) => void): void;
        mozGetUserMedia?(constraints: MediaStreamConstraints, successCallback: (stream: MediaStream) => void, errorCallback: (error: DOMException) => void): void;
        msGetUserMedia?(constraints: MediaStreamConstraints, successCallback: (stream: MediaStream) => void, errorCallback: (error: DOMException) => void): void;
    }
}

declare global {
    interface HTMLVideoElement {
        webkitSupportsPresentationMode?(mode: string): boolean;
        webkitSetPresentationMode?(mode: string): void;
        webkitPresentationMode?: string;
        onwebkitpresentationmodechanged?: ((this: Element, ev: Event) => any) | null;
    }
    var __nativeFnPipBridgeKey__: symbol | undefined;
}

type Writeable<T> = {
    -readonly [P in keyof T]: T[P];
};

declare type VersionResolver = undefined | string | ((string: string | undefined) => string);
declare interface PlatformInstance {
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
declare interface NameVersionPair<T> {
    name: T;
    version: string;
}
declare interface Locale {
    language: string | null;
    languages: string[];
    timezone: string | null;
    offset: number;
    isRTL: boolean;
}
interface GPUAdapterInfo {
    readonly vendor?: string;
    readonly architecture?: string;
    readonly device?: string;
    readonly description?: string;
}
declare type GPU = Writeable<GPUAdapterInfo>;

declare global {
    interface Navigator {
        userAgent?: string;
        userAgentData?: UserAgentData;
        language?: string;
        languages?: readonly string[];
        browserLanguage?: string;
        systemLanguage?: string;
        userLanguage?: string;
        standalone?: boolean;
        gpu?: WebGPU;
    }
    interface NodeProcessVersions {
        node?: string;
        chrome?: string;
    }
    interface NodeProcess {
        versions?: NodeProcessVersions;
        type?: string;
        platform?: string;
        getSystemVersion?(): string;
    }
    var process: NodeProcess | undefined;
    namespace Intl {
        const Locale: {
            new (tag: string): IntlLocale;
        };
    }
}
interface IntlLocale {
    getTextInfo?(): IntlLocaleTextInfo;
    textInfo: IntlLocaleTextInfo;
}
interface IntlLocaleTextInfo {
    direction: 'rtl' | 'ltr';
}
interface ModernUserAgentDataBrand {
    brand: string;
    version: string;
}
type UserAgentDataBrand = ModernUserAgentDataBrand | string | null | undefined;
interface UserAgentDataValues {
    brands?: UserAgentDataBrand[];
    fullVersionList?: UserAgentDataBrand[];
    platformVersion?: string | null | undefined;
    platform?: string | null | undefined;
    mobile?: boolean;
}
interface UserAgentData {
    getHighEntropyValues?(hints: string[]): Promise<UserAgentDataValues>;
}
interface WebGPU {
    requestAdapter(options?: GPURequestAdapterOptions): Promise<GPUAdapter | null>;
}
interface GPURequestAdapterOptions {
    powerPreference?: GPUPowerPreference;
    forceFallbackAdapter?: boolean;
}
type GPUPowerPreference = 'low-power' | 'high-performance';
interface GPUAdapter {
    readonly info: GPUAdapterInfo;
}
declare const Platform: PlatformInstance;

export { BROWSER_RESOLVER_MAP, Browsers, Devices, ENGINE_RESOLVER_MAP, Engines, HIGH_ENTROPY_BRAND_NAME_MAP, Locale, OS, OS_RESOLVER_MAP, RTL_LANGUAGES, USER_AGENT, Platform as default };
export type { GPU, GPUAdapterInfo, NameVersionPair, PlatformInstance, VersionResolver };
