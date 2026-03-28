import AppearanceInstance from "../plugin/appearance";
import BadgeInstance from "../plugin/badge";
import BatteryInstance from "../plugin/battery";
import ClipboardInstance from "../plugin/clipboard";
import DimensionInstance from "../plugin/dimension";
import FullscreenInstance from "../plugin/fullscreen";
import GeoLocationInstance from "../plugin/geolocation";
import NotificationInstance from "../plugin/notification";
import OpenInstance from "../plugin/open";
import PlatformInstance from "../plugin/platform";
import ThemeInstance from "../plugin/theme";
import VibrationInstance from "../plugin/vibration";
import PermissionInstance from "../plugin/permission";
import PipInstance from "../plugin/pip";

export declare interface NativeInstance {
    version: string;

    appearance: typeof AppearanceInstance;
    badge: typeof BadgeInstance;
    battery: typeof BatteryInstance;
    clipboard: typeof ClipboardInstance;
    dimension: typeof DimensionInstance;
    fullscreen: typeof FullscreenInstance;
    geolocation: typeof GeoLocationInstance;
    notification: typeof NotificationInstance;
    open: typeof OpenInstance;
    permission: typeof PermissionInstance;
    platform: typeof PlatformInstance;
    pip: typeof PipInstance;
    theme: typeof ThemeInstance;
    vibration: typeof VibrationInstance;
}
