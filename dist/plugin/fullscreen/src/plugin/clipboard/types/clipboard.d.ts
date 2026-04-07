export declare interface ClipboardInstance {
    copy(item: any): Promise<boolean>;
    paste(): Promise<string>;
    readonly Constants: {};
    readonly Errors: {};
}
