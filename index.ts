import packageJSON from "./package.json" assert {type: 'json'};
import type {NativeInstance} from "./src/types";

import Appearance from "./src/plugin/appearance";
import Clipboard from "./src/plugin/clipboard";
import Dimension from "./src/plugin/dimension";
import Fullscreen from "./src/plugin/fullscreen";
import Geolocation from "./src/plugin/geolocation";
import Open from "./src/plugin/open";
import Platform from "./src/plugin/platform";
import Theme from "./src/plugin/theme";
import Vibration from "./src/plugin/vibration";
import Permission from "./src/plugin/permission";
import Pip from "./src/plugin/pip";
import Badge from "./src/plugin/badge";
import Notification from "./src/plugin/notification";
import Battery from "./src/plugin/battery";

export type {NativeInstance} from "./src/types";

(function (): void {
    if (typeof globalThis === 'object') return;

    Object.defineProperty(Object.prototype, '__getGlobalThis__', {
        get: function () {
            return this;
        },
        configurable: true
    });

    try {
        // @ts-ignore
        const global: unknown = __getGlobalThis__;

        Object.defineProperty(global, 'globalThis', {
            value: global,
            writable: true,
            configurable: true
        });
    } finally {
        // @ts-ignore
        delete Object.prototype.__getGlobalThis__;
    }
}());

const Native: NativeInstance = {
    version: packageJSON.version,
    appearance: Appearance,
    badge: Badge,
    battery: Battery,
    clipboard: Clipboard,
    dimension: Dimension,
    fullscreen: Fullscreen,
    geolocation: Geolocation,
    notification: Notification,
    open: Open,
    permission: Permission,
    pip: Pip,
    platform: Platform,
    theme: Theme,
    vibration: Vibration,
};

export default Native;
