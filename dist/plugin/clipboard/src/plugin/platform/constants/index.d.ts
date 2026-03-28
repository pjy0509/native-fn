import { VersionResolver } from "../types";
export declare enum OS {
    Unknown = "Unknown",
    Android = "Android",
    iOS = "iOS",
    Windows = "Windows",
    MacOS = "MacOS"
}
export declare enum Devices {
    Unknown = "Unknown",
    Mobile = "Mobile",
    Desktop = "Desktop"
}
export declare enum Engines {
    Unknown = "Unknown",
    EdgeHTML = "EdgeHTML",
    ArkWeb = "ArkWeb",
    Blink = "Blink",
    Presto = "Presto",
    WebKit = "WebKit",
    Trident = "Trident",
    NetFront = "NetFront",
    KHTML = "KHTML",
    Tasman = "Tasman",
    Gecko = "Gecko"
}
export declare enum Browsers {
    Unknown = "Unknown",
    Chrome = "Chrome",
    Safari = "Safari",
    Edge = "Edge",
    Firefox = "Firefox",
    Opera = "Opera",
    IE = "IE",
    SamsungInternet = "SamsungInternet"
}
export declare const USER_AGENT: string;
export declare const HIGH_ENTROPY_BRAND_NAME_MAP: Record<string, string>;
export declare const RTL_LANGUAGES: string[];
export declare const OS_RESOLVER_MAP: [RegExp, OS, VersionResolver?][];
export declare const ENGINE_RESOLVER_MAP: [RegExp, Engines, VersionResolver?][];
export declare const BROWSER_RESOLVER_MAP: [RegExp, Browsers, VersionResolver?][];
