import {Appearances} from "../constants";

export declare interface AppearanceInstance {
    get value(): Appearances;

    onChange(listener: (appearance: Appearances) => void, options?: AddEventListenerOptions): () => void;

    Constants: {
        Appearances: typeof Appearances;
    };
    Errors: {};
}
