declare enum Appearances {
    Unknown = "unknown",
    Light = "light",
    Dark = "dark"
}

declare interface AppearanceInstance {
    get value(): Appearances;
    onChange(listener: (appearance: Appearances) => void, options?: AddEventListenerOptions): () => void;
    Constants: {
        Appearances: typeof Appearances;
    };
    Errors: {};
}

declare const Appearance: AppearanceInstance;

declare const NotSupportedError: ErrorConstructor;

declare interface BadgeInstance {
    set(contents: number): Promise<void>;
    clear(): Promise<void>;
    get supported(): boolean;
    Constants: {};
    Errors: {
        NotSupportedError: typeof NotSupportedError;
    };
}

declare const Badge: BadgeInstance;

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
declare interface BatteryInstance {
    get value(): Promise<BatteryManager>;
    get supported(): boolean;
    onChange(listener: (battery: BatteryManager) => void, options?: AddEventListenerOptions): () => void;
    Constants: {};
    Errors: {
        NotSupportedError: typeof NotSupportedError;
    };
}

declare const Battery: BatteryInstance;

declare interface ClipboardInstance {
    copy(item: any): Promise<boolean>;
    paste(): Promise<string>;
    Constants: {};
    Errors: {};
}

declare const Clipboard: ClipboardInstance;

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

declare interface FullscreenInstance {
    supported: boolean;
    element: Element | null;
    isFullscreen: boolean;
    request(target?: Element, options?: FullscreenOptions): Promise<void>;
    exit(): Promise<void>;
    toggle(target?: Element, options?: FullscreenOptions): Promise<void>;
    onChange(listener: (event: Event) => void, options?: AddEventListenerOptions): () => void;
    onError(listener: (event: Event) => void, options?: AddEventListenerOptions): () => void;
    Constants: {};
    Errors: {
        NotSupportedError: typeof NotSupportedError;
    };
}

declare global {
    interface HTMLVideoElement {
        webkitEnterFullscreen?: () => void;
        webkitExitFullscreen?: () => void;
        webkitSupportsFullscreen?: boolean;
        webkitDisplayingFullscreen?: boolean;
        onwebkitbeginfullscreen?: ((this: HTMLVideoElement, ev: Event) => any) | null;
        onwebkitendfullscreen?: ((this: HTMLVideoElement, ev: Event) => any) | null;
        [key: symbol]: boolean | undefined;
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
}
declare const _default$1: FullscreenInstance;

declare const PermissionNotGrantedError: ErrorConstructor;

declare interface GeolocationInstance {
    get value(): Promise<GeolocationCoordinates>;
    get supported(): boolean;
    onChange(listener: (coordinates: GeolocationCoordinates) => void, options?: AddEventListenerOptions): () => void;
    Constants: {};
    Errors: {
        NotSupportedError: typeof NotSupportedError;
        PermissionNotGrantedError: typeof PermissionNotGrantedError;
    };
}

declare const Geolocation: GeolocationInstance;

interface NotificationOptions {
    title: string;
    badge?: string;
    body?: string;
    data?: any;
    dir?: NotificationDirection;
    icon?: string;
    lang?: string;
    requireInteraction?: boolean;
    silent?: boolean | null;
    tag?: string;
    onClick?: ((this: Notification, event: Event) => any);
    onClose?: ((this: Notification, event: Event) => any);
    onError?: ((this: Notification, event: Event) => any);
    onShow?: ((this: Notification, event: Event) => any);
}
declare interface NotificationInstance {
    send(options: NotificationOptions): Promise<Notification>;
    get supported(): boolean;
    Constants: {};
    Errors: {
        NotSupportedError: typeof NotSupportedError;
        PermissionNotGrantedError: typeof PermissionNotGrantedError;
    };
}

declare const Notification$1: NotificationInstance;

declare enum AppOpenState {
    Scheme = 0,
    Universal = 1,
    Intent = 2,
    Fallback = 3,
    Store = 4
}
declare enum SettingType {
    General = "general",
    Network = "network",
    Display = "display",
    Appearance = "appearance",
    Accessibility = "accessibility",
    Battery = "battery",
    Datetime = "datetime",
    Language = "language",
    Accounts = "accounts",
    Storage = "storage"
}
declare enum CameraType {
    Image = "image",
    Video = "video"
}
declare enum CaptureType {
    User = "user",
    Environment = "environment"
}
declare enum ExplorerStartIn {
    Desktop = "desktop",
    Documents = "documents",
    Downloads = "downloads",
    Music = "music",
    Pictures = "pictures",
    Videos = "videos"
}
declare enum DirectoryExploreMode {
    Read = "read",
    ReadWrite = "readwrite"
}

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

declare const URLOpenError: ErrorConstructor;

declare const UserCancelledError: ErrorConstructor;

declare interface AppInfo {
    scheme?: URLCandidate;
    fallback?: URLCandidateOrFallback;
    timeout?: number;
    allowAppStore?: boolean;
    allowWebStore?: boolean;
}
declare interface PackageName {
    packageName?: string;
}
declare interface ProductId {
    productId?: string;
}
declare interface BundleId {
    bundleId?: string;
}
declare interface TrackId {
    trackId?: string;
}
declare interface AndroidAppInfo extends AppInfo, PackageName {
    intent?: URLCandidate;
}
declare interface IOSAppInfo extends AppInfo, BundleId, TrackId {
    universal?: URLCandidate;
}
declare interface WindowsAppInfo extends AppInfo, PackageName, ProductId {
}
declare interface MacOSAppInfo extends AppInfo, BundleId, TrackId {
}
declare interface AppOpenOptions {
    [OS.Android]?: AndroidAppInfo;
    ['android']?: AndroidAppInfo;
    [OS.iOS]?: IOSAppInfo;
    ['ios']?: IOSAppInfo;
    [OS.Windows]?: WindowsAppInfo;
    ['windows']?: WindowsAppInfo;
    [OS.MacOS]?: MacOSAppInfo;
    ['macos']?: MacOSAppInfo;
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
interface ContactOptions {
    multiple?: boolean;
}
type FileExtension = `.${string}`;
type FileMimeType = `${string}/${string}`;
type FileAccept = (FileExtension | FileMimeType)[];
interface FileOptions {
    multiple?: boolean;
    accept?: FileAccept;
    id?: string;
    startIn?: ExplorerStartIn;
}
interface DirectoryOptions {
    mode?: DirectoryExploreMode;
    id?: string;
    startIn?: ExplorerStartIn;
}
interface FileWithPath {
    file: File;
    relativePath: string;
}
interface CameraOptions {
    type?: CameraType;
    capture?: CaptureType;
}
interface CalendarOptions {
    title?: string;
    description?: string;
    location?: string;
    allDay?: boolean;
    startDate: Date;
    endDate: Date;
    alarm?: CalendarAlarmOptions[];
    recur?: CalendarRecurOptions;
}
type CalendarAlarmOptions = {
    description?: string;
} & CalendarAlarmTrigger;
type CalendarAlarmTrigger = {
    datetime?: Date;
    repeat?: never;
    repeatDuration?: never;
    before?: never;
    weeks?: never;
    days?: never;
    hours?: never;
    minutes?: never;
    seconds?: never;
} | {
    datetime?: never;
    repeat?: number;
    repeatDuration?: number;
    before?: boolean;
    weeks?: number;
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
};
type CalendarRecurWeekDay = 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU';
type CalendarRecurDayValue = CalendarRecurWeekDay | `${number}${CalendarRecurWeekDay}`;
type CalendarRecurOptions = {
    frequency: 'SECONDLY' | 'MINUTELY' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    interval?: number;
    byMonth?: number[];
    byWeekNo?: number[];
    byYearDay?: number[];
    byMonthDay?: number[];
    byDay?: CalendarRecurDayValue[];
    byHour?: number[];
    byMinute?: number[];
    bySecond?: number[];
    bySetPos?: number[];
    weekStart?: CalendarRecurWeekDay;
} & CalendarRecurLimit;
type CalendarRecurLimit = {
    count: number;
    until?: never;
} | {
    count?: never;
    until: Date;
} | {
    count?: never;
    until?: never;
};
declare type URLCandidate = URL | string;
declare type URLCandidateOrFallback = URLCandidate | (() => any);
declare interface TelephoneOptions {
    to?: string | string[];
}
declare interface MessageOptions extends TelephoneOptions {
    body?: string;
}
declare interface MailOptions extends MessageOptions {
    cc?: string | string[];
    bcc?: string | string[];
    subject?: string;
}
declare interface OpenInstance {
    app(options: AppOpenOptions): Promise<AppOpenState>;
    telephone(options: TelephoneOptions): Promise<void>;
    message(options: MessageOptions): Promise<void>;
    mail(options: MailOptions): Promise<void>;
    file(options?: FileOptions): Promise<File[]>;
    directory(options?: DirectoryOptions): Promise<FileWithPath[]>;
    setting(type: SettingType): Promise<void>;
    camera(options?: CameraOptions): Promise<File[]>;
    contact(options?: ContactOptions): Promise<Contact[]>;
    share(options: ShareData): Promise<void>;
    calendar(options: CalendarOptions): void;
    supported: {
        get intent(): boolean;
        get universal(): boolean;
        get setting(): boolean;
        get directory(): boolean;
        get camera(): boolean;
        get contact(): boolean;
        get share(): boolean;
        get calendar(): boolean;
    };
    Constants: {
        AppOpenState: typeof AppOpenState;
        SettingType: typeof SettingType;
        CameraType: typeof CameraType;
        CaptureType: typeof CaptureType;
    };
    Errors: {
        URLOpenError: typeof URLOpenError;
        NotSupportedError: typeof NotSupportedError;
        UserCancelledError: typeof UserCancelledError;
    };
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
declare const Open: OpenInstance;

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

declare interface ThemeInstance {
    get value(): string | undefined;
    set value(color: string | undefined);
    Constants: {};
    Errors: {};
}

declare const Theme: ThemeInstance;

declare interface VibrationInstance {
    run(pattern: number | number[]): boolean;
    stop(): boolean;
    get supported(): boolean;
    Constants: {};
    Errors: {
        NotSupportedError: typeof NotSupportedError;
    };
}

declare const Vibration: VibrationInstance;

declare global {
    interface Navigator {
        getUserMedia?(constraints?: MediaStreamConstraints): Promise<MediaStream>;
        webkitGetUserMedia?(constraints: MediaStreamConstraints, successCallback: (stream: MediaStream) => void, errorCallback: (error: DOMException) => void): void;
        mozGetUserMedia?(constraints: MediaStreamConstraints, successCallback: (stream: MediaStream) => void, errorCallback: (error: DOMException) => void): void;
        msGetUserMedia?(constraints: MediaStreamConstraints, successCallback: (stream: MediaStream) => void, errorCallback: (error: DOMException) => void): void;
    }
}
declare enum PermissionType {
    Notification = "notifications",
    Geolocation = "geolocation",
    Camera = "camera",
    ClipboardRead = "clipboard-read",
    Microphone = "microphone",
    MIDI = "midi"
}
declare enum PermissionState {
    Grant = "grant",
    Denied = "denied",
    Prompt = "prompt",
    Unsupported = "unsupported"
}

declare interface PermissionInstance {
    request(type: PermissionType): Promise<PermissionState>;
    check(type: PermissionType): Promise<PermissionState>;
    Constants: {
        PermissionType: typeof PermissionType;
        PermissionState: typeof PermissionState;
    };
    Errors: {};
}

declare const Permission: PermissionInstance;

declare interface PipInstance {
    supported: boolean;
    element: HTMLVideoElement | null;
    isPip: boolean;
    request(target?: HTMLVideoElement): Promise<void>;
    exit(): Promise<void>;
    toggle(target?: HTMLVideoElement): Promise<void>;
    onChange(listener: (event: Event) => void, options?: AddEventListenerOptions): () => void;
    onError(listener: (event: Event) => void, options?: AddEventListenerOptions): () => void;
    Constants: {};
    Errors: {
        NotSupportedError: typeof NotSupportedError;
    };
}

declare global {
    interface HTMLVideoElement {
        webkitSupportsPresentationMode?: (mode: string) => boolean;
        webkitSetPresentationMode?: (mode: string) => void;
        webkitPresentationMode?: string;
        onwebkitpresentationmodechanged?: ((this: HTMLVideoElement, ev: Event) => any) | null;
        [key: symbol]: boolean | undefined;
    }
}
declare const _default: PipInstance;

declare interface NativeInstance {
    version: string;
    appearance: typeof Appearance;
    badge: typeof Badge;
    battery: typeof Battery;
    clipboard: typeof Clipboard;
    dimension: typeof Dimension;
    fullscreen: typeof _default$1;
    geolocation: typeof Geolocation;
    notification: typeof Notification$1;
    open: typeof Open;
    permission: typeof Permission;
    platform: typeof Platform;
    pip: typeof _default;
    theme: typeof Theme;
    vibration: typeof Vibration;
}

type Writeable<T> = {
    -readonly [P in keyof T]: T[P];
};

declare const Native: NativeInstance;

export { Native as default };
export type { NativeInstance };
