export declare interface ListenerEntry<T> {
    fn: (appearance: T) => any;
    once: boolean;
    signal?: AbortSignal;
}
