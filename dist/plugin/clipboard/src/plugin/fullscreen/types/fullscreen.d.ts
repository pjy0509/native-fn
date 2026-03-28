import { NotSupportedError } from "../../../errors/not-supported-error";
export declare interface FullscreenInstance {
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
