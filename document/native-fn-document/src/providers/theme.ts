import {DefaultTheme} from "styled-components";

declare module "styled-components" {
    export interface DefaultTheme {
        mode: "dark" | "light";
        colors: {
            bg: string;
            surface: string;
            surfaceHover: string;
            border: string;
            borderActive: string;
            text: string;
            textMuted: string;
            textStrong: string;
            accent: string;
            accentGlow: string;
            pathBg: string;
            pathBorder: string;
            pathText: string;
            scanColor: string;
        };
    }
}

export const darkTheme: DefaultTheme = {
    mode: "dark",
    colors: {
        bg: "#0d1117",
        surface: "#1e2a3a",
        surfaceHover: "#26374d",
        border: "#2d5a8e",
        borderActive: "#4a90d9",
        text: "#a8c8f0",
        textMuted: "#5a8db8",
        textStrong: "#c9dff5",
        accent: "#4a90d9",
        accentGlow: "rgba(74,144,217,0.18)",
        pathBg: "#111e2e",
        pathBorder: "#2d5a8e",
        pathText: "#7ab3e0",
        scanColor: "rgba(74,144,217,0.12)",
    },
};

export const lightTheme: DefaultTheme = {
    mode: "light",
    colors: {
        bg: "#f8f9fc",
        surface: "#ffffff",
        surfaceHover: "#f0f5fc",
        border: "#c2d8f0",
        borderActive: "#3b82f6",
        text: "#1e3a5f",
        textMuted: "#4a7aaa",
        textStrong: "#0f2540",
        accent: "#3b82f6",
        accentGlow: "rgba(59,130,246,0.12)",
        pathBg: "#eef4ff",
        pathBorder: "#7aaad4",
        pathText: "#2a5a8e",
        scanColor: "rgba(59,130,246,0.08)",
    },
};
