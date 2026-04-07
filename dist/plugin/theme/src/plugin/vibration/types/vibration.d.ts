import { NotSupportedError } from "../../../errors/not-supported-error";
export declare interface VibrationInstance {
    get supported(): boolean;
    run(pattern: number | number[]): boolean;
    stop(): boolean;
    readonly Constants: {};
    readonly Errors: {
        readonly NotSupportedError: typeof NotSupportedError;
    };
}
