import {AppOpenState, CameraType, CaptureType, SETTING_URL, SettingType} from "../constants";
import {
    AndroidAppInfo,
    AppOpenOptions,
    CalendarAlarmOptions,
    CalendarOptions,
    CameraOptions,
    Contact,
    ContactOptions,
    DirectoryOptions,
    FileOptions,
    FileWithPath,
    IOSAppInfo,
    MacOSAppInfo,
    MailOptions,
    MessageOptions,
    OpenInstance,
    StoreInfo,
    TelephoneOptions,
    URLCandidate,
    URLStringOrFallback,
    WindowsAppInfo
} from "../types";
import {Browsers, OS} from "../../platform/constants";
import Platform from "../../platform/cores";
import EventListener from "../../../utils/event-listener";
import compareVersion from "../../../utils/compare-version";
import getTopmostWindow from "../../../utils/get-topmost-window";
import createHiddenElement from "../../../utils/create-hidden-element";
import dispatchClickEvent from "../../../utils/dispatch-click-event";
import now from "../../../utils/now";
import randomString from "../../../utils/random-string";
import padStart from "../../../utils/pad-start";
import {URLOpenError} from "../errors/url-open-error";
import {UserCancelledError} from "../errors/user-cancel-error";
import {NotSupportedError} from "../../../errors/not-supported-error";
import Native from "../../../../index";

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

type IteratorResult<T, TReturn = any> =
    | IteratorYieldResult<T>
    | IteratorReturnResult<TReturn>;

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

interface IOSAndMacOSLookupAppInfo {
    resultCount?: number;
    results?: IOSAndMacOSLookupAppResult[];
}

interface IOSAndMacOSLookupAppResult {
    trackId: number;
}

interface ContactsManager {
    select(properties: string[], options?: Record<string, any>): Promise<Contact[]>;

    getProperties(): Promise<string[]>;
}

type FocusEventKey = 'focus' | 'blur' | 'visibilitychange';

interface FocusEventConfig {
    type: Partial<Record<FocusEventKey, string>>;
    target: Partial<Record<FocusEventKey, EventTarget>>;
}

const Open: OpenInstance = {
    app: app,
    telephone: telephone,
    message: message,
    mail: mail,
    file: file,
    directory: directory,
    setting: setting,
    camera: camera,
    contact: contact,
    share: share,
    calendar: calendar,
    supported: {
        get intent(): boolean {
            return canOpenIntentURL();
        },
        get universal(): boolean {
            return canOpenUniversalURL();
        },
        get setting(): boolean {
            return canOpenSetting();
        },
        get directory(): boolean {
            return canOpenDirectory();
        },
        get camera(): boolean {
            return canOpenCamera();
        },
        get contact(): boolean {
            return canOpenContact();
        },
        get share(): boolean {
            return canOpenShare();
        },
        get calendar(): boolean {
            return canOpenCalendar();
        },
    },
    Constants: {
        AppOpenState: AppOpenState,
        SettingType: SettingType,
        CameraType: CameraType,
        CaptureType: CaptureType,
    },
    Errors: {
        URLOpenError: URLOpenError,
        NotSupportedError: NotSupportedError,
        UserCancelledError: UserCancelledError,
    }
};

let resolveFileCleanup: (() => void) | undefined = undefined;

function resolveFocusEventConfig(): FocusEventConfig {
    const top: WindowProxy = getTopmostWindow();
    const topDocument: Document = top.document;
    const eventType: Partial<Record<FocusEventKey, string>> = {};
    const eventTarget: Partial<Record<FocusEventKey, EventTarget>> = {};
    const isCordova: boolean = typeof globalThis.cordova !== 'undefined';
    const isIOS: boolean = Platform.os.name === OS.iOS;
    const isIOSOver8: boolean = isIOS && compareVersion(Platform.os.version, '8.0') >= 0;
    const isIOSUnder8: boolean = isIOS && !isIOSOver8;
    const isStandard: boolean = EventListener.useStd;

    if (isCordova) {
        eventType.focus = 'resume';
        eventType.blur = 'pause';
        eventTarget.focus = topDocument;
        eventTarget.blur = topDocument;
    } else if (isIOSOver8) {
        eventType.visibilitychange = 'visibilitychange';
        eventTarget.visibilitychange = topDocument;
    } else if (isIOSUnder8) {
        eventType.focus = 'pageshow';
        eventType.blur = 'pagehide';
        eventTarget.focus = top;
        eventTarget.blur = top;
    } else if (isStandard) {
        eventType.focus = 'focus';
        eventType.blur = 'blur';
        eventType.visibilitychange = 'visibilitychange';
        eventTarget.focus = top;
        eventTarget.blur = top;
        eventTarget.visibilitychange = topDocument;
    } else {
        eventType.focus = 'focus';
        eventType.blur = 'blur';
        eventType.visibilitychange = 'visibilitychange';
        eventTarget.focus = topDocument;
        eventTarget.blur = topDocument;
        eventTarget.visibilitychange = topDocument;
    }

    return {
        type: eventType,
        target: eventTarget
    };
}

function getTrackId(bundle: string): string | undefined {
    try {
        const xhr: XMLHttpRequest = new XMLHttpRequest();

        xhr.open('GET', 'https://itunes.apple.com/lookup?bundleId=' + bundle, false);
        xhr.send();

        if (xhr.status === 200) {
            try {
                return parseLookupBundleIdResponse(JSON.parse(xhr.response));
            } catch (_: unknown) {
                return undefined;
            }
        }

        return undefined;
    } catch (_: unknown) {
        return undefined;
    }
}

function parseLookupBundleIdResponse(response: IOSAndMacOSLookupAppInfo): string | undefined {
    if (typeof response.results === 'undefined') return undefined;

    const results: IOSAndMacOSLookupAppResult[] = response.results;

    if (results.length === 0) return undefined;

    const result: IOSAndMacOSLookupAppResult = results[0];

    if (typeof result === 'undefined') return undefined;

    return '' + result.trackId;
}

function parseIntentURL(intent: string): AndroidAppInfo {
    const parsed: AndroidAppInfo = {};
    const split: string[] = intent.split('#Intent;');
    const host: string = split[0].substring(9);
    const suffix: string = split[1];
    const parameterString: string = suffix.substring(0, suffix.length - 4);
    const parameters: string[] = parameterString.split(';');
    const extras: Record<string, string> = {};

    for (let i: number = 0; i < parameters.length; i++) {
        const part: string = parameters[i];
        const index: number = part.indexOf('=');

        if (index !== -1) extras[part.substring(0, index)] = part.substring(index + 1);
    }

    if (typeof extras['scheme'] !== 'undefined') parsed.scheme = (extras['scheme'] + '://' + host);
    if (typeof extras['package'] !== 'undefined') parsed.packageName = extras['package'];
    if (typeof extras['S.browser_fallback_url'] !== 'undefined') parsed.fallback = extras['S.browser_fallback_url'];

    return parsed;
}

function createIntentURL(scheme: string, packageName: string | undefined, fallback: string | (() => void) | undefined): string {
    const split: string[] = scheme.split('://');
    const prefix: string = split[0];
    const suffix: string = split[1];

    let intent: string = 'intent://';

    if (typeof suffix !== 'undefined') intent += suffix;

    intent += '#Intent;'
        + 'scheme=' + prefix + ';'
        + 'action=android.intent.action.VIEW;'
        + 'category=android.intent.category.BROWSABLE;';

    if (typeof packageName !== 'undefined') intent += 'package=' + packageName + ';';
    if (typeof fallback !== 'undefined' && typeof fallback === 'string') intent += 'S.browser_fallback_url=' + globalThis.encodeURIComponent(fallback) + ';';
    else if (typeof packageName !== 'undefined') intent += 'S.browser_fallback_url=' + globalThis.encodeURIComponent(createAppStoreURL(packageName, OS.Android)!) + ';';

    return intent + 'end';
}

function createAppStoreURL(packageName: string | undefined, os: OS): string | undefined {
    if (typeof packageName === 'undefined') return undefined;

    switch (os) {
        case OS.Android:
            return 'market://details?id=' + packageName;
        case OS.iOS:
            return 'itms-apps://itunes.apple.com/app/id' + packageName + '?mt=8';
        case OS.Windows:
            return 'ms-windows-store://pdp/?ProductId=' + packageName;
        case OS.MacOS:
            return 'macappstore://itunes.apple.com/app/id' + packageName + '?mt=12';
        default:
            throw new URLOpenError('Unsupported OS: \"' + Platform.userAgent + '\"');
    }
}

function createWebStoreURL(packageName: string | undefined, os: OS): string | undefined {
    if (typeof packageName === 'undefined') return undefined;

    switch (os) {
        case OS.Android:
            return 'https://play.google.com/store/apps/details?id=' + packageName;
        case OS.iOS:
            return 'https://itunes.apple.com/app/id' + packageName + '?mt=8';
        case OS.Windows:
            return 'https://apps.microsoft.com/detail/' + packageName;
        case OS.MacOS:
            return 'https://apps.apple.com/app/id' + packageName + '?mt=12';
        default:
            throw new URLOpenError('Unsupported OS: \"' + Platform.userAgent + '\"');
    }
}

function getDefaultTimeoutByOS(os: OS): number {
    switch (os) {
        case OS.iOS:
            return 2000;
        case OS.Android:
            return 1000;
        default:
            return 750;
    }
}

function canOpenIntentURL(): boolean {
    if (Platform.os.name !== OS.Android) return false;

    const version: string = Platform.browser.version;

    // Browser:     Samsung Internet
    // Version:     17.0.1.69 ≤ v < 17.0.7.34
    // Bug:         `intent://` links open a blank tab instead of launching the target app.
    // Rationale:   The regression is reported for 17.0.1; subsequent Samsung Internet release notes list “bug fixes / stability improvements” around 17.0.4.3, 17.0.6.9 and 17.0.7.34, and no further blank-tab reports appear for later 17.x builds.
    // Sources:     https://forum.developer.samsung.com/t/chrome-intent-scheme/20237
    if (Platform.browser.name === Browsers.SamsungInternet && compareVersion(version, '17.0.1.69') >= 0 && compareVersion(version, '17.0.7.34') < 0) return false;

    // Browser:     Firefox
    // Version:     v < 41.0
    // Bug:         `intent://` links cannot launch apps because Intent URI handling is not implemented yet.
    // Rationale:   The Firefox for Android 41.0 release notes list “Open Android applications from a webpage via Intent URIs” as a new feature, implying earlier versions did not support it.
    // Sources:     https://bugzilla.mozilla.org/show_bug.cgi?id=851693
    if (Platform.browser.name === Browsers.Firefox && compareVersion(version, '41.0') < 0) return false;

    // Browser:     Firefox
    // Version:     59.0 ≤ v < 68.11.0
    // Bug:         When an `intent://` URL contains a `package` parameter, Firefox may incorrectly redirect to the Play Store (or fail to launch the installed app) even if the app is already installed.
    // Rationale:   Bugzilla bug 851693 comments report a regression in the 59.x range where a `package` parameter causes Play Store redirection; no explicit fix is documented for 58–68 Fennec, and 68.11.0 is announced as the final Fennec release, so we conservatively assume the entire 58–68.10.* range is impacted.
    // Sources:     https://bugzilla.mozilla.org/show_bug.cgi?id=1453784
    if (Platform.browser.name === Browsers.Firefox && compareVersion(version, '59.0') >= 0 && compareVersion(version, '68.11.0') < 0) return false;

    // Browser:     Firefox
    // Version:     80.0 ≤ v < 82.0
    // Bug:         Index links / `intent://` URLs may open the Play Store instead of the already-installed target app when loaded inside Firefox for Android (Fenix).
    // Rationale:   GitHub issue mozilla-mobile/fenix#12746 and related Support threads describe installed apps being ignored and links going to Play Store starting from 79; follow-up comments indicate fixes landing and QA verification around 81–82.
    // Sources:     https://github.com/mozilla-mobile/fenix/issues/12746
    if (Platform.browser.name === Browsers.Firefox && compareVersion(version, '80.0') >= 0 && compareVersion(version, '82.0') < 0) return false;

    // Browser:     Firefox
    // Version:     96.0 ≤ v < 107.0
    // Bug:         `S.browser_fallback_url` is always followed even when the target app is installed and should handle the intent, causing the fallback URL to load unnecessarily and potentially leaking SameSite=Strict cookies across contexts.
    // Rationale:   Fenix issue #23397 reports `S.browser_fallback_url` always being executed in 96.2.0, and CVE-2022-45413 documents the SameSite cookie leak for Firefox for Android versions prior to 107, so we treat 96–106.* as affected.
    // Sources:     https://github.com/mozilla-mobile/fenix/issues/23397
    if (Platform.browser.name === Browsers.Firefox && compareVersion(version, '96.0') >= 0 && compareVersion(version, '107.0') < 0) return false;

    // Browser:     Opera
    // Version:     v < 14.0
    // Bug:         Presto-based Opera for Android does not reliably support Chrome-style `intent://` links for launching installed apps.
    // Rationale:   Opera switched from Presto to Chromium around Opera 14; prior to this, its engine did not fully implement Chrome-specific Android Intent URI semantics.
    // Sources:     https://forums.opera.com/topic/11318
    if (Platform.browser.name === Browsers.Opera && compareVersion(version, '14.0') < 0) return false;

    // Browser:     Facebook / Instagram / WeChat / TicTok in-app browsers
    // Version:
    // Bug:
    // Rationale:
    // Sources:     https://developers.facebook.com/community/threads/470205278761649
    return !(/(?:fban\/fbios|fb_iab\/fb4a)(?!.+fbav)|;fbav\/[\w.]+;/i.test(Platform.userAgent) || /instagram[\/ ][-\w.]+/i.test(Platform.userAgent) || /micromessenger\/([\w.]+)/i.test(Platform.userAgent) || /musical_ly(?:.+app_?version\/|_)[\w.]+/i.test(Platform.userAgent) || /ultralite app_version\/[\w.]+/i.test(Platform.userAgent));
}

function canOpenUniversalURL() {
    return Platform.os.name === OS.iOS && compareVersion(Platform.os.version, '9.0') >= 0;
}

function canOpenSetting(): boolean {
    const os: OS = Platform.os.name;
    const version: string = Platform.os.version;

    if (os === OS.Unknown) return false;
    if (os === OS.Android && !canOpenIntentURL()) return false;
    if (os === OS.iOS) return false;
    if (os === OS.Windows && (version === 'Vista' || version === 'XP' || version === '2000' || version === 'NT 4.0' || version === 'NT 3.11' || version === 'ME' || compareVersion(version, '10') < 0)) return false;
    return !(os === OS.MacOS && compareVersion(version, '10.10') < 0);
}

function canOpenDirectory(): boolean {
    return typeof globalThis.showDirectoryPicker !== 'undefined' || typeof createHiddenElement('input').webkitdirectory !== 'undefined';
}

function canOpenCamera(): boolean {
    const os: OS = Platform.os.name;
    const version: string = Platform.os.version;

    return !Platform.isWebview && ((os === OS.iOS && compareVersion(version, '10.3.1') === 0) || (os === OS.Android && compareVersion(version, '3.0') >= 0));
}

function canOpenContact(): boolean {
    return typeof globalThis.navigator.contacts !== 'undefined';
}

function canOpenShare(): boolean {
    return typeof globalThis.navigator.share !== 'undefined';
}

function canOpenCalendar(): boolean {
    return Platform.os.name === OS.iOS && compareVersion(Platform.os.version, '15.0') >= 0 && Platform.browser.name === Browsers.Safari && !Platform.isWebview;
}

function pushURL(urls: [AppOpenState, URLStringOrFallback][], url: URLStringOrFallback | URLCandidate | undefined, state: AppOpenState, condition: boolean = false): void {
    if ((typeof url === 'function' || typeof url === 'string') && condition) urls.push([state, url]);
}

function joining<T>(values: ArrayLike<T>, mapfn: ((value: T) => string) | undefined = undefined, separator: string = ','): string {
    const length: number = values.length;
    let result: string = '';

    for (let i: number = 0; i < length; i++) {
        if (i !== 0) result += separator;

        if (typeof mapfn !== 'undefined') result += mapfn(values[i]);
        else result += values[i];
    }

    return result;
}

function escapeURIComponentString(value: string): string {
    return globalThis.encodeURIComponent(value)
        .replace(/[!'()*]/g, function (char: string): string {
            return '%' + char.charCodeAt(0).toString(16);
        });
}

function escapeURIComponentMailAddressString(value: string): string {
    return escapeURIComponentString(value)
        .replace(/%22/g, '"')
        .replace(/%40/g, '@')
        .replace(/%2C/gi, ',');
}

function escapeICSString(value: string): string {
    return value
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\r\n|\n|\r/g, '\\n');
}

function utf8ByteLength(value: string): number {
    if (typeof globalThis.TextEncoder !== 'undefined') return new TextEncoder().encode(value).length;
    return globalThis.unescape(globalThis.encodeURIComponent(value)).length;
}

function foldICSString(value: string): string {
    if (utf8ByteLength(value) <= 75) return value;

    let out: string = '';
    let current: string = '';
    let currentBytes: number = 0;

    for (let i: number = 0; i < value.length; i++) {
        const char: string = value[i];
        const charBytes: number = utf8ByteLength(value[i]);

        if (current !== '' && currentBytes + charBytes > 75) {
            out += current + '\r\n ';
            current = char;
            currentBytes = charBytes;
        } else {
            current += char;
            currentBytes += charBytes;
        }
    }

    out += current;
    return out;
}

function urlToString<T>(value: URLCandidate | Exclude<T, URL> | undefined): Exclude<T, URL> | string | undefined {
    if (value instanceof URL) return value.toString();
    return value;
}

function dateToICSDateString(date: Date, allDay: boolean = false): string {
    if (allDay) {
        return date.getUTCFullYear()
            + padStart(date.getUTCMonth() + 1, 2, '0')
            + padStart(date.getUTCDate(), 2, '0');
    }

    return date.getUTCFullYear()
        + padStart(date.getUTCMonth() + 1, 2, '0')
        + padStart(date.getUTCDate(), 2, '0')
        + 'T'
        + padStart(date.getUTCHours(), 2, '0')
        + padStart(date.getUTCMinutes(), 2, '0')
        + padStart(date.getUTCSeconds(), 2, '0')
        + 'Z';
}

function getURLOpenError(tried: string[]): Error {
    let triedURLString: string = '';

    for (let i: number = 0; i < tried.length; i++) triedURLString += '\n' + (i + 1) + ': ' + tried[i];
    if (triedURLString.length > 0) triedURLString = '\n' + triedURLString + '\n';

    return new URLOpenError('Failed to open any of the provided URLs: ' + triedURLString);
}

function openURLViaHref(url: string, index: number): HTMLAnchorElement | undefined {
    const top: WindowProxy = getTopmostWindow();
    const topDocument: Document = top.document;
    let anchor: HTMLAnchorElement | undefined = undefined;

    try {
        if (index === 0) {
            top.location.href = url;
            return;
        }

        anchor = createHiddenElement('a');
        anchor.href = url;

        topDocument.body.appendChild(anchor);

        dispatchClickEvent(anchor, top);

        return anchor;
    } catch (_: unknown) {
    } finally {
        if (typeof anchor !== 'undefined') {
            try {
                topDocument.body.removeChild(anchor);
            } catch (_: unknown) {
            }
        }
    }
}

function openURLViaIframe(url: string): HTMLIFrameElement | undefined {
    const top: WindowProxy = getTopmostWindow();
    const topDocument: Document = top.document;
    let iframe: HTMLIFrameElement | undefined = undefined;

    try {
        iframe = createHiddenElement('iframe');

        if (typeof iframe === 'undefined') return;

        iframe.src = url;

        topDocument.body.appendChild(iframe);

        globalThis.setTimeout(function (): void {
            if (typeof iframe !== 'undefined') {
                try {
                    topDocument.body.removeChild(iframe);
                } catch (_: unknown) {
                }
            }
        }, 500);
    } catch (_: unknown) {
    }

    return iframe;
}

function isDocumentHidden(): boolean {
    const top: WindowProxy = getTopmostWindow();
    const topDocument: Document = top.document;

    if (topDocument.visibilityState === 'hidden') return true;
    if (topDocument.webkitVisibilityState === 'hidden') return true;
    if (topDocument.mozVisibilityState === 'hidden') return true;
    if (topDocument.msVisibilityState === 'hidden') return true;
    if (typeof topDocument.hidden !== 'undefined') return topDocument.hidden;
    if (typeof topDocument.webkitHidden !== 'undefined') return topDocument.webkitHidden;
    if (typeof topDocument.mozHidden !== 'undefined') return topDocument.mozHidden;
    if (typeof topDocument.msHidden !== 'undefined') return topDocument.msHidden;
    if (typeof topDocument.hasFocus === 'function') return !topDocument.hasFocus();

    return true;
}

function hasFocus(document: Document): boolean {
    if (typeof document.hasFocus === 'function') return document.hasFocus();
    return false;
}

function focus(target: WindowProxy | HTMLOrSVGElement): void {
    try {
        target.focus({preventScroll: true});
    } catch (_: unknown) {
        try {
            target.focus();
        } catch (_: unknown) {
        }
    }
}

function restoreFocus(): boolean {
    const top: WindowProxy = getTopmostWindow();
    const topDocument: Document = top.document;

    focus(top);

    if (hasFocus(topDocument)) return true;

    if (topDocument.body.tabIndex < 0) topDocument.body.tabIndex = -1;

    focus(topDocument.body);

    if (hasFocus(topDocument)) return true;

    let input: HTMLInputElement | undefined = undefined;

    try {
        input = createHiddenElement('input');

        if (typeof input === 'undefined') return false;

        input.type = 'text';
        input.readOnly = true;

        topDocument.body.appendChild(input);

        focus(input);

        try {
            input.select();
        } catch (_: unknown) {
        }

        if (hasFocus(topDocument)) return true;
    } catch (_: unknown) {
    } finally {
        if (typeof input !== 'undefined' && input !== null) {
            try {
                input.blur();
            } catch (_: unknown) {
            }

            try {
                topDocument.body.removeChild(input);
            } catch (_: unknown) {
            }
        }
    }

    return hasFocus(topDocument);
}

function resolveFile(from: HTMLInputElement | Promise<FileSystemFileHandle[]>): Promise<File[]> {
    if (Object.prototype.toString.call(from) === '[object Promise]') {
        const handle: Promise<FileSystemFileHandle[]> = from as Promise<FileSystemFileHandle[]>;

        return new Promise(function (resolve: (files: File[]) => void, reject: (error: Error) => void): void {
            handle
                .then(function (handles: FileSystemFileHandle[]): void {
                    const getFiles: Promise<File>[] = [];

                    for (let i: number = 0; i < handles.length; i++) getFiles[i] = handles[i].getFile();

                    Promise.all(getFiles)
                        .then(resolve)
                        .catch(reject);
                })
                .catch(function (error: Error): void {
                    if (error.name === 'AbortError') return reject(new UserCancelledError('User cancelled the operation.'));
                    return reject(new NotSupportedError(error.message));
                });
        });
    } else {
        const input: HTMLInputElement = from as HTMLInputElement;
        const config: FocusEventConfig = resolveFocusEventConfig();
        const top: WindowProxy = getTopmostWindow();
        const topDocument: Document = top.document;

        return new Promise(function (resolve: (files: File[]) => void, reject: (error: Error) => void): void {
            let resolved: boolean = false;

            function cleanup(): void {
                resolveFileCleanup = undefined;

                try {
                    EventListener.remove(config.target.focus, {type: config.type.focus, callback: onFocus});
                    EventListener.remove(config.target.visibilitychange, {type: config.type.visibilitychange, callback: onVisibilityChange});
                    EventListener.remove(topDocument, {type: 'click', callback: onClick});
                } catch (_: unknown) {
                    // cross-origin window
                }
            }

            function done(success: boolean): void {
                if (resolved) return;

                resolved = true;

                const fileList: FileList | null = input.files;
                const files: File[] = [];

                if (fileList === null) return resolve(files);

                for (let i: number = 0; i < fileList.length; i++) files.push(fileList[i]);

                cleanup();

                if (success) resolve(files);
                else reject(new UserCancelledError('User cancelled the operation.'));
            }

            function onFocus(): void {
                globalThis.setTimeout(function (): void {
                    if (input.value.length > 0) done(true);
                    else done(false);
                }, 1000);
            }

            function onVisibilityChange(): void {
                if (!isDocumentHidden()) onFocus();
            }

            function onClick(): void {
                done(false);
            }

            input.onchange = function (): void {
                done(true);
            };

            if (typeof resolveFileCleanup !== 'undefined') resolveFileCleanup();

            if (typeof input.oncancel !== 'undefined') {
                input.oncancel = function () {
                    done(false);
                };
            } else {
                input.onclick = function (): void {
                    EventListener.add(config.target.visibilitychange, {type: config.type.visibilitychange, callback: onVisibilityChange});
                    EventListener.add(config.target.focus, {type: config.type.focus, callback: onFocus});

                    globalThis.setTimeout(function (): void {
                        EventListener.add(topDocument, {type: 'click', callback: onClick});
                    }, 100);

                    resolveFileCleanup = function (): void {
                        done(false);
                    };
                }
            }

            dispatchClickEvent(input);
        });
    }
}

function resolveFileWithPath(from: HTMLInputElement | Promise<FileSystemDirectoryHandle>): Promise<FileWithPath[]> {
    if (Object.prototype.toString.call(from) === '[object Promise]') {
        const handle: Promise<FileSystemDirectoryHandle> = from as Promise<FileSystemDirectoryHandle>;

        return new Promise(function (resolve: (files: FileWithPath[]) => void, reject: (error: Error) => void): void {
            handle
                .then(function (handle: FileSystemDirectoryHandle): void {
                    const tasks: Promise<void>[] = [];
                    const fileWithPaths: FileWithPath[] = [];

                    function walkDirectory(directory: FileSystemDirectoryHandle, basePath: string = ''): Promise<void> {
                        return new Promise(function (resolve: () => void, reject: (error: Error) => void): void {
                            const iterator: AsyncIterator<[string, FileSystemHandle]> = directory.entries();

                            function pump(): void {
                                iterator
                                    .next()
                                    .then(function (result: IteratorResult<[string, FileSystemHandle]>): void {
                                        if (result.done) return resolve();

                                        const name: string = result.value[0];
                                        const handle: FileSystemHandle = result.value[1];
                                        let path: string;

                                        if (basePath === '') path = name;
                                        else path = basePath + '/' + name;

                                        if (handle.kind === 'file') {
                                            tasks.push(
                                                (handle as FileSystemFileHandle)
                                                    .getFile()
                                                    .then(function (file: File): void {
                                                        fileWithPaths.push({
                                                            file: file,
                                                            relativePath: path,
                                                        });
                                                    })
                                            );
                                        } else {
                                            tasks.push(walkDirectory(handle as FileSystemDirectoryHandle, path));
                                        }

                                        pump();
                                    })
                                    .catch(reject);
                            }

                            pump();
                        });
                    }

                    walkDirectory(handle, handle.name)
                        .then(function (): void {
                            Promise.all(tasks)
                                .then(function (): void {
                                    resolve(fileWithPaths);
                                })
                                .catch(reject);
                        })
                        .catch(reject);
                })
                .catch(function (error: Error): void {
                    if (error.name === 'AbortError') return reject(new UserCancelledError('User cancelled the operation.'));
                    return reject(new NotSupportedError(error.message));
                });
        });
    } else {
        const input: HTMLInputElement = from as HTMLInputElement;

        return new Promise(function (resolve: (files: FileWithPath[]) => void, reject: (error: Error) => void): void {
            resolveFile(input)
                .then(function (files: File[]): void {
                    const fileWithPaths: FileWithPath[] = [];

                    for (let i: number = 0; i < files.length; i++) {
                        const file: File = files[i];

                        fileWithPaths.push({
                            file: file,
                            relativePath: file.webkitRelativePath,
                        });
                    }

                    resolve(fileWithPaths);
                })
                .catch(reject);
        });
    }
}

function tryOpenURL(url: string, index: number, timeout: number): Promise<void> {
    const config: FocusEventConfig = resolveFocusEventConfig();
    const top: WindowProxy = getTopmostWindow();
    const topDocument: Document = top.document;

    let a: HTMLAnchorElement | undefined = undefined;
    let iframe: HTMLIFrameElement | undefined = undefined;

    return new Promise(function (resolve: () => void, reject: () => void): void {
        let timeoutId: ReturnType<typeof globalThis.setTimeout> | undefined;
        let resolved: boolean = false;

        function cleanup(): void {
            if (typeof timeoutId !== 'undefined') {
                clearTimeout(timeoutId);

                timeoutId = undefined;
            }

            try {
                EventListener.remove(config.target.blur, {type: config.type.blur, callback: onBlur});
                EventListener.remove(config.target.focus, {type: config.type.focus, callback: onFocus});
                EventListener.remove(config.target.visibilitychange, {type: config.type.visibilitychange, callback: onVisibilityChange});
            } catch (_: unknown) {
                // cross-origin window
            }

            if (typeof a !== 'undefined') {
                try {
                    topDocument.body.removeChild(a);
                } catch (_: unknown) {
                }
            }

            if (typeof iframe !== 'undefined') {
                try {
                    topDocument.body.removeChild(iframe);
                } catch (_: unknown) {
                }
            }
        }

        function done(success: boolean): void {
            if (resolved) return;

            resolved = true;

            cleanup();
            if (success) resolve();
            else reject();
        }

        function onBlur(): void {
            if (typeof timeoutId !== 'undefined') {
                clearTimeout(timeoutId);

                timeoutId = undefined;
            }

            EventListener.remove(config.target.blur, {type: config.type.blur, callback: onBlur});
            EventListener.add(config.target.focus, {type: config.type.focus, callback: onFocus});
        }

        function onFocus(): void {
            done(true);
        }

        function onVisibilityChange(): void {
            if (isDocumentHidden()) onBlur();
            else onFocus();
        }

        timeoutId = globalThis.setTimeout(function (): void {
            done(false);
        }, timeout);

        EventListener.add(config.target.blur, {type: config.type.blur, callback: onBlur});
        EventListener.add(config.target.visibilitychange, {type: config.type.visibilitychange, callback: onVisibilityChange});

        if (!hasFocus(topDocument)) restoreFocus();

        try {
            if (typeof globalThis.cordova !== 'undefined') {
                globalThis.open(url, '_system');
            } else {
                a = openURLViaHref(url, index);
                iframe = openURLViaIframe(url);
            }
        } catch (_: unknown) {
            done(false);
        }
    });
}

function getAndroidAppInfo(options: AppOpenOptions): AndroidAppInfo | undefined {
    if (typeof options[OS.Android] !== 'undefined') return options[OS.Android];
    return options.android;
}

function getIOSAppInfo(options: AppOpenOptions): IOSAppInfo | undefined {
    if (typeof options[OS.iOS] !== 'undefined') return options[OS.iOS];
    return options.ios;
}

function getWindowsAppInfo(options: AppOpenOptions): IOSAppInfo | undefined {
    if (typeof options[OS.Windows] !== 'undefined') return options[OS.Windows];
    return options.windows;
}

function getMacOSAppInfo(options: AppOpenOptions): IOSAppInfo | undefined {
    if (typeof options[OS.MacOS] !== 'undefined') return options[OS.MacOS];
    return options.macos;
}

function app(this: OpenInstance, options: AppOpenOptions): Promise<AppOpenState> {
    const os: OS = Platform.os.name;
    const urls: [AppOpenState, URLStringOrFallback][] = [];
    const tried: string[] = [];
    const infos: Partial<AndroidAppInfo & IOSAppInfo & WindowsAppInfo & MacOSAppInfo & StoreInfo> = {};

    let timeout: number | undefined;

    if (os === OS.Android) {
        const option: AndroidAppInfo | undefined = getAndroidAppInfo(options);

        if (typeof option === 'undefined') return Promise.reject(getURLOpenError(tried));

        timeout = option.timeout;

        infos.scheme = urlToString(option.scheme);
        infos.intent = urlToString(option.intent);
        infos.packageName = option.packageName;
        infos.fallback = urlToString(option.fallback);
        infos.appStore = createAppStoreURL(infos.packageName, OS.Android);
        infos.webStore = createWebStoreURL(infos.packageName, OS.Android);
        infos.allowAppStore = option.allowAppStore;
        infos.allowWebStore = option.allowWebStore;

        if (typeof infos.intent !== 'undefined' && (typeof infos.scheme === 'undefined' || typeof infos.packageName === 'undefined' || typeof infos.fallback === 'undefined')) {
            const parsed: AndroidAppInfo = parseIntentURL(infos.intent);

            if (typeof parsed.scheme !== 'undefined' && typeof infos.scheme === 'undefined') infos.scheme = parsed.scheme as string;
            if (typeof parsed.packageName !== 'undefined' && typeof infos.packageName === 'undefined') infos.packageName = parsed.packageName;
            if (typeof parsed.fallback !== 'undefined' && typeof infos.fallback === 'undefined') infos.fallback = parsed.fallback as string;
        }

        if (typeof infos.scheme !== 'undefined' && typeof infos.intent === 'undefined') infos.intent = createIntentURL(infos.scheme, infos.packageName, infos.fallback);
    } else if (os === OS.iOS) {
        const option: IOSAppInfo | undefined = getIOSAppInfo(options);

        if (typeof option === 'undefined') return Promise.reject(getURLOpenError(tried));

        timeout = option.timeout;

        infos.scheme = urlToString(option.scheme);
        infos.bundleId = option.bundleId;
        infos.trackId = option.trackId;
        infos.universal = urlToString(option.universal);
        infos.fallback = urlToString(option.fallback);
        infos.appStore = createAppStoreURL(infos.trackId, OS.iOS);
        infos.webStore = createWebStoreURL(infos.trackId, OS.iOS);
        infos.allowAppStore = option.allowAppStore;
        infos.allowWebStore = option.allowWebStore;

        if (typeof infos.bundleId !== 'undefined' && typeof infos.trackId === 'undefined') infos.trackId = getTrackId(infos.bundleId);
    } else if (os === OS.Windows) {
        const option: WindowsAppInfo | undefined = getWindowsAppInfo(options);

        if (typeof option === 'undefined') return Promise.reject(getURLOpenError(tried));

        timeout = option.timeout;

        infos.scheme = urlToString(option.scheme);
        infos.productId = option.productId;
        infos.fallback = urlToString(option.fallback);
        infos.appStore = createAppStoreURL(infos.productId, OS.Windows);
        infos.webStore = createWebStoreURL(infos.productId, OS.Windows);
        infos.allowAppStore = option.allowAppStore;
        infos.allowWebStore = option.allowWebStore;
    } else if (os === OS.MacOS) {
        const option: MacOSAppInfo | undefined = getMacOSAppInfo(options);

        if (typeof option === 'undefined') return Promise.reject(getURLOpenError(tried));

        timeout = option.timeout;

        infos.scheme = urlToString(option.scheme);
        infos.bundleId = option.bundleId;
        infos.trackId = option.trackId;
        infos.fallback = urlToString(option.fallback);
        infos.appStore = createAppStoreURL(infos.trackId, OS.MacOS);
        infos.webStore = createWebStoreURL(infos.trackId, OS.MacOS);
        infos.allowAppStore = option.allowAppStore;
        infos.allowWebStore = option.allowWebStore;

        if (typeof infos.bundleId !== 'undefined' && typeof infos.trackId === 'undefined') infos.trackId = getTrackId(infos.bundleId);
    }

    pushURL(urls, infos.intent, AppOpenState.Intent, canOpenIntentURL());
    pushURL(urls, infos.universal, AppOpenState.Universal, canOpenUniversalURL());
    pushURL(urls, infos.scheme, AppOpenState.Scheme, true);
    pushURL(urls, infos.fallback, AppOpenState.Fallback, true);
    pushURL(urls, infos.appStore, AppOpenState.Store, infos.allowAppStore);
    pushURL(urls, infos.webStore, AppOpenState.Store, infos.allowWebStore);

    if (typeof timeout === 'undefined') timeout = getDefaultTimeoutByOS(os);

    return new Promise(function (resolve: (value: AppOpenState) => void, reject: (urlOpenError: Error) => void): Promise<void> | void {
        function openURLSequential(index: number = 0): Promise<void> | void {
            if (index >= urls.length) return reject(getURLOpenError(tried));

            const entry: [AppOpenState, URLStringOrFallback] = urls[index];
            const state: AppOpenState = entry[0];
            const url: URLStringOrFallback = entry[1];

            if (typeof url === 'string') {
                tried[index] = url;

                return tryOpenURL(url, index, timeout!)
                    .then(function (): void {
                        resolve(state);
                    })
                    .catch(function (): void {
                        openURLSequential(index + 1);
                    });
            } else {
                tried[index] = '[function fallback]';

                url();
                resolve(state);
            }
        }

        return openURLSequential();
    });
}

function openMessenger(options: MailOptions, type: string): Promise<void> {
    if (typeof options.to === 'string') options.to = escapeURIComponentMailAddressString(options.to);
    if (typeof options.cc === 'string') options.cc = escapeURIComponentMailAddressString(options.cc);
    if (typeof options.bcc === 'string') options.bcc = escapeURIComponentMailAddressString(options.bcc);
    if (typeof options.subject === 'string') options.subject = escapeURIComponentString(options.subject);
    if (typeof options.body === 'string') options.body = escapeURIComponentString(options.body);

    if (typeof options.to === 'object') options.to = joining(options.to, escapeURIComponentMailAddressString);
    if (typeof options.cc === 'object') options.cc = joining(options.cc, escapeURIComponentMailAddressString);
    if (typeof options.bcc === 'object') options.bcc = joining(options.bcc, escapeURIComponentMailAddressString);

    const params: string[] = [];
    let url: string = type + ':';

    if (typeof options.to === 'string') url += options.to;
    if (typeof options.cc === 'string') params.push('cc=' + options.cc);
    if (typeof options.bcc === 'string') params.push('bcc=' + options.bcc);
    if (typeof options.subject === 'string') params.push('subject=' + options.subject);
    if (typeof options.body === 'string') params.push('body=' + options.body);

    return tryOpenURL(url + '?' + joining(params, undefined, '&'), 0, getDefaultTimeoutByOS(Platform.os.name));
}

function telephone(this: OpenInstance, options: TelephoneOptions) {
    return openMessenger(options, 'tel');
}

function message(this: OpenInstance, options: MessageOptions) {
    return openMessenger(options, 'sms');
}

function mail(this: OpenInstance, options: MailOptions) {
    return openMessenger(options, 'mailto');
}

function setting(this: OpenInstance, type: SettingType): Promise<void> {
    const os: OS = Platform.os.name;
    const version: string = Platform.os.version;

    if (!canOpenSetting()) return Promise.reject(getURLOpenError([]));

    const urls: string[] = [];

    switch (os) {
        case OS.Android:
            if (type !== SettingType.General) {
                if (type === SettingType.Accessibility && compareVersion(version, '1.6') >= 0) urls.push(SETTING_URL['Android'][SettingType.Accessibility]);
                else if (type === SettingType.Battery && compareVersion(version, '5.1') >= 0) urls.push(SETTING_URL['Android'][SettingType.Battery]);
                else if (type === SettingType.Accounts && compareVersion(version, '1.5') >= 0) urls.push(SETTING_URL['Android'][SettingType.Accounts]);
                else if (type === SettingType.Storage && compareVersion(version, '3.0') >= 0) urls.push(SETTING_URL['Android'][SettingType.Storage]);
                else urls.push(SETTING_URL['Android'][type]);
            }

            urls.push(SETTING_URL['Android'][SettingType.General]);
            break;
        case OS.Windows:
            urls.push(SETTING_URL['Windows'][type]);
            break;
        case OS.MacOS:
            if (type === SettingType.Appearance && compareVersion(version, '10.14') < 0) {
                urls.push(SETTING_URL['MacOS'][SettingType.General]);
                break;
            }

            if (compareVersion(version, '13.0') < 0) urls.push(SETTING_URL['MacOS'][type]);
            else urls.push(SETTING_URL['MacOS13+'][type]);
            break;
    }

    return new Promise(function (resolve: () => void, reject: (urlOpenError: Error) => void): Promise<void> | void {
        function openURLSequential(index: number = 0): Promise<void> | void {
            if (index >= urls.length) return reject(getURLOpenError([]));

            const url: URLStringOrFallback = urls[index];

            return tryOpenURL(url, index, 750)
                .then(function (): void {
                    resolve();
                })
                .catch(function (): void {
                    openURLSequential(index + 1);
                });
        }

        return openURLSequential();
    });
}

function file(this: OpenInstance, options?: FileOptions): Promise<File[]> {
    if (typeof globalThis.showOpenFilePicker !== 'undefined') {
        const openFilePickerOption: OpenFilePickerOptions = {};

        if (typeof options !== 'undefined') {
            if (typeof options.multiple !== 'undefined') openFilePickerOption.multiple = options.multiple;
            if (typeof options.id !== 'undefined') openFilePickerOption.id = options.id;
            if (typeof options.startIn !== 'undefined') openFilePickerOption.startIn = options.startIn;
            if (typeof options.accept !== 'undefined') {
                const accepts: Record<string, string[]> = {};

                openFilePickerOption.excludeAcceptAllOption = true;
                openFilePickerOption.types = [{
                    description: '',
                    accept: accepts,
                }];

                for (let i: number = 0; i < options.accept.length; i++) {
                    const accept: string = options.accept[i];

                    if (/^\.\w+/i.test(accept)) {
                        if (typeof accepts['application/octet-stream'] === 'undefined') accepts['application/octet-stream'] = [];

                        accepts['application/octet-stream'].push(accept);
                    } else if (/^\w+\/\w+$/i.test(accept)) {
                        accepts[accept] = [];
                    }
                }
            }
        }

        return resolveFile(globalThis.showOpenFilePicker(openFilePickerOption));
    }

    const input: HTMLInputElement = createHiddenElement('input');

    input.type = 'file';

    if (typeof options !== 'undefined') {
        if (typeof options.multiple !== 'undefined') input.multiple = options.multiple;
        if (typeof options.accept !== 'undefined') input.accept = joining(options.accept);
    }

    return resolveFile(input);
}

function directory(this: OpenInstance, options?: DirectoryOptions): Promise<FileWithPath[]> {
    if (!canOpenDirectory()) return Promise.reject(new NotSupportedError('\'window.showDirectoryPicker\' and \'HTMLInputElement.prototype.webkitdirectory\' does not supported.'));

    if (typeof globalThis.showDirectoryPicker !== 'undefined') {
        const openDirectoryPickerOption: OpenDirectoryPickerOptions = {};

        if (typeof options !== 'undefined') {
            if (typeof options.id !== 'undefined') openDirectoryPickerOption.id = options.id;
            if (typeof options.startIn !== 'undefined') openDirectoryPickerOption.startIn = options.startIn;
            if (typeof options.mode !== 'undefined') openDirectoryPickerOption.mode = options.mode;
        }

        return resolveFileWithPath(globalThis.showDirectoryPicker(openDirectoryPickerOption));
    }

    const input: HTMLInputElement = createHiddenElement('input');

    input.type = 'file';
    input.webkitdirectory = true;

    return resolveFileWithPath(input);
}

function camera(this: OpenInstance, options?: CameraOptions): Promise<File[]> {
    const input: HTMLInputElement = createHiddenElement('input');

    input.type = 'file';
    input.accept = 'image/*;capture=camera';
    input.capture = 'environment';

    if (typeof options !== 'undefined') {
        if (typeof options.type !== 'undefined') {
            if (options.type === CameraType.Image) input.accept = 'image/*;capture=camera';
            else input.accept = 'video/*;capture=camcorder';
        }

        if (typeof options.capture !== 'undefined') {
            if (options.capture === CaptureType.Environment) input.capture = 'environment';
            else input.capture = 'user';
        }
    }

    return resolveFile(input);
}

function contact(this: OpenInstance, options?: ContactOptions): Promise<Contact[]> {
    return new Promise(function (resolve: (contacts: Contact[]) => void, reject: (error: Error) => void): void {
        if (!canOpenContact()) return reject(new NotSupportedError('\'navigator.contacts\' does not supported.'));

        let multiple: boolean = false;

        if (typeof options !== 'undefined' && typeof options.multiple !== 'undefined') multiple = options.multiple;

        globalThis.navigator.contacts!
            .getProperties()
            .then(function (properties: string[]): void {
                globalThis.navigator.contacts!
                    .select(properties, {multiple: multiple})
                    .then(function (contacts: Contact[]): void {
                        resolve(contacts);
                    });
            });
    });
}

function share(this: OpenInstance, options: ShareData): Promise<void> {
    return new Promise(function (resolve: () => void, reject: (error: Error) => void): void {
        if (!canOpenShare()) return reject(new NotSupportedError('\'navigator.share\' does not supported.'));
        if (!globalThis.navigator.canShare(options)) return reject(new NotSupportedError('The provided data cannot be shared on this device.'));

        globalThis.navigator.share(options)
            .then(function (): void {
                resolve();
            })
            .catch(function (error: Error): void {
                if (error.name === 'AbortError') return reject(new UserCancelledError('User cancelled the operation.'));
                return reject(new NotSupportedError(error.message));
            });
    });
}

function calendar(this: OpenInstance, options: CalendarOptions): void {
    const timestamp: number = now();

    let ics: string = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\n';

    if (globalThis.document.title !== '') {
        ics += foldICSString('PRODID:-//' + escapeICSString(globalThis.document.title) + '//EN') + '\r\n'
    } else {
        ics += foldICSString('PRODID:-//' + escapeICSString(globalThis.location.host) + '//EN') + '\r\n'
    }

    ics += 'BEGIN:VEVENT\r\n'
        + 'UID:' + timestamp + '-' + randomString(10) + '\r\n'
        + 'DTSTAMP:' + dateToICSDateString(new Date()) + '\r\n';

    if (options.allDay === true) {
        ics += 'DTSTART;VALUE=DATE:' + dateToICSDateString(options.startDate, true) + '\r\n'
            + 'DTEND;VALUE=DATE:' + dateToICSDateString(options.endDate, true) + '\r\n';
    } else {
        ics += 'DTSTART:' + dateToICSDateString(options.startDate) + '\r\n'
            + 'DTEND:' + dateToICSDateString(options.endDate) + '\r\n';
    }

    if (typeof options.title !== 'undefined') {
        ics += foldICSString('SUMMARY:' + escapeICSString(options.title)) + '\r\n';
    }

    if (typeof options.description !== 'undefined') {
        ics += foldICSString('DESCRIPTION:' + escapeICSString(options.description)) + '\r\n';
    }

    if (typeof options.location !== 'undefined') {
        ics += foldICSString('LOCATION:' + escapeICSString(options.location)) + '\r\n';
    }

    if (typeof options.recur !== 'undefined') {
        let rrule: string = 'FREQ=' + options.recur.frequency;

        if (typeof options.recur.interval !== 'undefined' && options.recur.interval > 1) {
            rrule += ';INTERVAL=' + String(options.recur.interval);
        }

        if (typeof options.recur.count !== 'undefined') {
            rrule += ';COUNT=' + String(options.recur.count);
        }

        if (typeof options.recur.until !== 'undefined') {
            rrule += ';UNTIL=' + dateToICSDateString(options.recur.until);
        }

        if (typeof options.recur.byMonth !== 'undefined' && options.recur.byMonth.length > 0) {
            rrule += ';BYMONTH=' + joining(options.recur.byMonth);
        }

        if (typeof options.recur.byWeekNo !== 'undefined' && options.recur.byWeekNo.length > 0) {
            rrule += ';BYWEEKNO=' + joining(options.recur.byWeekNo);
        }

        if (typeof options.recur.byYearDay !== 'undefined' && options.recur.byYearDay.length > 0) {
            rrule += ';BYYEARDAY=' + joining(options.recur.byYearDay);
        }

        if (typeof options.recur.byMonthDay !== 'undefined' && options.recur.byMonthDay.length > 0) {
            rrule += ';BYMONTHDAY=' + joining(options.recur.byMonthDay);
        }

        if (typeof options.recur.byDay !== 'undefined' && options.recur.byDay.length > 0) {
            rrule += ';BYDAY=' + joining(options.recur.byDay);
        }

        if (typeof options.recur.byHour !== 'undefined' && options.recur.byHour.length > 0) {
            rrule += ';BYHOUR=' + joining(options.recur.byHour);
        }

        if (typeof options.recur.byMinute !== 'undefined' && options.recur.byMinute.length > 0) {
            rrule += ';BYMINUTE=' + joining(options.recur.byMinute);
        }

        if (typeof options.recur.bySecond !== 'undefined' && options.recur.bySecond.length > 0) {
            rrule += ';BYSECOND=' + joining(options.recur.bySecond);
        }

        if (typeof options.recur.bySetPos !== 'undefined' && options.recur.bySetPos.length > 0) {
            rrule += ';BYSETPOS=' + joining(options.recur.bySetPos);
        }

        if (typeof options.recur.weekStart !== 'undefined' && options.recur.weekStart !== 'MO') {
            rrule += ';WKST=' + options.recur.weekStart;
        }

        ics += foldICSString('RRULE:' + rrule) + '\r\n';
    }

    if (typeof options.alarm !== 'undefined') {
        for (let i: number = 0; i < options.alarm.length; i++) {
            const alarm: CalendarAlarmOptions = options.alarm[i];

            ics += 'BEGIN:VALARM\r\n'
                + 'ACTION:DISPLAY\r\n';

            if (typeof alarm.datetime !== 'undefined') {
                ics += 'TRIGGER;VALUE=DATE-TIME:' + dateToICSDateString(alarm.datetime) + '\r\n';
            } else {
                let duration: string = '';

                if (typeof alarm.before === 'undefined' || alarm.before) {
                    duration += '-';
                }

                duration += 'P';

                if (typeof alarm.weeks !== 'undefined' && alarm.weeks > 0) {
                    duration += String(alarm.weeks) + 'W';
                } else {
                    if (typeof alarm.days !== 'undefined' && alarm.days > 0) {
                        duration += String(alarm.days) + 'D';
                    }

                    const hasHours: boolean = (typeof alarm.hours !== 'undefined' && alarm.hours > 0);
                    const hasMinutes: boolean = (typeof alarm.minutes !== 'undefined' && alarm.minutes > 0);
                    const hasSeconds: boolean = (typeof alarm.seconds !== 'undefined' && alarm.seconds > 0);

                    if (hasHours || hasMinutes || hasSeconds) {
                        duration += 'T';

                        if (hasHours) {
                            duration += String(alarm.hours) + 'H';
                        }

                        if (hasMinutes) {
                            duration += String(alarm.minutes) + 'M';
                        }

                        if (hasSeconds) {
                            duration += String(alarm.seconds) + 'S';
                        }
                    }
                }

                ics += 'TRIGGER:' + duration + '\r\n';
            }

            if (typeof alarm.description !== 'undefined') {
                ics += foldICSString('DESCRIPTION:' + escapeICSString(alarm.description)) + '\r\n';
            } else {
                ics += 'DESCRIPTION:Reminder\r\n';
            }

            if (typeof alarm.datetime === 'undefined' && typeof alarm.repeat !== 'undefined' && typeof alarm.repeatDuration !== 'undefined') {
                ics += 'REPEAT:' + String(alarm.repeat) + '\r\n';
                ics += 'DURATION:PT' + String(alarm.repeatDuration) + 'M\r\n';
            }

            ics += 'END:VALARM\r\n';
        }
    }

    ics += 'END:VEVENT\r\nEND:VCALENDAR';

    const anchor: HTMLAnchorElement = createHiddenElement('a');

    anchor.href = 'data:text/calendar;charset=utf-8,' + globalThis.encodeURIComponent(ics);
    anchor.download = 'event-' + timestamp + '.ics';

    dispatchClickEvent(anchor);
}

export default Open;
