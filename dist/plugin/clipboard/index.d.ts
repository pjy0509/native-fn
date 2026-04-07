declare interface ClipboardInstance {
    copy(item: any): Promise<boolean>;
    paste(): Promise<string>;
    readonly Constants: {};
    readonly Errors: {};
}

declare const Clipboard: ClipboardInstance;

export { Clipboard as default };
export type { ClipboardInstance };
