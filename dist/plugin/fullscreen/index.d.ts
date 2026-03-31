declare const NotSupportedError: ErrorConstructor;

declare const InvalidStateError: ErrorConstructor;

declare interface FullscreenInstance {
    supported: boolean;
    element: Element | null;
    isFullscreen: boolean;
    request(target?: Element, options?: FullscreenOptions): Promise<void>;
    exit(): Promise<void>;
    onChange(listener: (payload: FullscreenEventPayload) => void, options?: AddEventListenerOptions): () => void;
    onError(listener: (payload: FullscreenEventPayload) => void, options?: AddEventListenerOptions): () => void;
    Constants: {};
    Errors: {
        NotSupportedError: typeof NotSupportedError;
        InvalidStateError: typeof InvalidStateError;
    };
}
declare interface FullscreenEventPayload {
    nativeEvent: Event;
    element: Element;
    isFullscreen: boolean;
}

declare global {
    interface HTMLVideoElement {
        webkitEnterFullscreen?: () => void;
        webkitExitFullscreen?: () => void;
        webkitSupportsFullscreen?: boolean;
        webkitDisplayingFullscreen?: boolean;
        onwebkitbeginfullscreen?: ((this: HTMLVideoElement, ev: Event) => any) | null;
        onwebkitendfullscreen?: ((this: HTMLVideoElement, ev: Event) => any) | null;
    }
    interface Document {
        readonly fullscreenEnabled: boolean;
        fullscreenElement?: Element | null;
        exitFullscreen: () => Promise<void>;
        readonly webkitFullscreenEnabled?: boolean;
        webkitFullscreenElement?: Element | null;
        webkitCurrentFullScreenElement?: Element | null;
        webkitExitFullscreen?: () => Promise<void>;
        webkitCancelFullScreen?: () => Promise<void>;
        readonly mozFullScreenEnabled?: boolean;
        mozFullScreenElement?: Element | null;
        mozCancelFullScreen?: () => Promise<void>;
        readonly msFullscreenEnabled?: boolean;
        msFullscreenElement?: Element | null;
        msExitFullscreen?: () => Promise<void>;
    }
    interface Element {
        requestFullscreen: (options?: FullscreenOptions) => Promise<void>;
        webkitRequestFullscreen?: (options?: FullscreenOptions) => Promise<void>;
        webkitRequestFullScreen?: (options?: FullscreenOptions) => Promise<void>;
        mozRequestFullScreen?: () => Promise<void>;
        msRequestFullscreen?: () => Promise<void>;
    }
    var __nativeFnFsBridgeKey__: symbol | undefined;
}
declare const Fullscreen: FullscreenInstance;

export { Fullscreen as default };
export type { FullscreenEventPayload, FullscreenInstance };
