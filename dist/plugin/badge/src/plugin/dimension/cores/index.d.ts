import { DimensionInstance } from "../types";
declare global {
    interface DOMRectReadOnly {
        readonly x: number;
        readonly y: number;
        readonly width: number;
        readonly height: number;
        readonly top: number;
        readonly right: number;
        readonly bottom: number;
        readonly left: number;
    }
    interface VisualViewport {
        readonly segments?: DOMRectReadOnly[];
    }
}
declare const Dimension: DimensionInstance;
export default Dimension;
