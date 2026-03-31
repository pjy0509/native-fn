import { NotSupportedError } from "../../../errors/not-supported-error";
import { InvalidStateError } from "../../../errors/invalid-state-error";
export declare interface FullscreenInstance {
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
export declare interface FullscreenEventPayload {
    nativeEvent: Event;
    element: Element;
    isFullscreen: boolean;
}
