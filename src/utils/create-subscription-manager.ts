import {ListenerEntry} from "../types/listener-entry";
import EventListener from "./event-listener";
import {SubscriptionManager} from "../types/subscription-manager";

export default function createSubscriptionManager<T>(attach: () => void, detach: () => void): SubscriptionManager<T> {
    const entries: ListenerEntry<T>[] = [];

    function removeEntry(entry: ListenerEntry<T>): void {
        const index: number = indexOfEntry(entry);

        if (index !== -1) {
            entries.splice(index, 1);

            if (entries.length === 0) detach();
        }
    }

    function indexOfEntry(entry: ListenerEntry<T>): number {
        for (let i: number = 0; i < entries.length; i++) if (entries[i].fn === entry.fn) return i;

        return -1;
    }

    return {
        emit: function (value: T): void {
            const snapshot: ListenerEntry<T>[] = entries.slice();

            for (let i: number = 0; i < snapshot.length; i++) {
                snapshot[i].fn(value);

                if (snapshot[i].once) removeEntry(snapshot[i]);
            }
        },
        subscribe: function (listener: (value: T) => void, options: AddEventListenerOptions = {}): () => void {
            if (typeof options.signal !== 'undefined' && options.signal.aborted) return function () {};

            const entry: ListenerEntry<T> = {fn: listener, once: false};

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
            };

            if (typeof entry.signal !== 'undefined') EventListener.add(entry.signal, {type: 'abort', callback: cleanup});

            return function unsubscribe(): void {
                removeEntry(entry);
            };
        }
    };
}
