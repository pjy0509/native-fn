declare global {
    interface Navigator {
        getUserMedia?(constraints?: MediaStreamConstraints): Promise<MediaStream>;
        webkitGetUserMedia?(constraints: MediaStreamConstraints, successCallback: (stream: MediaStream) => void, errorCallback: (error: DOMException) => void): void;
        mozGetUserMedia?(constraints: MediaStreamConstraints, successCallback: (stream: MediaStream) => void, errorCallback: (error: DOMException) => void): void;
        msGetUserMedia?(constraints: MediaStreamConstraints, successCallback: (stream: MediaStream) => void, errorCallback: (error: DOMException) => void): void;
    }
}

export enum PermissionType {
    Notification = 'notifications',
    Geolocation = 'geolocation',
    Camera = 'camera',
    ClipboardRead = 'clipboard-read',
    Microphone = 'microphone',
    MIDI = 'midi',
}

export enum PermissionState {
    Grant = 'grant',
    Denied = 'denied',
    Prompt = 'prompt',
    Unsupported = 'unsupported',
}

export const GET_USER_MEDIA: ((constraints?: MediaStreamConstraints) => Promise<MediaStream>) | undefined = (function (): ((constraints?: MediaStreamConstraints) => Promise<MediaStream>) | undefined {
    if (typeof globalThis.navigator.mediaDevices !== 'undefined' && typeof globalThis.navigator.mediaDevices.getUserMedia !== 'undefined') return globalThis.navigator.mediaDevices.getUserMedia.bind(globalThis.navigator.mediaDevices);

    const legacy: ((constraints: MediaStreamConstraints, successCallback: (stream: MediaStream) => void, errorCallback: (error: DOMException) => void) => void) | undefined = (function (): ((constraints: MediaStreamConstraints, successCallback: (stream: MediaStream) => void, errorCallback: (error: DOMException) => void) => void) | undefined {
        if (typeof globalThis.navigator.getUserMedia !== 'undefined') return globalThis.navigator.getUserMedia;
        if (typeof globalThis.navigator.webkitGetUserMedia !== 'undefined') return globalThis.navigator.webkitGetUserMedia;
        if (typeof globalThis.navigator.mozGetUserMedia !== 'undefined') return globalThis.navigator.mozGetUserMedia;
        if (typeof globalThis.navigator.msGetUserMedia !== 'undefined') return globalThis.navigator.msGetUserMedia;
    })();

    if (typeof legacy !== 'undefined') {
        return function legacyUserMedia(constraints: MediaStreamConstraints = {}) {
            return new Promise((resolve: (stream: MediaStream) => void, reject: (error: DOMException) => void) => {
                legacy.call(globalThis.navigator, constraints, resolve, reject);
            });
        }
    }
})();
