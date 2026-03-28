declare const NotSupportedError: ErrorConstructor;

declare const PermissionNotGrantedError: ErrorConstructor;

interface NotificationOptions {
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
declare interface NotificationInstance {
    send(options: NotificationOptions): Promise<Notification>;
    get supported(): boolean;
    Constants: {};
    Errors: {
        NotSupportedError: typeof NotSupportedError;
        PermissionNotGrantedError: typeof PermissionNotGrantedError;
    };
}

declare const Notification$1: NotificationInstance;

export { Notification$1 as default };
export type { NotificationInstance, NotificationOptions };
