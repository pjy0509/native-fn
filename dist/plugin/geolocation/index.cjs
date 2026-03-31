'use strict';

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
    get supported() {
        return supported$1();
    },
    request: request$1,
    check: check,
    Constants: {
        PermissionType: PermissionType,
        PermissionState: PermissionState,
    },
    Errors: {},
};
function supported$1() {
    return typeof globalThis.navigator.permissions !== 'undefined';
}
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

function keys(object) {
    var keys = [];
    for (var key in object)
        if (object.hasOwnProperty(key))
            keys.push(key);
    return keys;
}

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

var onChangeSubscriptionManager = createSubscriptionManager(attachOnChange, detachOnChange);
var watchIdRef = null;
var Geolocation = {
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
        PermissionNotGrantedError: PermissionNotGrantedError,
    },
};
function getValue() {
    return new Promise(function (resolve, reject) {
        function fallback(error) {
            getFallbackValue(error)
                .then(resolve)
                .catch(reject);
        }
        if (!supported()) {
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
function attachOnChange() {
    if (!supported())
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
function detachOnChange() {
    if (!supported() || watchIdRef === null)
        return;
    globalThis.navigator.geolocation.clearWatch(watchIdRef);
}
function onGeolocationCoordinatesChange(coordinates) {
    onChangeSubscriptionManager.emit(coordinates);
}
function supported() {
    return typeof globalThis.navigator.geolocation !== 'undefined';
}

module.exports = Geolocation;
