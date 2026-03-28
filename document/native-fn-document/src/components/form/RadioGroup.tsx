import styled, {css} from "styled-components";
import Field from "./Field";
import FieldLabel from "./FieldLabel";
import React, {ChangeEventHandler} from "react";
import {createId} from "../../utils/createId";

export interface RadioGroupProps {
    label?: string;
    name?: string;
    value?: string;
    onChange?: (value: string) => void;
    options?: RadioProps[];
}

interface RadioProps {
    label?: string;
    checked?: boolean;
    onChange?: ChangeEventHandler<HTMLInputElement, HTMLInputElement>;
    name?: string;
    value: string;
    disabled?: boolean;
}

const RadioWrap = styled.label.withConfig({shouldForwardProp: (prop: string) => prop !== "disabled"})<{ disabled?: boolean }>`
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

const RadioDot = styled.span.withConfig({shouldForwardProp: (prop: string) => prop !== "checked"})<{ checked?: boolean }>`
    width: 1.125em;
    height: 1.125em;
    flex-shrink: 0;
    border-radius: 50%;
    border: 1.5px solid ${({theme, checked}) => checked ? theme.colors.borderActive : theme.colors.border};
    background: ${({theme}) => theme.colors.pathBg};
    transition: all 0.18s ease;
    display: flex;
    align-items: center;
    justify-content: center;

    ${({checked, theme}) => checked && css`
        box-shadow: 0 0 0 3px ${theme.colors.accentGlow};
    `}
    
    &::after {
        content: '';
        width: 0.5em;
        height: 0.5em;
        border-radius: 50%;
        background: ${({theme}) => theme.colors.accent};
        transform: scale(${({checked}) => checked ? 1 : 0});
        opacity: ${({checked}) => checked ? 1 : 0};
        transition: transform 0.18s ease, opacity 0.18s ease;
    }
`;

function Radio({label, checked, onChange, name, value, disabled}: RadioProps): React.JSX.Element {
    return (
        <RadioWrap disabled={disabled}>
            <input type="radio" name={name} value={value} checked={checked} onChange={onChange} disabled={disabled}/>

            <RadioDot checked={checked}/>

            {label && <span>{label}</span>}
        </RadioWrap>
    );
}

function RadioGroup({label, name = createId("rg"), value, onChange, options}: RadioGroupProps): React.JSX.Element {
    function onChangeInput(event: React.ChangeEvent<HTMLInputElement, HTMLInputElement>): void {
        if (onChange !== undefined) onChange(event.target.value);
    }

    return (
        <Field>
            {label && <FieldLabel>{label}</FieldLabel>}

            <div style={{display: "flex", flexDirection: "column", gap: "0.625rem"}}>
                {
                    options && options.map((option: RadioProps) => <Radio
                        key={option.value}
                        label={option.label}
                        name={name}
                        value={option.value}
                        checked={value === option.value}
                        onChange={onChangeInput}
                        disabled={option.disabled}
                    />)
                }
            </div>
        </Field>
    );
}

export default RadioGroup;
