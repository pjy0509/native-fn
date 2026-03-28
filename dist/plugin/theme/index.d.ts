declare interface ThemeInstance {
    get value(): string | undefined;
    set value(color: string | undefined);
    Constants: {};
    Errors: {};
}

declare const Theme: ThemeInstance;

export { Theme as default };
export type { ThemeInstance };
