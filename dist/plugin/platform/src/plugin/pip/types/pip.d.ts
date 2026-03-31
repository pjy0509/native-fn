import { NotSupportedError } from "../../../errors/not-supported-error";
import { InvalidStateError } from "../../../errors/invalid-state-error";
export declare interface PipInstance {
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
export declare interface PipEventPayload {
    nativeEvent: Event;
    element: HTMLVideoElement;
    isPip: boolean;
}
