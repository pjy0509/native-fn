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
    Orientation["PortraitPrimary"] = "portrait-primary";
    Orientation["PortraitSecondary"] = "portrait-secondary";
    Orientation["LandscapePrimary"] = "landscape-primary";
    Orientation["LandscapeSecondary"] = "landscape-secondary";
})(Orientation || (Orientation = {}));
(function (Orientation) {
    function isLandscape(orientation) {
        return orientation === Orientation.LandscapePrimary || orientation === Orientation.LandscapeSecondary;
    }
    Orientation.isLandscape = isLandscape;
    function isPortrait(orientation) {
        return orientation === Orientation.PortraitPrimary || orientation === Orientation.PortraitSecondary;
    }
    Orientation.isPortrait = isPortrait;
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
var ORIENTATION_MEDIA_QUERY_LIST;
if (typeof globalThis.matchMedia !== 'undefined')
    ORIENTATION_MEDIA_QUERY_LIST = globalThis.matchMedia('(orientation: portrait)');
else
    ORIENTATION_MEDIA_QUERY_LIST = FALLBACK_MEDIA_QUERY_LIST;
var DEVICE_POSTURE_MEDIA_QUERY_LIST;
if (typeof globalThis.matchMedia !== 'undefined')
    DEVICE_POSTURE_MEDIA_QUERY_LIST = globalThis.matchMedia('(device-posture: folded)');
else
    DEVICE_POSTURE_MEDIA_QUERY_LIST = FALLBACK_MEDIA_QUERY_LIST;

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
            if (typeof options.signal !== 'undefined' && options.signal.aborted)
                return function () { };
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
            if (typeof entry.signal !== 'undefined')
                EventListener.add(entry.signal, { type: 'abort', callback: cleanup });
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

var MAX_SEGMENTS_PER_AXIS = 4;
function noop() {
}
function getSupportedEnvironment() {
    if (typeof globalThis.CSS !== 'undefined' && typeof globalThis.CSS.supports === 'function') {
        if (globalThis.CSS.supports('x: env(x)'))
            return 'env';
        if (globalThis.CSS.supports('x: constant(x)'))
            return 'constant';
    }
    return undefined;
}
function getSegmentGrid() {
    if (typeof globalThis.matchMedia !== 'function')
        return { rows: 1, cols: 1 };
    var cols = 1;
    var rows = 1;
    for (var i = MAX_SEGMENTS_PER_AXIS; i >= 2; i--) {
        if (globalThis.matchMedia('(horizontal-viewport-segments: ' + i + ')').matches) {
            cols = i;
            break;
        }
    }
    for (var i = MAX_SEGMENTS_PER_AXIS; i >= 2; i--) {
        if (globalThis.matchMedia('(vertical-viewport-segments: ' + i + ')').matches) {
            rows = i;
            break;
        }
    }
    return { rows: rows, cols: cols };
}
function buildSegmentMediaQueryLists() {
    if (typeof globalThis.matchMedia !== 'function')
        return [];
    var mediaQueryLists = [];
    for (var i = 2; i <= MAX_SEGMENTS_PER_AXIS; i++) {
        mediaQueryLists.push(globalThis.matchMedia('(horizontal-viewport-segments: ' + i + ')'));
        mediaQueryLists.push(globalThis.matchMedia('(vertical-viewport-segments: ' + i + ')'));
    }
    return mediaQueryLists;
}
function createViewportSegmentObserver() {
    var viewport = globalThis.viewport;
    var visualViewport = globalThis.visualViewport;
    var devicePosture = globalThis.navigator.devicePosture;
    var hasSegmentsAPI = typeof viewport !== 'undefined';
    var hasLegacySegmentsAPI = !hasSegmentsAPI && typeof visualViewport !== 'undefined' && visualViewport !== null && typeof visualViewport.segments !== 'undefined';
    var hasDevicePosture = typeof devicePosture !== 'undefined';
    var onChangeSubscriptionManager = createSubscriptionManager(attachOnChange, detachOnChange);
    var support = getSupportedEnvironment();
    var cachedDiv = null;
    var segmentMediaQueryLists = [];
    var previousSegments = null;
    function attachCSSFallbackListeners() {
        segmentMediaQueryLists = buildSegmentMediaQueryLists();
        for (var i = 0; i < segmentMediaQueryLists.length; i++)
            EventListener.add(segmentMediaQueryLists[i], { type: 'change', callback: onSegmentChange });
        if (DEVICE_POSTURE_MEDIA_QUERY_LIST.media !== 'not all')
            EventListener.add(DEVICE_POSTURE_MEDIA_QUERY_LIST, { type: 'change', callback: onSegmentChange });
    }
    function detachCSSFallbackListeners() {
        for (var i = 0; i < segmentMediaQueryLists.length; i++)
            EventListener.remove(segmentMediaQueryLists[i], { type: 'change', callback: onSegmentChange });
        segmentMediaQueryLists = [];
        if (DEVICE_POSTURE_MEDIA_QUERY_LIST.media !== 'not all')
            EventListener.remove(DEVICE_POSTURE_MEDIA_QUERY_LIST, { type: 'change', callback: onSegmentChange });
    }
    function attachDevicePostureChangeListener() {
        if (hasDevicePosture)
            EventListener.add(devicePosture, { type: 'change', callback: onSegmentChange });
        attachCSSFallbackListeners();
    }
    function detachDevicePostureChangeListener() {
        if (hasDevicePosture)
            EventListener.remove(devicePosture, { type: 'change', callback: onSegmentChange });
        detachCSSFallbackListeners();
    }
    function attachVisualViewportResizeListener() {
        EventListener.add(visualViewport, { type: 'resize', callback: onSegmentChange, options: { passive: true } });
    }
    function detachVisualViewportResizeListener() {
        EventListener.remove(visualViewport, { type: 'resize', callback: onSegmentChange, options: { passive: true } });
    }
    function attachOnChange() {
        EventListener.add(globalThis, { type: 'resize', callback: onSegmentChange });
        if (hasSegmentsAPI) {
            attachDevicePostureChangeListener();
        }
        else if (hasLegacySegmentsAPI) {
            attachVisualViewportResizeListener();
            attachDevicePostureChangeListener();
        }
        else {
            getOrCreateCachedDiv();
            attachVisualViewportResizeListener();
        }
    }
    function detachOnChange() {
        EventListener.remove(globalThis, { type: 'resize', callback: onSegmentChange });
        if (hasSegmentsAPI) {
            detachDevicePostureChangeListener();
        }
        else if (hasLegacySegmentsAPI) {
            detachVisualViewportResizeListener();
            detachDevicePostureChangeListener();
        }
        else {
            detachVisualViewportResizeListener();
            releaseDiv();
        }
    }
    function segmentsEqual(segments1, segments2) {
        if (segments1.length !== segments2.length)
            return false;
        for (var i = 0; i < segments1.length; i++) {
            var segment1 = segments1[i];
            var segment2 = segments2[i];
            if (segment1.width !== segment2.width || segment1.height !== segment2.height || segment1.top !== segment2.top || segment1.left !== segment2.left || segment1.bottom !== segment2.bottom || segment1.right !== segment2.right)
                return false;
        }
        return true;
    }
    function onSegmentChange() {
        var next = getValue();
        if (previousSegments !== null && segmentsEqual(previousSegments, next))
            return;
        previousSegments = next;
        onChangeSubscriptionManager.emit(next);
    }
    function buildDiv() {
        var div = createHiddenElement('div');
        div.setAttribute('data-viewport-segment-observer', '');
        div.style.setProperty('position', 'fixed', 'important');
        div.style.setProperty('top', '0', 'important');
        div.style.setProperty('left', '0', 'important');
        div.style.setProperty('visibility', 'hidden', 'important');
        div.style.setProperty('pointer-events', 'none', 'important');
        div.style.setProperty('z-index', '-1', 'important');
        div.style.setProperty('box-sizing', 'content-box', 'important');
        div.style.setProperty('padding', '0', 'important');
        div.style.setProperty('margin', '0', 'important');
        div.style.setProperty('border', '0', 'important');
        div.style.setProperty('width', '0', 'important');
        div.style.setProperty('height', '0', 'important');
        div.style.setProperty('min-width', '0', 'important');
        div.style.setProperty('min-height', '0', 'important');
        div.style.setProperty('max-width', 'none', 'important');
        div.style.setProperty('max-height', 'none', 'important');
        div.style.setProperty('transition', 'none', 'important');
        div.style.setProperty('animation', 'none', 'important');
        div.style.setProperty('display', 'block', 'important');
        div.style.setProperty('float', 'none', 'important');
        div.style.setProperty('transform', 'none', 'important');
        return div;
    }
    function getOrCreateCachedDiv() {
        if (cachedDiv !== null)
            return cachedDiv;
        cachedDiv = buildDiv();
        globalThis.document.body.appendChild(cachedDiv);
        return cachedDiv;
    }
    function releaseDiv() {
        if (cachedDiv !== null) {
            if (cachedDiv.parentNode !== null)
                cachedDiv.parentNode.removeChild(cachedDiv);
            cachedDiv = null;
        }
    }
    function readFromSegmentsAPI() {
        var segments;
        if (hasSegmentsAPI)
            segments = viewport.segments;
        else
            segments = visualViewport.segments;
        if (segments === null || typeof segments === 'undefined' || segments.length === 0)
            return [buildFullViewportSegment()];
        var results = [];
        for (var i = 0; i < segments.length; i++) {
            var segment = segments[i];
            results.push({
                width: segment.width,
                height: segment.height,
                top: segment.top,
                left: segment.left,
                bottom: segment.bottom,
                right: segment.right,
            });
        }
        return results;
    }
    function buildFullViewportSegment() {
        var width = globalThis.innerWidth;
        var height = globalThis.innerHeight;
        return {
            width: width,
            height: height,
            top: 0,
            left: 0,
            bottom: height,
            right: width,
        };
    }
    function readFromCSSEnv(div) {
        var grid = getSegmentGrid();
        if (grid.rows === 1 && grid.cols === 1)
            return [buildFullViewportSegment()];
        if (typeof support === 'undefined' || typeof div.style.setProperty === 'undefined')
            return [buildFullViewportSegment()];
        var results = [];
        for (var row = 0; row < grid.rows; row++) {
            for (var col = 0; col < grid.cols; col++) {
                div.style.setProperty('width', support + '(viewport-segment-width ' + row + ' ' + col + ', -1px)', 'important');
                div.style.setProperty('height', support + '(viewport-segment-height ' + row + ' ' + col + ', -1px)', 'important');
                div.style.setProperty('margin-top', support + '(viewport-segment-top ' + row + ' ' + col + ', -1px)', 'important');
                div.style.setProperty('margin-left', support + '(viewport-segment-left ' + row + ' ' + col + ', -1px)', 'important');
                div.style.setProperty('margin-bottom', support + '(viewport-segment-bottom ' + row + ' ' + col + ', -1px)', 'important');
                div.style.setProperty('margin-right', support + '(viewport-segment-right ' + row + ' ' + col + ', -1px)', 'important');
                var computed = globalThis.getComputedStyle(div);
                var top_1 = globalThis.parseFloat(computed.marginTop);
                if (top_1 < 0)
                    continue;
                var left = globalThis.parseFloat(computed.marginLeft);
                var bottom = globalThis.parseFloat(computed.marginBottom);
                var right = globalThis.parseFloat(computed.marginRight);
                var width = globalThis.parseFloat(computed.width);
                var height = globalThis.parseFloat(computed.height);
                results.push({
                    width: width,
                    height: height,
                    top: top_1,
                    left: left,
                    bottom: bottom,
                    right: right,
                });
            }
        }
        return results;
    }
    function getValue() {
        if (hasSegmentsAPI || hasLegacySegmentsAPI)
            return readFromSegmentsAPI();
        if (cachedDiv !== null)
            return readFromCSSEnv(cachedDiv);
        var div = buildDiv();
        globalThis.document.body.appendChild(div);
        var results = readFromCSSEnv(div);
        globalThis.document.body.removeChild(div);
        return results;
    }
    function useCssVariable(prefix) {
        if (typeof globalThis.document === 'undefined')
            return noop;
        var attributes = keys(ENV_PRESETS['viewport-segment']);
        var element = globalThis.document.documentElement;
        var lastCount = 0;
        function applySegments(segments) {
            for (var i = segments.length; i < lastCount; i++) {
                for (var j = 0; j < attributes.length; j++) {
                    element.style.removeProperty('--' + prefix + '-' + i + '-' + attributes[j]);
                }
            }
            lastCount = segments.length;
            for (var i = 0; i < segments.length; i++) {
                var segment = segments[i];
                for (var j = 0; j < attributes.length; j++) {
                    var attribute = attributes[j];
                    element.style.setProperty('--' + prefix + '-' + i + '-' + attribute, segment[attribute] + 'px');
                }
            }
        }
        applySegments(getValue());
        var unsubscribe = onChangeSubscriptionManager.subscribe(function (segments) {
            applySegments(segments);
        });
        return function () {
            unsubscribe();
            for (var i = 0; i < lastCount; i++)
                for (var j = 0; j < attributes.length; j++)
                    element.style.removeProperty('--' + prefix + '-' + i + '-' + attributes[j]);
            lastCount = 0;
        };
    }
    return {
        get value() {
            return getValue();
        },
        onChange: onChangeSubscriptionManager.subscribe,
        useCssVariable: useCssVariable,
    };
}
function createVirtualKeyboardObserver() {
    var onChangeSubscriptionManager = createSubscriptionManager(attachOnChange, detachOnChange);
    var virtualKeyboard = globalThis.navigator.virtualKeyboard;
    var pendingRaf = null;
    function attachOnChange() {
        EventListener.add(virtualKeyboard, { type: 'geometrychange', callback: onGeometryChange, options: { passive: true } });
    }
    function detachOnChange() {
        EventListener.remove(virtualKeyboard, { type: 'geometrychange', callback: onGeometryChange, options: { passive: true } });
        if (pendingRaf !== null) {
            globalThis.cancelAnimationFrame(pendingRaf);
            pendingRaf = null;
        }
    }
    function onGeometryChange() {
        if (pendingRaf !== null)
            globalThis.cancelAnimationFrame(pendingRaf);
        if (typeof globalThis.requestAnimationFrame === 'function') {
            pendingRaf = globalThis.requestAnimationFrame(function () {
                pendingRaf = null;
                onChangeSubscriptionManager.emit(getValue());
            });
        }
        else {
            defer(function () {
                onChangeSubscriptionManager.emit(getValue());
            });
        }
    }
    function getValue() {
        var rect = virtualKeyboard.boundingRect;
        var width = rect.width;
        var height = rect.height;
        var top;
        var left;
        var bottom;
        var right;
        if (height === 0) {
            top = 0;
            bottom = 0;
        }
        else {
            top = rect.y;
            bottom = Math.max(0, globalThis.innerHeight - rect.y);
        }
        if (width === 0) {
            left = 0;
            right = 0;
        }
        else {
            left = rect.x;
            right = Math.max(0, globalThis.innerWidth - rect.x);
        }
        return {
            top: top,
            right: right,
            bottom: bottom,
            left: left,
            width: width,
            height: height,
        };
    }
    function useCssVariable(prefix) {
        if (typeof globalThis.document === 'undefined')
            return noop;
        var attributes = keys(ENV_PRESETS['keyboard-inset']);
        var element = globalThis.document.documentElement;
        function applyValues(values) {
            for (var i = 0; i < attributes.length; i++) {
                var attribute = attributes[i];
                element.style.setProperty('--' + prefix + '-' + attribute, values[attribute] + 'px');
            }
        }
        applyValues(getValue());
        var unsubscribe = onChangeSubscriptionManager.subscribe(function (values) {
            applyValues(values);
        });
        return function () {
            unsubscribe();
            for (var i = 0; i < attributes.length; i++)
                element.style.removeProperty('--' + prefix + '-' + attributes[i]);
        };
    }
    return {
        get value() {
            return getValue();
        },
        onChange: onChangeSubscriptionManager.subscribe,
        useCssVariable: useCssVariable,
    };
}
function createEnvironmentObserver(preset) {
    if (preset === 'keyboard-inset' && typeof globalThis.navigator.virtualKeyboard !== 'undefined')
        return createVirtualKeyboardObserver();
    if (preset === 'viewport-segment')
        return createViewportSegmentObserver();
    var environmentMap = ENV_PRESETS[preset];
    var attributes = keys(environmentMap);
    var support = getSupportedEnvironment();
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
        var envVar = environmentMap[attribute];
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
            for (var i = 0; i < attributes.length; i++)
                elementComputedStyle[attributes[i]] = 0;
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
    function useCssVariable(prefix) {
        if (typeof support === 'undefined' || typeof globalThis.document === 'undefined')
            return noop;
        var element = globalThis.document.documentElement;
        function applyValues(values) {
            for (var i = 0; i < attributes.length; i++) {
                var attribute = attributes[i];
                element.style.setProperty('--' + prefix + '-' + String(attributes[i]), values[attribute] + 'px');
            }
        }
        var unsubscribe = onChangeSubscriptionManager.subscribe(function (values) {
            applyValues(values);
        });
        applyValues(readValues());
        return function () {
            unsubscribe();
            for (var i = 0; i < attributes.length; i++)
                element.style.removeProperty('--' + prefix + '-' + String(attributes[i]));
        };
    }
    return {
        get value() {
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
        },
        useCssVariable: useCssVariable
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

var PermissionNotGrantedError = createCustomError('PermissionNotGrantedError');

var NotSupportedError = createCustomError('NotSupportedError');

var safeAreaInsetObserver = createEnvironmentObserver('safe-area-inset');
var safeAreaMaxInsetObserver = createEnvironmentObserver('safe-area-max-inset');
var keyboardInsetObserver = createEnvironmentObserver('keyboard-inset');
var titlebarAreaObserver = createEnvironmentObserver('titlebar-area');
var viewportSegmentObserver = createEnvironmentObserver('viewport-segment');
var onDimensionChangeSubscriptionManager = createSubscriptionManager(attachOnDimensionChange, detachOnDimensionChange);
var onScreenOrientationChangeSubscriptionManager = createSubscriptionManager(attachOnScreenOrientationChange, detachOnScreenOrientationChange);
var onDeviceOrientationChangeSubscriptionManager = createSubscriptionManager(attachOnDeviceOrientationChange, detachOnDeviceOrientationChange);
var dimensionRef = null;
var screenOrientationRef = null;
var deviceOrientationRef = null;
var Dimension = {
    get value() {
        return getDimension();
    },
    environment: getEnvironment(),
    screenOrientation: getScreenOrientation(),
    deviceOrientation: getDeviceOrientation(),
    onChange: onDimensionChangeSubscriptionManager.subscribe,
    Constants: {
        Orientation: Orientation,
    },
    Errors: {
        NotSupportedError: NotSupportedError,
        PermissionNotGrantedError: PermissionNotGrantedError,
    },
};
function getOrientation() {
    if (typeof globalThis.screen !== 'undefined' && typeof globalThis.screen.orientation !== 'undefined' && typeof globalThis.screen.orientation.type !== 'undefined') {
        switch (globalThis.screen.orientation.type) {
            case 'portrait-primary':
                return Orientation.PortraitPrimary;
            case 'portrait-secondary':
                return Orientation.PortraitSecondary;
            case 'landscape-primary':
                return Orientation.LandscapePrimary;
            case 'landscape-secondary':
                return Orientation.LandscapeSecondary;
        }
    }
    if (typeof globalThis.orientation !== 'undefined') {
        switch (globalThis.orientation) {
            case 0:
                return Orientation.PortraitPrimary;
            case 180:
                return Orientation.PortraitSecondary;
            case 90:
                return Orientation.LandscapePrimary;
            case -90:
            case 270:
                return Orientation.LandscapeSecondary;
        }
    }
    if (ORIENTATION_MEDIA_QUERY_LIST.media === 'not all')
        throw new NotSupportedError('\'screen.orientation\', \'window.orientation\', and the orientation media query are all unsupported');
    if (ORIENTATION_MEDIA_QUERY_LIST.matches)
        return Orientation.PortraitPrimary;
    else
        return Orientation.LandscapePrimary;
}
function getScale() {
    if (typeof globalThis.devicePixelRatio !== 'undefined')
        return globalThis.devicePixelRatio;
    return -1;
}
function getEnvironment() {
    return {
        safeAreaInset: safeAreaInsetObserver,
        safeAreaMaxInset: safeAreaMaxInsetObserver,
        keyboardInset: keyboardInsetObserver,
        titlebarArea: titlebarAreaObserver,
        viewportSegment: viewportSegmentObserver,
    };
}
function getScreenOrientation() {
    return {
        get supported() {
            return screenOrientationSupported();
        },
        get value() {
            return getOrientation();
        },
        onChange: onScreenOrientationChangeSubscriptionManager.subscribe,
    };
}
function getDeviceOrientation() {
    return {
        get supported() {
            return deviceOrientationSupported();
        },
        get value() {
            return getDeviceOrientationValue();
        },
        onChange: onDeviceOrientationChangeSubscriptionManager.subscribe,
    };
}
function getDimension() {
    var innerWidth = 0;
    var innerHeight = 0;
    var outerWidth = 0;
    var outerHeight = 0;
    var scale = getScale();
    if (typeof globalThis.innerWidth !== 'undefined') {
        innerWidth = globalThis.innerWidth;
        innerHeight = globalThis.innerHeight;
        outerWidth = globalThis.outerWidth;
        outerHeight = globalThis.outerHeight;
    }
    return {
        innerWidth: innerWidth,
        innerHeight: innerHeight,
        outerWidth: outerWidth,
        outerHeight: outerHeight,
        scale: scale,
    };
}
function attachOnDimensionChange() {
    dimensionRef = getDimension();
    EventListener.add(globalThis, { type: 'resize', callback: onDimensionChange });
}
function detachOnDimensionChange() {
    dimensionRef = null;
    EventListener.remove(globalThis, { type: 'resize', callback: onDimensionChange });
}
function onDimensionChange() {
    var dimension = getDimension();
    if (dimensionRef === null || dimension.innerWidth !== dimensionRef.innerWidth || dimension.innerHeight !== dimensionRef.innerHeight || dimension.outerWidth !== dimensionRef.outerWidth || dimension.outerHeight !== dimensionRef.outerHeight || dimension.scale !== dimensionRef.scale)
        onDimensionChangeSubscriptionManager.emit(dimensionRef = dimension);
}
function screenOrientationSupported() {
    if (typeof globalThis.screen !== 'undefined' && typeof globalThis.screen.orientation !== 'undefined' && typeof globalThis.screen.orientation.type !== 'undefined')
        return true;
    if (typeof globalThis.orientation !== 'undefined')
        return true;
    return ORIENTATION_MEDIA_QUERY_LIST.media !== 'not all';
}
function attachOnScreenOrientationChange() {
    if (typeof globalThis.screen !== 'undefined' && typeof globalThis.screen.orientation !== 'undefined' && typeof globalThis.screen.orientation.addEventListener === 'function')
        return EventListener.add(globalThis.screen.orientation, {
            type: 'change',
            callback: onScreenOrientationChange
        });
    else if (typeof globalThis.orientation !== 'undefined')
        return EventListener.add(globalThis, { type: 'orientationchange', callback: onScreenOrientationChange });
    else if (ORIENTATION_MEDIA_QUERY_LIST.media !== 'not all')
        return EventListener.add(ORIENTATION_MEDIA_QUERY_LIST, { type: 'change', callback: onScreenOrientationChange });
    throw new NotSupportedError('\'screen.orientation\', \'window.orientation\', and the orientation media query are all unsupported');
}
function detachOnScreenOrientationChange() {
    if (typeof globalThis.screen !== 'undefined' && typeof globalThis.screen.orientation !== 'undefined' && typeof globalThis.screen.orientation.removeEventListener === 'function')
        return EventListener.remove(globalThis.screen.orientation, {
            type: 'change',
            callback: onScreenOrientationChange
        });
    else if (typeof globalThis.orientation !== 'undefined')
        return EventListener.remove(globalThis, { type: 'orientationchange', callback: onScreenOrientationChange });
    else if (ORIENTATION_MEDIA_QUERY_LIST.media !== 'not all')
        return EventListener.remove(ORIENTATION_MEDIA_QUERY_LIST, { type: 'change', callback: onScreenOrientationChange });
    throw new NotSupportedError('\'screen.orientation\', \'window.orientation\', and the orientation media query are all unsupported');
}
function onScreenOrientationChange() {
    var orientation = getOrientation();
    if (screenOrientationRef === null || orientation !== screenOrientationRef)
        onScreenOrientationChangeSubscriptionManager.emit(screenOrientationRef = orientation);
}
function deviceOrientationSupported() {
    return typeof globalThis.DeviceOrientationEvent !== 'undefined';
}
function attachOnDeviceOrientationChange() {
    return new Promise(function (resolve, reject) {
        if (!deviceOrientationSupported())
            return reject(new NotSupportedError('\'window.DeviceOrientationEvent\' does not supported.'));
        var DeviceOrientationEventWithPermission = DeviceOrientationEvent;
        if (typeof DeviceOrientationEventWithPermission.requestPermission === 'function') {
            DeviceOrientationEventWithPermission.requestPermission().then(function (permission) {
                if (permission === 'granted') {
                    EventListener.add(globalThis, { type: 'deviceorientation', callback: onDeviceOrientationChange });
                    return resolve();
                }
                return reject(new PermissionNotGrantedError('\'deviceorientation\' permission is not granted.'));
            }).catch(function (_) {
                return reject(new NotSupportedError('\'window.DeviceOrientationEvent\' does not supported.'));
            });
        }
        else {
            EventListener.add(globalThis, { type: 'deviceorientation', callback: onDeviceOrientationChange });
            return resolve();
        }
    });
}
function detachOnDeviceOrientationChange() {
    EventListener.remove(globalThis, { type: 'deviceorientation', callback: onDeviceOrientationChange });
}
function onDeviceOrientationChange(event) {
    deviceOrientationRef = {
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma,
        absolute: event.absolute,
    };
    onDeviceOrientationChangeSubscriptionManager.emit(deviceOrientationRef);
}
function getDeviceOrientationValue() {
    return new Promise(function (resolve, reject) {
        if (deviceOrientationRef !== null)
            return resolve(deviceOrientationRef);
        if (!deviceOrientationSupported())
            return reject(new NotSupportedError('\'window.DeviceOrientationEvent\' does not supported.'));
        var DeviceOrientationEventWithPermission = DeviceOrientationEvent;
        var callback = function (event) {
            var value = {
                alpha: event.alpha,
                beta: event.beta,
                gamma: event.gamma,
                absolute: event.absolute,
            };
            deviceOrientationRef = value;
            EventListener.remove(globalThis, { type: 'deviceorientation', callback: callback });
            return resolve(value);
        };
        if (typeof DeviceOrientationEventWithPermission.requestPermission === 'function') {
            DeviceOrientationEventWithPermission.requestPermission().then(function (permission) {
                if (permission === 'granted') {
                    EventListener.add(globalThis, { type: 'deviceorientation', callback: callback });
                    return;
                }
                return reject(new PermissionNotGrantedError('\'deviceorientation\' permission is not granted.'));
            }).catch(function (_) {
                return reject(new NotSupportedError('\'window.DeviceOrientationEvent\' does not supported.'));
            });
        }
        else {
            EventListener.add(globalThis, { type: 'deviceorientation', callback: callback });
            return;
        }
    });
}

export { DEVICE_POSTURE_MEDIA_QUERY_LIST, ENV_PRESETS, ORIENTATION_MEDIA_QUERY_LIST, Orientation, Dimension as default };
