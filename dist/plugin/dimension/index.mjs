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

function setStyle(element, styles) {
    var elementStyle = element.style;
    for (var key in styles) {
        var style = styles[key];
        if (typeof style !== 'undefined')
            elementStyle[key] = style;
    }
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
var onChangeSubscriptionManager = createSubscriptionManager(attachOnChange, detachOnChange);
var dimensionRef = null;
var Dimension = {
    get value() {
        return getDimension();
    },
    environment: getEnvironment(),
    onChange: onChangeSubscriptionManager.subscribe,
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
function attachOnChange() {
    dimensionRef = getDimension();
    EventListener.add(globalThis, { type: 'resize', callback: onResize });
    if (typeof globalThis.screen.orientation.addEventListener === 'function')
        EventListener.add(globalThis.screen.orientation, { type: 'change', callback: onResize });
    else if (typeof globalThis.orientation !== 'undefined')
        EventListener.add(globalThis, { type: 'orientationChange', callback: onResize });
    else if (MEDIA_QUERY_LIST.media !== 'not all')
        EventListener.add(MEDIA_QUERY_LIST, { type: 'change', callback: onResize });
}
function detachOnChange() {
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
        onChangeSubscriptionManager.emit(dimensionRef = dimension);
}

export { ENV_PRESETS, FALLBACK_DIMENSION, MEDIA_QUERY_LIST, Orientation, Dimension as default };
