import { NotSupportedError } from "../../../errors/not-supported-error";
export declare interface VibrationInstance {
    get supported(): boolean;
    run(pattern: number | number[]): boolean;
    stop(): boolean;
    Constants: {};
    Errors: {
        NotSupportedError: typeof NotSupportedError;
    };
}
