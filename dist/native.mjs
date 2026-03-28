var version = "1.1.8";
var packageJSON = {
	version: version};

var FALLBACK_MEDIA_QUERY_LIST = {
    matches: false,
    media: 'not all',
    onchange: null,
    addListener: function () {
    },
    removeListener: function () {
    },
    addEventListener: function () {
    },
    removeEventListener: function () {
    },
    dispatchEvent: function () {
        return false;
    },
};

var Appearances;
(function (Appearances) {
    Appearances["Unknown"] = "unknown";
    Appearances["Light"] = "light";
    Appearances["Dark"] = "dark";
})(Appearances || (Appearances = {}));
var MEDIA_QUERY_LIST$1;
if (typeof globalThis.matchMedia !== 'undefined')
    MEDIA_QUERY_LIST$1 = globalThis.matchMedia('(prefers-color-scheme: dark)');
else
    MEDIA_QUERY_LIST$1 = FALLBACK_MEDIA_QUERY_LIST;
var CONTEXT = globalThis.document.createElement('canvas').getContext('2d', { willReadFrequently: true });
var SVG_PIXEL_DATA_URL = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0wIDBoMXYxSDB6Ii8+PC9zdmc+';

function compareVersion(lhs, rhs) {
    var pa = lhs.split('.');
    var pb = rhs.split('.');
    var length = Math.max(pa.length, pb.length);
    for (var i = 0; i < length; i++) {
        var a = void 0;
        var b = void 0;
        if (i < pa.length)
            a = parseInt(pa[i], 10);
        else
            a = 0;
        if (i < pb.length)
            b = parseInt(pb[i], 10);
        else
            b = 0;
        if (a > b)
            return 1;
        if (a < b)
            return -1;
    }
    return 0;
}

function resolveWindowsVersion(string) {
    if (typeof string === 'undefined')
        return '';
    var mapped = {
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
    if (typeof mapped !== 'undefined')
        return mapped;
    return string;
}
function resolveUnderscoreVersion(string) {
    if (typeof string === 'undefined')
        return '';
    return string.replace(/_/g, '.');
}
var OS;
(function (OS) {
    OS["Unknown"] = "Unknown";
    OS["Android"] = "Android";
    OS["iOS"] = "iOS";
    OS["Windows"] = "Windows";
    OS["MacOS"] = "MacOS";
})(OS || (OS = {}));
var Devices;
(function (Devices) {
    Devices["Unknown"] = "Unknown";
    Devices["Mobile"] = "Mobile";
    Devices["Desktop"] = "Desktop";
})(Devices || (Devices = {}));
var Engines;
(function (Engines) {
    Engines["Unknown"] = "Unknown";
    Engines["EdgeHTML"] = "EdgeHTML";
    Engines["ArkWeb"] = "ArkWeb";
    Engines["Blink"] = "Blink";
    Engines["Presto"] = "Presto";
    Engines["WebKit"] = "WebKit";
    Engines["Trident"] = "Trident";
    Engines["NetFront"] = "NetFront";
    Engines["KHTML"] = "KHTML";
    Engines["Tasman"] = "Tasman";
    Engines["Gecko"] = "Gecko";
})(Engines || (Engines = {}));
var Browsers;
(function (Browsers) {
    Browsers["Unknown"] = "Unknown";
    Browsers["Chrome"] = "Chrome";
    Browsers["Safari"] = "Safari";
    Browsers["Edge"] = "Edge";
    Browsers["Firefox"] = "Firefox";
    Browsers["Opera"] = "Opera";
    Browsers["IE"] = "IE";
    Browsers["SamsungInternet"] = "SamsungInternet";
})(Browsers || (Browsers = {}));
var USER_AGENT = (function () {
    if (typeof globalThis.navigator.userAgent !== 'undefined')
        return globalThis.navigator.userAgent;
    return '';
})();
var HIGH_ENTROPY_BRAND_NAME_MAP = {
    'Google Chrome': 'Chrome',
    'Microsoft Edge': 'Edge',
    'Microsoft Edge WebView2': 'Edge WebView2',
    'Android WebView': 'Chrome WebView',
    'HeadlessChrome': 'Chrome Headless',
    'OperaMobile': 'Opera Mobi',
};
var RTL_LANGUAGES = ['ae', 'ar', 'arc', 'bcc', 'bqi', 'ckb', 'dv', 'fa', 'glk', 'he', 'iw', 'ku', 'mzn', 'nqo', 'pnb', 'ps', 'sd', 'ug', 'ur', 'yi'];
var OS_RESOLVER_MAP = [
    [/windows nt (6\.[23]); arm/i, OS.Windows, resolveWindowsVersion],
    [/windows (?:phone|mobile|iot)(?: os)?[\/ ]?([\d.]*( se)?)/i, OS.Windows, resolveWindowsVersion],
    [/windows[\/ ](1[01]|2000|3\.1|7|8(\.1)?|9[58]|me|server 20\d\d( r2)?|vista|xp)/i, OS.Windows, resolveWindowsVersion],
    [/windows nt ?([\d.)]*)(?!.+xbox)/i, OS.Windows, resolveWindowsVersion],
    [/\bwin(?=3| ?9|n)(?:nt| 9x )?([\d.;]*)/i, OS.Windows, resolveWindowsVersion],
    [/windows ce\/?([\d.]*)/i, OS.Windows, resolveWindowsVersion],
    [/[adehimnop]{4,7}\b(?:.*os (\w+) like mac|; opera)/i, OS.iOS, resolveUnderscoreVersion],
    [/(?:ios;fbsv|ios(?=.+ip(?:ad|hone))|ip(?:ad|hone)(?: |.+i(?:pad)?)os)[\/ ]([\w.]+)/i, OS.iOS, resolveUnderscoreVersion],
    [/cfnetwork\/.+darwin/i, OS.iOS, resolveUnderscoreVersion],
    [/mac os x ?([\w. ]*)/i, OS.MacOS, resolveUnderscoreVersion],
    [/(?:macintosh|mac_powerpc\b)(?!.+(haiku|morphos))/i, OS.MacOS, resolveUnderscoreVersion],
    [/droid ([\w.]+)\b.+(android[- ]x86)/i, OS.Android],
    [/android\w*[-\/.; ]?([\d.]*)/i, OS.Android],
];
var ENGINE_RESOLVER_MAP = [
    [/windows.+ edge\/([\w.]+)/i, Engines.EdgeHTML],
    [/arkweb\/([\w.]+)/i, Engines.ArkWeb],
    [/webkit\/537\.36.+chrome\/(?!27)([\w.]+)/i, Engines.Blink],
    [/presto\/([\w.]+)/i, Engines.Presto],
    [/webkit\/([\w.]+)/i, Engines.WebKit],
    [/trident\/([\w.]+)/i, Engines.Trident],
    [/netfront\/([\w.]+)/i, Engines.NetFront],
    [/khtml[\/ ]\(?([\w.]+)/i, Engines.KHTML],
    [/tasman[\/ ]\(?([\w.]+)/i, Engines.Tasman],
    [/rv:([\w.]{1,9})\b.+gecko/i, Engines.Gecko]
];
var BROWSER_RESOLVER_MAP = [
    [/\b(?:crmo|crios)\/([\w.]+)/i, Browsers.Chrome],
    [/webview.+edge\/([\w.]+)/i, Browsers.Edge],
    [/edg(?:e|ios|a)?\/([\w.]+)/i, Browsers.Edge],
    [/opera mini\/([-\w.]+)/i, Browsers.Opera],
    [/opera [mobileta]{3,6}\b.+version\/([-\w.]+)/i, Browsers.Opera],
    [/opera(?:.+version\/|[\/ ]+)([\w.]+)/i, Browsers.Opera],
    [/opios[\/ ]+([\w.]+)/i, Browsers.Opera],
    [/\bop(?:rg)?x\/([\w.]+)/i, Browsers.Opera],
    [/\bopr\/([\w.]+)/i, Browsers.Opera],
    [/iemobile(?:browser|boat|jet)[\/ ]?([\d.]*)/i, Browsers.IE],
    [/(?:ms|\()ie ([\w.]+)/i, Browsers.IE],
    [/trident.+rv[: ]([\w.]{1,9})\b.+like gecko/i, Browsers.IE],
    [/\bfocus\/([\w.]+)/i, Browsers.Firefox],
    [/\bopt\/([\w.]+)/i, Browsers.Opera],
    [/coast\/([\w.]+)/i, Browsers.Opera],
    [/fxios\/([\w.-]+)/i, Browsers.Firefox],
    [/samsungbrowser\/([\w.]+)/i, Browsers.SamsungInternet],
    [/headlesschrome(?:\/([\w.]+)| )/i, Browsers.Chrome],
    [/wv\).+chrome\/([\w.]+).+edgw\//i, Browsers.Edge],
    [/ wv\).+(chrome)\/([\w.]+)/i, Browsers.Chrome],
    [/chrome\/([\w.]+) mobile/i, Browsers.Chrome],
    [/chrome\/v?([\w.]+)/i, Browsers.Chrome],
    [/version\/([\w.,]+) .*mobile(?:\/\w+ | ?)safari/i, Browsers.Safari],
    [/iphone .*mobile(?:\/\w+ | ?)safari/i, Browsers.Safari],
    [/version\/([\w.,]+) .*safari/i, Browsers.Safari],
    [/webkit.+?(?:mobile ?safari|safari)(\/[\w.]+)/i, Browsers.Safari, '1'],
    [/(?:mobile|tablet);.*firefox\/([\w.-]+)/i, Browsers.Firefox],
    [/mobile vr; rv:([\w.]+)\).+firefox/i, Browsers.Firefox],
    [/firefox\/([\w.]+)/i, Browsers.Firefox],
];

var IE_WRAPPER_STORE = [];
var MEDIA_QUERY_LIST_WRAPPER_STORE = [];
function isEventListenerCallback(callback) {
    return (typeof callback === 'function' ||
        (typeof callback === 'object' && callback !== null && typeof callback.handleEvent === 'function'));
}
function isMediaQueryListTarget(target) {
    return typeof target.media === 'string' && typeof target.matches === 'boolean';
}
function findIEWrapper(target, type, callback) {
    for (var i = 0; i < IE_WRAPPER_STORE.length; i++) {
        var wrapper = IE_WRAPPER_STORE[i];
        if (wrapper.target === target && wrapper.type === type && wrapper.callback === callback)
            return wrapper.wrapper;
    }
    return undefined;
}
function setIEWrapper(target, type, callback, wrapper) {
    IE_WRAPPER_STORE.push({ target: target, type: type, callback: callback, wrapper: wrapper });
}
function removeIEWrapper(target, type, callback) {
    for (var i = 0; i < IE_WRAPPER_STORE.length; i++) {
        var wrapper = IE_WRAPPER_STORE[i];
        if (wrapper.target === target && wrapper.type === type && wrapper.callback === callback) {
            IE_WRAPPER_STORE.splice(i, 1);
            return wrapper.wrapper;
        }
    }
    return undefined;
}
function findMediaQueryListWrapper(target, type, callback) {
    for (var i = 0; i < MEDIA_QUERY_LIST_WRAPPER_STORE.length; i++) {
        var wrapper = MEDIA_QUERY_LIST_WRAPPER_STORE[i];
        if (wrapper.target === target && wrapper.type === type && wrapper.callback === callback)
            return wrapper.wrapper;
    }
    return undefined;
}
function setMediaQueryListWrapper(target, type, callback, wrapper) {
    MEDIA_QUERY_LIST_WRAPPER_STORE.push({ target: target, type: type, callback: callback, wrapper: wrapper });
}
function removeMediaQueryListWrapper(target, type, callback) {
    for (var i = 0; i < MEDIA_QUERY_LIST_WRAPPER_STORE.length; i++) {
        var wrapper = MEDIA_QUERY_LIST_WRAPPER_STORE[i];
        if (wrapper.target === target && wrapper.type === type && wrapper.callback === callback) {
            MEDIA_QUERY_LIST_WRAPPER_STORE.splice(i, 1);
            return wrapper.wrapper;
        }
    }
    return undefined;
}
function createMediaQueryListWrapper(callback) {
    return function (event) {
        if (typeof callback === 'function') {
            callback.call(this, event);
        }
        else if (callback && typeof callback.handleEvent === 'function') {
            callback.handleEvent(event);
        }
    };
}
function capitalize(_) {
    var groups = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        groups[_i - 1] = arguments[_i];
    }
    var result = '';
    for (var i = 0; i < groups.length - 2; i++) {
        var arg = groups[i];
        if (typeof arg !== 'undefined')
            result = result + arg.charAt(0).toUpperCase() + arg.slice(1);
    }
    return result;
}
function withVendor(target, type) {
    if (target === globalThis.document && ['deviceready', 'pause', 'resume', 'backbutton', 'menubutton', 'searchbutton', 'startcallbutton', 'endcallbutton', 'volumedownbutton', 'volumeupbutton', 'activated', 'cordovacallbackerror'].indexOf(type) > -1)
        return type;
    if (typeof target.webkitEnterFullscreen === 'function' && ['webkitbeginfullscreen', 'webkitendfullscreen', 'webkitpresentationmodechanged'].indexOf(type) > -1)
        return type;
    var types;
    if (typeof LEGACY_TYPE_MAP[type] !== 'undefined')
        types = LEGACY_TYPE_MAP[type];
    else if (EVENT_TYPE_REGEXP.test(type))
        types = [type, type.replace(EVENT_TYPE_REGEXP, capitalize)];
    else
        types = [type];
    for (var i = 0; i < VENDORS.length; i++) {
        for (var j = 0; j < types.length; j++) {
            var name_1 = VENDORS[i] + types[j];
            if (typeof target['on' + name_1] !== 'undefined')
                return name_1;
        }
    }
    return type;
}
function preventDefaultPolyfill() {
    this.returnValue = false;
}
function stopPropagationPolyfill() {
    this.cancelBubble = true;
}
var EVENT_TYPE_REGEXP = /(animation)(start|iteration|end|cancel)|(transition)(start|run|end|cancel)|(fullscreen)(change|error)|(lost|got)(pointer)(capture)|(pointer)(lock)(change|error)|(pointer)(cancel|down|enter|leave|move|out|over|up)/i;
var VENDORS = ['', 'webkit', 'moz', 'ms', 'MS', 'o', 'O'];
var LEGACY_TYPE_MAP = {
    'wheel': ['wheel', 'mousewheel', 'DOMMouseScroll'],
    'focus': ['focus', 'focusin'],
    'blur': ['blur', 'focusout'],
    'beforeinput': ['beforeinput', 'textInput'],
};
var EventListener = {
    useStd: typeof globalThis.document.addEventListener === 'function',
    add: function (target, eventListenerOptions) {
        if (typeof eventListenerOptions.type === 'undefined')
            return;
        if (typeof target === 'undefined')
            return;
        var callback = eventListenerOptions.callback;
        var type = withVendor(target, eventListenerOptions.type);
        var options = eventListenerOptions.options;
        if (isMediaQueryListTarget(target)) {
            if (typeof target.addListener === 'function') {
                try {
                    var wrapper = findMediaQueryListWrapper(target, type, callback);
                    if (typeof wrapper === 'undefined') {
                        setMediaQueryListWrapper(target, type, callback, wrapper = createMediaQueryListWrapper(callback));
                    }
                    return target.addListener(wrapper);
                }
                catch (_) {
                }
            }
        }
        if (typeof target.addEventListener === 'function') {
            try {
                if (isEventListenerCallback(callback)) {
                    return target.addEventListener(type, callback, options);
                }
            }
            catch (_) {
            }
        }
        if (typeof target.attachEvent === 'function') {
            var existing = findIEWrapper(target, type, callback);
            if (typeof existing === 'function')
                return;
            var wrapper = function (event) {
                if (typeof event === 'undefined')
                    event = globalThis.event;
                if (typeof event === 'undefined')
                    return;
                try {
                    Object.defineProperty(event, 'currentTarget', { value: target, configurable: true });
                }
                catch (_) {
                }
                if (typeof event.preventDefault !== 'function')
                    event.preventDefault = preventDefaultPolyfill.bind(event);
                if (typeof event.stopPropagation !== 'function')
                    event.stopPropagation = stopPropagationPolyfill.bind(event);
                if (typeof callback === 'function')
                    callback.call(target, event);
                else if (callback && typeof callback.handleEvent === 'function')
                    callback.handleEvent(event);
            };
            setIEWrapper(target, type, callback, wrapper);
            return target.attachEvent('on' + type, wrapper);
        }
    },
    remove: function (target, eventListenerOptions) {
        if (typeof eventListenerOptions.type === 'undefined')
            return;
        if (typeof target === 'undefined')
            return;
        var callback = eventListenerOptions.callback;
        var type = withVendor(target, eventListenerOptions.type);
        var options = eventListenerOptions.options;
        if (isMediaQueryListTarget(target)) {
            if (typeof target.removeListener === 'function') {
                try {
                    var wrapper = removeMediaQueryListWrapper(target, type, callback);
                    if (typeof wrapper === 'function')
                        return target.removeListener(wrapper);
                }
                catch (_) {
                }
            }
            return;
        }
        if (typeof target.removeEventListener === 'function') {
            try {
                if (isEventListenerCallback(callback)) {
                    return target.removeEventListener(type, callback, options);
                }
            }
            catch (_) {
            }
        }
        if (typeof target.detachEvent === 'function') {
            var wrapper = removeIEWrapper(target, type, callback);
            if (typeof wrapper === 'function')
                target.detachEvent('on' + type, wrapper);
            return;
        }
    },
};

var currentUserAgent = USER_AGENT;
var parsedCache = null;
var parsedFromHighEntropyValuesOS = {};
var parsedFromHighEntropyValuesBrowser = {};
var parsedFromHighEntropyValuesEngine = {};
var parsedFromHighEntropyValuesDevice = null;
var parsedFromNavigatorGPU = {};
var cachedLocale = null;
var ready;
function resolveVersion(string, resolver) {
    if (typeof resolver === 'function')
        return resolver(string);
    if (typeof resolver === 'string')
        return resolver;
    if (typeof string === 'undefined')
        return '';
    return string;
}
function normalizeBrand(entry) {
    if (entry === null || typeof entry === 'undefined')
        return { brand: '', version: '' };
    if (typeof entry === 'string')
        return { brand: entry, version: '' };
    return { brand: entry.brand, version: entry.version };
}
function normalizeLocale(locale) {
    if (locale === null || typeof locale === 'undefined')
        return locale;
    if (locale.length === 0)
        return null;
    locale = locale.replace(/_/g, '-');
    if (locale === 'C' || locale.toLowerCase() === 'posix')
        return 'en-US';
    if (locale.indexOf('.') !== -1)
        return normalizeLocale(locale.split('.')[0]);
    if (locale.indexOf('@') !== -1)
        return normalizeLocale(locale.split('@')[0]);
    var parts = locale.split('-');
    if (parts.length === 0)
        return null;
    parts[0] = parts[0].toLowerCase();
    if (parts.length > 1 && parts[1].length === 2)
        parts[1] = parts[1].toUpperCase();
    if (parts.length > 2 && parts[1].length === 4) {
        parts[1] = parts[1].charAt(0).toUpperCase() + parts[1].slice(1).toLowerCase();
    }
    return parts.join('-');
}
function invalidateCache() {
    parsedCache = null;
    cachedLocale = null;
    parsedFromHighEntropyValuesOS = {};
    parsedFromHighEntropyValuesBrowser = {};
    parsedFromHighEntropyValuesEngine = {};
    parsedFromHighEntropyValuesDevice = null;
    parsedFromNavigatorGPU = {};
}
function getParsedCache() {
    if (parsedCache !== null && parsedCache.userAgent === currentUserAgent)
        return parsedCache;
    parsedCache = {
        userAgent: currentUserAgent,
        os: parseOS(),
        browser: parseBrowser(),
        engine: parseEngine(),
    };
    return parsedCache;
}
function parseOS() {
    var result = { name: OS.Unknown, version: '' };
    for (var i = 0; i < OS_RESOLVER_MAP.length; i++) {
        var map = OS_RESOLVER_MAP[i];
        var matched = currentUserAgent.match(map[0]);
        if (matched !== null) {
            result.name = map[1];
            result.version = resolveVersion(matched[1], map[2]);
            break;
        }
    }
    if (result.name === OS.iOS && compareVersion(result.version, '18.6') === 0) {
        var version = /\) Version\/([\d.]+)/.exec(currentUserAgent);
        if (version !== null) {
            var major = parseInt(version[1].split('.')[0], 10);
            if (major >= 26)
                result.version = version[1];
        }
    }
    if (currentUserAgent === USER_AGENT) {
        if (typeof parsedFromHighEntropyValuesOS.name !== 'undefined')
            result.name = parsedFromHighEntropyValuesOS.name;
        if (typeof parsedFromHighEntropyValuesOS.version !== 'undefined')
            result.version = parsedFromHighEntropyValuesOS.version;
        if (result.name === OS.MacOS && typeof globalThis.navigator.standalone !== 'undefined' && globalThis.navigator.maxTouchPoints > 2)
            result.name = OS.iOS;
    }
    return result;
}
function parseBrowser() {
    var result = { name: Browsers.Unknown, version: '' };
    for (var i = 0; i < BROWSER_RESOLVER_MAP.length; i++) {
        var map = BROWSER_RESOLVER_MAP[i];
        var matched = currentUserAgent.match(map[0]);
        if (matched !== null) {
            result.name = map[1];
            result.version = resolveVersion(matched[1], map[2]);
            break;
        }
    }
    if (currentUserAgent === USER_AGENT) {
        if (typeof parsedFromHighEntropyValuesBrowser.name !== 'undefined')
            result.name = parsedFromHighEntropyValuesBrowser.name;
        if (typeof parsedFromHighEntropyValuesBrowser.version !== 'undefined')
            result.version = parsedFromHighEntropyValuesBrowser.version;
    }
    return result;
}
function parseEngine() {
    var result = { name: Engines.Unknown, version: '' };
    for (var i = 0; i < ENGINE_RESOLVER_MAP.length; i++) {
        var map = ENGINE_RESOLVER_MAP[i];
        var matched = currentUserAgent.match(map[0]);
        if (matched !== null) {
            result.name = map[1];
            result.version = resolveVersion(matched[1], map[2]);
            break;
        }
    }
    if (currentUserAgent === USER_AGENT) {
        if (typeof parsedFromHighEntropyValuesEngine.name !== 'undefined')
            result.name = parsedFromHighEntropyValuesEngine.name;
        if (typeof parsedFromHighEntropyValuesEngine.version !== 'undefined')
            result.version = parsedFromHighEntropyValuesEngine.version;
    }
    return result;
}
function getGPU() {
    return {
        architecture: parsedFromNavigatorGPU.architecture,
        description: parsedFromNavigatorGPU.description,
        device: parsedFromNavigatorGPU.device,
        vendor: parsedFromNavigatorGPU.vendor,
    };
}
function getLocale() {
    if (cachedLocale !== null)
        return cachedLocale;
    var locale = {
        language: null,
        languages: [],
        timezone: null,
        offset: 0,
        isRTL: false,
    };
    var isRTL = null;
    function addLanguages(language) {
        for (var i = 0; i < language.length; i++)
            addLanguage(language[i]);
    }
    function addLanguage(language) {
        language = normalizeLocale(language);
        if (typeof language === 'string' && locale.languages.indexOf(language) === -1) {
            if (locale.language === null)
                locale.language = language;
            locale.languages.push(language);
        }
    }
    if (typeof Intl !== 'undefined') {
        try {
            addLanguage(Intl.DateTimeFormat().resolvedOptions().locale);
        }
        catch (_) {
        }
        try {
            locale.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        }
        catch (_) {
        }
    }
    if (typeof globalThis.navigator !== 'undefined') {
        if (typeof globalThis.navigator.languages !== 'undefined')
            addLanguages(globalThis.navigator.languages);
        if (typeof globalThis.navigator.language !== 'undefined')
            addLanguage(globalThis.navigator.language);
        if (typeof globalThis.navigator.userLanguage !== 'undefined')
            addLanguage(globalThis.navigator.userLanguage);
        if (typeof globalThis.navigator.browserLanguage !== 'undefined')
            addLanguage(globalThis.navigator.browserLanguage);
        if (typeof globalThis.navigator.systemLanguage !== 'undefined')
            addLanguage(globalThis.navigator.systemLanguage);
    }
    try {
        locale.offset = new Date().getTimezoneOffset() * -1;
    }
    catch (_) {
    }
    if (typeof locale.language === 'string') {
        if (typeof Intl !== 'undefined' && typeof Intl.Locale !== 'undefined') {
            try {
                var intlLocale = new Intl.Locale(locale.language);
                if (typeof intlLocale.getTextInfo === 'function')
                    isRTL = intlLocale.getTextInfo().direction === 'rtl';
                else if (typeof intlLocale.textInfo !== 'undefined')
                    isRTL = intlLocale.textInfo.direction === 'rtl';
            }
            catch (_) {
            }
        }
        if (typeof isRTL !== 'boolean') {
            var matched = /^([A-Za-z]{1,8})(?:[-_][A-Za-z0-9]{1,8})*$/.exec(locale.language);
            if (matched !== null) {
                var language = matched[1].toLowerCase();
                for (var i = 0; i < RTL_LANGUAGES.length; i++) {
                    if (RTL_LANGUAGES[i] === language) {
                        isRTL = true;
                        break;
                    }
                }
            }
        }
    }
    if (typeof isRTL === 'boolean')
        locale.isRTL = isRTL;
    cachedLocale = locale;
    return cachedLocale;
}
function getDevice() {
    if (currentUserAgent === USER_AGENT && parsedFromHighEntropyValuesDevice !== null)
        return parsedFromHighEntropyValuesDevice;
    var osName = getParsedCache().os.name;
    if (osName === OS.iOS || osName === OS.Android)
        return Devices.Mobile;
    if (osName === OS.Windows || osName === OS.MacOS)
        return Devices.Desktop;
    return Devices.Unknown;
}
function getIsWebview() {
    return /; ?wv|applewebkit(?!.*safari)/i.test(currentUserAgent);
}
function getIsNode() {
    return typeof globalThis.process !== 'undefined' && typeof globalThis.process.versions !== 'undefined' && typeof globalThis.process.versions.node !== 'undefined';
}
function getIsStandalone() {
    var osName = getParsedCache().os.name;
    if (osName === OS.iOS)
        return globalThis.navigator.standalone === true;
    if (typeof globalThis.matchMedia === 'undefined')
        return false;
    return globalThis.matchMedia('(display-mode: standalone)').matches;
}
function parseFromHighEntropyValues() {
    if (typeof globalThis.navigator === 'undefined' || typeof globalThis.navigator.userAgentData === 'undefined' || typeof globalThis.navigator.userAgentData.getHighEntropyValues === 'undefined')
        return Promise.resolve();
    return globalThis.navigator.userAgentData
        .getHighEntropyValues(['brands', 'fullVersionList', 'mobile', 'model', 'platform', 'platformVersion', 'architecture', 'formFactors', 'bitness', 'uaFullVersion', 'wow64'])
        .then(function (result) {
        try {
            var brands = result.fullVersionList || result.brands || [];
            var platformVersion = result.platformVersion;
            var platform = result.platform;
            var browserName = getParsedCache().browser.name;
            var prevBrandName = null;
            for (var i = 0; i < brands.length; i++) {
                var brand = normalizeBrand(brands[i]);
                var brandVersion = brand.version;
                var brandName = brand.brand;
                if (/not.a.brand/i.test(brandName))
                    continue;
                if (prevBrandName === null || (/Chrom/.test(prevBrandName) && brandName !== 'Chromium') || (prevBrandName === 'Edge' && /WebView2/.test(brandName))) {
                    brandName = HIGH_ENTROPY_BRAND_NAME_MAP[brandName] || brandName;
                    prevBrandName = browserName;
                    if (prevBrandName === null || /Chrom/.test(prevBrandName) || !/Chrom/.test(brandName)) {
                        browserName = brandName;
                        if (browserName === 'Chrome' || browserName === 'Chrome WebView' || browserName === 'Chrome Headless')
                            parsedFromHighEntropyValuesBrowser.name = Browsers.Chrome;
                        else if (browserName === 'Edge' || browserName === 'Edge WebView2')
                            parsedFromHighEntropyValuesBrowser.name = Browsers.Edge;
                        else if (browserName === 'Opera Mobi')
                            parsedFromHighEntropyValuesBrowser.name = Browsers.Opera;
                        parsedFromHighEntropyValuesBrowser.version = brandVersion;
                    }
                    prevBrandName = brandName;
                }
                if (brandName === 'Chromium')
                    parsedFromHighEntropyValuesEngine.version = brandVersion;
            }
            if (typeof platformVersion === 'string') {
                if (getParsedCache().os.name === OS.Windows)
                    parsedFromHighEntropyValuesOS.version = parseInt(platformVersion.split('.')[0], 10) >= 13 ? '11' : '10';
                else
                    parsedFromHighEntropyValuesOS.version = platformVersion;
            }
            if (typeof platform === 'string') {
                if (/android/i.test(platform))
                    parsedFromHighEntropyValuesOS.name = OS.Android;
                else if (/ios|iphone|ipad/i.test(platform))
                    parsedFromHighEntropyValuesOS.name = OS.iOS;
                else if (/windows|win32/i.test(platform))
                    parsedFromHighEntropyValuesOS.name = OS.Windows;
                else if (/macos|macintel/i.test(platform))
                    parsedFromHighEntropyValuesOS.name = OS.MacOS;
            }
            if (result.mobile === true)
                parsedFromHighEntropyValuesDevice = Devices.Mobile;
            parsedCache = null;
        }
        catch (_) {
        }
    })
        .catch(function () {
    });
}
function parseFromNavigatorGPU() {
    if (typeof globalThis.navigator === 'undefined' || typeof globalThis.navigator.gpu === 'undefined')
        return Promise.resolve();
    return globalThis.navigator.gpu
        .requestAdapter()
        .then(function (adapter) {
        if (adapter !== null) {
            var info = adapter.info;
            parsedFromNavigatorGPU.architecture = info.architecture;
            parsedFromNavigatorGPU.description = info.description;
            parsedFromNavigatorGPU.device = info.device;
            parsedFromNavigatorGPU.vendor = info.vendor;
        }
    })
        .catch(function () {
    });
}
ready = Promise.all([
    parseFromHighEntropyValues(),
    parseFromNavigatorGPU(),
]).then(function () {
});
EventListener.add(globalThis, {
    type: 'languagechange', callback: function () {
        cachedLocale = null;
    }
});
var Platform = {
    get ready() {
        return ready;
    },
    get os() {
        return getParsedCache().os;
    },
    get engine() {
        return getParsedCache().engine;
    },
    get browser() {
        return getParsedCache().browser;
    },
    get userAgent() {
        return currentUserAgent;
    },
    set userAgent(value) {
        if (currentUserAgent === value)
            return;
        currentUserAgent = value;
        invalidateCache();
        if (value === USER_AGENT) {
            ready = Promise.all([
                parseFromHighEntropyValues(),
                parseFromNavigatorGPU(),
            ]).then(function () {
            });
        }
    },
    get locale() {
        return getLocale();
    },
    get device() {
        return getDevice();
    },
    get gpu() {
        return getGPU();
    },
    get isWebview() {
        return getIsWebview();
    },
    get isNode() {
        return getIsNode();
    },
    get isStandalone() {
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

function createSubscriptionManager(attach, detach) {
    var entries = [];
    function removeEntry(entry) {
        var index = indexOfEntry(entry);
        if (index !== -1) {
            entries.splice(index, 1);
            if (entries.length === 0)
                detach();
        }
    }
    function indexOfEntry(entry) {
        for (var i = 0; i < entries.length; i++)
            if (entries[i].fn === entry.fn)
                return i;
        return -1;
    }
    return {
        emit: function (value) {
            var snapshot = entries.slice();
            for (var i = 0; i < snapshot.length; i++) {
                snapshot[i].fn(value);
                if (snapshot[i].once)
                    removeEntry(snapshot[i]);
            }
        },
        subscribe: function (listener, options) {
            if (options === void 0) { options = {}; }
            var entry = { fn: listener, once: false };
            if (typeof options.once !== 'undefined')
                entry.once = options.once;
            if (typeof options.signal !== 'undefined')
                entry.signal = options.signal;
            var index = indexOfEntry(entry);
            if (index === -1) {
                entries.push(entry);
                if (entries.length === 1)
                    attach();
            }
            else if (entries[index].once && !entry.once) {
                entries[index].once = false;
            }
            var cleanup = function () {
                EventListener.remove(entry.signal, { type: 'abort', callback: cleanup });
                removeEntry(entry);
            };
            if (typeof entry.signal !== 'undefined') {
                if (entry.signal.aborted)
                    removeEntry(entry);
                else
                    EventListener.add(entry.signal, { type: 'abort', callback: cleanup });
            }
            return function unsubscribe() {
                removeEntry(entry);
            };
        }
    };
}

var onChangeSubscriptionManager$3 = createSubscriptionManager(attachOnChange$3, detachOnChange$3);
var appearanceRef = null;
var pollingIntervalId = null;
var Appearance = {
    get value() {
        return getAppearance();
    },
    onChange: onChangeSubscriptionManager$3.subscribe,
    Constants: {
        Appearances: Appearances
    },
    Errors: {}
};
function getAppearanceFromEngine() {
    var img = new Image();
    img.src = SVG_PIXEL_DATA_URL;
    if (CONTEXT === null)
        return Appearances.Light;
    CONTEXT.drawImage(img, 0, 0);
    var data = CONTEXT.getImageData(0, 0, 1, 1).data;
    if ((data[0] & data[1] & data[2]) < 255)
        return Appearances.Dark;
    else
        return Appearances.Light;
}
function getAppearanceFromMediaQuery() {
    if (MEDIA_QUERY_LIST$1.media === 'not all')
        return Appearances.Unknown;
    if (MEDIA_QUERY_LIST$1.matches)
        return Appearances.Dark;
    return Appearances.Light;
}
function getAppearance() {
    if (Platform.browser.name === Browsers.SamsungInternet)
        return getAppearanceFromEngine();
    return getAppearanceFromMediaQuery();
}
function startPolling() {
    appearanceRef = getAppearanceFromEngine();
    pollingIntervalId = globalThis.setInterval(function () {
        var appearance = getAppearanceFromEngine();
        if (appearance !== appearanceRef) {
            appearanceRef = appearance;
            onChangeSubscriptionManager$3.emit(appearance);
        }
    }, 2000);
}
function stopPolling() {
    appearanceRef = null;
    if (pollingIntervalId !== null) {
        clearInterval(pollingIntervalId);
        pollingIntervalId = null;
    }
}
function attachOnChange$3() {
    appearanceRef = getAppearanceFromMediaQuery();
    EventListener.add(MEDIA_QUERY_LIST$1, { type: 'change', callback: onMediaChange });
    if (Platform.browser.name === Browsers.SamsungInternet)
        startPolling();
}
function detachOnChange$3() {
    appearanceRef = null;
    EventListener.remove(MEDIA_QUERY_LIST$1, { type: 'change', callback: onMediaChange });
    if (Platform.browser.name === Browsers.SamsungInternet)
        stopPolling();
}
function onMediaChange(event) {
    var appearance;
    if (event.matches)
        appearance = Appearances.Dark;
    else
        appearance = Appearances.Light;
    if (appearance !== appearanceRef)
        onChangeSubscriptionManager$3.emit(appearanceRef = appearance);
}

function isSecureContext() {
    if (typeof globalThis.isSecureContext !== 'undefined')
        return globalThis.isSecureContext;
    var protocol = location.protocol;
    var hostname = location.hostname;
    return protocol === 'https:' ||
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '[::1]';
}

function setStyle(element, styles) {
    var elementStyle = element.style;
    for (var key in styles) {
        var style = styles[key];
        if (typeof style !== 'undefined')
            elementStyle[key] = style;
    }
}

function createHiddenElement(tagName, focusable) {
    if (focusable === void 0) { focusable = true; }
    var element = globalThis.document.createElement(tagName);
    if (typeof element.width !== 'undefined')
        element.width = '0';
    if (typeof element.height !== 'undefined')
        element.height = '0';
    if (typeof element.border !== 'undefined')
        element.border = '0';
    if (typeof element.frameBorder !== 'undefined')
        element.frameBorder = '0';
    if (typeof element.scrolling !== 'undefined')
        element.scrolling = 'no';
    if (typeof element.cellPadding !== 'undefined')
        element.cellPadding = '0';
    if (typeof element.cellSpacing !== 'undefined')
        element.cellSpacing = '0';
    if (typeof element.frame !== 'undefined')
        element.frame = 'void';
    if (typeof element.rules !== 'undefined')
        element.rules = 'none';
    if (typeof element.noWrap !== 'undefined')
        element.noWrap = true;
    element.tabIndex = -1;
    element.setAttribute('role', 'presentation');
    if (focusable) {
        setStyle(element, {
            width: '1px',
            height: '1px',
        });
    }
    else {
        element.setAttribute('aria-hidden', 'true');
        setStyle(element, {
            width: '0',
            height: '0',
            zIndex: '-9999',
            display: 'none',
            visibility: 'hidden',
            pointerEvents: 'none',
        });
    }
    setStyle(element, {
        position: 'absolute',
        top: '0',
        left: '0',
        padding: '0',
        margin: '0',
        border: 'none',
        outline: 'hidden',
        clip: 'rect(1px, 1px, 1px, 1px)',
        clipPath: 'inset(50%)',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
    });
    return element;
}

var Clipboard = {
    copy: copy,
    paste: paste,
    Constants: {},
    Errors: {},
};
function isObject(item) {
    return item !== null && typeof item === 'object';
}
function isArray(item) {
    return Array.isArray(item);
}
function isSerializable(item) {
    return isObject(item) || isArray(item);
}
function isElement(item) {
    if (item == null || (typeof item !== "object" && typeof item !== "function"))
        return false;
    if (item.nodeType !== 1)
        return false;
    if (typeof item.nodeName !== "string")
        return false;
    return typeof item.getAttribute === "function";
}
function isSelection(item) {
    return Object.prototype.toString.call(item) === '[object Selection]';
}
function convertToString(item) {
    if (isElement(item)) {
        var textContent = item.textContent;
        if (textContent !== null)
            return textContent;
        return '';
    }
    if (isSelection(item))
        return item.toString();
    if (isSerializable(item)) {
        try {
            return JSON.stringify(item);
        }
        catch (_) {
            return '' + item;
        }
    }
    else if (typeof item !== 'string') {
        return '' + item;
    }
    return item;
}
function convertToHTML(item) {
    var html = null;
    if (isElement(item))
        html = item.outerHTML;
    if (isSelection(item) && item.rangeCount > 0) {
        var div = globalThis.document.createElement('div');
        for (var i = 0; i < item.rangeCount; i++)
            div.appendChild(item.getRangeAt(i).cloneContents());
        html = div.innerHTML;
    }
    if (html === null)
        return;
    return html;
}
function supportsClipboardAPI() {
    return (isSecureContext() && typeof globalThis.navigator.clipboard !== 'undefined');
}
function supportsClipboardWriteAPI() {
    return supportsClipboardAPI() && (typeof globalThis.navigator.clipboard.write !== 'undefined' || typeof globalThis.navigator.clipboard.writeText !== 'undefined');
}
function supportsClipboardReadAPI() {
    return supportsClipboardAPI() && (typeof globalThis.navigator.clipboard.read !== 'undefined' || typeof globalThis.navigator.clipboard.readText !== 'undefined');
}
function copy(item) {
    var text = convertToString(item);
    var html = convertToHTML(item);
    if (supportsClipboardWriteAPI()) {
        return copyViaClipboardAPI(text, html)
            .then(function (success) {
            if (success)
                return true;
            return copyViaLegacy(text, html);
        })
            .catch(function () {
            return copyViaLegacy(text, html);
        });
    }
    return Promise.resolve(copyViaLegacy(text, html));
}
function copyViaClipboardAPI(text, html) {
    try {
        if (typeof globalThis.ClipboardItem !== 'undefined' && typeof globalThis.navigator.clipboard.write !== 'undefined') {
            var items = {};
            if (typeof html !== 'undefined')
                items['text/html'] = new Blob([html], { type: 'text/html' });
            items['text/plain'] = new Blob([text], { type: 'text/plain' });
            return globalThis.navigator.clipboard.write([new ClipboardItem(items)])
                .then(function () {
                return true;
            })
                .catch(function () {
                return false;
            });
        }
        else if (typeof globalThis.navigator.clipboard.writeText !== 'undefined') {
            return globalThis.navigator.clipboard.writeText(text)
                .then(function () {
                return true;
            })
                .catch(function () {
                return false;
            });
        }
    }
    catch (_) {
        return Promise.resolve(false);
    }
    return Promise.resolve(false);
}
function copyViaSelection(text, html) {
    if (typeof globalThis.getSelection === 'undefined' || typeof globalThis.document.createRange === 'undefined')
        return false;
    var div = createHiddenElement('div');
    div.contentEditable = 'true';
    if (typeof html !== 'undefined')
        div.innerHTML = html;
    else
        div.textContent = text;
    div.style.whiteSpace = 'pre';
    div.style.userSelect = 'text';
    div.style.setProperty('-webkit-user-select', 'text');
    div.style.setProperty('-moz-user-select', 'text');
    div.style.setProperty('-ms-user-select', 'text');
    globalThis.document.body.appendChild(div);
    var selection = globalThis.getSelection();
    var range = globalThis.document.createRange();
    var onCopy = function (event) {
        try {
            if (event.clipboardData !== null && typeof event.clipboardData.setData === 'function') {
                event.preventDefault();
                if (typeof html !== 'undefined')
                    event.clipboardData.setData('text/html', html);
                event.clipboardData.setData('text/plain', text);
            }
        }
        catch (_) {
        }
    };
    EventListener.add(globalThis.document, { type: 'copy', callback: onCopy, options: { once: true, capture: true } });
    try {
        if (selection === null) {
            cleanupSelection(div, selection, onCopy);
            return false;
        }
        selection.removeAllRanges();
        range.selectNodeContents(div);
        selection.addRange(range);
        var success = globalThis.document.execCommand('copy');
        cleanupSelection(div, selection, onCopy);
        return success;
    }
    catch (_) {
        cleanupSelection(div, selection, onCopy);
        return false;
    }
}
function copyViaClipboardData(text, html) {
    var windowWithClipboardData = globalThis;
    var clipboardData = windowWithClipboardData.clipboardData;
    if (typeof clipboardData !== 'undefined' && typeof clipboardData.setData === 'function') {
        try {
            if (typeof html !== 'undefined')
                clipboardData.setData('HTML', html);
            return clipboardData.setData('Text', text);
        }
        catch (_) {
            return false;
        }
    }
    return false;
}
function copyViaLegacy(text, html) {
    return copyViaSelection(text, html) || copyViaClipboardData(text, html);
}
function paste() {
    if (supportsClipboardReadAPI()) {
        return pasteViaClipboardAPI()
            .then(function (text) {
            if (text !== null)
                return text;
            return pasteViaLegacy();
        })
            .catch(function () {
            return pasteViaLegacy();
        });
    }
    return Promise.resolve(pasteViaLegacy());
}
function pasteViaClipboardAPI() {
    try {
        if (typeof globalThis.ClipboardItem !== 'undefined' && typeof globalThis.navigator.clipboard.read !== 'undefined') {
            return globalThis.navigator.clipboard.read()
                .then(function (items) {
                if (items.length === 0)
                    return Promise.resolve(null);
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    var types = item.types;
                    for (var j = 0; j < types.length; j++) {
                        if (types[j] === 'text/html') {
                            return item.getType('text/html')
                                .then(function (blob) {
                                return blob.text();
                            })
                                .catch(function () {
                                return null;
                            });
                        }
                    }
                }
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    var types = item.types;
                    for (var j = 0; j < types.length; j++) {
                        if (types[j] === 'text/plain') {
                            return item.getType('text/plain')
                                .then(function (blob) {
                                return blob.text();
                            })
                                .catch(function () {
                                return null;
                            });
                        }
                    }
                }
                return Promise.resolve(null);
            })
                .catch(function () {
                return null;
            });
        }
        else if (typeof globalThis.navigator.clipboard.readText !== 'undefined') {
            return globalThis.navigator.clipboard.readText()
                .then(function (text) {
                return text;
            })
                .catch(function () {
                return null;
            });
        }
    }
    catch (_) {
        return Promise.resolve(null);
    }
    return Promise.resolve(null);
}
function pasteViaSelection() {
    var div = createHiddenElement('div');
    div.contentEditable = 'true';
    globalThis.document.body.appendChild(div);
    div.focus();
    var pastedText = null;
    var onPaste = function (event) {
        try {
            if (event.clipboardData !== null && typeof event.clipboardData.getData === 'function') {
                event.preventDefault();
                var html = event.clipboardData.getData('text/html');
                var plain = event.clipboardData.getData('text/plain');
                if (html !== '')
                    pastedText = html;
                if (plain !== '')
                    pastedText = plain;
            }
        }
        catch (_) {
        }
    };
    EventListener.add(globalThis.document, { type: 'paste', callback: onPaste, options: { once: true, capture: true } });
    try {
        var success = globalThis.document.execCommand('paste');
        if (!success && pastedText === null) {
            var innerHTML = div.innerHTML;
            if (innerHTML !== '') {
                pastedText = innerHTML;
            }
            else {
                var textContent = div.textContent;
                if (textContent !== null && textContent !== '')
                    pastedText = textContent;
            }
        }
        cleanupPaste(div, onPaste);
        return pastedText;
    }
    catch (_) {
        cleanupPaste(div, onPaste);
        return null;
    }
}
function pasteViaClipboardData() {
    var windowWithClipboardData = globalThis;
    var clipboardData = windowWithClipboardData.clipboardData;
    if (typeof clipboardData !== 'undefined' && typeof clipboardData.getData === 'function') {
        try {
            var text = clipboardData.getData('Text');
            if (text !== '')
                return text;
            return null;
        }
        catch (_) {
            return null;
        }
    }
    return null;
}
function pasteViaLegacy() {
    var fromSelection = pasteViaSelection();
    if (fromSelection !== null)
        return fromSelection;
    var fromClipboardData = pasteViaClipboardData();
    if (fromClipboardData !== null)
        return fromClipboardData;
    return '';
}
function cleanupSelection(span, selection, onCopy) {
    if (selection !== null)
        selection.removeAllRanges();
    globalThis.document.body.removeChild(span);
    EventListener.remove(globalThis.document, { type: 'copy', callback: onCopy });
}
function cleanupPaste(div, onPaste) {
    globalThis.document.body.removeChild(div);
    EventListener.remove(globalThis.document, { type: 'paste', callback: onPaste });
}

var Orientation;
(function (Orientation) {
    Orientation["Portrait"] = "portrait";
    Orientation["Landscape"] = "landscape";
    Orientation["Unknown"] = "unknown";
})(Orientation || (Orientation = {}));
var ENV_PRESETS = {
    'safe-area-inset': {
        top: 'safe-area-inset-top',
        right: 'safe-area-inset-right',
        bottom: 'safe-area-inset-bottom',
        left: 'safe-area-inset-left',
    },
    'safe-area-max-inset': {
        top: 'safe-area-max-inset-top',
        right: 'safe-area-max-inset-right',
        bottom: 'safe-area-max-inset-bottom',
        left: 'safe-area-max-inset-left',
    },
    'titlebar-area': {
        x: 'titlebar-area-x',
        y: 'titlebar-area-y',
        width: 'titlebar-area-width',
        height: 'titlebar-area-height',
    },
    'keyboard-inset': {
        top: 'keyboard-inset-top',
        right: 'keyboard-inset-right',
        bottom: 'keyboard-inset-bottom',
        left: 'keyboard-inset-left',
        width: 'keyboard-inset-width',
        height: 'keyboard-inset-height',
    },
    'viewport-segment': {
        width: 'viewport-segment-width',
        height: 'viewport-segment-height',
        top: 'viewport-segment-top',
        right: 'viewport-segment-right',
        bottom: 'viewport-segment-bottom',
        left: 'viewport-segment-left',
    },
};
var FALLBACK_DIMENSION = {
    innerWidth: -1,
    innerHeight: -1,
    outerWidth: -1,
    outerHeight: -1,
    scale: 1,
    orientation: Orientation.Unknown,
};
var MEDIA_QUERY_LIST;
if (typeof globalThis.matchMedia !== 'undefined')
    MEDIA_QUERY_LIST = globalThis.matchMedia('(orientation: portrait)');
else
    MEDIA_QUERY_LIST = FALLBACK_MEDIA_QUERY_LIST;

function keys(object) {
    var keys = [];
    for (var key in object)
        if (object.hasOwnProperty(key))
            keys.push(key);
    return keys;
}

function defer(task) {
    if (typeof globalThis.queueMicrotask !== 'undefined') {
        globalThis.queueMicrotask(task);
        return;
    }
    if (typeof globalThis.Promise === 'function') {
        Promise.resolve().then(task);
        return;
    }
    globalThis.setTimeout(task, 0);
}

function noop() {
}
function createVirtualKeyboardObserver() {
    var onChangeSubscriptionManager = createSubscriptionManager(attachOnChange, detachOnChange);
    function attachOnChange() {
        EventListener.add(globalThis.navigator.virtualKeyboard, { type: 'geometrychange', callback: onGeometryChange, options: { passive: true } });
    }
    function detachOnChange() {
        EventListener.remove(globalThis.navigator.virtualKeyboard, { type: 'geometrychange', callback: onGeometryChange, options: { passive: true } });
    }
    function onGeometryChange() {
        onChangeSubscriptionManager.emit(getValue());
    }
    function getValue() {
        var rect = globalThis.navigator.virtualKeyboard.boundingRect;
        var left = rect.x;
        var top = rect.y;
        var width = rect.width;
        var height = rect.height;
        var right = (function () {
            if (width === 0)
                return 0;
            return Math.max(0, globalThis.innerWidth - (left + width));
        })();
        var bottom = (function () {
            if (height === 0)
                return 0;
            return Math.max(0, globalThis.innerHeight - (top + height));
        })();
        return {
            top: top,
            right: right,
            bottom: bottom,
            left: left,
            width: width,
            height: height,
        };
    }
    return {
        get: getValue,
        onChange: onChangeSubscriptionManager.subscribe,
    };
}
function createEnvObserver(preset) {
    if (preset === 'keyboard-inset' && typeof globalThis.navigator.virtualKeyboard !== 'undefined')
        return createVirtualKeyboardObserver();
    var envMap = ENV_PRESETS[preset];
    var attributes = keys(envMap);
    var support = getSupportedEnv();
    var parentReadyCallbacks = [];
    var onChangeSubscriptionManager = createSubscriptionManager(attachOnChange, detachOnChange);
    var elementComputedStyle = {};
    var passiveEvents = undefined;
    var parentDiv = null;
    var pendingChange = false;
    var lastEmittedValues = null;
    function attachOnChange() {
        if (typeof support === 'undefined')
            return;
        if (parentDiv === null)
            init();
    }
    function detachOnChange() {
        removeDetector();
    }
    function getSupportedEnv() {
        if (typeof globalThis.CSS !== 'undefined' && typeof globalThis.CSS.supports === 'function') {
            if (globalThis.CSS.supports('x: env(x)'))
                return 'env';
            if (globalThis.CSS.supports('x: constant(x)'))
                return 'constant';
        }
        return undefined;
    }
    function isSameValues(a, b) {
        for (var i = 0; i < attributes.length; i++) {
            var key = attributes[i];
            if (a[key] !== b[key])
                return false;
        }
        return true;
    }
    try {
        var options = Object.defineProperty({}, 'passive', {
            get: function () {
                passiveEvents = { passive: true };
            },
        });
        EventListener.add(globalThis, { type: 'test', callback: noop, options: options });
    }
    catch (_) {
    }
    function attributeChange() {
        if (pendingChange)
            return;
        pendingChange = true;
        defer(function flush() {
            pendingChange = false;
            var nextValues = readValues();
            if (lastEmittedValues !== null && isSameValues(lastEmittedValues, nextValues))
                return;
            lastEmittedValues = nextValues;
            onChangeSubscriptionManager.emit(nextValues);
        });
    }
    function parentReady(callback) {
        if (typeof callback !== 'undefined')
            parentReadyCallbacks.push(callback);
        else
            for (var i = 0; i < parentReadyCallbacks.length; i++)
                parentReadyCallbacks[i]();
    }
    function addChild(parent, attribute) {
        var envVar = envMap[attribute];
        var p1 = globalThis.document.createElement('div');
        var p2 = globalThis.document.createElement('div');
        var c1 = globalThis.document.createElement('div');
        var c2 = globalThis.document.createElement('div');
        var parentStyle = {
            position: 'absolute',
            width: '100px',
            height: '200px',
            boxSizing: 'border-box',
            overflow: 'hidden',
            paddingBottom: support + '(' + envVar + ')',
        };
        var child1Style = {
            transition: '0s',
            animation: 'none',
            width: '400px',
            height: '400px',
        };
        var child2Style = {
            transition: '0s',
            animation: 'none',
            width: '250%',
            height: '250%',
        };
        setStyle(p1, parentStyle);
        setStyle(p2, parentStyle);
        setStyle(c1, child1Style);
        setStyle(c2, child2Style);
        p1.appendChild(c1);
        p2.appendChild(c2);
        parent.appendChild(p1);
        parent.appendChild(p2);
        parentReady(function () {
            p1.scrollTop = p2.scrollTop = 10000;
            var p1LastScrollTop = p1.scrollTop;
            var p2LastScrollTop = p2.scrollTop;
            function onScroll() {
                var lastScrollTop;
                if (this === p1)
                    lastScrollTop = p1LastScrollTop;
                else
                    lastScrollTop = p2LastScrollTop;
                if (this.scrollTop === lastScrollTop)
                    return;
                p1.scrollTop = p2.scrollTop = 10000;
                p1LastScrollTop = p1.scrollTop;
                p2LastScrollTop = p2.scrollTop;
                attributeChange();
            }
            EventListener.add(p1, { type: 'scroll', callback: onScroll, options: passiveEvents });
            EventListener.add(p2, { type: 'scroll', callback: onScroll, options: passiveEvents });
        });
        var computedStyle = globalThis.getComputedStyle(p1);
        Object.defineProperty(elementComputedStyle, attribute, {
            configurable: true,
            get: function () {
                return globalThis.parseFloat(computedStyle.paddingBottom);
            },
        });
    }
    function init() {
        if (typeof support === 'undefined') {
            for (var i = 0; i < attributes.length; i++) {
                elementComputedStyle[attributes[i]] = 0;
            }
            return;
        }
        elementComputedStyle = {};
        parentDiv = globalThis.document.createElement('div');
        parentDiv.setAttribute('data-' + preset + '-observer', '');
        setStyle(parentDiv, {
            position: 'absolute',
            left: '0',
            top: '0',
            width: '0',
            height: '0',
            zIndex: '-1',
            overflow: 'hidden',
            visibility: 'hidden',
        });
        for (var i = 0; i < attributes.length; i++) {
            addChild(parentDiv, attributes[i]);
        }
        globalThis.document.body.appendChild(parentDiv);
        lastEmittedValues = readValues();
        parentReady();
    }
    function removeDetector() {
        if (parentDiv !== null) {
            if (parentDiv.parentNode !== null)
                parentDiv.parentNode.removeChild(parentDiv);
            parentDiv = null;
        }
        parentReadyCallbacks.length = 0;
        elementComputedStyle = {};
        lastEmittedValues = null;
    }
    function getAttribute(attribute) {
        return elementComputedStyle[attribute];
    }
    function readValues() {
        var result = {};
        for (var i = 0; i < attributes.length; i++) {
            var attribute = attributes[i];
            result[attribute] = getAttribute(attribute);
        }
        return result;
    }
    return {
        get: function () {
            if (parentDiv !== null)
                return readValues();
            init();
            var result = readValues();
            removeDetector();
            return result;
        },
        onChange: function (callback, options) {
            if (options === void 0) { options = {}; }
            if (typeof support === 'undefined')
                return noop;
            return onChangeSubscriptionManager.subscribe(callback, options);
        }
    };
}

var safeAreaInsetObserver = createEnvObserver('safe-area-inset');
var safeAreaMaxInsetObserver = createEnvObserver('safe-area-max-inset');
var keyboardInsetObserver = createEnvObserver('keyboard-inset');
var titlebarAreaObserver = createEnvObserver('titlebar-area');
var viewportSegmentObserver = createEnvObserver('viewport-segment');
var onChangeSubscriptionManager$2 = createSubscriptionManager(attachOnChange$2, detachOnChange$2);
var dimensionRef = null;
var Dimension = {
    get value() {
        return getDimension();
    },
    environment: getEnvironment(),
    onChange: onChangeSubscriptionManager$2.subscribe,
    Constants: {
        Orientation: Orientation,
    },
    Errors: {},
};
function getOrientation() {
    if (typeof globalThis.screen !== 'undefined') {
        switch (globalThis.screen.orientation.type) {
            case 'portrait-primary':
            case 'portrait-secondary':
                return Orientation.Portrait;
            case 'landscape-primary':
            case 'landscape-secondary':
                return Orientation.Landscape;
        }
    }
    if (typeof globalThis.orientation !== 'undefined') {
        switch (globalThis.orientation) {
            case 0:
            case 180:
                return Orientation.Portrait;
            case 90:
            case 270:
                return Orientation.Landscape;
        }
    }
    if (MEDIA_QUERY_LIST.media === 'not all')
        return Orientation.Unknown;
    else if (MEDIA_QUERY_LIST.matches)
        return Orientation.Portrait;
    else
        return Orientation.Landscape;
}
function getScale() {
    if (typeof globalThis.devicePixelRatio !== 'undefined')
        return globalThis.devicePixelRatio;
    return -1;
}
function getEnvironment() {
    return {
        safeAreaInset: {
            get value() {
                return safeAreaInsetObserver.get();
            },
            onChange: safeAreaInsetObserver.onChange,
        },
        safeAreaMaxInset: {
            get value() {
                return safeAreaMaxInsetObserver.get();
            },
            onChange: safeAreaMaxInsetObserver.onChange,
        },
        keyboardInset: {
            get value() {
                return keyboardInsetObserver.get();
            },
            onChange: keyboardInsetObserver.onChange,
        },
        titlebarArea: {
            get value() {
                return titlebarAreaObserver.get();
            },
            onChange: titlebarAreaObserver.onChange,
        },
        viewportSegment: {
            get value() {
                return viewportSegmentObserver.get();
            },
            onChange: viewportSegmentObserver.onChange,
        },
    };
}
function getDimension() {
    if (typeof globalThis.innerWidth !== 'undefined') {
        return {
            innerWidth: globalThis.innerWidth,
            innerHeight: globalThis.innerHeight,
            outerWidth: globalThis.outerWidth,
            outerHeight: globalThis.outerHeight,
            scale: getScale(),
            orientation: getOrientation(),
        };
    }
    return FALLBACK_DIMENSION;
}
function attachOnChange$2() {
    dimensionRef = getDimension();
    EventListener.add(globalThis, { type: 'resize', callback: onResize });
    if (typeof globalThis.screen.orientation.addEventListener === 'function')
        EventListener.add(globalThis.screen.orientation, { type: 'change', callback: onResize });
    else if (typeof globalThis.orientation !== 'undefined')
        EventListener.add(globalThis, { type: 'orientationChange', callback: onResize });
    else if (MEDIA_QUERY_LIST.media !== 'not all')
        EventListener.add(MEDIA_QUERY_LIST, { type: 'change', callback: onResize });
}
function detachOnChange$2() {
    dimensionRef = null;
    EventListener.remove(globalThis, { type: 'resize', callback: onResize });
    if (typeof globalThis.screen.orientation.removeEventListener === 'function')
        EventListener.remove(globalThis.screen.orientation, { type: 'change', callback: onResize });
    else if (typeof globalThis.orientation !== 'undefined')
        EventListener.remove(globalThis, { type: 'orientationChange', callback: onResize });
    else if (MEDIA_QUERY_LIST.media !== 'not all')
        EventListener.remove(MEDIA_QUERY_LIST, { type: 'change', callback: onResize });
}
function onResize() {
    var dimension = getDimension();
    if (dimensionRef === null || dimension.innerWidth !== dimensionRef.innerWidth || dimension.innerHeight !== dimensionRef.innerHeight || dimension.outerWidth !== dimensionRef.outerWidth || dimension.outerHeight !== dimensionRef.outerHeight || dimension.scale !== dimensionRef.scale || dimension.orientation !== dimensionRef.orientation)
        onChangeSubscriptionManager$2.emit(dimensionRef = dimension);
}

function createCustomError(name, Base) {
    if (Base === void 0) { Base = Error; }
    function CustomError(message) {
        if (!(this instanceof CustomError))
            return new CustomError(message);
        var error = (function () {
            if (typeof message === 'undefined')
                return new Base('');
            return new Base(message);
        })();
        if (typeof Object.setPrototypeOf === 'function')
            Object.setPrototypeOf(error, CustomError.prototype);
        else
            error.__proto__ = CustomError.prototype;
        error.name = name;
        if (typeof message !== 'undefined')
            error.message = message;
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            try {
                Object.defineProperty(error, Symbol.toStringTag, {
                    value: name,
                    writable: false,
                    enumerable: false,
                    configurable: true
                });
            }
            catch (_) {
            }
        }
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(error, CustomError);
        }
        else if (Base.captureStackTrace && typeof Base.captureStackTrace === 'function') {
            Base.captureStackTrace(error, CustomError);
        }
        else {
            try {
                var tempError = new Base();
                if (tempError.stack)
                    error.stack = tempError.stack;
            }
            catch (_) {
            }
        }
        return error;
    }
    CustomError.prototype = Object.create(Base.prototype, {
        constructor: {
            value: CustomError,
            writable: true,
            enumerable: false,
            configurable: true
        }
    });
    try {
        Object.defineProperty(CustomError.prototype, 'name', {
            value: name,
            writable: true,
            enumerable: false,
            configurable: true
        });
    }
    catch (_) {
        try {
            CustomError.prototype.name = name;
        }
        catch (_) {
        }
    }
    try {
        Object.defineProperty(CustomError, 'name', {
            value: name,
            writable: false,
            enumerable: false,
            configurable: true
        });
    }
    catch (_) {
    }
    return CustomError;
}

var NotSupportedError = createCustomError('NotSupportedError');

var FS_BRIDGED_KEY = Symbol('fsBridged');
var API_VARIANTS = {
    standard: {
        enabled: 'fullscreenEnabled',
        element: 'fullscreenElement',
        request: 'requestFullscreen',
        exit: 'exitFullscreen',
        events: { change: 'fullscreenchange', error: 'fullscreenerror' },
    },
    webkit: {
        enabled: 'webkitFullscreenEnabled',
        element: 'webkitFullscreenElement',
        request: 'webkitRequestFullscreen',
        exit: 'webkitExitFullscreen',
        events: { change: 'webkitfullscreenchange', error: 'webkitfullscreenerror' },
    },
    moz: {
        enabled: 'mozFullScreenEnabled',
        element: 'mozFullScreenElement',
        request: 'mozRequestFullScreen',
        exit: 'mozCancelFullScreen',
        events: { change: 'mozfullscreenchange', error: 'mozfullscreenerror' },
    },
    ms: {
        enabled: 'msFullscreenEnabled',
        element: 'msFullscreenElement',
        request: 'msRequestFullscreen',
        exit: 'msExitFullscreen',
        events: { change: 'MSFullscreenChange', error: 'MSFullscreenError' },
    },
};
var api = detectApi();
function detectApi() {
    var element = globalThis.document.documentElement;
    if (typeof globalThis.document.fullscreenEnabled !== 'undefined' || typeof globalThis.document.exitFullscreen !== 'undefined')
        return API_VARIANTS.standard;
    var keys = ['webkit', 'moz', 'ms'];
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var variant = API_VARIANTS[key];
        if (typeof globalThis.document[variant.enabled] !== 'undefined' || typeof globalThis.document[variant.element] !== 'undefined' || typeof globalThis.document[variant.exit] !== 'undefined') {
            if (key === 'webkit' && typeof element.webkitRequestFullScreen !== 'undefined')
                variant.request = 'webkitRequestFullScreen';
            return variant;
        }
    }
    return null;
}
function createFullscreen() {
    var lastIOSVideo = null;
    var eventsBridged = false;
    var activeOperation = null;
    var pendingQueue = [];
    var lastIntendedOperation = 'exit';
    var onChangeSubscriptionManager = createSubscriptionManager(attachOnChange, detachOnChange);
    var onErrorSubscriptionManager = createSubscriptionManager(attachOnError, detachOnError);
    function getDefaultTarget() {
        if (Platform.os.name === OS.iOS) {
            var video = globalThis.document.querySelector('video');
            if (video === null)
                return undefined;
            return video;
        }
        return globalThis.document.documentElement;
    }
    function bridgeEvents() {
        if (eventsBridged)
            return;
        eventsBridged = true;
        if (Platform.os.name === OS.iOS) {
            bridgeIOSVideoEvents();
            if (typeof globalThis.MutationObserver !== 'undefined') {
                var observer = new MutationObserver(function () {
                    bridgeIOSVideoEvents();
                });
                observer.observe(globalThis.document.documentElement, {
                    childList: true,
                    subtree: true,
                });
            }
        }
    }
    function bridgeIOSVideoEvents() {
        if (typeof globalThis.document === 'undefined')
            return;
        var videos = globalThis.document.querySelectorAll('video');
        videos.forEach(function (video) {
            if (video[FS_BRIDGED_KEY] === true || !(typeof video.webkitEnterFullscreen !== 'undefined' || typeof video.onwebkitbeginfullscreen !== 'undefined'))
                return;
            EventListener.add(video, {
                type: 'webkitbeginfullscreen',
                callback: onChangeSubscriptionManager.emit,
                options: false,
            });
            EventListener.add(video, {
                type: 'webkitendfullscreen',
                callback: onChangeSubscriptionManager.emit,
                options: false,
            });
            video[FS_BRIDGED_KEY] = true;
        });
    }
    function attachOnChange() {
        var events = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'];
        for (var i = 0; i < events.length; i++) {
            EventListener.add(globalThis.document, {
                type: events[i],
                callback: onChangeSubscriptionManager.emit,
                options: false,
            });
        }
    }
    function detachOnChange() {
        var events = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'];
        for (var i = 0; i < events.length; i++) {
            EventListener.remove(globalThis.document, {
                type: events[i],
                callback: onChangeSubscriptionManager.emit,
                options: false,
            });
        }
    }
    function attachOnError() {
        var events = ['fullscreenerror', 'webkitfullscreenerror', 'mozfullscreenerror', 'MSFullscreenError'];
        for (var i = 0; i < events.length; i++) {
            EventListener.add(globalThis.document, {
                type: events[i],
                callback: onErrorSubscriptionManager.emit,
                options: false,
            });
        }
    }
    function detachOnError() {
        var events = ['fullscreenerror', 'webkitfullscreenerror', 'mozfullscreenerror', 'MSFullscreenError'];
        for (var i = 0; i < events.length; i++) {
            EventListener.remove(globalThis.document, {
                type: events[i],
                callback: onErrorSubscriptionManager.emit,
                options: false,
            });
        }
    }
    function getEnabled() {
        if (api === null)
            return (Platform.os.name === OS.iOS && globalThis.HTMLVideoElement.prototype.webkitSupportsFullscreen === true);
        return globalThis.document[api.enabled] === true;
    }
    function getElement() {
        if (api === null) {
            if (lastIOSVideo !== null && lastIOSVideo.webkitDisplayingFullscreen === true)
                return lastIOSVideo;
            return null;
        }
        var currentElement = globalThis.document[api.element];
        if (typeof currentElement !== 'undefined')
            return currentElement;
        return null;
    }
    function getIsFullscreen() {
        return getElement() !== null;
    }
    function drainPendingOperation() {
        var entry = pendingQueue.shift();
        if (typeof entry === 'undefined') {
            activeOperation = null;
            return;
        }
        var next;
        if (entry.operation === 'request')
            next = requestImmediately(entry.target, entry.options);
        else
            next = exitImmediately();
        activeOperation = next
            .then(function () {
            entry.resolve();
            drainPendingOperation();
        })
            .catch(function (error) {
            entry.reject(error);
            drainPendingOperation();
        });
    }
    function request(target, options) {
        lastIntendedOperation = 'request';
        if (activeOperation === null) {
            var next = requestImmediately(target, options);
            activeOperation = next
                .then(drainPendingOperation)
                .catch(drainPendingOperation);
            return next;
        }
        return new Promise(function (resolve, reject) {
            pendingQueue.push({
                operation: 'request',
                target: target,
                options: options,
                resolve: resolve,
                reject: reject,
            });
        });
    }
    function exit() {
        lastIntendedOperation = 'exit';
        if (activeOperation === null) {
            var next = exitImmediately();
            activeOperation = next
                .then(drainPendingOperation)
                .catch(drainPendingOperation);
            return next;
        }
        return new Promise(function (resolve, reject) {
            pendingQueue.push({
                operation: 'exit',
                target: undefined,
                options: undefined,
                resolve: resolve,
                reject: reject,
            });
        });
    }
    function requestImmediately(target, options) {
        return new Promise(function (resolve, reject) {
            if (typeof target === 'undefined')
                target = getDefaultTarget();
            if (typeof target === 'undefined')
                return reject(new NotSupportedError('Failed to enter fullscreen mode.'));
            var tagName = target.tagName.toLowerCase();
            function fallbackToIOSVideo() {
                if (Platform.os.name === OS.iOS && typeof target !== 'undefined' && target.tagName.toUpperCase() === 'VIDEO') {
                    var video = target;
                    if (video.webkitSupportsFullscreen === true && typeof video.webkitEnterFullscreen === 'function') {
                        lastIOSVideo = video;
                        bridgeIOSVideoEvents();
                        video.webkitEnterFullscreen();
                        return resolve();
                    }
                }
                reject(new NotSupportedError('The "' + tagName + '" element does not support fullscreen requests.'));
            }
            if (api !== null) {
                var method = target[api.request];
                if (typeof method === 'function') {
                    var result = method.call(target, options);
                    if (typeof result !== 'undefined' && typeof result.then === 'function') {
                        result
                            .then(resolve)
                            .catch(function () {
                            if (Platform.os.name !== OS.iOS)
                                return reject(new NotSupportedError('The "' + tagName + '" element does not support fullscreen requests.'));
                            fallbackToIOSVideo();
                        });
                        return;
                    }
                    return resolve();
                }
            }
            fallbackToIOSVideo();
        });
    }
    function exitImmediately() {
        return new Promise(function (resolve, reject) {
            if (getElement() === null && lastIOSVideo === null)
                return resolve();
            function fallbackToIOSVideo() {
                if (Platform.os.name === OS.iOS) {
                    var candidates = void 0;
                    if (lastIOSVideo !== null)
                        candidates = [lastIOSVideo];
                    else
                        candidates = globalThis.document.querySelectorAll('video');
                    for (var i = 0; i < candidates.length; i++) {
                        var video = candidates[i];
                        if (typeof video.webkitExitFullscreen === 'function' && video.webkitDisplayingFullscreen === true) {
                            video.webkitExitFullscreen();
                            lastIOSVideo = null;
                            return resolve();
                        }
                    }
                }
                reject(new NotSupportedError('Failed to exit fullscreen mode.'));
            }
            if (api !== null) {
                var method = globalThis.document[api.exit];
                if (typeof method === 'function') {
                    var result = method.call(globalThis.document);
                    if (typeof result !== 'undefined' && typeof result.then === 'function') {
                        result
                            .then(resolve)
                            .catch(function () {
                            if (Platform.os.name !== OS.iOS)
                                return reject(new NotSupportedError('Failed to exit fullscreen mode.'));
                            fallbackToIOSVideo();
                        });
                        return;
                    }
                    return resolve();
                }
            }
            fallbackToIOSVideo();
        });
    }
    function toggle(target, options) {
        if (lastIntendedOperation === 'request')
            return exit();
        return request(target, options);
    }
    bridgeEvents();
    return {
        get supported() {
            return getEnabled();
        },
        get element() {
            return getElement();
        },
        get isFullscreen() {
            return getIsFullscreen();
        },
        request: request,
        exit: exit,
        toggle: toggle,
        onChange: onChangeSubscriptionManager.subscribe,
        onError: onErrorSubscriptionManager.subscribe,
        Constants: {},
        Errors: {
            NotSupportedError: NotSupportedError,
        },
    };
}
var Fullscreen = createFullscreen();

var PermissionType;
(function (PermissionType) {
    PermissionType["Notification"] = "notifications";
    PermissionType["Geolocation"] = "geolocation";
    PermissionType["Camera"] = "camera";
    PermissionType["ClipboardRead"] = "clipboard-read";
    PermissionType["Microphone"] = "microphone";
    PermissionType["MIDI"] = "midi";
})(PermissionType || (PermissionType = {}));
var PermissionState;
(function (PermissionState) {
    PermissionState["Grant"] = "grant";
    PermissionState["Denied"] = "denied";
    PermissionState["Prompt"] = "prompt";
    PermissionState["Unsupported"] = "unsupported";
})(PermissionState || (PermissionState = {}));
var GET_USER_MEDIA = (function () {
    if (typeof globalThis.navigator.mediaDevices !== 'undefined' && typeof globalThis.navigator.mediaDevices.getUserMedia !== 'undefined')
        return globalThis.navigator.mediaDevices.getUserMedia.bind(globalThis.navigator.mediaDevices);
    var legacy = (function () {
        if (typeof globalThis.navigator.getUserMedia !== 'undefined')
            return globalThis.navigator.getUserMedia;
        if (typeof globalThis.navigator.webkitGetUserMedia !== 'undefined')
            return globalThis.navigator.webkitGetUserMedia;
        if (typeof globalThis.navigator.mozGetUserMedia !== 'undefined')
            return globalThis.navigator.mozGetUserMedia;
        if (typeof globalThis.navigator.msGetUserMedia !== 'undefined')
            return globalThis.navigator.msGetUserMedia;
    })();
    if (typeof legacy !== 'undefined') {
        return function legacyUserMedia(constraints) {
            if (constraints === void 0) { constraints = {}; }
            return new Promise(function (resolve, reject) {
                legacy.call(globalThis.navigator, constraints, resolve, reject);
            });
        };
    }
})();

var Permission = {
    request: request$1,
    check: check,
    Constants: {
        PermissionType: PermissionType,
        PermissionState: PermissionState,
    },
    Errors: {},
};
function request$1(type) {
    var instance = this;
    return new Promise(function (resolve) {
        function resolveAfterCheck() {
            instance.check(type).then(resolve);
        }
        instance.check(type)
            .then(function (state) {
            if (state === PermissionState.Grant)
                return resolve(state);
            switch (type) {
                case PermissionType.Notification:
                    if (typeof globalThis.Notification === 'undefined')
                        return resolve(PermissionState.Unsupported);
                    globalThis.Notification.requestPermission().then(function (value) {
                        switch (value) {
                            case 'default':
                                return resolve(PermissionState.Prompt);
                            case 'granted':
                                return resolve(PermissionState.Grant);
                            case 'denied':
                                return resolve(PermissionState.Denied);
                            default:
                                resolveAfterCheck();
                        }
                    });
                    break;
                case PermissionType.Geolocation:
                    if (typeof globalThis.navigator.geolocation === 'undefined')
                        return resolve(PermissionState.Unsupported);
                    globalThis.navigator.geolocation.getCurrentPosition(resolveAfterCheck, resolveAfterCheck);
                    break;
                case PermissionType.Microphone:
                case PermissionType.Camera:
                    if (typeof GET_USER_MEDIA === 'undefined')
                        return resolve(PermissionState.Unsupported);
                    GET_USER_MEDIA({
                        video: type === PermissionType.Camera,
                        audio: type === PermissionType.Microphone,
                    })
                        .then(function (stream) {
                        var tracks = stream.getTracks();
                        for (var i = 0; i < tracks.length; i++)
                            tracks[i].stop();
                        resolveAfterCheck();
                    })
                        .catch(resolveAfterCheck);
                    break;
                case PermissionType.ClipboardRead:
                    if (typeof globalThis.navigator.clipboard === 'undefined' || typeof globalThis.navigator.clipboard.read === 'undefined')
                        return resolve(PermissionState.Unsupported);
                    globalThis.navigator.clipboard.read()
                        .then(resolveAfterCheck)
                        .catch(resolveAfterCheck);
                    break;
                case PermissionType.MIDI:
                    if (typeof globalThis.navigator.requestMIDIAccess === 'undefined')
                        return resolve(PermissionState.Unsupported);
                    globalThis.navigator.requestMIDIAccess()
                        .then(resolveAfterCheck)
                        .catch(resolveAfterCheck);
                    break;
                default:
                    return resolve(PermissionState.Unsupported);
            }
        });
    });
}
function check(type) {
    return new Promise(function (resolve) {
        if (typeof globalThis.navigator.permissions === 'undefined')
            return resolve(PermissionState.Unsupported);
        globalThis.navigator.permissions.query({ name: type })
            .then(function (status) {
            switch (status.state) {
                case 'prompt':
                    return resolve(PermissionState.Prompt);
                case 'granted':
                    return resolve(PermissionState.Grant);
                case 'denied':
                    return resolve(PermissionState.Denied);
                default:
                    return resolve(PermissionState.Unsupported);
            }
        });
    });
}

var PermissionNotGrantedError = createCustomError('PermissionNotGrantedError');

function request(url, options) {
    return new Promise(function (resolve) {
        var method = 'GET';
        var headers = {};
        var body = undefined;
        if (typeof globalThis.fetch !== 'undefined') {
            fetch(url, {
                method: method,
                headers: headers,
                body: body
            })
                .then(function (response) {
                if (!response.ok) {
                    resolve(undefined);
                    return Promise.resolve();
                }
                return response
                    .json()
                    .then(function (data) {
                    resolve(data);
                })
                    .catch(function () {
                    resolve(undefined);
                });
            })
                .catch(function () {
                resolve(undefined);
            });
            return;
        }
        if (typeof XMLHttpRequest !== "undefined") {
            var xhr_1 = new XMLHttpRequest();
            xhr_1.open(method, url, true);
            var headerKeys = keys(headers);
            for (var i = 0; i < headerKeys.length; i++) {
                var headerKey = headerKeys[i];
                xhr_1.setRequestHeader(headerKey, headers[headerKey]);
            }
            xhr_1.onreadystatechange = function () {
                if (xhr_1.readyState !== 4)
                    return;
                if (xhr_1.status >= 200 && xhr_1.status < 300) {
                    try {
                        resolve(JSON.parse(xhr_1.responseText));
                    }
                    catch (_) {
                        resolve(undefined);
                    }
                }
                else {
                    resolve(undefined);
                }
            };
            xhr_1.onerror = function () {
                resolve(undefined);
            };
            xhr_1.send(body);
            return;
        }
        resolve(undefined);
    });
}

function assign() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var to = Object(args[0]);
    for (var i = 1; i < args.length; i++) {
        var src = args[i];
        if (src == null)
            continue;
        for (var key in src) {
            if (!Object.prototype.hasOwnProperty.call(src, key) || key === '__proto__' || key === 'constructor' || key === 'prototype')
                continue;
            to[key] = src[key];
        }
    }
    return to;
}

var onChangeSubscriptionManager$1 = createSubscriptionManager(attachOnChange$1, detachOnChange$1);
var watchIdRef = null;
var Geolocation = {
    get value() {
        return getValue$1();
    },
    get supported() {
        return supported$4();
    },
    onChange: onChangeSubscriptionManager$1.subscribe,
    Constants: {},
    Errors: {
        NotSupportedError: NotSupportedError,
        PermissionNotGrantedError: PermissionNotGrantedError,
    },
};
function getValue$1() {
    return new Promise(function (resolve, reject) {
        function fallback(error) {
            getFallbackValue(error)
                .then(resolve)
                .catch(reject);
        }
        if (!supported$4()) {
            return fallback(new NotSupportedError('\'navigator.geolocation\' does not supported.'));
        }
        else {
            Permission
                .request(PermissionType.Geolocation)
                .then(function (state) {
                if (state === PermissionState.Grant) {
                    globalThis.navigator.geolocation.getCurrentPosition(function (position) {
                        resolve(position.coords);
                    }, function (error) {
                        return fallback(normalizeError(error));
                    });
                }
                else {
                    return fallback(new PermissionNotGrantedError('\'geolocation\' permission is not granted.'));
                }
            });
        }
    });
}
function getFallbackValue(error) {
    return new Promise(function (resolve, reject) {
        request('http://ip-api.com/json?fields=lat,lon')
            .then(function (response) {
            if (typeof response !== 'undefined') {
                var coordinate_1 = {
                    latitude: response.lat,
                    longitude: response.lon,
                    accuracy: -1,
                    altitude: null,
                    altitudeAccuracy: null,
                    heading: null,
                    speed: null
                };
                resolve(assign(coordinate_1, {
                    toJSON: function () {
                        return coordinate_1;
                    }
                }));
            }
            else {
                reject(error);
            }
        })
            .catch(function () {
            reject(error);
        });
    });
}
function normalizeError(error) {
    switch (error.code) {
        case GeolocationPositionError.PERMISSION_DENIED:
            return new PermissionNotGrantedError('\'geolocation\' permission is not granted.');
        case GeolocationPositionError.POSITION_UNAVAILABLE:
            return new NotSupportedError('The acquisition of the geolocation failed because at least one internal source of position returned an internal error.');
        case GeolocationPositionError.TIMEOUT:
            return new NotSupportedError('The time allowed to acquire the geolocation was reached before the information was obtained.');
        default:
            return new NotSupportedError('Unknown error.');
    }
}
function attachOnChange$1() {
    if (!supported$4())
        return;
    Permission
        .request(PermissionType.Geolocation)
        .then(function (state) {
        if (state === PermissionState.Grant) {
            watchIdRef = globalThis.navigator.geolocation.watchPosition(function (position) {
                onGeolocationCoordinatesChange(position.coords);
            });
        }
    });
}
function detachOnChange$1() {
    if (!supported$4() || watchIdRef === null)
        return;
    globalThis.navigator.geolocation.clearWatch(watchIdRef);
}
function onGeolocationCoordinatesChange(coordinates) {
    onChangeSubscriptionManager$1.emit(coordinates);
}
function supported$4() {
    return typeof globalThis.navigator.geolocation !== 'undefined';
}

var _a, _b, _c, _d, _e;
var AppOpenState;
(function (AppOpenState) {
    AppOpenState[AppOpenState["Scheme"] = 0] = "Scheme";
    AppOpenState[AppOpenState["Universal"] = 1] = "Universal";
    AppOpenState[AppOpenState["Intent"] = 2] = "Intent";
    AppOpenState[AppOpenState["Fallback"] = 3] = "Fallback";
    AppOpenState[AppOpenState["Store"] = 4] = "Store";
})(AppOpenState || (AppOpenState = {}));
var SettingType;
(function (SettingType) {
    SettingType["General"] = "general";
    SettingType["Network"] = "network";
    SettingType["Display"] = "display";
    SettingType["Appearance"] = "appearance";
    SettingType["Accessibility"] = "accessibility";
    SettingType["Battery"] = "battery";
    SettingType["Datetime"] = "datetime";
    SettingType["Language"] = "language";
    SettingType["Accounts"] = "accounts";
    SettingType["Storage"] = "storage";
})(SettingType || (SettingType = {}));
var CameraType;
(function (CameraType) {
    CameraType["Image"] = "image";
    CameraType["Video"] = "video";
})(CameraType || (CameraType = {}));
var CaptureType;
(function (CaptureType) {
    CaptureType["User"] = "user";
    CaptureType["Environment"] = "environment";
})(CaptureType || (CaptureType = {}));
var ExplorerStartIn;
(function (ExplorerStartIn) {
    ExplorerStartIn["Desktop"] = "desktop";
    ExplorerStartIn["Documents"] = "documents";
    ExplorerStartIn["Downloads"] = "downloads";
    ExplorerStartIn["Music"] = "music";
    ExplorerStartIn["Pictures"] = "pictures";
    ExplorerStartIn["Videos"] = "videos";
})(ExplorerStartIn || (ExplorerStartIn = {}));
var DirectoryExploreMode;
(function (DirectoryExploreMode) {
    DirectoryExploreMode["Read"] = "read";
    DirectoryExploreMode["ReadWrite"] = "readwrite";
})(DirectoryExploreMode || (DirectoryExploreMode = {}));
var SETTING_URL = (_a = {},
    _a[OS.Android] = (_b = {},
        _b[SettingType.General] = 'intent:#Intent;action=android.settings.SETTINGS;end',
        _b[SettingType.Network] = 'intent:#Intent;action=android.settings.WIFI_SETTINGS;end',
        _b[SettingType.Display] = 'intent:#Intent;action=android.settings.DISPLAY_SETTINGS;end',
        _b[SettingType.Appearance] = 'intent:#Intent;action=android.settings.DISPLAY_SETTINGS;end',
        _b[SettingType.Accessibility] = 'intent:#Intent;action=android.settings.ACCESSIBILITY_SETTINGS;end',
        _b[SettingType.Battery] = 'intent:#Intent;action=android.settings.BATTERY_SAVER_SETTINGS;end',
        _b[SettingType.Datetime] = 'intent:#Intent;action=android.settings.DATE_SETTINGS;end',
        _b[SettingType.Language] = 'intent:#Intent;action=android.settings.LOCALE_SETTINGS;end',
        _b[SettingType.Accounts] = 'intent:#Intent;action=android.settings.SYNC_SETTINGS;end',
        _b[SettingType.Storage] = 'intent:#Intent;action=android.settings.INTERNAL_STORAGE_SETTINGS;end',
        _b),
    _a[OS.Windows] = (_c = {},
        _c[SettingType.General] = 'ms-settings:system',
        _c[SettingType.Network] = 'ms-settings:network',
        _c[SettingType.Display] = 'ms-settings:display',
        _c[SettingType.Appearance] = 'ms-settings:colors',
        _c[SettingType.Accessibility] = 'ms-settings:easeofaccess',
        _c[SettingType.Battery] = 'ms-settings:batterysaver',
        _c[SettingType.Datetime] = 'ms-settings:dateandtime',
        _c[SettingType.Language] = 'ms-settings:regionlanguage',
        _c[SettingType.Accounts] = 'ms-settings:emailandaccounts',
        _c[SettingType.Storage] = 'ms-settings:storagesense',
        _c),
    _a[OS.MacOS] = (_d = {},
        _d[SettingType.General] = 'x-apple.systempreferences:',
        _d[SettingType.Network] = 'x-apple.systempreferences:com.apple.preference.network',
        _d[SettingType.Display] = 'x-apple.systempreferences:com.apple.preference.displays',
        _d[SettingType.Appearance] = 'x-apple.systempreferences:com.apple.preference.general',
        _d[SettingType.Accessibility] = 'x-apple.systempreferences:com.apple.preference.universalaccess',
        _d[SettingType.Battery] = 'x-apple.systempreferences:com.apple.preference.energysaver',
        _d[SettingType.Datetime] = 'x-apple.systempreferences:com.apple.preference.datetime',
        _d[SettingType.Language] = 'x-apple.systempreferences:com.apple.Localization',
        _d[SettingType.Accounts] = 'x-apple.systempreferences:com.apple.preferences.internetaccounts',
        _d[SettingType.Storage] = 'x-apple.systempreferences:',
        _d),
    _a['MacOS13+'] = (_e = {},
        _e[SettingType.General] = 'x-apple.systempreferences:com.apple.General-Settings.extension',
        _e[SettingType.Network] = 'x-apple.systempreferences:com.apple.Network-Settings.extension',
        _e[SettingType.Display] = 'x-apple.systempreferences:com.apple.Displays-Settings.extension',
        _e[SettingType.Appearance] = 'x-apple.systempreferences:com.apple.Appearance-Settings.extension',
        _e[SettingType.Accessibility] = 'x-apple.systempreferences:com.apple.Accessibility-Settings.extension',
        _e[SettingType.Battery] = 'x-apple.systempreferences:com.apple.Battery-Settings.extension',
        _e[SettingType.Datetime] = 'x-apple.systempreferences:com.apple.Date-Time-Settings.extension',
        _e[SettingType.Language] = 'x-apple.systempreferences:com.apple.Localization-Settings.extension',
        _e[SettingType.Accounts] = 'x-apple.systempreferences:com.apple.Internet-Accounts-Settings.extension',
        _e[SettingType.Storage] = 'x-apple.systempreferences:com.apple.settings.Storage',
        _e),
    _a);

function getTopmostWindow() {
    try {
        if (globalThis.top !== null && globalThis.top !== globalThis.window) {
            void globalThis.top.location.href;
            return globalThis.top;
        }
    }
    catch (_) {
    }
    return window;
}

function dispatchClickEvent(element, view) {
    if (view === void 0) { view = window; }
    var fake;
    try {
        fake = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: view
        });
    }
    catch (_) {
        fake = globalThis.document.createEvent('MouseEvents');
        fake.initMouseEvent('click', true, true, view, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    }
    element.dispatchEvent(fake);
}

function now() {
    if (typeof Date.now === 'function')
        return Date.now();
    return (new Date).getTime();
}

function randomString(length) {
    var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var result = '';
    var seed = new Date().getTime();
    for (var i = 0; i < length; i++) {
        seed = (seed * 9301 + 49297) % 233280;
        result += chars.charAt(seed % 62);
    }
    return result;
}

function padStart(string, length, pad) {
    length = length >> 0;
    if (typeof string !== 'string')
        string = String(string);
    if (string.length >= length)
        return string;
    length = length - string.length;
    if (length > pad.length)
        pad += pad.repeat(length / pad.length);
    return pad.slice(0, length) + string;
}

var URLOpenError = createCustomError('URLOpenError');

var UserCancelledError = createCustomError('UserCancelledError');

var Open = {
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
        get intent() {
            return canOpenIntentURL();
        },
        get universal() {
            return canOpenUniversalURL();
        },
        get setting() {
            return canOpenSetting();
        },
        get directory() {
            return canOpenDirectory();
        },
        get camera() {
            return canOpenCamera();
        },
        get contact() {
            return canOpenContact();
        },
        get share() {
            return canOpenShare();
        },
        get calendar() {
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
var resolveFileCleanup = undefined;
function resolveFocusEventConfig() {
    var top = getTopmostWindow();
    var topDocument = top.document;
    var eventType = {};
    var eventTarget = {};
    var isCordova = typeof globalThis.cordova !== 'undefined';
    var isIOS = Platform.os.name === OS.iOS;
    var isIOSOver8 = isIOS && compareVersion(Platform.os.version, '8.0') >= 0;
    var isIOSUnder8 = isIOS && !isIOSOver8;
    var isStandard = EventListener.useStd;
    if (isCordova) {
        eventType.focus = 'resume';
        eventType.blur = 'pause';
        eventTarget.focus = topDocument;
        eventTarget.blur = topDocument;
    }
    else if (isIOSOver8) {
        eventType.visibilitychange = 'visibilitychange';
        eventTarget.visibilitychange = topDocument;
    }
    else if (isIOSUnder8) {
        eventType.focus = 'pageshow';
        eventType.blur = 'pagehide';
        eventTarget.focus = top;
        eventTarget.blur = top;
    }
    else if (isStandard) {
        eventType.focus = 'focus';
        eventType.blur = 'blur';
        eventType.visibilitychange = 'visibilitychange';
        eventTarget.focus = top;
        eventTarget.blur = top;
        eventTarget.visibilitychange = topDocument;
    }
    else {
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
function getTrackId(bundle) {
    try {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://itunes.apple.com/lookup?bundleId=' + bundle, false);
        xhr.send();
        if (xhr.status === 200) {
            try {
                return parseLookupBundleIdResponse(JSON.parse(xhr.response));
            }
            catch (_) {
                return undefined;
            }
        }
        return undefined;
    }
    catch (_) {
        return undefined;
    }
}
function parseLookupBundleIdResponse(response) {
    if (typeof response.results === 'undefined')
        return undefined;
    var results = response.results;
    if (results.length === 0)
        return undefined;
    var result = results[0];
    if (typeof result === 'undefined')
        return undefined;
    return '' + result.trackId;
}
function parseIntentURL(intent) {
    var parsed = {};
    var split = intent.split('#Intent;');
    var host = split[0].substring(9);
    var suffix = split[1];
    var parameterString = suffix.substring(0, suffix.length - 4);
    var parameters = parameterString.split(';');
    var extras = {};
    for (var i = 0; i < parameters.length; i++) {
        var part = parameters[i];
        var index = part.indexOf('=');
        if (index !== -1)
            extras[part.substring(0, index)] = part.substring(index + 1);
    }
    if (typeof extras['scheme'] !== 'undefined')
        parsed.scheme = (extras['scheme'] + '://' + host);
    if (typeof extras['package'] !== 'undefined')
        parsed.packageName = extras['package'];
    if (typeof extras['S.browser_fallback_url'] !== 'undefined')
        parsed.fallback = extras['S.browser_fallback_url'];
    return parsed;
}
function createIntentURL(scheme, packageName, fallback) {
    var split = scheme.split('://');
    var prefix = split[0];
    var suffix = split[1];
    var intent = 'intent://';
    if (typeof suffix !== 'undefined')
        intent += suffix;
    intent += '#Intent;'
        + 'scheme=' + prefix + ';'
        + 'action=android.intent.action.VIEW;'
        + 'category=android.intent.category.BROWSABLE;';
    if (typeof packageName !== 'undefined')
        intent += 'package=' + packageName + ';';
    if (typeof fallback !== 'undefined' && typeof fallback === 'string')
        intent += 'S.browser_fallback_url=' + globalThis.encodeURIComponent(fallback) + ';';
    else if (typeof packageName !== 'undefined')
        intent += 'S.browser_fallback_url=' + globalThis.encodeURIComponent(createAppStoreURL(packageName, OS.Android)) + ';';
    return intent + 'end';
}
function createAppStoreURL(packageName, os) {
    if (typeof packageName === 'undefined')
        return undefined;
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
function createWebStoreURL(packageName, os) {
    if (typeof packageName === 'undefined')
        return undefined;
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
function getDefaultTimeoutByOS(os) {
    switch (os) {
        case OS.iOS:
            return 2000;
        case OS.Android:
            return 1000;
        default:
            return 750;
    }
}
function canOpenIntentURL() {
    if (Platform.os.name !== OS.Android)
        return false;
    var version = Platform.browser.version;
    if (Platform.browser.name === Browsers.SamsungInternet && compareVersion(version, '17.0.1.69') >= 0 && compareVersion(version, '17.0.7.34') < 0)
        return false;
    if (Platform.browser.name === Browsers.Firefox && compareVersion(version, '41.0') < 0)
        return false;
    if (Platform.browser.name === Browsers.Firefox && compareVersion(version, '59.0') >= 0 && compareVersion(version, '68.11.0') < 0)
        return false;
    if (Platform.browser.name === Browsers.Firefox && compareVersion(version, '80.0') >= 0 && compareVersion(version, '82.0') < 0)
        return false;
    if (Platform.browser.name === Browsers.Firefox && compareVersion(version, '96.0') >= 0 && compareVersion(version, '107.0') < 0)
        return false;
    if (Platform.browser.name === Browsers.Opera && compareVersion(version, '14.0') < 0)
        return false;
    return !(/(?:fban\/fbios|fb_iab\/fb4a)(?!.+fbav)|;fbav\/[\w.]+;/i.test(Platform.userAgent) || /instagram[\/ ][-\w.]+/i.test(Platform.userAgent) || /micromessenger\/([\w.]+)/i.test(Platform.userAgent) || /musical_ly(?:.+app_?version\/|_)[\w.]+/i.test(Platform.userAgent) || /ultralite app_version\/[\w.]+/i.test(Platform.userAgent));
}
function canOpenUniversalURL() {
    return Platform.os.name === OS.iOS && compareVersion(Platform.os.version, '9.0') >= 0;
}
function canOpenSetting() {
    var os = Platform.os.name;
    var version = Platform.os.version;
    if (os === OS.Unknown)
        return false;
    if (os === OS.Android && !canOpenIntentURL())
        return false;
    if (os === OS.iOS)
        return false;
    if (os === OS.Windows && (version === 'Vista' || version === 'XP' || version === '2000' || version === 'NT 4.0' || version === 'NT 3.11' || version === 'ME' || compareVersion(version, '10') < 0))
        return false;
    return !(os === OS.MacOS && compareVersion(version, '10.10') < 0);
}
function canOpenDirectory() {
    return typeof globalThis.showDirectoryPicker !== 'undefined' || typeof createHiddenElement('input').webkitdirectory !== 'undefined';
}
function canOpenCamera() {
    var os = Platform.os.name;
    var version = Platform.os.version;
    return !Platform.isWebview && ((os === OS.iOS && compareVersion(version, '10.3.1') === 0) || (os === OS.Android && compareVersion(version, '3.0') >= 0));
}
function canOpenContact() {
    return typeof globalThis.navigator.contacts !== 'undefined';
}
function canOpenShare() {
    return typeof globalThis.navigator.share !== 'undefined';
}
function canOpenCalendar() {
    return Platform.os.name === OS.iOS && compareVersion(Platform.os.version, '15.0') >= 0 && Platform.browser.name === Browsers.Safari && !Platform.isWebview;
}
function pushURL(urls, url, state, condition) {
    if (condition === void 0) { condition = false; }
    if ((typeof url === 'function' || typeof url === 'string') && condition)
        urls.push([state, url]);
}
function joining(values, mapfn, separator) {
    if (mapfn === void 0) { mapfn = undefined; }
    if (separator === void 0) { separator = ','; }
    var length = values.length;
    var result = '';
    for (var i = 0; i < length; i++) {
        if (i !== 0)
            result += separator;
        if (typeof mapfn !== 'undefined')
            result += mapfn(values[i]);
        else
            result += values[i];
    }
    return result;
}
function escapeURIComponentString(value) {
    return globalThis.encodeURIComponent(value)
        .replace(/[!'()*]/g, function (char) {
        return '%' + char.charCodeAt(0).toString(16);
    });
}
function escapeURIComponentMailAddressString(value) {
    return escapeURIComponentString(value)
        .replace(/%22/g, '"')
        .replace(/%40/g, '@')
        .replace(/%2C/gi, ',');
}
function escapeICSString(value) {
    return value
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\r\n|\n|\r/g, '\\n');
}
function utf8ByteLength(value) {
    if (typeof globalThis.TextEncoder !== 'undefined')
        return new TextEncoder().encode(value).length;
    return globalThis.unescape(globalThis.encodeURIComponent(value)).length;
}
function foldICSString(value) {
    if (utf8ByteLength(value) <= 75)
        return value;
    var out = '';
    var current = '';
    var currentBytes = 0;
    for (var i = 0; i < value.length; i++) {
        var char = value[i];
        var charBytes = utf8ByteLength(value[i]);
        if (current !== '' && currentBytes + charBytes > 75) {
            out += current + '\r\n ';
            current = char;
            currentBytes = charBytes;
        }
        else {
            current += char;
            currentBytes += charBytes;
        }
    }
    out += current;
    return out;
}
function urlToString(value) {
    if (value instanceof URL)
        return value.toString();
    return value;
}
function dateToICSDateString(date, allDay) {
    if (allDay === void 0) { allDay = false; }
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
function getURLOpenError(tried) {
    var triedURLString = '';
    for (var i = 0; i < tried.length; i++)
        triedURLString += '\n' + (i + 1) + ': ' + tried[i];
    if (triedURLString.length > 0)
        triedURLString = '\n' + triedURLString + '\n';
    return new URLOpenError('Failed to open any of the provided URLs: ' + triedURLString);
}
function openURLViaHref(url, index) {
    var top = getTopmostWindow();
    var topDocument = top.document;
    var anchor = undefined;
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
    }
    catch (_) {
    }
    finally {
        if (typeof anchor !== 'undefined') {
            try {
                topDocument.body.removeChild(anchor);
            }
            catch (_) {
            }
        }
    }
}
function openURLViaIframe(url) {
    var top = getTopmostWindow();
    var topDocument = top.document;
    var iframe = undefined;
    try {
        iframe = createHiddenElement('iframe');
        if (typeof iframe === 'undefined')
            return;
        iframe.src = url;
        topDocument.body.appendChild(iframe);
        globalThis.setTimeout(function () {
            if (typeof iframe !== 'undefined') {
                try {
                    topDocument.body.removeChild(iframe);
                }
                catch (_) {
                }
            }
        }, 500);
    }
    catch (_) {
    }
    return iframe;
}
function isDocumentHidden() {
    var top = getTopmostWindow();
    var topDocument = top.document;
    if (topDocument.visibilityState === 'hidden')
        return true;
    if (topDocument.webkitVisibilityState === 'hidden')
        return true;
    if (topDocument.mozVisibilityState === 'hidden')
        return true;
    if (topDocument.msVisibilityState === 'hidden')
        return true;
    if (typeof topDocument.hidden !== 'undefined')
        return topDocument.hidden;
    if (typeof topDocument.webkitHidden !== 'undefined')
        return topDocument.webkitHidden;
    if (typeof topDocument.mozHidden !== 'undefined')
        return topDocument.mozHidden;
    if (typeof topDocument.msHidden !== 'undefined')
        return topDocument.msHidden;
    if (typeof topDocument.hasFocus === 'function')
        return !topDocument.hasFocus();
    return true;
}
function hasFocus(document) {
    if (typeof document.hasFocus === 'function')
        return document.hasFocus();
    return false;
}
function focus(target) {
    try {
        target.focus({ preventScroll: true });
    }
    catch (_) {
        try {
            target.focus();
        }
        catch (_) {
        }
    }
}
function restoreFocus() {
    var top = getTopmostWindow();
    var topDocument = top.document;
    focus(top);
    if (hasFocus(topDocument))
        return true;
    if (topDocument.body.tabIndex < 0)
        topDocument.body.tabIndex = -1;
    focus(topDocument.body);
    if (hasFocus(topDocument))
        return true;
    var input = undefined;
    try {
        input = createHiddenElement('input');
        if (typeof input === 'undefined')
            return false;
        input.type = 'text';
        input.readOnly = true;
        topDocument.body.appendChild(input);
        focus(input);
        try {
            input.select();
        }
        catch (_) {
        }
        if (hasFocus(topDocument))
            return true;
    }
    catch (_) {
    }
    finally {
        if (typeof input !== 'undefined' && input !== null) {
            try {
                input.blur();
            }
            catch (_) {
            }
            try {
                topDocument.body.removeChild(input);
            }
            catch (_) {
            }
        }
    }
    return hasFocus(topDocument);
}
function resolveFile(from) {
    if (Object.prototype.toString.call(from) === '[object Promise]') {
        var handle_1 = from;
        return new Promise(function (resolve, reject) {
            handle_1
                .then(function (handles) {
                var getFiles = [];
                for (var i = 0; i < handles.length; i++)
                    getFiles[i] = handles[i].getFile();
                Promise.all(getFiles)
                    .then(resolve)
                    .catch(reject);
            })
                .catch(function (error) {
                if (error.name === 'AbortError')
                    return reject(new UserCancelledError('User cancelled the operation.'));
                return reject(new NotSupportedError(error.message));
            });
        });
    }
    else {
        var input_1 = from;
        var config_1 = resolveFocusEventConfig();
        var top_1 = getTopmostWindow();
        var topDocument_1 = top_1.document;
        return new Promise(function (resolve, reject) {
            var resolved = false;
            function cleanup() {
                resolveFileCleanup = undefined;
                try {
                    EventListener.remove(config_1.target.focus, { type: config_1.type.focus, callback: onFocus });
                    EventListener.remove(config_1.target.visibilitychange, { type: config_1.type.visibilitychange, callback: onVisibilityChange });
                    EventListener.remove(topDocument_1, { type: 'click', callback: onClick });
                }
                catch (_) {
                }
            }
            function done(success) {
                if (resolved)
                    return;
                resolved = true;
                var fileList = input_1.files;
                var files = [];
                if (fileList === null)
                    return resolve(files);
                for (var i = 0; i < fileList.length; i++)
                    files.push(fileList[i]);
                cleanup();
                if (success)
                    resolve(files);
                else
                    reject(new UserCancelledError('User cancelled the operation.'));
            }
            function onFocus() {
                globalThis.setTimeout(function () {
                    if (input_1.value.length > 0)
                        done(true);
                    else
                        done(false);
                }, 1000);
            }
            function onVisibilityChange() {
                if (!isDocumentHidden())
                    onFocus();
            }
            function onClick() {
                done(false);
            }
            input_1.onchange = function () {
                done(true);
            };
            if (typeof resolveFileCleanup !== 'undefined')
                resolveFileCleanup();
            if (typeof input_1.oncancel !== 'undefined') {
                input_1.oncancel = function () {
                    done(false);
                };
            }
            else {
                input_1.onclick = function () {
                    EventListener.add(config_1.target.visibilitychange, { type: config_1.type.visibilitychange, callback: onVisibilityChange });
                    EventListener.add(config_1.target.focus, { type: config_1.type.focus, callback: onFocus });
                    globalThis.setTimeout(function () {
                        EventListener.add(topDocument_1, { type: 'click', callback: onClick });
                    }, 100);
                    resolveFileCleanup = function () {
                        done(false);
                    };
                };
            }
            dispatchClickEvent(input_1);
        });
    }
}
function resolveFileWithPath(from) {
    if (Object.prototype.toString.call(from) === '[object Promise]') {
        var handle_2 = from;
        return new Promise(function (resolve, reject) {
            handle_2
                .then(function (handle) {
                var tasks = [];
                var fileWithPaths = [];
                function walkDirectory(directory, basePath) {
                    if (basePath === void 0) { basePath = ''; }
                    return new Promise(function (resolve, reject) {
                        var iterator = directory.entries();
                        function pump() {
                            iterator
                                .next()
                                .then(function (result) {
                                if (result.done)
                                    return resolve();
                                var name = result.value[0];
                                var handle = result.value[1];
                                var path;
                                if (basePath === '')
                                    path = name;
                                else
                                    path = basePath + '/' + name;
                                if (handle.kind === 'file') {
                                    tasks.push(handle
                                        .getFile()
                                        .then(function (file) {
                                        fileWithPaths.push({
                                            file: file,
                                            relativePath: path,
                                        });
                                    }));
                                }
                                else {
                                    tasks.push(walkDirectory(handle, path));
                                }
                                pump();
                            })
                                .catch(reject);
                        }
                        pump();
                    });
                }
                walkDirectory(handle, handle.name)
                    .then(function () {
                    Promise.all(tasks)
                        .then(function () {
                        resolve(fileWithPaths);
                    })
                        .catch(reject);
                })
                    .catch(reject);
            })
                .catch(function (error) {
                if (error.name === 'AbortError')
                    return reject(new UserCancelledError('User cancelled the operation.'));
                return reject(new NotSupportedError(error.message));
            });
        });
    }
    else {
        var input_2 = from;
        return new Promise(function (resolve, reject) {
            resolveFile(input_2)
                .then(function (files) {
                var fileWithPaths = [];
                for (var i = 0; i < files.length; i++) {
                    var file_1 = files[i];
                    fileWithPaths.push({
                        file: file_1,
                        relativePath: file_1.webkitRelativePath,
                    });
                }
                resolve(fileWithPaths);
            })
                .catch(reject);
        });
    }
}
function tryOpenURL(url, index, timeout) {
    var config = resolveFocusEventConfig();
    var top = getTopmostWindow();
    var topDocument = top.document;
    var a = undefined;
    var iframe = undefined;
    return new Promise(function (resolve, reject) {
        var timeoutId;
        var resolved = false;
        function cleanup() {
            if (typeof timeoutId !== 'undefined') {
                clearTimeout(timeoutId);
                timeoutId = undefined;
            }
            try {
                EventListener.remove(config.target.blur, { type: config.type.blur, callback: onBlur });
                EventListener.remove(config.target.focus, { type: config.type.focus, callback: onFocus });
                EventListener.remove(config.target.visibilitychange, { type: config.type.visibilitychange, callback: onVisibilityChange });
            }
            catch (_) {
            }
            if (typeof a !== 'undefined') {
                try {
                    topDocument.body.removeChild(a);
                }
                catch (_) {
                }
            }
            if (typeof iframe !== 'undefined') {
                try {
                    topDocument.body.removeChild(iframe);
                }
                catch (_) {
                }
            }
        }
        function done(success) {
            if (resolved)
                return;
            resolved = true;
            cleanup();
            if (success)
                resolve();
            else
                reject();
        }
        function onBlur() {
            if (typeof timeoutId !== 'undefined') {
                clearTimeout(timeoutId);
                timeoutId = undefined;
            }
            EventListener.remove(config.target.blur, { type: config.type.blur, callback: onBlur });
            EventListener.add(config.target.focus, { type: config.type.focus, callback: onFocus });
        }
        function onFocus() {
            done(true);
        }
        function onVisibilityChange() {
            if (isDocumentHidden())
                onBlur();
            else
                onFocus();
        }
        timeoutId = globalThis.setTimeout(function () {
            done(false);
        }, timeout);
        EventListener.add(config.target.blur, { type: config.type.blur, callback: onBlur });
        EventListener.add(config.target.visibilitychange, { type: config.type.visibilitychange, callback: onVisibilityChange });
        if (!hasFocus(topDocument))
            restoreFocus();
        try {
            if (typeof globalThis.cordova !== 'undefined') {
                globalThis.open(url, '_system');
            }
            else {
                a = openURLViaHref(url, index);
                iframe = openURLViaIframe(url);
            }
        }
        catch (_) {
            done(false);
        }
    });
}
function getAndroidAppInfo(options) {
    if (typeof options[OS.Android] !== 'undefined')
        return options[OS.Android];
    return options.android;
}
function getIOSAppInfo(options) {
    if (typeof options[OS.iOS] !== 'undefined')
        return options[OS.iOS];
    return options.ios;
}
function getWindowsAppInfo(options) {
    if (typeof options[OS.Windows] !== 'undefined')
        return options[OS.Windows];
    return options.windows;
}
function getMacOSAppInfo(options) {
    if (typeof options[OS.MacOS] !== 'undefined')
        return options[OS.MacOS];
    return options.macos;
}
function app(options) {
    var os = Platform.os.name;
    var urls = [];
    var tried = [];
    var infos = {};
    var timeout;
    if (os === OS.Android) {
        var option = getAndroidAppInfo(options);
        if (typeof option === 'undefined')
            return Promise.reject(getURLOpenError(tried));
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
            var parsed = parseIntentURL(infos.intent);
            if (typeof parsed.scheme !== 'undefined' && typeof infos.scheme === 'undefined')
                infos.scheme = parsed.scheme;
            if (typeof parsed.packageName !== 'undefined' && typeof infos.packageName === 'undefined')
                infos.packageName = parsed.packageName;
            if (typeof parsed.fallback !== 'undefined' && typeof infos.fallback === 'undefined')
                infos.fallback = parsed.fallback;
        }
        if (typeof infos.scheme !== 'undefined' && typeof infos.intent === 'undefined')
            infos.intent = createIntentURL(infos.scheme, infos.packageName, infos.fallback);
    }
    else if (os === OS.iOS) {
        var option = getIOSAppInfo(options);
        if (typeof option === 'undefined')
            return Promise.reject(getURLOpenError(tried));
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
        if (typeof infos.bundleId !== 'undefined' && typeof infos.trackId === 'undefined')
            infos.trackId = getTrackId(infos.bundleId);
    }
    else if (os === OS.Windows) {
        var option = getWindowsAppInfo(options);
        if (typeof option === 'undefined')
            return Promise.reject(getURLOpenError(tried));
        timeout = option.timeout;
        infos.scheme = urlToString(option.scheme);
        infos.productId = option.productId;
        infos.fallback = urlToString(option.fallback);
        infos.appStore = createAppStoreURL(infos.productId, OS.Windows);
        infos.webStore = createWebStoreURL(infos.productId, OS.Windows);
        infos.allowAppStore = option.allowAppStore;
        infos.allowWebStore = option.allowWebStore;
    }
    else if (os === OS.MacOS) {
        var option = getMacOSAppInfo(options);
        if (typeof option === 'undefined')
            return Promise.reject(getURLOpenError(tried));
        timeout = option.timeout;
        infos.scheme = urlToString(option.scheme);
        infos.bundleId = option.bundleId;
        infos.trackId = option.trackId;
        infos.fallback = urlToString(option.fallback);
        infos.appStore = createAppStoreURL(infos.trackId, OS.MacOS);
        infos.webStore = createWebStoreURL(infos.trackId, OS.MacOS);
        infos.allowAppStore = option.allowAppStore;
        infos.allowWebStore = option.allowWebStore;
        if (typeof infos.bundleId !== 'undefined' && typeof infos.trackId === 'undefined')
            infos.trackId = getTrackId(infos.bundleId);
    }
    pushURL(urls, infos.intent, AppOpenState.Intent, canOpenIntentURL());
    pushURL(urls, infos.universal, AppOpenState.Universal, canOpenUniversalURL());
    pushURL(urls, infos.scheme, AppOpenState.Scheme, true);
    pushURL(urls, infos.fallback, AppOpenState.Fallback, true);
    pushURL(urls, infos.appStore, AppOpenState.Store, infos.allowAppStore);
    pushURL(urls, infos.webStore, AppOpenState.Store, infos.allowWebStore);
    if (typeof timeout === 'undefined')
        timeout = getDefaultTimeoutByOS(os);
    return new Promise(function (resolve, reject) {
        function openURLSequential(index) {
            if (index === void 0) { index = 0; }
            if (index >= urls.length)
                return reject(getURLOpenError(tried));
            var entry = urls[index];
            var state = entry[0];
            var url = entry[1];
            if (typeof url === 'string') {
                tried[index] = url;
                return tryOpenURL(url, index, timeout)
                    .then(function () {
                    resolve(state);
                })
                    .catch(function () {
                    openURLSequential(index + 1);
                });
            }
            else {
                tried[index] = '[function fallback]';
                url();
                resolve(state);
            }
        }
        return openURLSequential();
    });
}
function openMessenger(options, type) {
    if (typeof options.to === 'string')
        options.to = escapeURIComponentMailAddressString(options.to);
    if (typeof options.cc === 'string')
        options.cc = escapeURIComponentMailAddressString(options.cc);
    if (typeof options.bcc === 'string')
        options.bcc = escapeURIComponentMailAddressString(options.bcc);
    if (typeof options.subject === 'string')
        options.subject = escapeURIComponentString(options.subject);
    if (typeof options.body === 'string')
        options.body = escapeURIComponentString(options.body);
    if (typeof options.to === 'object')
        options.to = joining(options.to, escapeURIComponentMailAddressString);
    if (typeof options.cc === 'object')
        options.cc = joining(options.cc, escapeURIComponentMailAddressString);
    if (typeof options.bcc === 'object')
        options.bcc = joining(options.bcc, escapeURIComponentMailAddressString);
    var params = [];
    var url = type + ':';
    if (typeof options.to === 'string')
        url += options.to;
    if (typeof options.cc === 'string')
        params.push('cc=' + options.cc);
    if (typeof options.bcc === 'string')
        params.push('bcc=' + options.bcc);
    if (typeof options.subject === 'string')
        params.push('subject=' + options.subject);
    if (typeof options.body === 'string')
        params.push('body=' + options.body);
    return tryOpenURL(url + '?' + joining(params, undefined, '&'), 0, getDefaultTimeoutByOS(Platform.os.name));
}
function telephone(options) {
    return openMessenger(options, 'tel');
}
function message(options) {
    return openMessenger(options, 'sms');
}
function mail(options) {
    return openMessenger(options, 'mailto');
}
function setting(type) {
    var os = Platform.os.name;
    var version = Platform.os.version;
    if (!canOpenSetting())
        return Promise.reject(getURLOpenError([]));
    var urls = [];
    switch (os) {
        case OS.Android:
            if (type !== SettingType.General) {
                if (type === SettingType.Accessibility && compareVersion(version, '1.6') >= 0)
                    urls.push(SETTING_URL['Android'][SettingType.Accessibility]);
                else if (type === SettingType.Battery && compareVersion(version, '5.1') >= 0)
                    urls.push(SETTING_URL['Android'][SettingType.Battery]);
                else if (type === SettingType.Accounts && compareVersion(version, '1.5') >= 0)
                    urls.push(SETTING_URL['Android'][SettingType.Accounts]);
                else if (type === SettingType.Storage && compareVersion(version, '3.0') >= 0)
                    urls.push(SETTING_URL['Android'][SettingType.Storage]);
                else
                    urls.push(SETTING_URL['Android'][type]);
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
            if (compareVersion(version, '13.0') < 0)
                urls.push(SETTING_URL['MacOS'][type]);
            else
                urls.push(SETTING_URL['MacOS13+'][type]);
            break;
    }
    return new Promise(function (resolve, reject) {
        function openURLSequential(index) {
            if (index === void 0) { index = 0; }
            if (index >= urls.length)
                return reject(getURLOpenError([]));
            var url = urls[index];
            return tryOpenURL(url, index, 750)
                .then(function () {
                resolve();
            })
                .catch(function () {
                openURLSequential(index + 1);
            });
        }
        return openURLSequential();
    });
}
function file(options) {
    if (typeof globalThis.showOpenFilePicker !== 'undefined') {
        var openFilePickerOption = {};
        if (typeof options !== 'undefined') {
            if (typeof options.multiple !== 'undefined')
                openFilePickerOption.multiple = options.multiple;
            if (typeof options.id !== 'undefined')
                openFilePickerOption.id = options.id;
            if (typeof options.startIn !== 'undefined')
                openFilePickerOption.startIn = options.startIn;
            if (typeof options.accept !== 'undefined') {
                var accepts = {};
                openFilePickerOption.excludeAcceptAllOption = true;
                openFilePickerOption.types = [{
                        description: '',
                        accept: accepts,
                    }];
                for (var i = 0; i < options.accept.length; i++) {
                    var accept = options.accept[i];
                    if (/^\.\w+/i.test(accept)) {
                        if (typeof accepts['application/octet-stream'] === 'undefined')
                            accepts['application/octet-stream'] = [];
                        accepts['application/octet-stream'].push(accept);
                    }
                    else if (/^\w+\/\w+$/i.test(accept)) {
                        accepts[accept] = [];
                    }
                }
            }
        }
        return resolveFile(globalThis.showOpenFilePicker(openFilePickerOption));
    }
    var input = createHiddenElement('input');
    input.type = 'file';
    if (typeof options !== 'undefined') {
        if (typeof options.multiple !== 'undefined')
            input.multiple = options.multiple;
        if (typeof options.accept !== 'undefined')
            input.accept = joining(options.accept);
    }
    return resolveFile(input);
}
function directory(options) {
    if (!canOpenDirectory())
        return Promise.reject(new NotSupportedError('\'window.showDirectoryPicker\' and \'HTMLInputElement.prototype.webkitdirectory\' does not supported.'));
    if (typeof globalThis.showDirectoryPicker !== 'undefined') {
        var openDirectoryPickerOption = {};
        if (typeof options !== 'undefined') {
            if (typeof options.id !== 'undefined')
                openDirectoryPickerOption.id = options.id;
            if (typeof options.startIn !== 'undefined')
                openDirectoryPickerOption.startIn = options.startIn;
            if (typeof options.mode !== 'undefined')
                openDirectoryPickerOption.mode = options.mode;
        }
        return resolveFileWithPath(globalThis.showDirectoryPicker(openDirectoryPickerOption));
    }
    var input = createHiddenElement('input');
    input.type = 'file';
    input.webkitdirectory = true;
    return resolveFileWithPath(input);
}
function camera(options) {
    var input = createHiddenElement('input');
    input.type = 'file';
    input.accept = 'image/*;capture=camera';
    input.capture = 'environment';
    if (typeof options !== 'undefined') {
        if (typeof options.type !== 'undefined') {
            if (options.type === CameraType.Image)
                input.accept = 'image/*;capture=camera';
            else
                input.accept = 'video/*;capture=camcorder';
        }
        if (typeof options.capture !== 'undefined') {
            if (options.capture === CaptureType.Environment)
                input.capture = 'environment';
            else
                input.capture = 'user';
        }
    }
    return resolveFile(input);
}
function contact(options) {
    return new Promise(function (resolve, reject) {
        if (!canOpenContact())
            return reject(new NotSupportedError('\'navigator.contacts\' does not supported.'));
        var multiple = false;
        if (typeof options !== 'undefined' && typeof options.multiple !== 'undefined')
            multiple = options.multiple;
        globalThis.navigator.contacts
            .getProperties()
            .then(function (properties) {
            globalThis.navigator.contacts
                .select(properties, { multiple: multiple })
                .then(function (contacts) {
                resolve(contacts);
            });
        });
    });
}
function share(options) {
    return new Promise(function (resolve, reject) {
        if (!canOpenShare())
            return reject(new NotSupportedError('\'navigator.share\' does not supported.'));
        if (!globalThis.navigator.canShare(options))
            return reject(new NotSupportedError('The provided data cannot be shared on this device.'));
        globalThis.navigator.share(options)
            .then(function () {
            resolve();
        })
            .catch(function (error) {
            if (error.name === 'AbortError')
                return reject(new UserCancelledError('User cancelled the operation.'));
            return reject(new NotSupportedError(error.message));
        });
    });
}
function calendar(options) {
    var timestamp = now();
    var ics = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\n';
    if (globalThis.document.title !== '') {
        ics += foldICSString('PRODID:-//' + escapeICSString(globalThis.document.title) + '//EN') + '\r\n';
    }
    else {
        ics += foldICSString('PRODID:-//' + escapeICSString(globalThis.location.host) + '//EN') + '\r\n';
    }
    ics += 'BEGIN:VEVENT\r\n'
        + 'UID:' + timestamp + '-' + randomString(10) + '\r\n'
        + 'DTSTAMP:' + dateToICSDateString(new Date()) + '\r\n';
    if (options.allDay === true) {
        ics += 'DTSTART;VALUE=DATE:' + dateToICSDateString(options.startDate, true) + '\r\n'
            + 'DTEND;VALUE=DATE:' + dateToICSDateString(options.endDate, true) + '\r\n';
    }
    else {
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
        var rrule = 'FREQ=' + options.recur.frequency;
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
        for (var i = 0; i < options.alarm.length; i++) {
            var alarm = options.alarm[i];
            ics += 'BEGIN:VALARM\r\n'
                + 'ACTION:DISPLAY\r\n';
            if (typeof alarm.datetime !== 'undefined') {
                ics += 'TRIGGER;VALUE=DATE-TIME:' + dateToICSDateString(alarm.datetime) + '\r\n';
            }
            else {
                var duration = '';
                if (typeof alarm.before === 'undefined' || alarm.before) {
                    duration += '-';
                }
                duration += 'P';
                if (typeof alarm.weeks !== 'undefined' && alarm.weeks > 0) {
                    duration += String(alarm.weeks) + 'W';
                }
                else {
                    if (typeof alarm.days !== 'undefined' && alarm.days > 0) {
                        duration += String(alarm.days) + 'D';
                    }
                    var hasHours = (typeof alarm.hours !== 'undefined' && alarm.hours > 0);
                    var hasMinutes = (typeof alarm.minutes !== 'undefined' && alarm.minutes > 0);
                    var hasSeconds = (typeof alarm.seconds !== 'undefined' && alarm.seconds > 0);
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
            }
            else {
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
    var anchor = createHiddenElement('a');
    anchor.href = 'data:text/calendar;charset=utf-8,' + globalThis.encodeURIComponent(ics);
    anchor.download = 'event-' + timestamp + '.ics';
    dispatchClickEvent(anchor);
}

var IS_IE_MOBILE = /iemobile/i.test(Platform.userAgent);
var IS_WINDOWS_PHONE = /windows phone/i.test(Platform.userAgent);

var metaElement = null;
var Theme = {
    get value() {
        return getThemeColor();
    },
    set value(color) {
        if (typeof color === 'undefined')
            removeThemeColor();
        else
            setThemeColor(color);
    },
    Constants: {},
    Errors: {},
};
function getMetaName() {
    if (IS_IE_MOBILE)
        return 'msapplication-navbutton-color';
    if (IS_WINDOWS_PHONE)
        return 'msapplication-TileColor';
    return 'theme-color';
}
function getMeta() {
    if (metaElement !== null && metaElement.isConnected)
        return metaElement;
    return metaElement = globalThis.document.querySelector('meta[name="' + getMetaName() + '"]');
}
function createMeta() {
    var meta = globalThis.document.createElement('meta');
    meta.setAttribute('name', getMetaName());
    globalThis.document.head.prepend(meta);
    return metaElement = meta;
}
function setThemeColor(color) {
    var meta = getMeta();
    if (meta === null)
        meta = createMeta();
    meta.setAttribute('content', color);
}
function getThemeColor() {
    var meta = getMeta();
    if (!meta)
        return undefined;
    var attribute = meta.getAttribute('content');
    if (typeof attribute == 'string')
        return attribute;
    return undefined;
}
function removeThemeColor() {
    var meta = getMeta();
    if (meta) {
        meta.remove();
        metaElement = null;
    }
}

var Vibration = {
    run: run,
    stop: stop,
    get supported() {
        return supported$3();
    },
    Constants: {},
    Errors: {
        NotSupportedError: NotSupportedError,
    },
};
function run(pattern) {
    if (supported$3())
        return globalThis.navigator.vibrate(pattern);
    throw new NotSupportedError('\'navigator.vibrate\' does not supported.');
}
function stop() {
    return this.run(0);
}
function supported$3() {
    return typeof globalThis.navigator.vibrate !== 'undefined';
}

var PIP_BRIDGED_KEY = Symbol('pipBridged');
var PIP_PRESENTATION_MODE = 'picture-in-picture';
var INLINE_PRESENTATION_MODE = 'inline';
function hasStandardPipEvents() {
    return typeof globalThis.document.pictureInPictureEnabled !== 'undefined';
}
function createPip() {
    var lastPipVideo = null;
    var eventsBridged = false;
    var activeOperation = null;
    var pendingQueue = [];
    var lastIntendedOperation = 'exit';
    var onChangeSubscriptionManager = createSubscriptionManager(attachOnChange, detachOnChange);
    var onErrorSubscriptionManager = createSubscriptionManager(attachOnError, detachOnError);
    function getEnabled() {
        if (typeof globalThis.document.pictureInPictureEnabled === 'boolean')
            return globalThis.document.pictureInPictureEnabled;
        if (typeof HTMLVideoElement === 'undefined')
            return false;
        var videos = globalThis.document.querySelectorAll('video');
        for (var i = 0; i < videos.length; i++) {
            var video = videos[i];
            if (typeof video.webkitSupportsPresentationMode === 'function' && video.webkitSupportsPresentationMode(PIP_PRESENTATION_MODE))
                return true;
        }
        return false;
    }
    function getElement() {
        var currentElement = globalThis.document.pictureInPictureElement;
        if (currentElement !== null && typeof currentElement !== 'undefined')
            return currentElement;
        if (lastPipVideo !== null && lastPipVideo.webkitPresentationMode === PIP_PRESENTATION_MODE)
            return lastPipVideo;
        return null;
    }
    function getIsPip() {
        return getElement() !== null;
    }
    function getDefaultTarget() {
        var video = globalThis.document.querySelector('video');
        if (video === null)
            return undefined;
        return video;
    }
    function onWebkitPresentationModeChanged(event) {
        if (this.webkitPresentationMode === PIP_PRESENTATION_MODE || (this.webkitPresentationMode === INLINE_PRESENTATION_MODE && lastPipVideo === this))
            onChangeSubscriptionManager.emit(event);
    }
    function bridgeEvents() {
        if (eventsBridged)
            return;
        eventsBridged = true;
        if (!hasStandardPipEvents()) {
            bridgeWebkitVideoEvents();
            if (typeof globalThis.MutationObserver !== 'undefined') {
                var observer = new MutationObserver(function () {
                    bridgeWebkitVideoEvents();
                });
                observer.observe(globalThis.document.documentElement, {
                    childList: true,
                    subtree: true,
                });
            }
        }
    }
    function bridgeWebkitVideoEvents() {
        if (typeof globalThis.document === 'undefined')
            return;
        var videos = globalThis.document.querySelectorAll('video');
        videos.forEach(function (video) {
            if (video[PIP_BRIDGED_KEY] === true || !(typeof video.webkitSetPresentationMode !== 'undefined' || typeof video.onwebkitpresentationmodechanged !== 'undefined'))
                return;
            EventListener.add(video, {
                type: 'webkitpresentationmodechanged',
                callback: onWebkitPresentationModeChanged,
                options: false,
            });
            video[PIP_BRIDGED_KEY] = true;
        });
    }
    function attachOnChange() {
        if (hasStandardPipEvents()) {
            var changeEvents = ['enterpictureinpicture', 'leavepictureinpicture'];
            for (var i = 0; i < changeEvents.length; i++) {
                EventListener.add(globalThis.document, {
                    type: changeEvents[i],
                    callback: onChangeSubscriptionManager.emit,
                    options: false,
                });
            }
            return;
        }
        bridgeWebkitVideoEvents();
    }
    function detachOnChange() {
        if (hasStandardPipEvents()) {
            var changeEvents = ['enterpictureinpicture', 'leavepictureinpicture'];
            for (var i = 0; i < changeEvents.length; i++) {
                EventListener.remove(globalThis.document, {
                    type: changeEvents[i],
                    callback: onChangeSubscriptionManager.emit,
                    options: false,
                });
            }
            return;
        }
        var videos = globalThis.document.querySelectorAll('video');
        videos.forEach(function (video) {
            EventListener.remove(video, {
                type: 'webkitpresentationmodechanged',
                callback: onWebkitPresentationModeChanged,
                options: false,
            });
            try {
                delete video[PIP_BRIDGED_KEY];
            }
            catch (_) {
                video[PIP_BRIDGED_KEY] = undefined;
            }
        });
    }
    function attachOnError() {
        EventListener.add(globalThis.document, {
            type: 'pictureinpictureerror',
            callback: onErrorSubscriptionManager.emit,
            options: false,
        });
    }
    function detachOnError() {
        EventListener.remove(globalThis.document, {
            type: 'pictureinpictureerror',
            callback: onErrorSubscriptionManager.emit,
            options: false,
        });
    }
    function drainPendingOperation() {
        var entry = pendingQueue.shift();
        if (typeof entry === 'undefined') {
            activeOperation = null;
            return;
        }
        var next;
        if (entry.operation === 'request')
            next = requestImmediately(entry.target);
        else
            next = exitImmediately();
        activeOperation = next
            .then(function () {
            entry.resolve();
            drainPendingOperation();
        })
            .catch(function (error) {
            entry.reject(error);
            drainPendingOperation();
        });
    }
    function request(target) {
        lastIntendedOperation = 'request';
        if (activeOperation === null) {
            var next = requestImmediately(target);
            activeOperation = next
                .then(drainPendingOperation)
                .catch(drainPendingOperation);
            return next;
        }
        return new Promise(function (resolve, reject) {
            pendingQueue.push({
                operation: 'request',
                target: target,
                resolve: resolve,
                reject: reject,
            });
        });
    }
    function exit() {
        lastIntendedOperation = 'exit';
        if (activeOperation === null) {
            var next = exitImmediately();
            activeOperation = next
                .then(drainPendingOperation)
                .catch(drainPendingOperation);
            return next;
        }
        return new Promise(function (resolve, reject) {
            pendingQueue.push({
                operation: 'exit',
                target: undefined,
                resolve: resolve,
                reject: reject,
            });
        });
    }
    function requestImmediately(target) {
        return new Promise(function (resolve, reject) {
            if (typeof target === 'undefined')
                target = getDefaultTarget();
            if (typeof target === 'undefined')
                return reject(new NotSupportedError('Failed to enter Picture-in-Picture mode.'));
            var tagName = target.tagName.toLowerCase();
            if (tagName !== 'video')
                return reject(new NotSupportedError('The "' + tagName + '" element does not support Picture-in-Picture requests.'));
            function fallbackToWebkitVideo() {
                if (typeof target !== 'undefined' && typeof target.webkitSupportsPresentationMode === 'function' && target.webkitSupportsPresentationMode(PIP_PRESENTATION_MODE) && typeof target.webkitSetPresentationMode === 'function') {
                    if (target.disablePictureInPicture)
                        return reject(new NotSupportedError('Picture-in-Picture is disabled on this video element.'));
                    lastPipVideo = target;
                    bridgeWebkitVideoEvents();
                    target.webkitSetPresentationMode(PIP_PRESENTATION_MODE);
                    return resolve();
                }
                reject(new NotSupportedError('The "' + tagName + '" element does not support Picture-in-Picture requests.'));
            }
            var method = target.requestPictureInPicture;
            if (typeof method === 'function') {
                var result = method.call(target);
                if (typeof result !== 'undefined' && typeof result.then === 'function') {
                    result
                        .then(function () {
                        resolve();
                    })
                        .catch(function () {
                        fallbackToWebkitVideo();
                    });
                    return;
                }
                return resolve();
            }
            fallbackToWebkitVideo();
        });
    }
    function exitImmediately() {
        return new Promise(function (resolve, reject) {
            if (getElement() === null && lastPipVideo === null)
                return resolve();
            function fallbackToWebkitVideo() {
                var candidates;
                if (lastPipVideo !== null && lastPipVideo.webkitPresentationMode === PIP_PRESENTATION_MODE)
                    candidates = [lastPipVideo];
                else
                    candidates = globalThis.document.querySelectorAll('video');
                for (var i = 0; i < candidates.length; i++) {
                    var video = candidates[i];
                    if (typeof video.webkitSetPresentationMode === 'function' && video.webkitPresentationMode === PIP_PRESENTATION_MODE) {
                        video.webkitSetPresentationMode(INLINE_PRESENTATION_MODE);
                        lastPipVideo = null;
                        return resolve();
                    }
                }
                if (getElement() === null)
                    return resolve();
                reject(new NotSupportedError('Failed to exit Picture-in-Picture mode.'));
            }
            var method = globalThis.document.exitPictureInPicture;
            if (typeof method === 'function') {
                var result = method.call(globalThis.document);
                if (typeof result !== 'undefined' && typeof result.then === 'function') {
                    result
                        .then(resolve)
                        .catch(function () {
                        fallbackToWebkitVideo();
                    });
                    return;
                }
                return resolve();
            }
            fallbackToWebkitVideo();
        });
    }
    function toggle(target) {
        if (lastIntendedOperation === 'request')
            return exit();
        return request(target);
    }
    bridgeEvents();
    return {
        get supported() {
            return getEnabled();
        },
        get element() {
            return getElement();
        },
        get isPip() {
            return getIsPip();
        },
        request: request,
        exit: exit,
        toggle: toggle,
        onChange: onChangeSubscriptionManager.subscribe,
        onError: onErrorSubscriptionManager.subscribe,
        Constants: {},
        Errors: {
            NotSupportedError: NotSupportedError,
        },
    };
}
var Pip = createPip();

var Badge = {
    set: set,
    clear: clear,
    get supported() {
        return supported$2();
    },
    Constants: {},
    Errors: {
        NotSupportedError: NotSupportedError,
    },
};
function set(contents) {
    if (supported$2())
        return globalThis.navigator.setAppBadge(contents);
    return Promise.reject(new NotSupportedError('\'navigator.setAppBadge\' does not supported.'));
}
function clear() {
    return this.set(0);
}
function supported$2() {
    return typeof globalThis.navigator.setAppBadge !== 'undefined';
}

var Notification = {
    send: send,
    get supported() {
        return supported$1();
    },
    Constants: {},
    Errors: {
        NotSupportedError: NotSupportedError,
        PermissionNotGrantedError: PermissionNotGrantedError,
    },
};
function send(options) {
    return new Promise(function (resolve, reject) {
        if (!supported$1())
            return reject(new NotSupportedError('\'window.Notification\' does not supported.'));
        Permission
            .request(PermissionType.Notification)
            .then(function (state) {
            if (state === PermissionState.Grant) {
                var constructorOptions = {
                    badge: options.badge,
                    body: options.body,
                    data: options.data,
                    dir: options.dir,
                    icon: options.icon,
                    lang: options.lang,
                    requireInteraction: options.requireInteraction,
                    silent: options.silent,
                    tag: options.tag,
                };
                var notification = new globalThis.Notification(options.title, constructorOptions);
                if (typeof options.onClick !== 'undefined')
                    notification.onclick = options.onClick;
                if (typeof options.onShow !== 'undefined')
                    notification.onshow = options.onShow;
                if (typeof options.onClose !== 'undefined')
                    notification.onclose = options.onClose;
                if (typeof options.onError !== 'undefined')
                    notification.onerror = options.onError;
                resolve(notification);
            }
            else {
                reject(new PermissionNotGrantedError('\'notification\' permission is not granted.'));
            }
        });
    });
}
function supported$1() {
    return typeof globalThis.Notification !== 'undefined';
}

var onChangeSubscriptionManager = createSubscriptionManager(attachOnChange, detachOnChange);
var batteryRef = null;
var Battery = {
    get value() {
        return getValue();
    },
    get supported() {
        return supported();
    },
    onChange: onChangeSubscriptionManager.subscribe,
    Constants: {},
    Errors: {
        NotSupportedError: NotSupportedError,
    },
};
function getValue() {
    return new Promise(function (resolve, reject) {
        if (!supported())
            return reject(new NotSupportedError('\'navigator.getBattery\' does not supported.'));
        globalThis.navigator.getBattery()
            .then(resolve);
    });
}
function attachOnChange() {
    if (!supported())
        return;
    globalThis.navigator.getBattery()
        .then(function (battery) {
        batteryRef = battery;
        EventListener.add(battery, { type: 'chargingchange', callback: onBatteryChange });
        EventListener.add(battery, { type: 'levelchange', callback: onBatteryChange });
        EventListener.add(battery, { type: 'chargingtimechange', callback: onBatteryChange });
        EventListener.add(battery, { type: 'dischargingtimechange', callback: onBatteryChange });
    });
}
function detachOnChange() {
    if (!supported() || batteryRef === null)
        return;
    EventListener.remove(batteryRef, { type: 'chargingchange', callback: onBatteryChange });
    EventListener.remove(batteryRef, { type: 'levelchange', callback: onBatteryChange });
    EventListener.remove(batteryRef, { type: 'chargingtimechange', callback: onBatteryChange });
    EventListener.remove(batteryRef, { type: 'dischargingtimechange', callback: onBatteryChange });
    batteryRef = null;
}
function onBatteryChange() {
    onChangeSubscriptionManager.emit(batteryRef);
}
function supported() {
    return typeof globalThis.navigator.getBattery !== 'undefined';
}

(function () {
    if (typeof globalThis === 'object')
        return;
    Object.defineProperty(Object.prototype, '__getGlobalThis__', {
        get: function () {
            return this;
        },
        configurable: true
    });
    try {
        var global = __getGlobalThis__;
        Object.defineProperty(global, 'globalThis', {
            value: global,
            writable: true,
            configurable: true
        });
    }
    finally {
        delete Object.prototype.__getGlobalThis__;
    }
}());
var Native = {
    version: packageJSON.version,
    appearance: Appearance,
    badge: Badge,
    battery: Battery,
    clipboard: Clipboard,
    dimension: Dimension,
    fullscreen: Fullscreen,
    geolocation: Geolocation,
    notification: Notification,
    open: Open,
    permission: Permission,
    pip: Pip,
    platform: Platform,
    theme: Theme,
    vibration: Vibration,
};

export { Native as default };
