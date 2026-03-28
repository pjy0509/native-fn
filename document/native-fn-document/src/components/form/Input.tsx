import Field from "./Field";
import FieldLabel from "./FieldLabel";
import ErrorMessage from "./ErrorMessage";
import HintMessage from "./HintMessage";
import React from "react";
import styled from "styled-components";
import globalInputStyle from "../../styled/globalInputStyle";
import {createId} from "../../utils/createId";

type InputTypeValueMap = {
    text: string;
    password: string;
    email: string;
    tel: string;
    url: string;
    search: string;
    color: string;
    hidden: string;
    number: number;
    range: number;
    date: string;
    "datetime-local": string;
    time: string;
    month: string;
    week: string;
    checkbox: boolean;
    radio: boolean;
    file: FileList | null;
};

type InputType = keyof InputTypeValueMap;

export interface InputProps<T extends InputType = "text"> extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "type"> {
    type?: T;
    label?: string;
    hint?: string;
    error?: string;
    onChange?: (value: InputTypeValueMap[T]) => void;
}

const StyledInput = styled.input.withConfig({shouldForwardProp: (prop: string) => prop !== "error",})<{ error: boolean }>`
    ${globalInputStyle}
`;

export default function Input<T extends InputType = "text">({label, hint, error, id = createId("inp"), onChange, type, ...rest}: InputProps<T>): React.JSX.Element {
    function onChangeInput(event: React.ChangeEvent<HTMLInputElement>): void {
        if (onChange === undefined) return;

        const resolvedType: T | "text" = type ?? "text";
        let value: InputTypeValueMap[InputType];

        switch (resolvedType) {
            case "number":
            case "range":
                value = event.target.valueAsNumber;
                break;
            case "checkbox":
            case "radio":
                value = event.target.checked;
                break;
            case "file":
                value = event.target.files;
                break;
            default:
                value = event.target.value;
        }

        onChange(value as InputTypeValueMap[T]);
    }

    return (
        <Field>
            {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}

            <StyledInput
                id={id}
                type={type}
                error={error !== undefined}
                onChange={onChangeInput}
                {...rest}
            />

            {error !== undefined
                ? <ErrorMessage>{error}</ErrorMessage>
                : hint !== undefined
                    ? <HintMessage>{hint}</HintMessage>
                    : undefined}
        </Field>
    );
}
