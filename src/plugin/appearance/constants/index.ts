import {FALLBACK_MEDIA_QUERY_LIST} from "../../../constants";

export enum Appearances {
    Unknown = 'unknown',
    Light = 'light',
    Dark = 'dark',
}

export let MEDIA_QUERY_LIST: MediaQueryList;

if (typeof globalThis.matchMedia !== 'undefined') MEDIA_QUERY_LIST = globalThis.matchMedia('(prefers-color-scheme: dark)');
else MEDIA_QUERY_LIST = FALLBACK_MEDIA_QUERY_LIST;

export const CONTEXT: CanvasRenderingContext2D | null = globalThis.document.createElement('canvas').getContext('2d', {willReadFrequently: true});
export const SVG_PIXEL_DATA_URL: string = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0wIDBoMXYxSDB6Ii8+PC9zdmc+';
