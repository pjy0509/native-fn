export declare interface SubscriptionManager<T, U> {
    emit: (value: U) => void;
    subscribe: (listener: (value: U) => void, options?: AddEventListenerOptions) => () => void;
}
