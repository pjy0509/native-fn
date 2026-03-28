declare enum Appearances {
    Unknown = "unknown",
    Light = "light",
    Dark = "dark"
}
declare let MEDIA_QUERY_LIST: MediaQueryList;
declare const CONTEXT: CanvasRenderingContext2D | null;
declare const SVG_PIXEL_DATA_URL: string;

declare interface AppearanceInstance {
    get value(): Appearances;
    onChange(listener: (appearance: Appearances) => void, options?: AddEventListenerOptions): () => void;
    Constants: {
        Appearances: typeof Appearances;
    };
    Errors: {};
}

declare const Appearance: AppearanceInstance;

export { Appearances, CONTEXT, MEDIA_QUERY_LIST, SVG_PIXEL_DATA_URL, Appearance as default };
export type { AppearanceInstance };
