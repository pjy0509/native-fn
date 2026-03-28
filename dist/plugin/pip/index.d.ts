declare const NotSupportedError: ErrorConstructor;

declare interface PipInstance {
    supported: boolean;
    element: HTMLVideoElement | null;
    isPip: boolean;
    request(target?: HTMLVideoElement): Promise<void>;
    exit(): Promise<void>;
    toggle(target?: HTMLVideoElement): Promise<void>;
    onChange(listener: (event: Event) => void, options?: AddEventListenerOptions): () => void;
    onError(listener: (event: Event) => void, options?: AddEventListenerOptions): () => void;
    Constants: {};
    Errors: {
        NotSupportedError: typeof NotSupportedError;
    };
}

declare global {
    interface HTMLVideoElement {
        webkitSupportsPresentationMode?: (mode: string) => boolean;
        webkitSetPresentationMode?: (mode: string) => void;
        webkitPresentationMode?: string;
        onwebkitpresentationmodechanged?: ((this: HTMLVideoElement, ev: Event) => any) | null;
        [key: symbol]: boolean | undefined;
    }
}
declare const _default: PipInstance;

export { _default as default };
export type { PipInstance };
