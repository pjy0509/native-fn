import {AppOpenState, CameraType, CaptureType, DirectoryExploreMode, ExplorerStartIn, SettingType} from "../constants";
import {OS} from "../../platform";
import {URLOpenError} from "../errors/url-open-error";
import {UserCancelledError} from "../errors/user-cancel-error";
import {NotSupportedError} from "../../../errors/not-supported-error";

export declare interface AppInfo {
    scheme?: URLCandidate;
    fallback?: URLCandidateOrFallback;
    timeout?: number;
    allowAppStore?: boolean;
    allowWebStore?: boolean;
}

export declare interface PackageName {
    packageName?: string;
}

export declare interface ProductId {
    productId?: string;
}

export declare interface BundleId {
    bundleId?: string;
}

export declare interface TrackId {
    trackId?: string;
}

export declare interface AndroidAppInfo extends AppInfo, PackageName {
    intent?: URLCandidate;
}

export declare interface IOSAppInfo extends AppInfo, BundleId, TrackId {
    universal?: URLCandidate;
}

export declare interface WindowsAppInfo extends AppInfo, PackageName, ProductId {
}

export declare interface MacOSAppInfo extends AppInfo, BundleId, TrackId {
}

export declare interface StoreInfo {
    appStore?: string;
    webStore?: string;
}

export declare interface AppOpenOptions {
    [OS.Android]?: AndroidAppInfo;
    ['android']?: AndroidAppInfo;

    [OS.iOS]?: IOSAppInfo;
    ['ios']?: IOSAppInfo;

    [OS.Windows]?: WindowsAppInfo;
    ['windows']?: WindowsAppInfo;

    [OS.MacOS]?: MacOSAppInfo;
    ['macos']?: MacOSAppInfo;
}

export interface Contact {
    name?: string[];
    email?: string[];
    tel?: string[];
    address?: ContactAddress[];
    icon?: Blob[];
}

export interface ContactAddress {
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

export interface ContactOptions {
    multiple?: boolean;
}

export type FileExtension = `.${string}`;
export type FileMimeType = `${string}/${string}`;
export type FileAccept = (FileExtension | FileMimeType)[];

export interface FileOptions {
    multiple?: boolean;
    accept?: FileAccept;
    id?: string;
    startIn?: ExplorerStartIn;
}

export interface DirectoryOptions {
    mode?: DirectoryExploreMode;
    id?: string;
    startIn?: ExplorerStartIn;
}

export interface FileWithPath {
    file: File;
    relativePath: string;
}

export interface CameraOptions {
    type?: CameraType;
    capture?: CaptureType;
}

export interface CalendarOptions {
    title?: string;
    description?: string;
    location?: string;
    allDay?: boolean;
    startDate: Date;
    endDate: Date;
    alarm?: CalendarAlarmOptions[];
    recur?: CalendarRecurOptions;
}

export type CalendarAlarmOptions = {
    description?: string;
} & CalendarAlarmTrigger;

export type CalendarAlarmTrigger =
    | {
    datetime?: Date;
    repeat?: never;
    repeatDuration?: never;
    before?: never;
    weeks?: never;
    days?: never;
    hours?: never;
    minutes?: never;
    seconds?: never;
}
    | {
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

export type CalendarRecurWeekDay = 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU';
export type CalendarRecurDayValue = CalendarRecurWeekDay | `${number}${CalendarRecurWeekDay}`;

export type CalendarRecurOptions = {
    frequency: 'SECONDLY' | 'MINUTELY' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    // 1 ≤ n
    interval?: number;
    // 1 ≤ n ≤ 12
    byMonth?: number[];
    // -53 ≤ n ≤ 53, n ≠ 0
    byWeekNo?: number[];
    // -366 ≤ n ≤ 366, n ≠ 0
    byYearDay?: number[];
    // -31 ≤ n ≤ 31, n ≠ 0
    byMonthDay?: number[];
    byDay?: CalendarRecurDayValue[];
    // 0 ≤ n ≤ 23
    byHour?: number[];
    // 0 ≤ n ≤ 59
    byMinute?: number[];
    // 0 ≤ n ≤ 60
    bySecond?: number[];
    bySetPos?: number[];
    weekStart?: CalendarRecurWeekDay;
} & CalendarRecurLimit;

export type CalendarRecurLimit =
    | {
    count: number,
    until?: never
} | {
    count?: never,
    until: Date
} | {
    count?: never;
    until?: never;
};

export declare type URLCandidate = URL | string;
export declare type URLCandidateOrFallback = URLCandidate | (() => any);
export declare type URLStringOrFallback = string | (() => any);

export declare interface TelephoneOptions {
    to?: string | string[];
}

export declare interface MessageOptions extends TelephoneOptions {
    body?: string;
}

export declare interface MailOptions extends MessageOptions {
    cc?: string | string[];
    bcc?: string | string[];
    subject?: string;
}

export declare interface OpenInstance {
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
        AppOpenState: typeof AppOpenState,
        SettingType: typeof SettingType,
        CameraType: typeof CameraType,
        CaptureType: typeof CaptureType,
    };
    Errors: {
        URLOpenError: typeof URLOpenError,
        NotSupportedError: typeof NotSupportedError,
        UserCancelledError: typeof UserCancelledError,
    };
}
