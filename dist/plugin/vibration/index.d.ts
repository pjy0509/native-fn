declare const NotSupportedError: ErrorConstructor;

declare interface VibrationInstance {
    get supported(): boolean;
    run(pattern: number | number[]): boolean;
    stop(): boolean;
    readonly Constants: {};
    readonly Errors: {
        readonly NotSupportedError: typeof NotSupportedError;
    };
}

declare const Vibration: VibrationInstance;

export { Vibration as default };
export type { VibrationInstance };
