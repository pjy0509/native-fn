import { Appearances } from "../constants";
export declare interface AppearanceInstance {
    get value(): Appearances;
    onChange(listener: (appearance: Appearances) => void, options?: AddEventListenerOptions): () => void;
    readonly Constants: {
        readonly Appearances: typeof Appearances;
    };
    readonly Errors: {};
}
