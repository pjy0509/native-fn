import { NotSupportedError } from "../../../errors/not-supported-error";
import { InvalidStateError } from "../../../errors/invalid-state-error";
export declare interface FullscreenInstance {
    get supported(): boolean;
    get element(): Element | null;
    get isActive(): boolean;
    request(target?: Element, options?: FullscreenOptions): Promise<void>;
    toggle(target?: Element, options?: FullscreenOptions): Promise<void>;
    exit(): Promise<void>;
    onChange(listener: (payload: FullscreenEventPayload) => void, options?: AddEventListenerOptions): () => void;
    onChange(target: Element, listener: (payload: FullscreenEventPayload) => void, options?: AddEventListenerOptions): () => void;
    onError(listener: (payload: FullscreenEventPayload) => void, options?: AddEventListenerOptions): () => void;
    onChange(target: Element, listener: (payload: FullscreenEventPayload) => void, options?: AddEventListenerOptions): () => void;
    readonly Constants: {};
    readonly Errors: {
        readonly NotSupportedError: typeof NotSupportedError;
        readonly InvalidStateError: typeof InvalidStateError;
    };
}
export declare interface FullscreenEventPayload {
    readonly nativeEvent: Event;
    readonly element: Element;
    readonly isActive: boolean;
}
