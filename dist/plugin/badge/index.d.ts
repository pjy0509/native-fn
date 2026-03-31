declare const NotSupportedError: ErrorConstructor;

declare interface BadgeInstance {
    get supported(): boolean;
    set(contents: number): Promise<void>;
    clear(): Promise<void>;
    Constants: {};
    Errors: {
        NotSupportedError: typeof NotSupportedError;
    };
}

declare const Badge: BadgeInstance;

export { Badge as default };
export type { BadgeInstance };
