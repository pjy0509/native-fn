declare const NotSupportedError: ErrorConstructor;

declare const InvalidStateError: ErrorConstructor;

declare interface PipInstance {
    get supported(): boolean;
    get element(): HTMLVideoElement | null;
    get isPip(): boolean;
    request(target?: HTMLVideoElement): Promise<void>;
    exit(): Promise<void>;
    onChange(listener: (payload: PipEventPayload) => void, options?: AddEventListenerOptions): () => void;
    onError(listener: (payload: PipEventPayload) => void, options?: AddEventListenerOptions): () => void;
    Constants: {};
    Errors: {
        NotSupportedError: typeof NotSupportedError;
        InvalidStateError: typeof InvalidStateError;
    };
}
declare interface PipEventPayload {
    nativeEvent: Event;
    element: HTMLVideoElement;
    isPip: boolean;
}

declare global {
    interface HTMLVideoElement {
        webkitSupportsPresentationMode?(mode: string): boolean;
        webkitSetPresentationMode?(mode: string): void;
        webkitPresentationMode?: string;
        onwebkitpresentationmodechanged?: ((this: Element, ev: Event) => any) | null;
    }
    var __nativeFnPipBridgeKey__: symbol | undefined;
}
declare const Pip: PipInstance;

export { Pip as default };
export type { PipEventPayload, PipInstance };
