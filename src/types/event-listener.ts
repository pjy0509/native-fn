export type EventTargetLike = EventTarget & {
    attachEvent?(type: string, listener: (event: Event) => void): void;
    detachEvent?(type: string, listener: (event: Event) => void): void;
    webkitEnterFullscreen?(): void;

    media?: string;
    matches?: boolean | ((selectors: string) => boolean);
    addListener?(callback: MediaQueryListCallback | null): void;
    removeListener?(callback: MediaQueryListCallback | null): void;
};

export type MediaQueryListCallback = ((this: MediaQueryList, ev: MediaQueryListEvent) => any);

export type AnyCallback = EventListenerOrEventListenerObject | MediaQueryListCallback;

export declare interface EventListenerOptions<E extends Event = Event> {
    type?: string;
    callback: EventListenerOrEventListenerObject | MediaQueryListCallback | ((this: any, event: E) => void);
    options?: AddEventListenerOptions | boolean;
}

export interface EventListenerInstance {
    useStd: boolean;

    add<E extends Event = Event>(target: EventTargetLike | undefined, eventListenerOptions: EventListenerOptions<E>): void;
    remove<E extends Event = Event>(target: EventTargetLike | undefined, eventListenerOptions: EventListenerOptions<E>): void;
}

export type IEWrapper = (event: Event) => void;
export type IEWrapperRecord = {
    target: EventTarget;
    type: string;
    callback: AnyCallback;
    wrapper: IEWrapper;
};

export type MediaQueryListWrapper = (this: MediaQueryList, ev: MediaQueryListEvent) => void;
export type MediaQueryListWrapperRecord = {
    target: MediaQueryList;
    type: string;
    callback: AnyCallback;
    wrapper: MediaQueryListWrapper;
};
