declare const NotSupportedError: ErrorConstructor;

declare const PermissionNotGrantedError: ErrorConstructor;

declare interface GeolocationInstance {
    get supported(): boolean;
    get value(): Promise<GeolocationCoordinates>;
    onChange(listener: (coordinates: GeolocationCoordinates) => void, options?: AddEventListenerOptions): () => void;
    readonly Constants: {};
    readonly Errors: {
        readonly NotSupportedError: typeof NotSupportedError;
        readonly PermissionNotGrantedError: typeof PermissionNotGrantedError;
    };
}

declare const Geolocation: GeolocationInstance;

export { Geolocation as default };
export type { GeolocationInstance };
