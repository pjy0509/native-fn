import Field from "./Field";
import FieldLabel from "./FieldLabel";
import ErrorMessage from "./ErrorMessage";
import HintMessage from "./HintMessage";
import React from "react";
import styled, {css} from "styled-components";
import globalInputStyle from "../../styled/globalInputStyle";
import {createId} from "../../utils/createId";

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
    label?: string;
    hint?: string;
    error?: string;
    options?: SelectOption[];
    onChange?: (value: string) => void;
}

interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

const SelectWrap = styled.div`
    position: relative;

    svg {
        position: absolute;
        right: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        pointer-events: none;
        color: ${({theme}) => theme.colors.textMuted};
    }
`;

const StyledSelect = styled.select.withConfig({shouldForwardProp: (prop: string) => prop !== "error"})<{ error: boolean }>`
    ${
            css<{ error: boolean }>`
                ${globalInputStyle};
                appearance: none;
                padding-right: 2.25rem;
                cursor: pointer;
            `
    }`;

function Select({label, hint, error, id, options, onChange, ...rest}: SelectProps = {id: createId("sel")}): React.JSX.Element {
    function onChangeSelect(event: React.ChangeEvent<HTMLSelectElement, HTMLSelectElement>): void {
        if (onChange !== undefined) onChange(event.target.value);
    }

    return (
        <Field>
            {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}

            <SelectWrap>
                <StyledSelect
                    id={id}
                    error={error !== undefined}
                    onChange={onChangeSelect}
                    {...rest}
                >
                    {
                        options && options.map((option: SelectOption) => <option
                            key={option.value}
                            value={option.value}
                            disabled={option.disabled}
                        >
                            {option.label}
                        </option>)
                    }
                </StyledSelect>

                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </SelectWrap>

            {
                error !== undefined
                    ? <ErrorMessage>{error}</ErrorMessage>
                    : hint !== undefined
                        ? <HintMessage>{hint}</HintMessage>
                        : undefined
            }
        </Field>
    );
}

export default Select;
