import {ListenerEntry} from "../types/listener-entry";
import EventListener from "./event-listener";
import {SubscriptionManager} from "../types/subscription-manager";

export default function createSubscriptionManager<T, U>(attach: () => void, detach: () => void): SubscriptionManager<T, U> {
    const entries: ListenerEntry<U>[] = [];

    function removeEntry(entry: ListenerEntry<U>): void {
        const index: number = indexOfEntry(entry);

        if (index !== -1) {
            entries.splice(index, 1);

            if (entries.length === 0) detach();
        }
    }

    function indexOfEntry(entry: ListenerEntry<U>): number {
        for (let i: number = 0; i < entries.length; i++) if (entries[i].fn === entry.fn) return i;

        return -1;
    }

    return {
        emit: function (value: U): void {
            const snapshot: ListenerEntry<U>[] = entries.slice();

            for (let i: number = 0; i < snapshot.length; i++) {
                snapshot[i].fn(value);

                if (snapshot[i].once) removeEntry(snapshot[i]);
            }
        },
        subscribe: function (this: T, listener: (value: U) => void, options: AddEventListenerOptions = {}): () => void {
            const entry: ListenerEntry<U> = {fn: listener, once: false};

            if (typeof options.once !== 'undefined') entry.once = options.once;
            if (typeof options.signal !== 'undefined') entry.signal = options.signal;

            const index: number = indexOfEntry(entry);

            if (index === -1) {
                entries.push(entry);

                if (entries.length === 1) attach();
            } else if (entries[index].once && !entry.once) {
                entries[index].once = false;
            }

            const cleanup: () => void = function () {
                EventListener.remove(entry.signal, {type: 'abort', callback: cleanup});
                removeEntry(entry);
            }

            if (typeof entry.signal !== 'undefined') {
                if (entry.signal.aborted) removeEntry(entry);
                else EventListener.add(entry.signal, {type: 'abort', callback: cleanup});
            }

            return function unsubscribe(): void {
                removeEntry(entry);
            };
        }
    }
}
