declare global {
    interface Navigator {
        getUserMedia?(constraints?: MediaStreamConstraints): Promise<MediaStream>;
        webkitGetUserMedia?(constraints: MediaStreamConstraints, successCallback: (stream: MediaStream) => void, errorCallback: (error: DOMException) => void): void;
        mozGetUserMedia?(constraints: MediaStreamConstraints, successCallback: (stream: MediaStream) => void, errorCallback: (error: DOMException) => void): void;
        msGetUserMedia?(constraints: MediaStreamConstraints, successCallback: (stream: MediaStream) => void, errorCallback: (error: DOMException) => void): void;
    }
}
export declare enum PermissionType {
    Notification = "notifications",
    Geolocation = "geolocation",
    Camera = "camera",
    ClipboardRead = "clipboard-read",
    Microphone = "microphone",
    MIDI = "midi"
}
export declare enum PermissionState {
    Grant = "grant",
    Denied = "denied",
    Prompt = "prompt",
    Unsupported = "unsupported"
}
export declare const GET_USER_MEDIA: ((constraints?: MediaStreamConstraints) => Promise<MediaStream>) | undefined;
