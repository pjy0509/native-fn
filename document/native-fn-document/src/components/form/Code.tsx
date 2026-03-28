import styled from "styled-components";
import React from "react";
import hljs, {HighlightResult} from "highlight.js";
import {AppThemeContext, ThemeContextValue} from "../../providers/AppThemeProvider";

export interface CodeProps {
    language: string;
    code: string;
    lineNumber?: boolean;
    showLanguage?: boolean;
}

const HLJS_LIGHT = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/github.min.css";
const HLJS_DARK = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/github-dark.min.css";
const LINK_ID = "hljs-theme-link";

function applyHljsTheme(isDark: boolean): void {
    if (typeof document === "undefined") return;

    let link = document.getElementById(LINK_ID) as HTMLLinkElement | null;

    if (link === null) {
        link = document.createElement("link");
        link.id = LINK_ID;
        link.rel = "stylesheet";
        document.head.appendChild(link);
    }

    const href = isDark ? HLJS_DARK : HLJS_LIGHT;
    if (link.href !== href) link.href = href;
}

function buildLineNumberTable(highlightedHtml: string): string {
    const lines = highlightedHtml.split("\n");
    if (lines[lines.length - 1] === "") lines.pop();

    return lines
        .map((line, i) => {
            const content = line === "" ? "&nbsp;" : line;
            return `<tr>
                <td class="ln-number" data-line-number="${i + 1}"></td>
                <td class="ln-code">${content}</td>
            </tr>`;
        })
        .join("");
}

const Pre = styled.pre`
    background: ${({theme}) => theme.colors.bg} !important;
    border: 1px solid ${({theme}) => theme.colors.border};
    border-radius: 8px;
    margin: 0;
    overflow-x: auto;
    position: relative;

    font-family: "JetBrains Mono", "Fira Code", "Cascadia Code", "Consolas", "Monaco", monospace !important;
    font-size: 0.75rem !important;
    line-height: 1.6 !important;

    &::-webkit-scrollbar {
        height: 4px;
    }

    &::-webkit-scrollbar-track {
        background: transparent;
        border-radius: 0 0 8px 8px;
    }

    &::-webkit-scrollbar-thumb {
        background: ${({theme}) => theme.colors.border};
        border-radius: 2px;
        opacity: 0.6;
        transition: background 0.2s ease;
    }

    &::-webkit-scrollbar-thumb:hover {
        background: ${({theme}) => theme.colors.borderActive};
    }

    scrollbar-width: thin;
    scrollbar-color: ${({theme}) => theme.colors.border} transparent;

    table {
        border-collapse: collapse;
        width: 100%;
    }

    td.ln-number {
        text-align: right;
        vertical-align: top;
        padding: 0 0.75rem;
        width: 1%;
        white-space: nowrap;
        user-select: none;
        color: ${({theme}) => theme.colors.textMuted};
        border-right: 1px solid ${({theme}) => theme.colors.border};
        opacity: 0.45;

        &::before {
            content: attr(data-line-number);
        }
    }

    td.ln-code {
        padding: 0 1rem;
        white-space: pre;
    }

    @media (max-width: 500px) {
        td.ln-number {
            display: none;
        }

        td.ln-code {
            padding: 0 0.75rem;
        }
    }
`;

const PlainCode = styled.code`
    display: block;
    padding: 0.875rem 1rem;
    white-space: pre;
    overflow-x: auto;

    &::-webkit-scrollbar {
        height: 4px;
    }

    &::-webkit-scrollbar-track {
        background: transparent;
    }

    &::-webkit-scrollbar-thumb {
        background: ${({theme}) => theme.colors.border};
        border-radius: 2px;
    }

    &::-webkit-scrollbar-thumb:hover {
        background: ${({theme}) => theme.colors.borderActive};
    }

    scrollbar-width: thin;
    scrollbar-color: ${({theme}) => theme.colors.border} transparent;
`;

const PreLabel = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    left: 0;
    padding: 0.6rem 1rem;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 0.6875rem;
    font-weight: 600;
    color: ${({theme}) => theme.colors.accent};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid ${({theme}) => theme.colors.border};
    user-select: none;
    background: ${({theme}) => theme.colors.bg};
    z-index: 1;

    button {
        background: none;
        border: none;
        cursor: pointer;
        color: ${({theme}) => theme.colors.accent};
        opacity: 0;
        font-size: 13px;
        line-height: 1;
        transition: opacity 0.125s linear;
        padding: 0;
    }

    ${Pre}:hover & button {
        opacity: 1;
    }
`;

const Table = styled.table`
    border-collapse: collapse;
    width: 100%;
    padding: 0.875rem 0;
    display: table;

    tr:first-child td {
        padding-top: 0.875rem;
    }

    tr:last-child td {
        padding-bottom: 0.875rem;
    }
`;

export default function Code({language, code, lineNumber = false, showLanguage = false}: CodeProps): React.JSX.Element {
    const theme = React.useContext<ThemeContextValue>(AppThemeContext);

    const [highlighted, setHighlighted] = React.useState<string>("");
    const [rows, setRows] = React.useState<string>("");

    React.useEffect(() => applyHljsTheme(theme.isDark), [theme.isDark]);

    React.useEffect(() => {
        const result: HighlightResult = hljs.highlight(code.trim(), {
            language,
            ignoreIllegals: true,
        });

        if (lineNumber) setRows(buildLineNumberTable(result.value));
        else setHighlighted(result.value);
    }, [code, language, lineNumber]);

    return (
        <Pre translate="no" className="notranslate">
            {
                showLanguage
                && <PreLabel>
					<span>{language}</span>
				</PreLabel>
            }

            {
                lineNumber
                    ? <Table>
                        <tbody dangerouslySetInnerHTML={{__html: rows}}/>
                    </Table>
                    : <PlainCode dangerouslySetInnerHTML={{__html: highlighted}}/>
            }
        </Pre>
    );
}
