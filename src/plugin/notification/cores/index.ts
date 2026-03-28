import {NotificationInstance, NotificationOptions} from "../types";
import {NotSupportedError} from "../../../errors/not-supported-error";
import Permission from "../../permission";
import {PermissionState, PermissionType} from "../../permission/constants";
import {PermissionNotGrantedError} from "../../../errors/permission-not-granted-error";

const Notification: NotificationInstance = {
    send: send,
    get supported(): boolean {
        return supported();
    },
    Constants: {},
    Errors: {
        NotSupportedError: NotSupportedError,
        PermissionNotGrantedError: PermissionNotGrantedError,
    },
};

type NotificationConstructorOptions = globalThis.NotificationOptions;

function send(this: NotificationInstance, options: NotificationOptions): Promise<Notification> {
    return new Promise(function (resolve: (notification: Notification) => void, reject: (error: Error) => void): void {
        if (!supported()) return reject(new NotSupportedError('\'window.Notification\' does not supported.'));

        Permission
            .request(PermissionType.Notification)
            .then(function (state: PermissionState): void {
                if (state === PermissionState.Grant) {
                    const constructorOptions: NotificationConstructorOptions = {
                        badge: options.badge,
                        body: options.body,
                        data: options.data,
                        dir: options.dir,
                        icon: options.icon,
                        lang: options.lang,
                        requireInteraction: options.requireInteraction,
                        silent: options.silent,
                        tag: options.tag,
                    };

                    const notification: Notification = new globalThis.Notification(options.title, constructorOptions);

                    if (typeof options.onClick !== 'undefined') notification.onclick = options.onClick;
                    if (typeof options.onShow !== 'undefined') notification.onshow = options.onShow;
                    if (typeof options.onClose !== 'undefined') notification.onclose = options.onClose;
                    if (typeof options.onError !== 'undefined') notification.onerror = options.onError;

                    resolve(notification);
                } else {
                    reject(new PermissionNotGrantedError('\'notification\' permission is not granted.'));
                }
            });
    });
}

function supported(): boolean {
    return typeof globalThis.Notification !== 'undefined';
}

export default Notification;
