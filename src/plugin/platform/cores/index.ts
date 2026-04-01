import {GPU, GPUAdapterInfo, Locale, NameVersionPair, PlatformInstance, VersionResolver} from "../types";
import compareVersion from "../../../utils/compare-version";
import {
    BROWSER_RESOLVER_MAP,
    Browsers,
    Devices,
    ENGINE_RESOLVER_MAP,
    Engines,
    HIGH_ENTROPY_BRAND_NAME_MAP,
    OS,
    OS_RESOLVER_MAP,
    RTL_LANGUAGES,
    USER_AGENT
} from "../constants";
import {Writeable} from "../../../types";
import EventListener from "../../../utils/event-listener";

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
            new(tag: string): IntlLocale;
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

type UserAgentDataBrand =
    | ModernUserAgentDataBrand
    | string
    | null
    | undefined;

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

interface ParsedCache {
    userAgent: string;
    os: NameVersionPair<OS>;
    browser: NameVersionPair<Browsers>;
    engine: NameVersionPair<Engines>;
}

let currentUserAgent: string = USER_AGENT;
let parsedCache: ParsedCache | null = null;
let parsedFromHighEntropyValuesOS: Partial<NameVersionPair<OS>> = {};
let parsedFromHighEntropyValuesBrowser: Partial<NameVersionPair<Browsers>> = {};
let parsedFromHighEntropyValuesEngine: Partial<NameVersionPair<Engines>> = {};
let parsedFromHighEntropyValuesDevice: Devices | null = null;
let parsedFromNavigatorGPU: Writeable<GPUAdapterInfo> = {};
let cachedLocale: Locale | null = null;
let ready: Promise<void>;

function resolveVersion(string: string | undefined, resolver: VersionResolver): string {
    if (typeof resolver === 'function') return resolver(string);
    if (typeof resolver === 'string') return resolver;
    if (typeof string === 'undefined') return '';
    return string;
}

function normalizeBrand(entry: UserAgentDataBrand): ModernUserAgentDataBrand {
    if (entry === null || typeof entry === 'undefined') return {brand: '', version: ''};
    if (typeof entry === 'string') return {brand: entry, version: ''};
    return {brand: entry.brand, version: entry.version};
}

function normalizeLocale(locale: string | null | undefined): string | null | undefined {
    if (locale === null || typeof locale === 'undefined') return locale;
    if (locale.length === 0) return null;

    locale = locale.replace(/_/g, '-');

    if (locale === 'C' || locale.toLowerCase() === 'posix') return 'en-US';
    if (locale.indexOf('.') !== -1) return normalizeLocale(locale.split('.')[0]);
    if (locale.indexOf('@') !== -1) return normalizeLocale(locale.split('@')[0]);

    const parts: string[] = locale.split('-');

    if (parts.length === 0) return null;

    parts[0] = parts[0].toLowerCase();

    if (parts.length > 1 && parts[1].length === 2) parts[1] = parts[1].toUpperCase();
    if (parts.length > 2 && parts[1].length === 4) {
        parts[1] = parts[1].charAt(0).toUpperCase() + parts[1].slice(1).toLowerCase();
    }

    return parts.join('-');
}

function invalidateCache(): void {
    parsedCache = null;
    cachedLocale = null;

    parsedFromHighEntropyValuesOS = {};
    parsedFromHighEntropyValuesBrowser = {};
    parsedFromHighEntropyValuesEngine = {};
    parsedFromHighEntropyValuesDevice = null;
    parsedFromNavigatorGPU = {};
}

function getParsedCache(): ParsedCache {
    if (parsedCache !== null && parsedCache.userAgent === currentUserAgent) return parsedCache;

    parsedCache = {
        userAgent: currentUserAgent,
        os: parseOS(),
        browser: parseBrowser(),
        engine: parseEngine(),
    };

    return parsedCache;
}

function parseOS(): NameVersionPair<OS> {
    const result: NameVersionPair<OS> = {name: OS.Unknown, version: ''};

    for (let i: number = 0; i < OS_RESOLVER_MAP.length; i++) {
        const map: [RegExp, OS, VersionResolver?] = OS_RESOLVER_MAP[i];
        const matched: RegExpMatchArray | null = currentUserAgent.match(map[0]);

        if (matched !== null) {
            result.name = map[1];
            result.version = resolveVersion(matched[1], map[2]);
            break;
        }
    }

    if (result.name === OS.iOS && compareVersion(result.version, '18.6') === 0) {
        const version: RegExpExecArray | null = /\) Version\/([\d.]+)/.exec(currentUserAgent);

        if (version !== null) {
            const major: number = parseInt(version[1].split('.')[0], 10);

            if (major >= 26) result.version = version[1];
        }
    }

    if (currentUserAgent === USER_AGENT) {
        if (typeof parsedFromHighEntropyValuesOS.name !== 'undefined') result.name = parsedFromHighEntropyValuesOS.name;
        if (typeof parsedFromHighEntropyValuesOS.version !== 'undefined') result.version = parsedFromHighEntropyValuesOS.version;
        if (result.name === OS.MacOS && typeof globalThis.navigator.standalone !== 'undefined' && globalThis.navigator.maxTouchPoints > 2) result.name = OS.iOS;
    }

    return result;
}

function parseBrowser(): NameVersionPair<Browsers> {
    const result: NameVersionPair<Browsers> = {name: Browsers.Unknown, version: ''};

    for (let i: number = 0; i < BROWSER_RESOLVER_MAP.length; i++) {
        const map: [RegExp, Browsers, VersionResolver?] = BROWSER_RESOLVER_MAP[i];
        const matched: RegExpMatchArray | null = currentUserAgent.match(map[0]);

        if (matched !== null) {
            result.name = map[1];
            result.version = resolveVersion(matched[1], map[2]);
            break;
        }
    }

    if (currentUserAgent === USER_AGENT) {
        if (typeof parsedFromHighEntropyValuesBrowser.name !== 'undefined') result.name = parsedFromHighEntropyValuesBrowser.name;
        if (typeof parsedFromHighEntropyValuesBrowser.version !== 'undefined') result.version = parsedFromHighEntropyValuesBrowser.version;
    }

    return result;
}

function parseEngine(): NameVersionPair<Engines> {
    const result: NameVersionPair<Engines> = {name: Engines.Unknown, version: ''};

    for (let i: number = 0; i < ENGINE_RESOLVER_MAP.length; i++) {
        const map: [RegExp, Engines, VersionResolver?] = ENGINE_RESOLVER_MAP[i];
        const matched: RegExpMatchArray | null = currentUserAgent.match(map[0]);

        if (matched !== null) {
            result.name = map[1];
            result.version = resolveVersion(matched[1], map[2]);
            break;
        }
    }

    if (currentUserAgent === USER_AGENT) {
        if (typeof parsedFromHighEntropyValuesEngine.name !== 'undefined') result.name = parsedFromHighEntropyValuesEngine.name;
        if (typeof parsedFromHighEntropyValuesEngine.version !== 'undefined') result.version = parsedFromHighEntropyValuesEngine.version;
    }

    return result;
}

function getGPU(): GPU {
    return {
        architecture: parsedFromNavigatorGPU.architecture,
        description: parsedFromNavigatorGPU.description,
        device: parsedFromNavigatorGPU.device,
        vendor: parsedFromNavigatorGPU.vendor,
    };
}

function getLocale(): Locale {
    if (cachedLocale !== null) return cachedLocale;

    const locale: Locale = {
        language: null,
        languages: [],
        timezone: null,
        offset: 0,
        isRTL: false,
    };

    let isRTL: boolean | null = null;

    function addLanguages(language: string[] | readonly string[]): void {
        for (let i: number = 0; i < language.length; i++) addLanguage(language[i]);
    }

    function addLanguage(language: string | null | undefined): void {
        language = normalizeLocale(language);

        if (typeof language === 'string' && locale.languages.indexOf(language) === -1) {
            if (locale.language === null) locale.language = language;

            locale.languages.push(language);
        }
    }

    if (typeof Intl !== 'undefined') {
        try {
            addLanguage(Intl.DateTimeFormat().resolvedOptions().locale);
        } catch (_: unknown) {
        }

        try {
            locale.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        } catch (_: unknown) {
        }
    }

    if (typeof globalThis.navigator !== 'undefined') {
        if (typeof globalThis.navigator.languages !== 'undefined') addLanguages(globalThis.navigator.languages);
        if (typeof globalThis.navigator.language !== 'undefined') addLanguage(globalThis.navigator.language);
        if (typeof globalThis.navigator.userLanguage !== 'undefined') addLanguage(globalThis.navigator.userLanguage);
        if (typeof globalThis.navigator.browserLanguage !== 'undefined') addLanguage(globalThis.navigator.browserLanguage);
        if (typeof globalThis.navigator.systemLanguage !== 'undefined') addLanguage(globalThis.navigator.systemLanguage);
    }

    try {
        locale.offset = new Date().getTimezoneOffset() * -1;
    } catch (_: unknown) {
    }

    if (typeof locale.language === 'string') {
        if (typeof Intl !== 'undefined' && typeof Intl.Locale !== 'undefined') {
            try {
                const intlLocale: IntlLocale = new Intl.Locale(locale.language);

                if (typeof intlLocale.getTextInfo === 'function') isRTL = intlLocale.getTextInfo().direction === 'rtl';
                else if (typeof intlLocale.textInfo !== 'undefined') isRTL = intlLocale.textInfo.direction === 'rtl';
            } catch (_: unknown) {
            }
        }

        if (typeof isRTL !== 'boolean') {
            const matched: RegExpMatchArray | null = /^([A-Za-z]{1,8})(?:[-_][A-Za-z0-9]{1,8})*$/.exec(locale.language);

            if (matched !== null) {
                const language: string = matched[1].toLowerCase();

                for (let i: number = 0; i < RTL_LANGUAGES.length; i++) {
                    if (RTL_LANGUAGES[i] === language) {
                        isRTL = true;
                        break;
                    }
                }
            }
        }
    }

    if (typeof isRTL === 'boolean') locale.isRTL = isRTL;

    cachedLocale = locale;

    return cachedLocale;
}

function getDevice(): Devices {
    if (currentUserAgent === USER_AGENT && parsedFromHighEntropyValuesDevice !== null) return parsedFromHighEntropyValuesDevice;

    const osName: OS = getParsedCache().os.name;

    if (osName === OS.iOS || osName === OS.Android) return Devices.Mobile;
    if (osName === OS.Windows || osName === OS.MacOS) return Devices.Desktop;
    return Devices.Unknown;
}

function getIsWebview(): boolean {
    return /; ?wv|applewebkit(?!.*safari)/i.test(currentUserAgent);
}

function getIsNode(): boolean {
    return typeof globalThis.process !== 'undefined' && typeof globalThis.process.versions !== 'undefined' && typeof globalThis.process.versions.node !== 'undefined';
}

function getIsStandalone(): boolean {
    const osName: OS = getParsedCache().os.name;

    if (osName === OS.iOS) return globalThis.navigator.standalone === true;
    if (typeof globalThis.matchMedia === 'undefined') return false;

    return globalThis.matchMedia('(display-mode: standalone)').matches;
}

function parseFromHighEntropyValues(): Promise<void> {
    if (typeof globalThis.navigator === 'undefined' || typeof globalThis.navigator.userAgentData === 'undefined' || typeof globalThis.navigator.userAgentData.getHighEntropyValues === 'undefined') return Promise.resolve();

    return globalThis.navigator.userAgentData
        .getHighEntropyValues(['brands', 'fullVersionList', 'mobile', 'model', 'platform', 'platformVersion', 'architecture', 'formFactors', 'bitness', 'uaFullVersion', 'wow64'])
        .then(function (result: UserAgentDataValues): void {
            try {
                const brands: UserAgentDataBrand[] = result.fullVersionList || result.brands || [];
                const platformVersion: string | null | undefined = result.platformVersion;
                const platform: string | null | undefined = result.platform;
                let browserName: string = getParsedCache().browser.name;
                let prevBrandName: string | null = null;

                for (let i: number = 0; i < brands.length; i++) {
                    const brand: ModernUserAgentDataBrand = normalizeBrand(brands[i]);
                    const brandVersion: string = brand.version;
                    let brandName: string = brand.brand;

                    if (/not.a.brand/i.test(brandName)) continue;

                    if (prevBrandName === null || (/Chrom/.test(prevBrandName) && brandName !== 'Chromium') || (prevBrandName === 'Edge' && /WebView2/.test(brandName))) {
                        brandName = HIGH_ENTROPY_BRAND_NAME_MAP[brandName] || brandName;
                        prevBrandName = browserName;

                        if (prevBrandName === null || /Chrom/.test(prevBrandName) || !/Chrom/.test(brandName)) {
                            browserName = brandName;

                            if (browserName === 'Chrome' || browserName === 'Chrome WebView' || browserName === 'Chrome Headless') parsedFromHighEntropyValuesBrowser.name = Browsers.Chrome;
                            else if (browserName === 'Edge' || browserName === 'Edge WebView2') parsedFromHighEntropyValuesBrowser.name = Browsers.Edge;
                            else if (browserName === 'Opera Mobi') parsedFromHighEntropyValuesBrowser.name = Browsers.Opera;

                            parsedFromHighEntropyValuesBrowser.version = brandVersion;
                        }

                        prevBrandName = brandName;
                    }

                    if (brandName === 'Chromium') parsedFromHighEntropyValuesEngine.version = brandVersion;
                }

                if (typeof platformVersion === 'string') {
                    if (getParsedCache().os.name === OS.Windows) {
                        if (parseInt(platformVersion.split('.')[0], 10) >= 13) parsedFromHighEntropyValuesOS.version = '11';
                        else parsedFromHighEntropyValuesOS.version = '10';
                    } else {
                        parsedFromHighEntropyValuesOS.version = platformVersion;
                    }
                }

                if (typeof platform === 'string') {
                    if (/android/i.test(platform)) parsedFromHighEntropyValuesOS.name = OS.Android;
                    else if (/ios|iphone|ipad/i.test(platform)) parsedFromHighEntropyValuesOS.name = OS.iOS;
                    else if (/windows|win32/i.test(platform)) parsedFromHighEntropyValuesOS.name = OS.Windows;
                    else if (/macos|macintel/i.test(platform)) parsedFromHighEntropyValuesOS.name = OS.MacOS;
                }

                if (result.mobile === true) parsedFromHighEntropyValuesDevice = Devices.Mobile;

                parsedCache = null;

            } catch (_: unknown) {
            }
        })
        .catch(function (): void {
        });
}

function parseFromNavigatorGPU(): Promise<void> {
    if (typeof globalThis.navigator === 'undefined' || typeof globalThis.navigator.gpu === 'undefined') return Promise.resolve();

    return globalThis.navigator.gpu
        .requestAdapter()
        .then(function (adapter: GPUAdapter | null): void {
            if (adapter !== null) {
                const info: GPUAdapterInfo = adapter.info;

                parsedFromNavigatorGPU.architecture = info.architecture;
                parsedFromNavigatorGPU.description = info.description;
                parsedFromNavigatorGPU.device = info.device;
                parsedFromNavigatorGPU.vendor = info.vendor;
            }
        })
        .catch(function (): void {
        });
}

ready = Promise.all([
    parseFromHighEntropyValues(),
    parseFromNavigatorGPU(),
]).then(function (): void {
});

EventListener.add(globalThis, {
    type: 'languagechange', callback: function (): void {
        cachedLocale = null;
    }
});

const Platform: PlatformInstance = {
    get ready(): Promise<void> {
        return ready;
    },

    get os(): NameVersionPair<OS> {
        return getParsedCache().os;
    },

    get engine(): NameVersionPair<Engines> {
        return getParsedCache().engine;
    },

    get browser(): NameVersionPair<Browsers> {
        return getParsedCache().browser;
    },

    get userAgent(): string {
        return currentUserAgent;
    },

    set userAgent(value: string) {
        if (currentUserAgent === value) return;

        currentUserAgent = value;
        invalidateCache();

        if (value === USER_AGENT) {
            ready = Promise.all([
                parseFromHighEntropyValues(),
                parseFromNavigatorGPU(),
            ]).then(function (): void {
            });
        }
    },

    get locale(): Locale {
        return getLocale();
    },

    get device(): Devices {
        return getDevice();
    },

    get gpu(): GPU {
        return getGPU();
    },

    get isWebview(): boolean {
        return getIsWebview();
    },

    get isNode(): boolean {
        return getIsNode();
    },

    get isStandalone(): boolean {
        return getIsStandalone();
    },

    Constants: {
        OS: OS,
        Engines: Engines,
        Browsers: Browsers,
        Devices: Devices,
    },
    Errors: {},
};

export default Platform;
