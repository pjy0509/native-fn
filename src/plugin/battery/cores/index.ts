import {BatteryInstance, BatteryManager} from "../types";
import {NotSupportedError} from "../../../errors/not-supported-error";
import {SubscriptionManager} from "../../../types/subscription-manager";
import createSubscriptionManager from "../../../utils/create-subscription-manager";
import EventListener from "../../../utils/event-listener";

const onChangeSubscriptionManager: SubscriptionManager<BatteryInstance, BatteryManager> = createSubscriptionManager<BatteryInstance, BatteryManager>(attachOnChange, detachOnChange);
let batteryRef: BatteryManager | null = null;

const Battery: BatteryInstance = {
    get supported(): boolean {
        return supported();
    },
    get value(): Promise<BatteryManager> {
        return getValue();
    },
    onChange: onChangeSubscriptionManager.subscribe,
    Constants: {},
    Errors: {
        NotSupportedError: NotSupportedError,
    },
};

function getValue(): Promise<BatteryManager> {
    return new Promise(function (resolve: (battery: BatteryManager) => void, reject: (error: Error) => void): void {
        if (!supported()) return reject(new NotSupportedError('\'navigator.getBattery\' does not supported.'));

        globalThis.navigator.getBattery()
            .then(resolve);
    });
}

function attachOnChange(): void {
    if (!supported()) return;

    globalThis.navigator.getBattery()
        .then(function (battery: BatteryManager): void {
            batteryRef = battery;

            EventListener.add(battery, {type: 'chargingchange', callback: onBatteryChange});
            EventListener.add(battery, {type: 'levelchange', callback: onBatteryChange});
            EventListener.add(battery, {type: 'chargingtimechange', callback: onBatteryChange});
            EventListener.add(battery, {type: 'dischargingtimechange', callback: onBatteryChange});
        });
}

function detachOnChange(): void {
    if (!supported() || batteryRef === null) return;

    EventListener.remove(batteryRef, {type: 'chargingchange', callback: onBatteryChange});
    EventListener.remove(batteryRef, {type: 'levelchange', callback: onBatteryChange});
    EventListener.remove(batteryRef, {type: 'chargingtimechange', callback: onBatteryChange});
    EventListener.remove(batteryRef, {type: 'dischargingtimechange', callback: onBatteryChange});

    batteryRef = null;
}

function onBatteryChange(): void {
    onChangeSubscriptionManager.emit(batteryRef!);
}

function supported(): boolean {
    return typeof globalThis.navigator.getBattery !== 'undefined';
}

export default Battery;
