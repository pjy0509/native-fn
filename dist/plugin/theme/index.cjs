'use strict';

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
    }};

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

module.exports = Theme;
