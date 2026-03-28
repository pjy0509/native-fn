declare interface ClipboardInstance {
    copy(item: any): Promise<boolean>;
    paste(): Promise<string>;
    Constants: {};
    Errors: {};
}

declare const Clipboard: ClipboardInstance;

export { Clipboard as default };
export type { ClipboardInstance };
