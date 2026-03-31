import {NotSupportedError} from "../../../errors/not-supported-error";

declare global {
    interface Navigator {
        getBattery(): Promise<BatteryManager>;
    }
}

export interface BatteryManager extends EventTarget {
    readonly charging: boolean;
    readonly chargingTime: number;
    readonly dischargingTime: number;
    readonly level: number;

    onChange: ((this: BatteryManager, ev: Event) => any) | null;
    onchargingchange: ((this: BatteryManager, ev: Event) => any) | null;
    onchargingtimechange: ((this: BatteryManager, ev: Event) => any) | null;
    ondischargingtimechange: ((this: BatteryManager, ev: Event) => any) | null;
    onlevelchange: ((this: BatteryManager, ev: Event) => any) | null;
}

export declare interface BatteryInstance {
    get supported(): boolean;

    get value(): Promise<BatteryManager>;

    onChange(listener: (battery: BatteryManager) => void, options?: AddEventListenerOptions): () => void;

    Constants: {};
    Errors: {
        NotSupportedError: typeof NotSupportedError,
    };
}
