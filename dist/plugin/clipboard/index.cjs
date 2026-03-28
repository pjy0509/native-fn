'use strict';

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

module.exports = Clipboard;
