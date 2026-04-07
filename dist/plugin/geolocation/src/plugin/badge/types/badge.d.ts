import { NotSupportedError } from "../../../errors/not-supported-error";
export declare interface BadgeInstance {
    get supported(): boolean;
    set(contents: number): Promise<void>;
    clear(): Promise<void>;
    readonly Constants: {};
    readonly Errors: {
        readonly NotSupportedError: typeof NotSupportedError;
    };
}
