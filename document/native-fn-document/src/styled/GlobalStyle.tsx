import React from "react";
import { createGlobalStyle, ExecutionProps } from "styled-components";

const GlobalStyle: React.NamedExoticComponent<ExecutionProps> = createGlobalStyle`
    *,
    *::before,
    *::after {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        letter-spacing: -0.0375rem;
    }

    body {
        background: ${({theme}) => theme.colors.bg};
        color: ${({theme}) => theme.colors.text};
        font-family: 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
        line-height: 1.6;
        transition: background 0.25s ease, color 0.25s ease;
    }

    .scrollbar-track {
        background: transparent !important;
    }

    .scrollbar-track-y {
        width: 6px !important;
        right: 6px !important;
    }

    .scrollbar-track-x {
        height: 6px !important;
        bottom: 6px !important;
    }

    .scrollbar-thumb {
        background: ${({theme}) => theme.colors.border} !important;
        border-radius: 3px !important;
        opacity: 0.7;
        transition: opacity 0.2s ease, background 0.2s ease;
    }

    .scrollbar-thumb:hover {
        opacity: 1;
        background: ${({theme}) => theme.colors.borderActive} !important;
    }
`;

export default GlobalStyle;
