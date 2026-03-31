import {BadgeInstance} from "../types";
import {NotSupportedError} from "../../../errors/not-supported-error";

const Badge: BadgeInstance = {
    get supported(): boolean {
        return supported();
    },
    set: set,
    clear: clear,
    Constants: {},
    Errors: {
        NotSupportedError: NotSupportedError,
    },
};

function set(this: BadgeInstance, contents: number): Promise<void> {
    if (supported()) return globalThis.navigator.setAppBadge(contents);
    return Promise.reject(new NotSupportedError('\'navigator.setAppBadge\' does not supported.'));
}

function clear(this: BadgeInstance): Promise<void> {
    return this.set(0);
}

function supported(): boolean {
    return typeof globalThis.navigator.setAppBadge !== 'undefined';
}

export default Badge;
