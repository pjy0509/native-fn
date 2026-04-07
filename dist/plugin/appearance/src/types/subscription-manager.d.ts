export declare interface SubscriptionManager<T> {
    emit: (value: T) => void;
    subscribe: (listener: (value: T) => void, options?: AddEventListenerOptions) => () => void;
}
