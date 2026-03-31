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
    request: request,
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
function request(type) {
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

var Notification = {
    send: send,
    get supported() {
        return supported();
    },
    Constants: {},
    Errors: {
        NotSupportedError: NotSupportedError,
        PermissionNotGrantedError: PermissionNotGrantedError,
    },
};
function send(options) {
    return new Promise(function (resolve, reject) {
        if (!supported())
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
function supported() {
    return typeof globalThis.Notification !== 'undefined';
}

module.exports = Notification;
