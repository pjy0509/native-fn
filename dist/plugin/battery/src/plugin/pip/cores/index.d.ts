import { PipInstance } from "../types";
declare global {
    interface HTMLVideoElement {
        webkitSupportsPresentationMode?: (mode: string) => boolean;
        webkitSetPresentationMode?: (mode: string) => void;
        webkitPresentationMode?: string;
        onwebkitpresentationmodechanged?: ((this: HTMLVideoElement, ev: Event) => any) | null;
        [key: symbol]: boolean | undefined;
    }
}
declare const _default: PipInstance;
export default _default;
