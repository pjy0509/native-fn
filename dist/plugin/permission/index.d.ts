declare global {
    interface Navigator {
        getUserMedia?(constraints?: MediaStreamConstraints): Promise<MediaStream>;
        webkitGetUserMedia?(constraints: MediaStreamConstraints, successCallback: (stream: MediaStream) => void, errorCallback: (error: DOMException) => void): void;
        mozGetUserMedia?(constraints: MediaStreamConstraints, successCallback: (stream: MediaStream) => void, errorCallback: (error: DOMException) => void): void;
        msGetUserMedia?(constraints: MediaStreamConstraints, successCallback: (stream: MediaStream) => void, errorCallback: (error: DOMException) => void): void;
    }
}
declare enum PermissionType {
    Notification = "notifications",
    Geolocation = "geolocation",
    Camera = "camera",
    ClipboardRead = "clipboard-read",
    Microphone = "microphone",
    MIDI = "midi"
}
declare enum PermissionState {
    Grant = "grant",
    Denied = "denied",
    Prompt = "prompt",
    Unsupported = "unsupported"
}
declare const GET_USER_MEDIA: ((constraints?: MediaStreamConstraints) => Promise<MediaStream>) | undefined;

declare interface PermissionInstance {
    get supported(): boolean;
    request(type: PermissionType): Promise<PermissionState>;
    check(type: PermissionType): Promise<PermissionState>;
    Constants: {
        PermissionType: typeof PermissionType;
        PermissionState: typeof PermissionState;
    };
    Errors: {};
}

declare const Permission: PermissionInstance;

export { GET_USER_MEDIA, PermissionState, PermissionType, Permission as default };
export type { PermissionInstance };
