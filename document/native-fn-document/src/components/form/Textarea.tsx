import Field from "./Field";
import FieldLabel from "./FieldLabel";
import ErrorMessage from "./ErrorMessage";
import HintMessage from "./HintMessage";
import React from "react";
import globalInputStyle from "../../styled/globalInputStyle";
import styled, {css} from "styled-components";
import {createId} from "../../utils/createId";

export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
    label?: string;
    hint?: string;
    error?: string;
    onChange?: (value: string) => void;
}

const StyledTextarea = styled.textarea.withConfig({shouldForwardProp: (prop: string) => prop !== "error"})<{ error: boolean }>`
    ${
            css<{ error: boolean }>`
                ${globalInputStyle};
                resize: vertical;
            `
    }`;

export default function Textarea({label, hint, error, id = createId("ta"), onChange, rows = 4, ...rest}: TextareaProps): React.JSX.Element {
    function onChangeTextarea(event: React.ChangeEvent<HTMLTextAreaElement, HTMLTextAreaElement>): void {
        if (onChange !== undefined) onChange(event.target.value);
    }

    return (
        <Field>
            {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}

            <StyledTextarea
                id={id}
                error={error !== undefined}
                rows={rows}
                style={{minHeight: `${rows * 24 + 20}px`}}
                onChange={onChangeTextarea}
                {...rest}
            />

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
