import {GeolocationInstance} from "../types";
import {NotSupportedError} from "../../../errors/not-supported-error";
import Permission from "../../permission";
import {PermissionState, PermissionType} from "../../permission";
import {PermissionNotGrantedError} from "../../../errors/permission-not-granted-error";
import {request} from "../../../utils/request";
import {SubscriptionManager} from "../../../types/subscription-manager";
import createSubscriptionManager from "../../../utils/create-subscription-manager";
import assign from "../../../utils/assign";

const onChangeSubscriptionManager: SubscriptionManager<GeolocationInstance, GeolocationCoordinates> = createSubscriptionManager<GeolocationInstance, GeolocationCoordinates>(attachOnChange, detachOnChange);
let watchIdRef: number | null = null;

interface IPApiResponse {
    lat: number,
    lon: number,
}

const Geolocation: GeolocationInstance = {
    get value(): Promise<GeolocationCoordinates> {
        return getValue();
    },
    get supported(): boolean {
        return supported();
    },
    onChange: onChangeSubscriptionManager.subscribe,
    Constants: {},
    Errors: {
        NotSupportedError: NotSupportedError,
        PermissionNotGrantedError: PermissionNotGrantedError,
    },
};

function getValue(): Promise<GeolocationCoordinates> {
    return new Promise(function (resolve: (coordinates: GeolocationCoordinates) => void, reject: (error: Error) => void): void {
        function fallback(error: Error): void {
            getFallbackValue(error)
                .then(resolve)
                .catch(reject);
        }

        if (!supported()) {
            return fallback(new NotSupportedError('\'navigator.geolocation\' does not supported.'));
        } else {
            Permission
                .request(PermissionType.Geolocation)
                .then(function (state: PermissionState): void {
                    if (state === PermissionState.Grant) {
                        globalThis.navigator.geolocation.getCurrentPosition(
                            function (position: GeolocationPosition) {
                                resolve(position.coords);
                            },
                            function (error: GeolocationPositionError) {
                                return fallback(normalizeError(error));
                            }
                        );
                    } else {
                        return fallback(new PermissionNotGrantedError('\'geolocation\' permission is not granted.'));
                    }
                });
        }
    });
}

function getFallbackValue(error: Error): Promise<GeolocationCoordinates> {
    return new Promise(function (resolve: (coordinates: GeolocationCoordinates) => void, reject: (error: Error) => void): void {
        request<IPApiResponse>('http://ip-api.com/json?fields=lat,lon')
            .then(function (response: IPApiResponse | undefined): void {
                if (typeof response !== 'undefined') {
                    const coordinate: Omit<GeolocationCoordinates, 'toJSON'> = {
                        latitude: response.lat,
                        longitude: response.lon,
                        accuracy: -1,
                        altitude: null,
                        altitudeAccuracy: null,
                        heading: null,
                        speed: null
                    };

                    resolve(
                        assign(coordinate, {
                            toJSON(): any {
                                return coordinate;
                            }
                        })
                    );
                } else {
                    reject(error);
                }
            })
            .catch(function (): void {
                reject(error);
            });
    });
}

function normalizeError(error: GeolocationPositionError): Error {
    switch (error.code) {
        case GeolocationPositionError.PERMISSION_DENIED:
            return new PermissionNotGrantedError('\'geolocation\' permission is not granted.');
        case GeolocationPositionError.POSITION_UNAVAILABLE:
            return new NotSupportedError('The acquisition of the geolocation failed because at least one internal source of position returned an internal error.');
        case GeolocationPositionError.TIMEOUT:
            return new NotSupportedError('The time allowed to acquire the geolocation was reached before the information was obtained.');
        default:
            return new NotSupportedError('Unknown error.');
    }
}

function attachOnChange(): void {
    if (!supported()) return;

    Permission
        .request(PermissionType.Geolocation)
        .then(function (state: PermissionState): void {
            if (state === PermissionState.Grant) {
                watchIdRef = globalThis.navigator.geolocation.watchPosition(
                    function (position: GeolocationPosition) {
                        onGeolocationCoordinatesChange(position.coords);
                    }
                );
            }
        });
}

function detachOnChange(): void {
    if (!supported() || watchIdRef === null) return;

    globalThis.navigator.geolocation.clearWatch(watchIdRef);
}

function onGeolocationCoordinatesChange(coordinates: GeolocationCoordinates): void {
    onChangeSubscriptionManager.emit(coordinates);
}

function supported(): boolean {
    return typeof globalThis.navigator.geolocation !== 'undefined';
}

export default Geolocation;
