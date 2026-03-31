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
declare const SETTING_URL: Record<'Android' | 'Windows' | 'MacOS' | 'MacOS13+', Record<SettingType, string>>;

declare enum OS {
    Unknown = "Unknown",
    Android = "Android",
    iOS = "iOS",
    Windows = "Windows",
    MacOS = "MacOS"
}

declare const NotSupportedError: ErrorConstructor;

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

interface GPUAdapterInfo {
    readonly vendor?: string;
    readonly architecture?: string;
    readonly device?: string;
    readonly description?: string;
}

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
declare interface StoreInfo {
    appStore?: string;
    webStore?: string;
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
declare type URLStringOrFallback = string | (() => any);
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

export { AppOpenState, CameraType, CaptureType, DirectoryExploreMode, ExplorerStartIn, SETTING_URL, SettingType, Open as default };
export type { AndroidAppInfo, AppInfo, AppOpenOptions, BundleId, CalendarAlarmOptions, CalendarAlarmTrigger, CalendarOptions, CalendarRecurDayValue, CalendarRecurLimit, CalendarRecurOptions, CalendarRecurWeekDay, CameraOptions, Contact, ContactAddress, ContactOptions, DirectoryOptions, FileAccept, FileExtension, FileMimeType, FileOptions, FileWithPath, IOSAppInfo, MacOSAppInfo, MailOptions, MessageOptions, OpenInstance, PackageName, ProductId, StoreInfo, TelephoneOptions, TrackId, URLCandidate, URLCandidateOrFallback, URLStringOrFallback, WindowsAppInfo };
