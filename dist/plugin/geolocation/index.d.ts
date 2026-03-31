declare const NotSupportedError: ErrorConstructor;

declare const PermissionNotGrantedError: ErrorConstructor;

declare interface GeolocationInstance {
    get supported(): boolean;
    get value(): Promise<GeolocationCoordinates>;
    onChange(listener: (coordinates: GeolocationCoordinates) => void, options?: AddEventListenerOptions): () => void;
    Constants: {};
    Errors: {
        NotSupportedError: typeof NotSupportedError;
        PermissionNotGrantedError: typeof PermissionNotGrantedError;
    };
}

declare const Geolocation: GeolocationInstance;

export { Geolocation as default };
export type { GeolocationInstance };
