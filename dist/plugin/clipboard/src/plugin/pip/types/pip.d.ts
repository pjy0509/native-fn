import { NotSupportedError } from "../../../errors/not-supported-error";
export declare interface PipInstance {
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
