import {NotSupportedError} from "../../../errors/not-supported-error";
import {InvalidStateError} from "../../../errors/invalid-state-error";

export declare interface PipInstance {
    get supported(): boolean;

    get element(): HTMLVideoElement | null;

    get isActive(): boolean;

    request(target?: HTMLVideoElement): Promise<void>;

    exit(): Promise<void>;

    toggle(target?: HTMLVideoElement): Promise<void>;

    onChange(listener: (payload: PipEventPayload) => void, options?: AddEventListenerOptions): () => void;

    onChange(target: HTMLVideoElement, listener: (payload: PipEventPayload) => void, options?: AddEventListenerOptions): () => void;

    onError(listener: (payload: PipEventPayload) => void, options?: AddEventListenerOptions): () => void;

    onError(target: HTMLVideoElement, listener: (payload: PipEventPayload) => void, options?: AddEventListenerOptions): () => void;

    Constants: {};
    Errors: {
        NotSupportedError: typeof NotSupportedError,
        InvalidStateError: typeof InvalidStateError,
    };
}

export declare interface PipEventPayload {
    nativeEvent: Event;
    element: HTMLVideoElement;
    isActive: boolean;
}
