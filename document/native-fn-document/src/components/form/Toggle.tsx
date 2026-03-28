import styled, {css} from "styled-components";
import React from "react";

interface ToggleProps {
    label?: string;
    checked?: boolean;
    onChange?: (value: boolean) => void;
    disabled?: boolean;
}

const ToggleTrack = styled.span.withConfig({shouldForwardProp: (prop: string) => prop !== "on"})<{ on?: boolean }>`
    position: relative;
    width: 2.375rem;
    height: 1.375rem;
    border-radius: 0.6875rem;
    border: 1.5px solid ${({on, theme}) => on ? theme.colors.borderActive : theme.colors.border};
    background: ${({on, theme}) => on ? theme.colors.accent : theme.colors.pathBg};
    transition: all 0.22s ease;
    flex-shrink: 0;

    ${({on, theme}) => on && css`
        box-shadow: 0 0 0 3px ${theme.colors.accentGlow};
    `}
    
    &::after {
        content: '';
        position: absolute;
        top: 0.1875rem;
        left: ${({on}) => on ? "calc(100% - 1rem)" : "0.1875rem"};
        width: 0.875rem;
        height: 0.875rem;
        border-radius: 50%;
        background: ${({on}) => on ? "#fff" : "rgba(255,255,255,0.5)"};
        transition: left 0.22s ease, background 0.22s ease;
    }
`;

function Toggle({label, checked, onChange, disabled}: ToggleProps): React.JSX.Element {
    function onChangeToggle(): void {
        if (disabled) return;

        checked = !checked;

        if (onChange) onChange(checked);
    }

    return (
        <div
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.625rem",
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.45 : 1,
                fontSize: "0.8125rem",
            }}
            onClick={onChangeToggle}
        >
            <ToggleTrack on={checked}/>

            {label && <span>{label}</span>}
        </div>
    );
}

export default Toggle;
