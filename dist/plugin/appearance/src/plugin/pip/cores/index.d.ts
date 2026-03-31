import { PipInstance } from "../types";
declare global {
    interface HTMLVideoElement {
        webkitSupportsPresentationMode?(mode: string): boolean;
        webkitSetPresentationMode?(mode: string): void;
        webkitPresentationMode?: string;
        onwebkitpresentationmodechanged?: ((this: Element, ev: Event) => any) | null;
    }
    var __nativeFnPipBridgeKey__: symbol | undefined;
}
declare const Pip: PipInstance;
export default Pip;
