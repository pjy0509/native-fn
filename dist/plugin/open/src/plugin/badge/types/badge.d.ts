import { NotSupportedError } from "../../../errors/not-supported-error";
export declare interface BadgeInstance {
    set(contents: number): Promise<void>;
    clear(): Promise<void>;
    get supported(): boolean;
    Constants: {};
    Errors: {
        NotSupportedError: typeof NotSupportedError;
    };
}
