declare const NotSupportedError: ErrorConstructor;

declare interface BadgeInstance {
    set(contents: number): Promise<void>;
    clear(): Promise<void>;
    get supported(): boolean;
    Constants: {};
    Errors: {
        NotSupportedError: typeof NotSupportedError;
    };
}

declare const Badge: BadgeInstance;

export { Badge as default };
export type { BadgeInstance };
