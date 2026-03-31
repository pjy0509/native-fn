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
        return supported();
    },
    request: request,
    check: check,
    Constants: {
        PermissionType: PermissionType,
        PermissionState: PermissionState,
    },
    Errors: {},
};
function supported() {
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

export { GET_USER_MEDIA, PermissionState, PermissionType, Permission as default };
