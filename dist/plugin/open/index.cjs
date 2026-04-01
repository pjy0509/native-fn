'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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
function invalidateCache() {
    parsedCache = null;
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
function getIsWebview() {
    return /; ?wv|applewebkit(?!.*safari)/i.test(currentUserAgent);
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
                if (getParsedCache().os.name === OS.Windows) {
                    if (parseInt(platformVersion.split('.')[0], 10) >= 13)
                        parsedFromHighEntropyValuesOS.version = '11';
                    else
                        parsedFromHighEntropyValuesOS.version = '10';
                }
                else {
                    parsedFromHighEntropyValuesOS.version = platformVersion;
                }
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
Promise.all([
    parseFromHighEntropyValues(),
    parseFromNavigatorGPU(),
]).then(function () {
});
EventListener.add(globalThis, {
    type: 'languagechange', callback: function () {
    }
});
var Platform = {
    get os() {
        return getParsedCache().os;
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
            Promise.all([
                parseFromHighEntropyValues(),
                parseFromNavigatorGPU(),
            ]).then(function () {
            });
        }
    },
    get isWebview() {
        return getIsWebview();
    }};

var _a, _b, _c, _d, _e;
exports.AppOpenState = void 0;
(function (AppOpenState) {
    AppOpenState[AppOpenState["Scheme"] = 0] = "Scheme";
    AppOpenState[AppOpenState["Universal"] = 1] = "Universal";
    AppOpenState[AppOpenState["Intent"] = 2] = "Intent";
    AppOpenState[AppOpenState["Fallback"] = 3] = "Fallback";
    AppOpenState[AppOpenState["Store"] = 4] = "Store";
})(exports.AppOpenState || (exports.AppOpenState = {}));
exports.SettingType = void 0;
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
})(exports.SettingType || (exports.SettingType = {}));
exports.CameraType = void 0;
(function (CameraType) {
    CameraType["Image"] = "image";
    CameraType["Video"] = "video";
})(exports.CameraType || (exports.CameraType = {}));
exports.CaptureType = void 0;
(function (CaptureType) {
    CaptureType["User"] = "user";
    CaptureType["Environment"] = "environment";
})(exports.CaptureType || (exports.CaptureType = {}));
exports.ExplorerStartIn = void 0;
(function (ExplorerStartIn) {
    ExplorerStartIn["Desktop"] = "desktop";
    ExplorerStartIn["Documents"] = "documents";
    ExplorerStartIn["Downloads"] = "downloads";
    ExplorerStartIn["Music"] = "music";
    ExplorerStartIn["Pictures"] = "pictures";
    ExplorerStartIn["Videos"] = "videos";
})(exports.ExplorerStartIn || (exports.ExplorerStartIn = {}));
exports.DirectoryExploreMode = void 0;
(function (DirectoryExploreMode) {
    DirectoryExploreMode["Read"] = "read";
    DirectoryExploreMode["ReadWrite"] = "readwrite";
})(exports.DirectoryExploreMode || (exports.DirectoryExploreMode = {}));
var SETTING_URL = (_a = {},
    _a[OS.Android] = (_b = {},
        _b[exports.SettingType.General] = 'intent:#Intent;action=android.settings.SETTINGS;end',
        _b[exports.SettingType.Network] = 'intent:#Intent;action=android.settings.WIFI_SETTINGS;end',
        _b[exports.SettingType.Display] = 'intent:#Intent;action=android.settings.DISPLAY_SETTINGS;end',
        _b[exports.SettingType.Appearance] = 'intent:#Intent;action=android.settings.DISPLAY_SETTINGS;end',
        _b[exports.SettingType.Accessibility] = 'intent:#Intent;action=android.settings.ACCESSIBILITY_SETTINGS;end',
        _b[exports.SettingType.Battery] = 'intent:#Intent;action=android.settings.BATTERY_SAVER_SETTINGS;end',
        _b[exports.SettingType.Datetime] = 'intent:#Intent;action=android.settings.DATE_SETTINGS;end',
        _b[exports.SettingType.Language] = 'intent:#Intent;action=android.settings.LOCALE_SETTINGS;end',
        _b[exports.SettingType.Accounts] = 'intent:#Intent;action=android.settings.SYNC_SETTINGS;end',
        _b[exports.SettingType.Storage] = 'intent:#Intent;action=android.settings.INTERNAL_STORAGE_SETTINGS;end',
        _b),
    _a[OS.Windows] = (_c = {},
        _c[exports.SettingType.General] = 'ms-settings:system',
        _c[exports.SettingType.Network] = 'ms-settings:network',
        _c[exports.SettingType.Display] = 'ms-settings:display',
        _c[exports.SettingType.Appearance] = 'ms-settings:colors',
        _c[exports.SettingType.Accessibility] = 'ms-settings:easeofaccess',
        _c[exports.SettingType.Battery] = 'ms-settings:batterysaver',
        _c[exports.SettingType.Datetime] = 'ms-settings:dateandtime',
        _c[exports.SettingType.Language] = 'ms-settings:regionlanguage',
        _c[exports.SettingType.Accounts] = 'ms-settings:emailandaccounts',
        _c[exports.SettingType.Storage] = 'ms-settings:storagesense',
        _c),
    _a[OS.MacOS] = (_d = {},
        _d[exports.SettingType.General] = 'x-apple.systempreferences:',
        _d[exports.SettingType.Network] = 'x-apple.systempreferences:com.apple.preference.network',
        _d[exports.SettingType.Display] = 'x-apple.systempreferences:com.apple.preference.displays',
        _d[exports.SettingType.Appearance] = 'x-apple.systempreferences:com.apple.preference.general',
        _d[exports.SettingType.Accessibility] = 'x-apple.systempreferences:com.apple.preference.universalaccess',
        _d[exports.SettingType.Battery] = 'x-apple.systempreferences:com.apple.preference.energysaver',
        _d[exports.SettingType.Datetime] = 'x-apple.systempreferences:com.apple.preference.datetime',
        _d[exports.SettingType.Language] = 'x-apple.systempreferences:com.apple.Localization',
        _d[exports.SettingType.Accounts] = 'x-apple.systempreferences:com.apple.preferences.internetaccounts',
        _d[exports.SettingType.Storage] = 'x-apple.systempreferences:',
        _d),
    _a['MacOS13+'] = (_e = {},
        _e[exports.SettingType.General] = 'x-apple.systempreferences:com.apple.General-Settings.extension',
        _e[exports.SettingType.Network] = 'x-apple.systempreferences:com.apple.Network-Settings.extension',
        _e[exports.SettingType.Display] = 'x-apple.systempreferences:com.apple.Displays-Settings.extension',
        _e[exports.SettingType.Appearance] = 'x-apple.systempreferences:com.apple.Appearance-Settings.extension',
        _e[exports.SettingType.Accessibility] = 'x-apple.systempreferences:com.apple.Accessibility-Settings.extension',
        _e[exports.SettingType.Battery] = 'x-apple.systempreferences:com.apple.Battery-Settings.extension',
        _e[exports.SettingType.Datetime] = 'x-apple.systempreferences:com.apple.Date-Time-Settings.extension',
        _e[exports.SettingType.Language] = 'x-apple.systempreferences:com.apple.Localization-Settings.extension',
        _e[exports.SettingType.Accounts] = 'x-apple.systempreferences:com.apple.Internet-Accounts-Settings.extension',
        _e[exports.SettingType.Storage] = 'x-apple.systempreferences:com.apple.settings.Storage',
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

var URLOpenError = createCustomError('URLOpenError');

var UserCancelledError = createCustomError('UserCancelledError');

var NotSupportedError = createCustomError('NotSupportedError');

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
        AppOpenState: exports.AppOpenState,
        SettingType: exports.SettingType,
        CameraType: exports.CameraType,
        CaptureType: exports.CaptureType,
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
    pushURL(urls, infos.intent, exports.AppOpenState.Intent, canOpenIntentURL());
    pushURL(urls, infos.universal, exports.AppOpenState.Universal, canOpenUniversalURL());
    pushURL(urls, infos.scheme, exports.AppOpenState.Scheme, true);
    pushURL(urls, infos.fallback, exports.AppOpenState.Fallback, true);
    pushURL(urls, infos.appStore, exports.AppOpenState.Store, infos.allowAppStore);
    pushURL(urls, infos.webStore, exports.AppOpenState.Store, infos.allowWebStore);
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
            if (type !== exports.SettingType.General) {
                if (type === exports.SettingType.Accessibility && compareVersion(version, '1.6') >= 0)
                    urls.push(SETTING_URL['Android'][exports.SettingType.Accessibility]);
                else if (type === exports.SettingType.Battery && compareVersion(version, '5.1') >= 0)
                    urls.push(SETTING_URL['Android'][exports.SettingType.Battery]);
                else if (type === exports.SettingType.Accounts && compareVersion(version, '1.5') >= 0)
                    urls.push(SETTING_URL['Android'][exports.SettingType.Accounts]);
                else if (type === exports.SettingType.Storage && compareVersion(version, '3.0') >= 0)
                    urls.push(SETTING_URL['Android'][exports.SettingType.Storage]);
                else
                    urls.push(SETTING_URL['Android'][type]);
            }
            urls.push(SETTING_URL['Android'][exports.SettingType.General]);
            break;
        case OS.Windows:
            urls.push(SETTING_URL['Windows'][type]);
            break;
        case OS.MacOS:
            if (type === exports.SettingType.Appearance && compareVersion(version, '10.14') < 0) {
                urls.push(SETTING_URL['MacOS'][exports.SettingType.General]);
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
            if (options.type === exports.CameraType.Image)
                input.accept = 'image/*;capture=camera';
            else
                input.accept = 'video/*;capture=camcorder';
        }
        if (typeof options.capture !== 'undefined') {
            if (options.capture === exports.CaptureType.Environment)
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

exports.SETTING_URL = SETTING_URL;
exports.default = Open;
