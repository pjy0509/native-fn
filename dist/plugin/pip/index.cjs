'use strict';

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

module.exports = Pip;
