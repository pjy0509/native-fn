declare const NotSupportedError: ErrorConstructor;

declare interface FullscreenInstance {
    supported: boolean;
    element: Element | null;
    isFullscreen: boolean;
    request(target?: Element, options?: FullscreenOptions): Promise<void>;
    exit(): Promise<void>;
    toggle(target?: Element, options?: FullscreenOptions): Promise<void>;
    onChange(listener: (event: Event) => void, options?: AddEventListenerOptions): () => void;
    onError(listener: (event: Event) => void, options?: AddEventListenerOptions): () => void;
    Constants: {};
    Errors: {
        NotSupportedError: typeof NotSupportedError;
    };
}

declare global {
    interface HTMLVideoElement {
        webkitEnterFullscreen?: () => void;
        webkitExitFullscreen?: () => void;
        webkitSupportsFullscreen?: boolean;
        webkitDisplayingFullscreen?: boolean;
        onwebkitbeginfullscreen?: ((this: HTMLVideoElement, ev: Event) => any) | null;
        onwebkitendfullscreen?: ((this: HTMLVideoElement, ev: Event) => any) | null;
        [key: symbol]: boolean | undefined;
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
}
declare const _default: FullscreenInstance;

export { _default as default };
export type { FullscreenInstance };
