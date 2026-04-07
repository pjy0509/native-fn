declare const NotSupportedError: ErrorConstructor;

declare interface BadgeInstance {
    get supported(): boolean;
    set(contents: number): Promise<void>;
    clear(): Promise<void>;
    readonly Constants: {};
    readonly Errors: {
        readonly NotSupportedError: typeof NotSupportedError;
    };
}

declare const Badge: BadgeInstance;

export { Badge as default };
export type { BadgeInstance };
