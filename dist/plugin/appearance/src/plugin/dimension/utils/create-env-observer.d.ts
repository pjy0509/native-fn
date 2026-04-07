import { EnvironmentObserver, EnvironmentPresetKey } from "../types";
declare global {
    interface Navigator {
        readonly virtualKeyboard?: VirtualKeyboard;
        readonly devicePosture?: DevicePosture;
    }
    var viewport: BrowsingContextViewport | undefined;
}
interface DevicePosture extends EventTarget {
    readonly type: 'continuous' | 'folded';
    onchange: ((this: DevicePosture, ev: Event) => any) | null;
}
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
interface BrowsingContextViewportEventMap {
    change: Event;
}
interface BrowsingContextViewport extends EventTarget {
    readonly segments: ReadonlyArray<DOMRectReadOnly> | null;
    addEventListener<K extends keyof BrowsingContextViewportEventMap>(type: K, listener: (this: BrowsingContextViewport, ev: BrowsingContextViewportEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof BrowsingContextViewportEventMap>(type: K, listener: (this: BrowsingContextViewport, ev: BrowsingContextViewportEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
}
export default function createEnvObserver<K extends EnvironmentPresetKey>(preset: K): EnvironmentObserver<K>;
export {};
