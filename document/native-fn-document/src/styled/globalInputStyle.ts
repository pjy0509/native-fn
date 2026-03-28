import {css, RuleSet} from "styled-components";

const globalInputStyle: RuleSet<{ error: boolean }> = css<{ error: boolean }>`
    width: 100%;
    padding: 0.625rem 0.875rem;
    background: ${({theme}) => theme.colors.pathBg};
    border: 1.5px solid ${({error, theme}) => error ? "#f85149" : theme.colors.border};
    border-radius: 0.5rem;
    color: ${({theme}) => theme.colors.textStrong};
    font-family: inherit;
    font-size: 0.8125rem;
    line-height: 1.5;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;

    &::placeholder {
        color: ${({theme}) => theme.colors.textMuted};
        opacity: 0.6;
    }

    &:hover:not(:disabled) {
        border-color: ${({error, theme}) => error ? "#f85149" : theme.colors.textMuted};
    }

    &:focus {
        border-color: ${({error, theme}) => error ? "#f85149" : theme.colors.borderActive};
        box-shadow: 0 0 0 3px ${({error, theme}) => error ? "rgba(248,81,73,0.15)" : theme.colors.accentGlow};
        background: ${({theme}) => theme.colors.surface};
    }

    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
`;

export default globalInputStyle;
