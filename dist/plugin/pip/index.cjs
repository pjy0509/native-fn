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

var InvalidStateError = createCustomError('InvalidStateError');

var PIP_PRESENTATION_MODE = 'picture-in-picture';
var INLINE_PRESENTATION_MODE = 'inline';
var lastPipVideo = null;
var eventsBridged = false;
var PIP_BRIDGE_KEY = (function () {
    if (typeof Symbol === 'function') {
        var existing = globalThis.__nativeFnPipBridgeKey__;
        if (typeof existing === 'symbol')
            return existing;
        return globalThis.__nativeFnPipBridgeKey__ = Symbol('native.fn.pip.bridged');
    }
    return '__nativeFnPipBridged__';
}());
var onChangeSubscriptionManager = createSubscriptionManager(attachOnChange, detachOnChange);
var onErrorSubscriptionManager = createSubscriptionManager(attachOnError, detachOnError);
var Pip = {
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
    onChange: onChangeSubscriptionManager.subscribe,
    onError: onErrorSubscriptionManager.subscribe,
    Constants: {},
    Errors: {
        NotSupportedError: NotSupportedError,
        InvalidStateError: InvalidStateError,
    },
};
function hasStandardApi() {
    return typeof globalThis.document.pictureInPictureEnabled !== 'undefined';
}
function getDefaultTarget() {
    var video = globalThis.document.querySelector('video');
    return video !== null ? video : undefined;
}
function createPipEventPayload(nativeEvent, element, isPip) {
    return {
        nativeEvent: nativeEvent,
        element: element,
        isPip: isPip
    };
}
function emitChange(nativeEvent, element, isPip) {
    onChangeSubscriptionManager.emit(createPipEventPayload(nativeEvent, element, isPip));
}
function emitError(nativeEvent, element, isPip) {
    onErrorSubscriptionManager.emit(createPipEventPayload(nativeEvent, element, isPip));
}
function onEnterPictureInPicture(event) {
    var target = event.target;
    if (target instanceof globalThis.HTMLVideoElement)
        emitChange(event, target, true);
}
function onLeavePictureInPicture(event) {
    var target = event.target;
    if (target instanceof globalThis.HTMLVideoElement)
        emitChange(event, target, false);
}
function onPictureInPictureError(event) {
    var target = event.target;
    if (target instanceof globalThis.HTMLVideoElement)
        emitError(event, target, getIsPip());
}
function onWebkitPresentationModeChanged(event) {
    if (this.webkitPresentationMode === PIP_PRESENTATION_MODE) {
        lastPipVideo = this;
        emitChange(event, this, true);
        return;
    }
    if (this.webkitPresentationMode === INLINE_PRESENTATION_MODE && lastPipVideo === this) {
        lastPipVideo = null;
        emitChange(event, this, false);
    }
}
function bridgeSingleVideoNode(video) {
    if (video[PIP_BRIDGE_KEY])
        return;
    if (typeof video.webkitSetPresentationMode === 'undefined' && typeof video.onwebkitpresentationmodechanged === 'undefined')
        return;
    EventListener.add(video, { type: 'webkitpresentationmodechanged', callback: onWebkitPresentationModeChanged, options: false });
    video[PIP_BRIDGE_KEY] = true;
}
function bridgeWebkitVideoEvents() {
    var videos = globalThis.document.querySelectorAll('video');
    for (var i = 0; i < videos.length; i++)
        bridgeSingleVideoNode(videos[i]);
}
function bridgeEvents() {
    if (eventsBridged)
        return;
    eventsBridged = true;
    if (hasStandardApi())
        return;
    bridgeWebkitVideoEvents();
    if (typeof globalThis.MutationObserver === 'undefined')
        return;
    var observer = new globalThis.MutationObserver(function (records) {
        if (lastPipVideo !== null) {
            var removed = false;
            for (var i = 0; i < records.length; i++) {
                var removedNodes = records[i].removedNodes;
                for (var j = 0; j < removedNodes.length; j++) {
                    var node = removedNodes[j];
                    if (node === lastPipVideo || (node.nodeType === Node.ELEMENT_NODE && node.contains(lastPipVideo))) {
                        removed = true;
                        break;
                    }
                }
                if (removed)
                    break;
            }
            if (removed && !globalThis.document.contains(lastPipVideo))
                lastPipVideo = null;
        }
        for (var i = 0; i < records.length; i++) {
            var addedNodes = records[i].addedNodes;
            for (var j = 0; j < addedNodes.length; j++) {
                var node = addedNodes[j];
                if (node.nodeType !== Node.ELEMENT_NODE)
                    continue;
                var element = node;
                if (element.tagName === 'VIDEO') {
                    bridgeSingleVideoNode(element);
                    continue;
                }
                var nested = element.querySelectorAll('video');
                for (var k = 0; k < nested.length; k++)
                    bridgeSingleVideoNode(nested[k]);
            }
        }
    });
    observer.observe(globalThis.document.documentElement, { childList: true, subtree: true });
}
function attachOnChange() {
    if (hasStandardApi()) {
        EventListener.add(globalThis.document, { type: 'enterpictureinpicture', callback: onEnterPictureInPicture, options: false });
        EventListener.add(globalThis.document, { type: 'leavepictureinpicture', callback: onLeavePictureInPicture, options: false });
        return;
    }
    bridgeWebkitVideoEvents();
}
function detachOnChange() {
    if (hasStandardApi()) {
        EventListener.remove(globalThis.document, { type: 'enterpictureinpicture', callback: onEnterPictureInPicture, options: false });
        EventListener.remove(globalThis.document, { type: 'leavepictureinpicture', callback: onLeavePictureInPicture, options: false });
        return;
    }
    var videos = globalThis.document.querySelectorAll('video');
    for (var i = 0; i < videos.length; i++) {
        EventListener.remove(videos[i], { type: 'webkitpresentationmodechanged', callback: onWebkitPresentationModeChanged, options: false });
        videos[i][PIP_BRIDGE_KEY] = false;
    }
}
function attachOnError() {
    EventListener.add(globalThis.document, { type: 'pictureinpictureerror', callback: onPictureInPictureError, options: false });
}
function detachOnError() {
    EventListener.remove(globalThis.document, { type: 'pictureinpictureerror', callback: onPictureInPictureError, options: false });
}
function getEnabled() {
    if (typeof globalThis.document.pictureInPictureEnabled === 'boolean')
        return globalThis.document.pictureInPictureEnabled;
    var video;
    var selected = globalThis.document.querySelector('video');
    if (selected !== null)
        video = selected;
    else
        video = globalThis.document.createElement('video');
    return typeof video.webkitSupportsPresentationMode === 'function' && video.webkitSupportsPresentationMode(PIP_PRESENTATION_MODE);
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
function request(target) {
    return new Promise(function (resolve, reject) {
        if (typeof target === 'undefined')
            target = getDefaultTarget();
        if (typeof target === 'undefined')
            return reject(new NotSupportedError('Failed to enter Picture-in-Picture mode.'));
        var tagName = target.tagName.toLowerCase();
        if (tagName !== 'video')
            return reject(new NotSupportedError('The "' + tagName + '" element does not support Picture-in-Picture requests.'));
        var method = target.requestPictureInPicture;
        var isWebkitPipActive = lastPipVideo !== null && lastPipVideo.webkitPresentationMode === PIP_PRESENTATION_MODE;
        if (typeof method === 'function' && !isWebkitPipActive) {
            var result = method.call(target);
            if (typeof result !== 'undefined' && typeof result.then === 'function') {
                result
                    .then(resolve)
                    .catch(function () {
                    try {
                        fallbackToWebkit();
                    }
                    catch (e) {
                        reject(new NotSupportedError('The "' + tagName + '" element does not support Picture-in-Picture requests.'));
                    }
                });
                return;
            }
            return resolve();
        }
        function fallbackToWebkit() {
            if (typeof target !== 'undefined' && typeof target.webkitSupportsPresentationMode === 'function' && target.webkitSupportsPresentationMode(PIP_PRESENTATION_MODE) && typeof target.webkitSetPresentationMode === 'function') {
                if (target.disablePictureInPicture)
                    return reject(new NotSupportedError('Picture-in-Picture is disabled on this element.'));
                if (!hasStandardApi())
                    bridgeSingleVideoNode(target);
                target.webkitSetPresentationMode(PIP_PRESENTATION_MODE);
                if (target.webkitPresentationMode !== PIP_PRESENTATION_MODE)
                    return reject(new InvalidStateError('Picture-in-Picture transition is already in progress.'));
                lastPipVideo = target;
                return resolve();
            }
            reject(new NotSupportedError('The "' + tagName + '" element does not support Picture-in-Picture requests.'));
        }
        fallbackToWebkit();
    });
}
function exit() {
    return new Promise(function (resolve, reject) {
        var method = globalThis.document.exitPictureInPicture;
        if (typeof method === 'function') {
            var result = method.call(globalThis.document);
            if (typeof result !== 'undefined' && typeof result.then === 'function') {
                result
                    .then(resolve)
                    .catch(function () {
                    try {
                        fallbackToWebkit();
                    }
                    catch (e) {
                        reject(new NotSupportedError('Failed to exit Picture-in-Picture mode.'));
                    }
                });
                return;
            }
            return resolve();
        }
        function fallbackToWebkit() {
            if (lastPipVideo !== null && typeof lastPipVideo.webkitSetPresentationMode === 'function' && lastPipVideo.webkitPresentationMode === PIP_PRESENTATION_MODE) {
                lastPipVideo.webkitSetPresentationMode(INLINE_PRESENTATION_MODE);
                lastPipVideo = null;
                return resolve();
            }
            var videos = globalThis.document.querySelectorAll('video');
            for (var i = 0; i < videos.length; i++) {
                var video = videos[i];
                if (typeof video.webkitSetPresentationMode === 'function' && video.webkitPresentationMode === PIP_PRESENTATION_MODE) {
                    video.webkitSetPresentationMode(INLINE_PRESENTATION_MODE);
                    lastPipVideo = null;
                    return resolve();
                }
            }
            if (globalThis.document.pictureInPictureElement === null || typeof globalThis.document.pictureInPictureElement === 'undefined')
                return resolve();
            reject(new NotSupportedError('Failed to exit Picture-in-Picture mode.'));
        }
        fallbackToWebkit();
    });
}
bridgeEvents();

module.exports = Pip;
