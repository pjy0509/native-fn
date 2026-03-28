import {NotSupportedError} from "../../../errors/not-supported-error";

export declare interface VibrationInstance {
    run(pattern: number | number[]): boolean;

    stop(): boolean;

    get supported(): boolean;

    Constants: {};
    Errors: {
        NotSupportedError: typeof NotSupportedError,
    };
}
