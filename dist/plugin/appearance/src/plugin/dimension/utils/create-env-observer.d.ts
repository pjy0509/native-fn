import { EnvironmentPresetKey, EnvironmentPresetValues } from "../types";
declare global {
    interface Navigator {
        readonly virtualKeyboard?: VirtualKeyboard;
    }
}
type ChangeCallback<K extends EnvironmentPresetKey> = (values: EnvironmentPresetValues<K>) => void;
interface VirtualKeyboardEventMap {
    geometrychange: Event;
}
interface VirtualKeyboard extends EventTarget {
    readonly boundingRect: DOMRect;
    overlaysContent: boolean;
    show(): void;
    hide(): void;
    addEventListener<K extends keyof VirtualKeyboardEventMap>(type: K, listener: (this: VirtualKeyboard, ev: VirtualKeyboardEventMap[K]) => any, options?: AddEventListenerOptions): void;
    removeEventListener<K extends keyof VirtualKeyboardEventMap>(type: K, listener: (this: VirtualKeyboard, ev: VirtualKeyboardEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
}
export type EnvObserver<K extends EnvironmentPresetKey> = {
    get(): EnvironmentPresetValues<K>;
    onChange(callback: ChangeCallback<K>, options?: AddEventListenerOptions): () => void;
};
export default function createEnvObserver<K extends EnvironmentPresetKey>(preset: K): EnvObserver<K>;
export {};
