declare const NotSupportedError: ErrorConstructor;

declare interface VibrationInstance {
    run(pattern: number | number[]): boolean;
    stop(): boolean;
    get supported(): boolean;
    Constants: {};
    Errors: {
        NotSupportedError: typeof NotSupportedError;
    };
}

declare const Vibration: VibrationInstance;

export { Vibration as default };
export type { VibrationInstance };
