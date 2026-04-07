import {NotSupportedError} from "../../../errors/not-supported-error";
import {PermissionNotGrantedError} from "../../../errors/permission-not-granted-error";

export declare interface GeolocationInstance {
    get supported(): boolean;

    get value(): Promise<GeolocationCoordinates>;

    onChange(listener: (coordinates: GeolocationCoordinates) => void, options?: AddEventListenerOptions): () => void;

    readonly Constants: {};
    readonly Errors: {
        readonly NotSupportedError: typeof NotSupportedError;
        readonly PermissionNotGrantedError: typeof PermissionNotGrantedError;
    };
}
