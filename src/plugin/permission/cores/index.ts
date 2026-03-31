import {PermissionInstance} from "../types";
import {GET_USER_MEDIA, PermissionState, PermissionType} from "../constants";

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
    Errors: {},
};

function supported(): boolean {
    return typeof globalThis.navigator.permissions !== 'undefined';
}

function request(this: PermissionInstance, type: PermissionType): Promise<PermissionState> {
    const instance: PermissionInstance = this;

    return new Promise(function (resolve: (status: PermissionState) => void): void {
        function resolveAfterCheck() {
            instance.check(type).then(resolve);
        }

        instance.check(type)
            .then(function (state: PermissionState): void {
                if (state === PermissionState.Grant) return resolve(state);

                switch (type) {
                    case PermissionType.Notification:
                        if (typeof globalThis.Notification === 'undefined') return resolve(PermissionState.Unsupported);

                        globalThis.Notification.requestPermission().then(function (value: NotificationPermission): void {
                            switch (value) {
                                case 'default':
                                    return resolve(PermissionState.Prompt);
                                case 'granted':
                                    return resolve(PermissionState.Grant);
                                case 'denied':
                                    return resolve(PermissionState.Denied);
                                default:
                                    resolveAfterCheck();
                            }
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
                        if (typeof globalThis.navigator.clipboard === 'undefined' || typeof  globalThis.navigator.clipboard.read === 'undefined') return resolve(PermissionState.Unsupported);

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
                    default:
                        return resolve(PermissionState.Unsupported);
                }
            });
    });
}

function check(this: PermissionInstance, type: PermissionType): Promise<PermissionState> {
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
