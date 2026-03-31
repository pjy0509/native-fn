import {PermissionState, PermissionType} from "../constants";

export declare interface PermissionInstance {
    get supported(): boolean;

    request(type: PermissionType): Promise<PermissionState>;

    check(type: PermissionType): Promise<PermissionState>;

    Constants: {
        PermissionType: typeof PermissionType,
        PermissionState: typeof PermissionState,
    };
    Errors: {};
}
