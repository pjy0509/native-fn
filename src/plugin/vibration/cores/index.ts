import {VibrationInstance} from "../types";
import {NotSupportedError} from "../../../errors/not-supported-error";

const Vibration: VibrationInstance = {
    run: run,
    stop: stop,
    get supported(): boolean {
        return supported();
    },
    Constants: {},
    Errors: {
        NotSupportedError: NotSupportedError,
    },
};

function run(this: VibrationInstance, pattern: number | number[]): boolean {
    if (supported()) return globalThis.navigator.vibrate(pattern);
    throw new NotSupportedError('\'navigator.vibrate\' does not supported.');
}

function stop(this: VibrationInstance): boolean {
    return this.run(0);
}

function supported(): boolean {
    return typeof globalThis.navigator.vibrate !== 'undefined';
}

export default Vibration;
