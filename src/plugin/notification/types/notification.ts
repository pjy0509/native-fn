import {NotSupportedError} from "../../../errors/not-supported-error";
import {PermissionNotGrantedError} from "../../../errors/permission-not-granted-error";

export interface NotificationOptions {
    title: string;
    badge?: string;
    body?: string;
    data?: any;
    dir?: NotificationDirection;
    icon?: string;
    lang?: string;
    requireInteraction?: boolean;
    silent?: boolean | null;
    tag?: string;
    onClick?: ((this: Notification, event: Event) => any);
    onClose?: ((this: Notification, event: Event) => any);
    onError?: ((this: Notification, event: Event) => any);
    onShow?: ((this: Notification, event: Event) => any);
}

export declare interface NotificationInstance {
    send(options: NotificationOptions): Promise<Notification>;

    get supported(): boolean;

    Constants: {};
    Errors: {
        NotSupportedError: typeof NotSupportedError,
        PermissionNotGrantedError: typeof PermissionNotGrantedError,
    };
}
