import { GPUAdapterInfo, PlatformInstance } from "../types";
declare global {
    interface Navigator {
        userAgent?: string;
        userAgentData?: UserAgentData;
        language?: string;
        languages?: readonly string[];
        browserLanguage?: string;
        systemLanguage?: string;
        userLanguage?: string;
        standalone?: boolean;
        gpu?: WebGPU;
    }
    interface NodeProcessVersions {
        node?: string;
        chrome?: string;
    }
    interface NodeProcess {
        versions?: NodeProcessVersions;
        type?: string;
        platform?: string;
        getSystemVersion?(): string;
    }
    var process: NodeProcess | undefined;
    namespace Intl {
        const Locale: {
            new (tag: string): IntlLocale;
        };
    }
}
interface IntlLocale {
    getTextInfo?(): IntlLocaleTextInfo;
    textInfo: IntlLocaleTextInfo;
}
interface IntlLocaleTextInfo {
    direction: 'rtl' | 'ltr';
}
interface ModernUserAgentDataBrand {
    brand: string;
    version: string;
}
type UserAgentDataBrand = ModernUserAgentDataBrand | string | null | undefined;
interface UserAgentDataValues {
    brands?: UserAgentDataBrand[];
    fullVersionList?: UserAgentDataBrand[];
    platformVersion?: string | null | undefined;
    platform?: string | null | undefined;
    mobile?: boolean;
}
interface UserAgentData {
    getHighEntropyValues?(hints: string[]): Promise<UserAgentDataValues>;
}
interface WebGPU {
    requestAdapter(options?: GPURequestAdapterOptions): Promise<GPUAdapter | null>;
}
interface GPURequestAdapterOptions {
    powerPreference?: GPUPowerPreference;
    forceFallbackAdapter?: boolean;
}
type GPUPowerPreference = 'low-power' | 'high-performance';
interface GPUAdapter {
    readonly info: GPUAdapterInfo;
}
declare const Platform: PlatformInstance;
export default Platform;
