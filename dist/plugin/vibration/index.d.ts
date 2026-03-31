declare const NotSupportedError: ErrorConstructor;

declare interface VibrationInstance {
    get supported(): boolean;
    run(pattern: number | number[]): boolean;
    stop(): boolean;
    Constants: {};
    Errors: {
        NotSupportedError: typeof NotSupportedError;
    };
}

declare const Vibration: VibrationInstance;

export { Vibration as default };
export type { VibrationInstance };
