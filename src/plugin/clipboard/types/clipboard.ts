export declare interface ClipboardInstance {
    copy(item: any): Promise<boolean>;

    paste(): Promise<string>;

    Constants: {};
    Errors: {};
}
