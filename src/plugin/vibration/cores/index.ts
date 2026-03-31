import {VibrationInstance} from "../types";
import {NotSupportedError} from "../../../errors/not-supported-error";

const Vibration: VibrationInstance = {
    get supported(): boolean {
        return supported();
    },
    run: run,
    stop: stop,
    Constants: {},
    Errors: {
        NotSupportedError: NotSupportedError,
    },
};

function supported(): boolean {
    return typeof globalThis.navigator.vibrate !== 'undefined';
}

function run(this: VibrationInstance, pattern: number | number[]): boolean {
    if (supported()) return globalThis.navigator.vibrate(pattern);
    throw new NotSupportedError('\'navigator.vibrate\' does not supported.');
}

function stop(this: VibrationInstance): boolean {
    return this.run(0);
}

export default Vibration;
