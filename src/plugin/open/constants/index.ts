import {OS} from "../../platform/constants";
import {DirectoryOptions} from "../types";

export enum AppOpenState {
    Scheme,
    Universal,
    Intent,
    Fallback,
    Store,
}

export enum SettingType {
    General = 'general',
    Network = 'network',
    Display = 'display',
    Appearance = 'appearance',
    Accessibility = 'accessibility',
    Battery = 'battery',
    Datetime = 'datetime',
    Language = 'language',
    Accounts = 'accounts',
    Storage = 'storage',
}

export enum CameraType {
    Image = 'image',
    Video = 'video',
}

export enum CaptureType {
    User = 'user',
    Environment = 'environment',
}

export enum ExplorerStartIn {
    Desktop = 'desktop',
    Documents = 'documents',
    Downloads = 'downloads',
    Music = 'music',
    Pictures = 'pictures',
    Videos = 'videos',
}

export enum DirectoryExploreMode {
    Read = 'read',
    ReadWrite = 'readwrite'
}

export const SETTING_URL: Record<'Android' | 'Windows' | 'MacOS' | 'MacOS13+', Record<SettingType, string>> = {
    [OS.Android]: {
        [SettingType.General]: 'intent:#Intent;action=android.settings.SETTINGS;end',
        [SettingType.Network]: 'intent:#Intent;action=android.settings.WIFI_SETTINGS;end',
        [SettingType.Display]: 'intent:#Intent;action=android.settings.DISPLAY_SETTINGS;end',
        [SettingType.Appearance]: 'intent:#Intent;action=android.settings.DISPLAY_SETTINGS;end',
        [SettingType.Accessibility]: 'intent:#Intent;action=android.settings.ACCESSIBILITY_SETTINGS;end',
        [SettingType.Battery]: 'intent:#Intent;action=android.settings.BATTERY_SAVER_SETTINGS;end',
        [SettingType.Datetime]: 'intent:#Intent;action=android.settings.DATE_SETTINGS;end',
        [SettingType.Language]: 'intent:#Intent;action=android.settings.LOCALE_SETTINGS;end',
        [SettingType.Accounts]: 'intent:#Intent;action=android.settings.SYNC_SETTINGS;end',
        [SettingType.Storage]: 'intent:#Intent;action=android.settings.INTERNAL_STORAGE_SETTINGS;end',
    },
    [OS.Windows]: {
        [SettingType.General]: 'ms-settings:system',
        [SettingType.Network]: 'ms-settings:network',
        [SettingType.Display]: 'ms-settings:display',
        [SettingType.Appearance]: 'ms-settings:colors',
        [SettingType.Accessibility]: 'ms-settings:easeofaccess',
        [SettingType.Battery]: 'ms-settings:batterysaver',
        [SettingType.Datetime]: 'ms-settings:dateandtime',
        [SettingType.Language]: 'ms-settings:regionlanguage',
        [SettingType.Accounts]: 'ms-settings:emailandaccounts',
        [SettingType.Storage]: 'ms-settings:storagesense',
    },
    [OS.MacOS]: {
        [SettingType.General]: 'x-apple.systempreferences:',
        [SettingType.Network]: 'x-apple.systempreferences:com.apple.preference.network',
        [SettingType.Display]: 'x-apple.systempreferences:com.apple.preference.displays',
        [SettingType.Appearance]: 'x-apple.systempreferences:com.apple.preference.general',
        [SettingType.Accessibility]: 'x-apple.systempreferences:com.apple.preference.universalaccess',
        [SettingType.Battery]: 'x-apple.systempreferences:com.apple.preference.energysaver',
        [SettingType.Datetime]: 'x-apple.systempreferences:com.apple.preference.datetime',
        [SettingType.Language]: 'x-apple.systempreferences:com.apple.Localization',
        [SettingType.Accounts]: 'x-apple.systempreferences:com.apple.preferences.internetaccounts',
        [SettingType.Storage]: 'x-apple.systempreferences:',
    },
    ['MacOS13+']: {
        [SettingType.General]: 'x-apple.systempreferences:com.apple.General-Settings.extension',
        [SettingType.Network]: 'x-apple.systempreferences:com.apple.Network-Settings.extension',
        [SettingType.Display]: 'x-apple.systempreferences:com.apple.Displays-Settings.extension',
        [SettingType.Appearance]: 'x-apple.systempreferences:com.apple.Appearance-Settings.extension',
        [SettingType.Accessibility]: 'x-apple.systempreferences:com.apple.Accessibility-Settings.extension',
        [SettingType.Battery]: 'x-apple.systempreferences:com.apple.Battery-Settings.extension',
        [SettingType.Datetime]: 'x-apple.systempreferences:com.apple.Date-Time-Settings.extension',
        [SettingType.Language]: 'x-apple.systempreferences:com.apple.Localization-Settings.extension',
        [SettingType.Accounts]: 'x-apple.systempreferences:com.apple.Internet-Accounts-Settings.extension',
        [SettingType.Storage]: 'x-apple.systempreferences:com.apple.settings.Storage',
    }
}
