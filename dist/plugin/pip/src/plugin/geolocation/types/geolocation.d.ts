import { NotSupportedError } from "../../../errors/not-supported-error";
import { PermissionNotGrantedError } from "../../../errors/permission-not-granted-error";
export declare interface GeolocationInstance {
    get value(): Promise<GeolocationCoordinates>;
    get supported(): boolean;
    onChange(listener: (coordinates: GeolocationCoordinates) => void, options?: AddEventListenerOptions): () => void;
    Constants: {};
    Errors: {
        NotSupportedError: typeof NotSupportedError;
        PermissionNotGrantedError: typeof PermissionNotGrantedError;
    };
}
