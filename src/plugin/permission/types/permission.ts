import {PermissionState, PermissionType} from "../constants";
import {NotSupportedError} from "../../../errors/not-supported-error";

export declare interface PermissionInstance {
    get supported(): boolean;

    request(type: PermissionType): Promise<PermissionState>;

    check(type: PermissionType): Promise<PermissionState>;

    readonly Constants: {
        readonly PermissionType: typeof PermissionType;
        readonly PermissionState: typeof PermissionState;
    };
    readonly Errors: {
        readonly NotSupportedError: typeof NotSupportedError;
    };
}
