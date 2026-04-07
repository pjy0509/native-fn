declare enum Appearances {
    Unknown = "unknown",
    Light = "light",
    Dark = "dark"
}
declare let PREFERS_COLOR_SCHEME_MEDIA_QUERY_LIST: MediaQueryList;
declare const CONTEXT: CanvasRenderingContext2D | null;
declare const SVG_PIXEL_DATA_URL: string;

declare interface AppearanceInstance {
    get value(): Appearances;
    onChange(listener: (appearance: Appearances) => void, options?: AddEventListenerOptions): () => void;
    readonly Constants: {
        readonly Appearances: typeof Appearances;
    };
    readonly Errors: {};
}

declare const Appearance: AppearanceInstance;

export { Appearances, CONTEXT, PREFERS_COLOR_SCHEME_MEDIA_QUERY_LIST, SVG_PIXEL_DATA_URL, Appearance as default };
export type { AppearanceInstance };
