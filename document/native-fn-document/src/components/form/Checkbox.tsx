import React from "react";
import styled, {css} from "styled-components";
import {checkPop, pulseGlow} from "../../styled/keyframes";

export interface CheckboxProps {
    label?: string;
    checked: boolean;
    disabled?: boolean;
    onChange?: (value: boolean) => void;
}

const CheckWrap = styled.label.withConfig({shouldForwardProp: (prop: string) => prop !== "disabled"})<{ disabled?: boolean }>`
    display: inline-flex;
    align-items: center;
    gap: 0.625em;
    cursor: ${({disabled}) => disabled ? "not-allowed" : "pointer"};
    opacity: ${({disabled}) => disabled ? 0.45 : 1};
    user-select: none;
    font-size: 0.8125rem;
    color: ${({theme}) => theme.colors.text};

    input {
        display: none;
    }
`;

const StyledCheckBox = styled.span.withConfig({shouldForwardProp: (prop: string) => prop !== "checked"})<{ checked?: boolean }>`
    width: 1.125em;
    height: 1.125em;
    flex-shrink: 0;
    border-radius: 0.3125rem;
    border: 1.5px solid ${({checked, theme}) => checked ? theme.colors.borderActive : theme.colors.border};
    background: ${({checked, theme}) => checked ? theme.colors.accent : theme.colors.pathBg};
    transition: all 0.18s ease;
    display: flex;
    align-items: center;
    justify-content: center;

    ${({checked, theme}) => checked && css`
        box-shadow: 0 0 0 3px ${theme.colors.accentGlow};
        animation: ${pulseGlow} 0.4s ease;
    `}
    svg {
        width: 0.6875em;
        height: 0.6875em;
        color: #fff;
        opacity: ${({checked}) => checked ? 1 : 0};
        ${({checked}) => checked && css`
            animation: ${checkPop} 0.22s ease forwards;
        `}
    }
`;

export default function Checkbox({label, checked, onChange, disabled}: CheckboxProps): React.JSX.Element {
    function onChangeInput(event: React.ChangeEvent<HTMLInputElement, HTMLInputElement>): void {
        if (onChange !== undefined) onChange(event.target.checked);
    }

    return (
        <CheckWrap disabled={disabled}>
            <input type="checkbox" checked={checked} onChange={onChangeInput} disabled={disabled}/>

            <StyledCheckBox checked={checked}>
                <svg viewBox="0 0 12 12" fill="none">
                    <polyline points="2,6 5,9 10,3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </StyledCheckBox>

            {label && <span>{label}</span>}
        </CheckWrap>
    );
}
