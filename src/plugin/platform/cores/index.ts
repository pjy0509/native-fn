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
let parsedFromHighEntropyValuesOSName: OS | undefined = undefined;
let parsedFromHighEntropyValuesOSVersion: string | undefined = undefined;
let parsedFromHighEntropyValuesBrowserName: Browsers | undefined = undefined;
let parsedFromHighEntropyValuesBrowserVersion: string | undefined = undefined;
let parsedFromHighEntropyValuesEngineName: Engines | undefined = undefined;
let parsedFromHighEntropyValuesEngineVersion: string | undefined = undefined;
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

    parsedFromHighEntropyValuesOSName = undefined;
    parsedFromHighEntropyValuesOSVersion = undefined;
    parsedFromHighEntropyValuesBrowserName = undefined;
    parsedFromHighEntropyValuesBrowserVersion = undefined;
    parsedFromHighEntropyValuesEngineName = undefined;
    parsedFromHighEntropyValuesEngineVersion = undefined;
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
    let name: OS = OS.Unknown;
    let version: string = '';

    for (let i: number = 0; i < OS_RESOLVER_MAP.length; i++) {
        const map: [RegExp, OS, VersionResolver?] = OS_RESOLVER_MAP[i];
        const matched: RegExpMatchArray | null = currentUserAgent.match(map[0]);

        if (matched !== null) {
            name = map[1];
            version = resolveVersion(matched[1], map[2]);
            break;
        }
    }

    if (name === OS.iOS && compareVersion(version, '18.6') === 0) {
        const execs: RegExpExecArray | null = /\) Version\/([\d.]+)/.exec(currentUserAgent);

        if (execs !== null) {
            const major: number = parseInt(execs[1].split('.')[0], 10);

            if (major >= 26) version = execs[1];
        }
    }

    if (currentUserAgent === USER_AGENT) {
        if (typeof parsedFromHighEntropyValuesOSName !== 'undefined') name = parsedFromHighEntropyValuesOSName;
        if (typeof parsedFromHighEntropyValuesOSVersion !== 'undefined') version = parsedFromHighEntropyValuesOSVersion;
        if (name === OS.MacOS && typeof globalThis.navigator.standalone !== 'undefined' && globalThis.navigator.maxTouchPoints > 2) name = OS.iOS;
    }

    return {name, version};
}

function parseBrowser(): NameVersionPair<Browsers> {
    let name: Browsers = Browsers.Unknown;
    let version: string = '';

    for (let i: number = 0; i < BROWSER_RESOLVER_MAP.length; i++) {
        const map: [RegExp, Browsers, VersionResolver?] = BROWSER_RESOLVER_MAP[i];
        const matched: RegExpMatchArray | null = currentUserAgent.match(map[0]);

        if (matched !== null) {
            name = map[1];
            version = resolveVersion(matched[1], map[2]);
            break;
        }
    }

    if (currentUserAgent === USER_AGENT) {
        if (typeof parsedFromHighEntropyValuesBrowserName !== 'undefined') name = parsedFromHighEntropyValuesBrowserName;
        if (typeof parsedFromHighEntropyValuesBrowserVersion !== 'undefined') version = parsedFromHighEntropyValuesBrowserVersion;
    }

    return {name, version};
}

function parseEngine(): NameVersionPair<Engines> {
    let name: Engines = Engines.Unknown;
    let version: string = '';

    for (let i: number = 0; i < ENGINE_RESOLVER_MAP.length; i++) {
        const map: [RegExp, Engines, VersionResolver?] = ENGINE_RESOLVER_MAP[i];
        const matched: RegExpMatchArray | null = currentUserAgent.match(map[0]);

        if (matched !== null) {
            name = map[1];
            version = resolveVersion(matched[1], map[2]);
            break;
        }
    }

    if (currentUserAgent === USER_AGENT) {
        if (typeof parsedFromHighEntropyValuesEngineName !== 'undefined') name = parsedFromHighEntropyValuesEngineName;
        if (typeof parsedFromHighEntropyValuesEngineVersion !== 'undefined') version = parsedFromHighEntropyValuesEngineVersion;
    }

    return {name, version};
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

    let language: string | null = null;
    let languages: string[] = [];
    let timezone: string | null = null;
    let offset: number = 0;
    let isRTL: boolean = false;
    let isRTLResolved: boolean | null = null;

    function addLanguages(langs: string[] | readonly string[]): void {
        for (let i: number = 0; i < langs.length; i++) addLanguage(langs[i]);
    }

    function addLanguage(lang: string | null | undefined): void {
        lang = normalizeLocale(lang);

        if (typeof lang === 'string' && languages.indexOf(lang) === -1) {
            if (language === null) language = lang;

            languages.push(lang);
        }
    }

    if (typeof Intl !== 'undefined') {
        try {
            addLanguage(Intl.DateTimeFormat().resolvedOptions().locale);
        } catch (_: unknown) {
        }

        try {
            timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
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
        offset = new Date().getTimezoneOffset() * -1;
    } catch (_: unknown) {
    }

    if (typeof language === 'string') {
        if (typeof Intl !== 'undefined' && typeof Intl.Locale !== 'undefined') {
            try {
                const intlLocale: IntlLocale = new Intl.Locale(language);

                if (typeof intlLocale.getTextInfo === 'function') isRTLResolved = intlLocale.getTextInfo().direction === 'rtl';
                else if (typeof intlLocale.textInfo !== 'undefined') isRTLResolved = intlLocale.textInfo.direction === 'rtl';
            } catch (_: unknown) {
            }
        }

        if (typeof isRTLResolved !== 'boolean') {
            const matched: RegExpMatchArray | null = /^([A-Za-z]{1,8})(?:[-_][A-Za-z0-9]{1,8})*$/.exec(language);

            if (matched !== null) {
                const lang: string = matched[1].toLowerCase();

                for (let i: number = 0; i < RTL_LANGUAGES.length; i++) {
                    if (RTL_LANGUAGES[i] === lang) {
                        isRTLResolved = true;
                        break;
                    }
                }
            }
        }
    }

    if (typeof isRTLResolved === 'boolean') isRTL = isRTLResolved;

    cachedLocale = {language, languages, timezone, offset, isRTL};

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

                            if (browserName === 'Chrome' || browserName === 'Chrome WebView' || browserName === 'Chrome Headless') parsedFromHighEntropyValuesBrowserName = Browsers.Chrome;
                            else if (browserName === 'Edge' || browserName === 'Edge WebView2') parsedFromHighEntropyValuesBrowserName = Browsers.Edge;
                            else if (browserName === 'Opera Mobi') parsedFromHighEntropyValuesBrowserName = Browsers.Opera;

                            parsedFromHighEntropyValuesBrowserVersion = brandVersion;
                        }

                        prevBrandName = brandName;
                    }

                    if (brandName === 'Chromium') parsedFromHighEntropyValuesEngineVersion = brandVersion;
                }

                if (typeof platformVersion === 'string') {
                    if (getParsedCache().os.name === OS.Windows) {
                        if (parseInt(platformVersion.split('.')[0], 10) >= 13) parsedFromHighEntropyValuesOSVersion = '11';
                        else parsedFromHighEntropyValuesOSVersion = '10';
                    } else {
                        parsedFromHighEntropyValuesOSVersion = platformVersion;
                    }
                }

                if (typeof platform === 'string') {
                    if (/android/i.test(platform)) parsedFromHighEntropyValuesOSName = OS.Android;
                    else if (/ios|iphone|ipad/i.test(platform)) parsedFromHighEntropyValuesOSName = OS.iOS;
                    else if (/windows|win32/i.test(platform)) parsedFromHighEntropyValuesOSName = OS.Windows;
                    else if (/macos|macintel/i.test(platform)) parsedFromHighEntropyValuesOSName = OS.MacOS;
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
