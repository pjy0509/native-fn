import {PermissionInstance} from "../types";
import {GET_USER_MEDIA, PermissionState, PermissionType} from "../constants";
import EventListener from "../../../utils/event-listener";
import {NotSupportedError} from "../../../errors/not-supported-error";

type DeviceOrientationEventWithPermission = typeof DeviceOrientationEvent & {
    requestPermission?: () => Promise<'denied' | 'granted' | 'prompt'>;
};

type DeviceMotionEventWithPermission = typeof DeviceMotionEvent & {
    requestPermission?: () => Promise<'denied' | 'granted' | 'prompt'>;
};

interface SafariDeviceSensorEventMap {
    event: DeviceOrientationEventWithPermission | DeviceMotionEventWithPermission,
    type: 'deviceorientation' | 'devicemotion'
}

const Permission: PermissionInstance = {
    get supported(): boolean {
        return supported();
    },
    request: request,
    check: check,
    Constants: {
        PermissionType: PermissionType,
        PermissionState: PermissionState,
    },
    Errors: {
        NotSupportedError: NotSupportedError,
    },
};

function toPermissionState(permission: 'denied' | 'granted' | 'prompt' | NotificationPermission): PermissionState {
    switch (permission) {
        case 'granted':
            return PermissionState.Grant;
        case 'denied':
            return PermissionState.Denied;
        case 'prompt':
        case 'default':
            return PermissionState.Prompt;
        default:
            return PermissionState.Unsupported;
    }
}

function toSafariSensorEventMap(type: PermissionType): SafariDeviceSensorEventMap | undefined {
    switch (type) {
        case PermissionType.DeviceOrientation:
            return {
                event: globalThis.DeviceOrientationEvent as DeviceOrientationEventWithPermission,
                type: 'deviceorientation',
            }
        case PermissionType.DeviceMotion:
            return {
                event: globalThis.DeviceMotionEvent as DeviceMotionEventWithPermission,
                type: 'devicemotion',
            }
        default:
            return undefined;
    }
}

function supported(): boolean {
    return typeof globalThis.navigator.permissions !== 'undefined';
}

function request(this: PermissionInstance, type: PermissionType): Promise<PermissionState> {
    const instance: PermissionInstance = this;

    return new Promise(function (resolve: (status: PermissionState) => void, reject: (error: Error) => void): void {
        function resolveAfterCheck() {
            instance.check(type).then(resolve);
        }

        instance.check(type)
            .then(function (state: PermissionState): void {
                if (state === PermissionState.Grant) return resolve(state);

                switch (type) {
                    case PermissionType.Notification:
                        if (typeof globalThis.Notification === 'undefined') return resolve(PermissionState.Unsupported);

                        globalThis.Notification.requestPermission().then(function (permission: NotificationPermission): void {
                            resolve(toPermissionState(permission));
                        });

                        break;
                    case PermissionType.Geolocation:
                        if (typeof globalThis.navigator.geolocation === 'undefined') return resolve(PermissionState.Unsupported);

                        globalThis.navigator.geolocation.getCurrentPosition(resolveAfterCheck, resolveAfterCheck);

                        break;
                    case PermissionType.Microphone:
                    case PermissionType.Camera:
                        if (typeof GET_USER_MEDIA === 'undefined') return resolve(PermissionState.Unsupported);

                        GET_USER_MEDIA({
                            video: type === PermissionType.Camera,
                            audio: type === PermissionType.Microphone,
                        })
                            .then(function (stream: MediaStream): void {
                                const tracks: MediaStreamTrack[] = stream.getTracks();

                                for (let i: number = 0; i < tracks.length; i++) tracks[i].stop();

                                resolveAfterCheck();
                            })
                            .catch(resolveAfterCheck);

                        break;
                    case PermissionType.ClipboardRead:
                        if (typeof globalThis.navigator.clipboard === 'undefined' || typeof globalThis.navigator.clipboard.read === 'undefined') return resolve(PermissionState.Unsupported);

                        globalThis.navigator.clipboard.read()
                            .then(resolveAfterCheck)
                            .catch(resolveAfterCheck);

                        break;
                    case PermissionType.MIDI:
                        if (typeof globalThis.navigator.requestMIDIAccess === 'undefined') return resolve(PermissionState.Unsupported);

                        globalThis.navigator.requestMIDIAccess()
                            .then(resolveAfterCheck)
                            .catch(resolveAfterCheck);

                        break;
                    case PermissionType.DeviceOrientation:
                    case PermissionType.DeviceMotion:
                        const sensorEventMap: SafariDeviceSensorEventMap | undefined = toSafariSensorEventMap(type);

                        if (typeof sensorEventMap === 'undefined' || typeof sensorEventMap.event === 'undefined') return resolve(PermissionState.Unsupported);
                        if (typeof sensorEventMap.event.requestPermission !== 'function') return resolve(PermissionState.Grant);

                        try {
                            sensorEventMap.event.requestPermission()
                                .then(function (permission: 'denied' | 'granted' | 'prompt'): void {
                                    resolve(toPermissionState(permission));
                                });
                        } catch (_: unknown) {
                            return reject(new NotSupportedError('\'DeviceOrientationEvent.requestPermission()\' must be called within a user gesture context.'));
                        }

                        break;
                    default:
                        return resolve(PermissionState.Unsupported);
                }
            });
    });
}

function check(this: PermissionInstance, type: PermissionType): Promise<PermissionState> {
    if (type === PermissionType.DeviceOrientation || type === PermissionType.DeviceMotion) {

        return new Promise<PermissionState>(function (resolve: (status: PermissionState) => void): void {
            const sensorEventMap: SafariDeviceSensorEventMap | undefined = toSafariSensorEventMap(type);

            if (typeof sensorEventMap === 'undefined' || typeof sensorEventMap.event === 'undefined') return resolve(PermissionState.Unsupported);
            if (typeof sensorEventMap.event.requestPermission !== 'function') return resolve(PermissionState.Grant);

            let granted: boolean = false;

            EventListener.add(
                globalThis,
                {
                    type: sensorEventMap.type,
                    callback: function (): void {
                        granted = true;
                    },
                    options: {once: true}
                }
            );

            setTimeout(function () {
                if (granted) return resolve(PermissionState.Grant);

                sensorEventMap.event.requestPermission!()
                    .then(function (permission: 'denied' | 'granted' | 'prompt'): void {
                        resolve(toPermissionState(permission));
                    })
                    .catch(function () {
                        resolve(PermissionState.Prompt);
                    });
            }, 50);
        });
    }

    return new Promise(function (resolve: (status: PermissionState) => void): void {
        if (typeof globalThis.navigator.permissions === 'undefined') return resolve(PermissionState.Unsupported);

        globalThis.navigator.permissions.query({name: type as PermissionName})
            .then(function (status: PermissionStatus): void {
                switch (status.state) {
                    case 'prompt':
                        return resolve(PermissionState.Prompt);
                    case 'granted':
                        return resolve(PermissionState.Grant);
                    case 'denied':
                        return resolve(PermissionState.Denied);
                    default:
                        return resolve(PermissionState.Unsupported);
                }
            });
    });
}

export default Permission;
