export declare enum AppOpenState {
    Scheme = 0,
    Universal = 1,
    Intent = 2,
    Fallback = 3,
    Store = 4
}
export declare enum SettingType {
    General = "general",
    Network = "network",
    Display = "display",
    Appearance = "appearance",
    Accessibility = "accessibility",
    Battery = "battery",
    Datetime = "datetime",
    Language = "language",
    Accounts = "accounts",
    Storage = "storage"
}
export declare enum CameraType {
    Image = "image",
    Video = "video"
}
export declare enum CaptureType {
    User = "user",
    Environment = "environment"
}
export declare enum ExplorerStartIn {
    Desktop = "desktop",
    Documents = "documents",
    Downloads = "downloads",
    Music = "music",
    Pictures = "pictures",
    Videos = "videos"
}
export declare enum DirectoryExploreMode {
    Read = "read",
    ReadWrite = "readwrite"
}
export declare const SETTING_URL: Record<'Android' | 'Windows' | 'MacOS' | 'MacOS13+', Record<SettingType, string>>;
