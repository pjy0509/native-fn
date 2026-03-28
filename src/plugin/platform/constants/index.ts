import {VersionResolver} from "../types";

function resolveWindowsVersion(string: string | undefined): string {
    if (typeof string === 'undefined') return '';

    const mapped: string | undefined = {
        '4.90': 'ME',
        'NT3.51': 'NT 3.11',
        'NT4.0': 'NT 4.0',
        'NT 5.0': '2000',
        'NT 5.1': 'XP',
        'NT 5.2': 'XP',
        'NT 6.0': 'Vista',
        'NT 6.1': '7',
        'NT 6.2': '8',
        'NT 6.3': '8.1',
        'NT 6.4': '10',
        'NT 10.0': '10',
        'ARM': 'RT'
    }[string];

    if (typeof mapped !== 'undefined') return mapped;
    return string;
}

function resolveUnderscoreVersion(string: string | undefined): string {
    if (typeof string === 'undefined') return '';
    return string.replace(/_/g, '.');
}

export enum OS {
    Unknown = 'Unknown',
    Android = 'Android',
    iOS = 'iOS',
    Windows = 'Windows',
    MacOS = 'MacOS',
}

export enum Devices {
    Unknown = 'Unknown',
    Mobile = 'Mobile',
    Desktop = 'Desktop',
}

export enum Engines {
    Unknown = 'Unknown',
    EdgeHTML = 'EdgeHTML',
    ArkWeb = 'ArkWeb',
    Blink = 'Blink',
    Presto = 'Presto',
    WebKit = 'WebKit',
    Trident = 'Trident',
    NetFront = 'NetFront',
    KHTML = 'KHTML',
    Tasman = 'Tasman',
    Gecko = 'Gecko'
}

export enum Browsers {
    Unknown = 'Unknown',
    Chrome = 'Chrome',
    Safari = 'Safari',
    Edge = 'Edge',
    Firefox = 'Firefox',
    Opera = 'Opera',
    IE = 'IE',
    SamsungInternet = 'SamsungInternet',
}

export const USER_AGENT: string = (function (): string {
    if (typeof globalThis.navigator.userAgent !== 'undefined') return globalThis.navigator.userAgent;
    return '';
})();

export const HIGH_ENTROPY_BRAND_NAME_MAP: Record<string, string> = {
    'Google Chrome': 'Chrome',
    'Microsoft Edge': 'Edge',
    'Microsoft Edge WebView2': 'Edge WebView2',
    'Android WebView': 'Chrome WebView',
    'HeadlessChrome': 'Chrome Headless',
    'OperaMobile': 'Opera Mobi',
};

export const RTL_LANGUAGES: string[] = ['ae', 'ar', 'arc', 'bcc', 'bqi', 'ckb', 'dv', 'fa', 'glk', 'he', 'iw', 'ku', 'mzn', 'nqo', 'pnb', 'ps', 'sd', 'ug', 'ur', 'yi'];

export const OS_RESOLVER_MAP: [RegExp, OS, VersionResolver?][] = [
    // Windows RT
    [/windows nt (6\.[23]); arm/i, OS.Windows, resolveWindowsVersion],
    // Windows IoT/Mobile/Phone
    [/windows (?:phone|mobile|iot)(?: os)?[\/ ]?([\d.]*( se)?)/i, OS.Windows, resolveWindowsVersion],
    // Windows NT/3.1/95/98/ME/2000/XP/Vista/7/8/8.1/10/11
    [/windows[\/ ](1[01]|2000|3\.1|7|8(\.1)?|9[58]|me|server 20\d\d( r2)?|vista|xp)/i, OS.Windows, resolveWindowsVersion],
    [/windows nt ?([\d.)]*)(?!.+xbox)/i, OS.Windows, resolveWindowsVersion],
    [/\bwin(?=3| ?9|n)(?:nt| 9x )?([\d.;]*)/i, OS.Windows, resolveWindowsVersion],
    // Windows CE
    [/windows ce\/?([\d.]*)/i, OS.Windows, resolveWindowsVersion],
    // iOS
    [/[adehimnop]{4,7}\b(?:.*os (\w+) like mac|; opera)/i, OS.iOS, resolveUnderscoreVersion],
    [/(?:ios;fbsv|ios(?=.+ip(?:ad|hone))|ip(?:ad|hone)(?: |.+i(?:pad)?)os)[\/ ]([\w.]+)/i, OS.iOS, resolveUnderscoreVersion],
    [/cfnetwork\/.+darwin/i, OS.iOS, resolveUnderscoreVersion],
    // MacOS
    [/mac os x ?([\w. ]*)/i, OS.MacOS, resolveUnderscoreVersion],
    [/(?:macintosh|mac_powerpc\b)(?!.+(haiku|morphos))/i, OS.MacOS, resolveUnderscoreVersion],
    // Android-x86
    [/droid ([\w.]+)\b.+(android[- ]x86)/i, OS.Android],
    // Android
    [/android\w*[-\/.; ]?([\d.]*)/i, OS.Android],
];

export const ENGINE_RESOLVER_MAP: [RegExp, Engines, VersionResolver?][] = [
    // EdgeHTML
    [/windows.+ edge\/([\w.]+)/i, Engines.EdgeHTML],
    // ArkWeb
    [/arkweb\/([\w.]+)/i, Engines.ArkWeb],
    // Blink
    [/webkit\/537\.36.+chrome\/(?!27)([\w.]+)/i, Engines.Blink],
    // Presto
    [/presto\/([\w.]+)/i, Engines.Presto],
    // WebKit
    [/webkit\/([\w.]+)/i, Engines.WebKit],
    // Trident
    [/trident\/([\w.]+)/i, Engines.Trident],
    // NetFront
    [/netfront\/([\w.]+)/i, Engines.NetFront],
    // KHTML
    [/khtml[\/ ]\(?([\w.]+)/i, Engines.KHTML],
    // Tasman
    [/tasman[\/ ]\(?([\w.]+)/i, Engines.Tasman],
    // Gecko
    [/rv:([\w.]{1,9})\b.+gecko/i, Engines.Gecko]
];

export const BROWSER_RESOLVER_MAP: [RegExp, Browsers, VersionResolver?][] = [
    // Chrome Mobile
    [/\b(?:crmo|crios)\/([\w.]+)/i, Browsers.Chrome],
    // Microsoft Edge WebView
    [/webview.+edge\/([\w.]+)/i, Browsers.Edge],
    // Microsoft Edge
    [/edg(?:e|ios|a)?\/([\w.]+)/i, Browsers.Edge],
    // Opera Mini
    [/opera mini\/([-\w.]+)/i, Browsers.Opera],
    // Opera Mobile/Tablet
    [/opera [mobileta]{3,6}\b.+version\/([-\w.]+)/i, Browsers.Opera],
    // Opera
    [/opera(?:.+version\/|[\/ ]+)([\w.]+)/i, Browsers.Opera],
    // Opera Mini (iOS ≥ 8.0)
    [/opios[\/ ]+([\w.]+)/i, Browsers.Opera],
    // Opera GX
    [/\bop(?:rg)?x\/([\w.]+)/i, Browsers.Opera],
    // Opera Webkit
    [/\bopr\/([\w.]+)/i, Browsers.Opera],
    // Internet Explorer Mobile
    [/iemobile(?:browser|boat|jet)[\/ ]?([\d.]*)/i, Browsers.IE],
    // Internet Explorer
    [/(?:ms|\()ie ([\w.]+)/i, Browsers.IE],
    // Internet Explorer 11
    [/trident.+rv[: ]([\w.]{1,9})\b.+like gecko/i, Browsers.IE],
    // Firefox Focus
    [/\bfocus\/([\w.]+)/i, Browsers.Firefox],
    // Opera Touch
    [/\bopt\/([\w.]+)/i, Browsers.Opera],
    // Opera Coast
    [/coast\/([\w.]+)/i, Browsers.Opera],
    // Firefox (iOS)
    [/fxios\/([\w.-]+)/i, Browsers.Firefox],
    // Samsung Internet
    [/samsungbrowser\/([\w.]+)/i, Browsers.SamsungInternet],
    // Chrome Headless
    [/headlesschrome(?:\/([\w.]+)| )/i, Browsers.Chrome],
    // Edge WebView
    [/wv\).+chrome\/([\w.]+).+edgw\//i, Browsers.Edge],
    // Chrome WebView
    [/ wv\).+(chrome)\/([\w.]+)/i, Browsers.Chrome],
    // Chrome Mobile
    [/chrome\/([\w.]+) mobile/i, Browsers.Chrome],
    // Chrome
    [/chrome\/v?([\w.]+)/i, Browsers.Chrome],
    // Safari Mobile
    [/version\/([\w.,]+) .*mobile(?:\/\w+ | ?)safari/i, Browsers.Safari],
    // Safari
    [/iphone .*mobile(?:\/\w+ | ?)safari/i, Browsers.Safari],
    [/version\/([\w.,]+) .*safari/i, Browsers.Safari],
    // Safari (< 3.0)
    [/webkit.+?(?:mobile ?safari|safari)(\/[\w.]+)/i, Browsers.Safari, '1'],
    // Firefox Mobile
    [/(?:mobile|tablet);.*firefox\/([\w.-]+)/i, Browsers.Firefox],
    // Firefox Reality
    [/mobile vr; rv:([\w.]+)\).+firefox/i, Browsers.Firefox],
    // Firefox
    [/firefox\/([\w.]+)/i, Browsers.Firefox],
];
