import {EventListenerOptions, EventListenerInstance, IEWrapperRecord, IEWrapper, EventTargetLike, MediaQueryListWrapper, MediaQueryListWrapperRecord, MediaQueryListCallback, AnyCallback} from "../types/event-listener";

const IE_WRAPPER_STORE: IEWrapperRecord[] = [];
const MEDIA_QUERY_LIST_WRAPPER_STORE: MediaQueryListWrapperRecord[] = [];

function isEventListenerCallback(callback: AnyCallback): callback is EventListenerOrEventListenerObject {
    return (
        typeof callback === 'function' ||
        (typeof callback === 'object' && callback !== null && typeof callback.handleEvent === 'function')
    );
}

function isMediaQueryListTarget(target: EventTargetLike): target is MediaQueryList & EventTargetLike {
    return typeof target.media === 'string' && typeof target.matches === 'boolean';
}

function findIEWrapper(target: EventTargetLike, type: string, callback: AnyCallback): IEWrapper | undefined {
    for (let i: number = 0; i < IE_WRAPPER_STORE.length; i++) {
        const wrapper: IEWrapperRecord = IE_WRAPPER_STORE[i];

        if (wrapper.target === target && wrapper.type === type && wrapper.callback === callback) return wrapper.wrapper;
    }

    return undefined;
}

function setIEWrapper(target: EventTargetLike, type: string, callback: AnyCallback, wrapper: IEWrapper): void {
    IE_WRAPPER_STORE.push({target, type, callback, wrapper});
}

function removeIEWrapper(target: EventTargetLike, type: string, callback: AnyCallback): IEWrapper | undefined {
    for (let i: number = 0; i < IE_WRAPPER_STORE.length; i++) {
        const wrapper: IEWrapperRecord = IE_WRAPPER_STORE[i];

        if (wrapper.target === target && wrapper.type === type && wrapper.callback === callback) {
            IE_WRAPPER_STORE.splice(i, 1);

            return wrapper.wrapper;
        }
    }

    return undefined;
}

function findMediaQueryListWrapper(target: MediaQueryList, type: string, callback: AnyCallback): MediaQueryListWrapper | undefined {
    for (let i: number = 0; i < MEDIA_QUERY_LIST_WRAPPER_STORE.length; i++) {
        const wrapper: MediaQueryListWrapperRecord = MEDIA_QUERY_LIST_WRAPPER_STORE[i];

        if (wrapper.target === target && wrapper.type === type && wrapper.callback === callback) return wrapper.wrapper;
    }

    return undefined;
}

function setMediaQueryListWrapper(target: MediaQueryList, type: string, callback: AnyCallback, wrapper: MediaQueryListWrapper): void {
    MEDIA_QUERY_LIST_WRAPPER_STORE.push({target, type, callback, wrapper});
}

function removeMediaQueryListWrapper(target: MediaQueryList, type: string, callback: AnyCallback): MediaQueryListWrapper | undefined {
    for (let i: number = 0; i < MEDIA_QUERY_LIST_WRAPPER_STORE.length; i++) {
        const wrapper: MediaQueryListWrapperRecord = MEDIA_QUERY_LIST_WRAPPER_STORE[i];

        if (wrapper.target === target && wrapper.type === type && wrapper.callback === callback) {
            MEDIA_QUERY_LIST_WRAPPER_STORE.splice(i, 1);

            return wrapper.wrapper;
        }
    }

    return undefined;
}

function createMediaQueryListWrapper(callback: AnyCallback): MediaQueryListWrapper {
    return function (this: MediaQueryList, event: MediaQueryListEvent): void {
        if (typeof callback === 'function') {
            (callback as MediaQueryListCallback).call(this, event);
        } else if (callback && typeof (callback as EventListenerObject).handleEvent === 'function') {
            (callback as EventListenerObject).handleEvent(event);
        }
    };
}

function capitalize(_: string, ...groups: string[]): string {
    let result: string = '';

    for (let i: number = 0; i < groups.length - 2; i++) {
        const arg: string | undefined = groups[i];

        if (typeof arg !== 'undefined') result = result + arg.charAt(0).toUpperCase() + arg.slice(1);
    }

    return result;
}

function withVendor(target: EventTargetLike, type: string): string {
    if (target === globalThis.document && ['deviceready', 'pause', 'resume', 'backbutton', 'menubutton', 'searchbutton', 'startcallbutton', 'endcallbutton', 'volumedownbutton', 'volumeupbutton', 'activated', 'cordovacallbackerror'].indexOf(type) > -1) return type;
    if (typeof target.webkitEnterFullscreen === 'function' && ['webkitbeginfullscreen', 'webkitendfullscreen', 'webkitpresentationmodechanged'].indexOf(type) > -1) return type;

    let types: string[];

    if (typeof LEGACY_TYPE_MAP[type] !== 'undefined') types = LEGACY_TYPE_MAP[type];
    else if (EVENT_TYPE_REGEXP.test(type)) types = [type, type.replace(EVENT_TYPE_REGEXP, capitalize)];
    else types = [type];

    for (let i: number = 0; i < VENDORS.length; i++) {
        for (let j: number = 0; j < types.length; j++) {
            const name: string = VENDORS[i] + types[j];

            if (typeof (target as unknown as Record<string, unknown>)['on' + name] !== 'undefined') return name;
        }
    }

    return type;
}

function preventDefaultPolyfill(this: Event): void {
    this.returnValue = false;
}

function stopPropagationPolyfill(this: Event): void {
    this.cancelBubble = true;
}

const EVENT_TYPE_REGEXP: RegExp = /(animation)(start|iteration|end|cancel)|(transition)(start|run|end|cancel)|(fullscreen)(change|error)|(lost|got)(pointer)(capture)|(pointer)(lock)(change|error)|(pointer)(cancel|down|enter|leave|move|out|over|up)/i;
const VENDORS: string[] = ['', 'webkit', 'moz', 'ms', 'MS', 'o', 'O'];
const LEGACY_TYPE_MAP: Record<string, string[]> = {
    'wheel': ['wheel', 'mousewheel', 'DOMMouseScroll'],
    'focus': ['focus', 'focusin'],
    'blur': ['blur', 'focusout'],
    'beforeinput': ['beforeinput', 'textInput'],
};

const EventListener: EventListenerInstance = {
    useStd: typeof globalThis.document.addEventListener === 'function',

    add: function (target: EventTargetLike | undefined, eventListenerOptions: EventListenerOptions): void {
        if (typeof eventListenerOptions.type === 'undefined') return;
        if (typeof target === 'undefined') return;

        const callback: AnyCallback = eventListenerOptions.callback;
        const type: string = withVendor(target, eventListenerOptions.type);
        const options: AddEventListenerOptions | boolean | undefined = eventListenerOptions.options;

        if (isMediaQueryListTarget(target)) {
            if (typeof target.addListener === 'function') {
                try {
                    let wrapper: MediaQueryListWrapper | undefined = findMediaQueryListWrapper(target as MediaQueryList, type, callback);

                    if (typeof wrapper === 'undefined') {
                        setMediaQueryListWrapper(target as MediaQueryList, type, callback, wrapper = createMediaQueryListWrapper(callback));
                    }

                    return target.addListener(wrapper);
                } catch (_: unknown) {
                }
            }
        }

        if (typeof target.addEventListener === 'function') {
            try {
                if (isEventListenerCallback(callback)) {
                    return target.addEventListener(type, callback, options);
                }
            } catch (_: unknown) {
            }
        }

        if (typeof target.attachEvent === 'function') {
            const existing: IEWrapper | undefined = findIEWrapper(target, type, callback);

            if (typeof existing === 'function') return;

            const wrapper: IEWrapper = function (event: Event | undefined): void {
                if (typeof event === 'undefined') event = globalThis.event;
                if (typeof event === 'undefined') return;

                try {
                    Object.defineProperty(event, 'currentTarget', {value: target, configurable: true});
                } catch (_: unknown) {
                }

                if (typeof event.preventDefault !== 'function') event.preventDefault = preventDefaultPolyfill.bind(event);
                if (typeof event.stopPropagation !== 'function') event.stopPropagation = stopPropagationPolyfill.bind(event);

                if (typeof callback === 'function') callback.call(target as unknown as MediaQueryList, event as unknown as MediaQueryListEvent);
                else if (callback && typeof (callback as EventListenerObject).handleEvent === 'function') (callback as EventListenerObject).handleEvent(event);
            };

            setIEWrapper(target, type, callback, wrapper);

            return target.attachEvent('on' + type, wrapper);
        }
    },

    remove: function (target: EventTargetLike | undefined, eventListenerOptions: EventListenerOptions): void {
        if (typeof eventListenerOptions.type === 'undefined') return;
        if (typeof target === 'undefined') return;

        const callback: AnyCallback = eventListenerOptions.callback;
        const type: string = withVendor(target, eventListenerOptions.type);
        const options: AddEventListenerOptions | boolean | undefined = eventListenerOptions.options;

        if (isMediaQueryListTarget(target)) {
            if (typeof target.removeListener === 'function') {
                try {
                    const wrapper: MediaQueryListWrapper | undefined = removeMediaQueryListWrapper(target as MediaQueryList, type, callback);

                    if (typeof wrapper === 'function') return target.removeListener(wrapper);
                } catch (_: unknown) {
                }
            }

            return;
        }

        if (typeof target.removeEventListener === 'function') {
            try {
                if (isEventListenerCallback(callback)) {
                    return target.removeEventListener(type, callback, options);
                }
            } catch (_: unknown) {
            }
        }

        if (typeof target.detachEvent === 'function') {
            const wrapper: IEWrapper | undefined = removeIEWrapper(target, type, callback);

            if (typeof wrapper === 'function') target.detachEvent('on' + type, wrapper);

            return;
        }
    },
};

export default EventListener;
