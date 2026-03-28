import React from "react";
import styled, {css, keyframes} from "styled-components";
import Field from "./Field";
import FieldLabel from "./FieldLabel";
import ErrorMessage from "./ErrorMessage";
import HintMessage from "./HintMessage";
import {createId} from "../../utils/createId";

export interface TagInputProps {
    label?: string;
    hint?: string;
    error?: string;
    placeholder?: string;
    defaultTags?: string[];
    disabled?: boolean;
    id?: string;
    onChange?: (tags: string[]) => void;
}

export interface TagInputHandle {
    getValue: () => string[];
}

const chipIn = keyframes`
    from {
        opacity: 0;
        transform: scale(0.72) translateY(4px);
    }
    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
`;

const chipOut = keyframes`
    from {
        opacity: 1;
        transform: scale(1);
        max-width: 200px;
    }
    to {
        opacity: 0;
        transform: scale(0.72);
        max-width: 0;
        padding-left: 0;
        padding-right: 0;
        margin-right: 0;
    }
`;

const InputWrap = styled.div.withConfig({shouldForwardProp: (prop: string) => !["focused", "error", "disabled"].includes(prop),})<{ focused: boolean; error: boolean; disabled: boolean }>`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.375rem;
    width: 100%;
    min-height: 2.75rem;
    padding: 0.375rem 0.625rem;
    background: ${({theme}) => theme.colors.pathBg};
    border: 1.5px solid ${({error, theme}) => error ? "#f85149" : theme.colors.border};
    border-radius: 0.5rem;
    cursor: text;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;

    ${({focused, error, theme}) =>
            focused &&
            css`
                border-color: ${error ? "#f85149" : theme.colors.borderActive};
                box-shadow: 0 0 0 3px ${error ? "rgba(248,81,73,0.15)" : theme.colors.accentGlow};
                background: ${theme.colors.surface};
            `}

    ${({disabled}) =>
            disabled &&
            css`
                opacity: 0.4;
                cursor: not-allowed;
            `}
`;

const ChipWrapper = styled.span<{ removing: boolean }>`
    display: inline-flex;
    align-items: center;
    gap: 0.3125rem;
    padding: 0.1875rem 0.375rem 0.1875rem 0.5rem;
    background: ${({theme}) => theme.colors.accentGlow};
    color: ${({theme}) => theme.colors.accent};
    border: 1px solid ${({theme}) => theme.colors.border};
    border-radius: 0.375rem;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.2px;
    white-space: nowrap;
    animation: ${({removing}) =>
            removing
                    ? css`${chipOut} 0.18s ease forwards`
                    : css`${chipIn} 0.2s cubic-bezier(0.34, 1.4, 0.64, 1) forwards`};
    overflow: hidden;
`;

const ChipRemoveBtn = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 0.875rem;
    height: 0.875rem;
    padding: 0;
    border: none;
    background: none;
    color: inherit;
    opacity: 0.55;
    cursor: pointer;
    border-radius: 0.1875rem;
    transition: opacity 0.15s ease;
    flex-shrink: 0;

    &:hover {
        opacity: 1;
    }

    svg {
        width: 0.625rem;
        height: 0.625rem;
        display: block;
    }
`;

const InlineInput = styled.input`
    flex: 1;
    min-width: 7rem;
    height: 1.625rem;
    padding: 0;
    border: none;
    background: transparent;
    outline: none;
    color: ${({theme}) => theme.colors.textStrong};
    font-family: inherit;
    font-size: 0.8125rem;
    line-height: 1.5;

    &::placeholder {
        color: ${({theme}) => theme.colors.textMuted};
        opacity: 0.6;
    }

    &:disabled {
        cursor: not-allowed;
    }
`;

interface ChipProps {
    label: string;
    onRemove: () => void;
    disabled: boolean;
}

function Chip({label, onRemove, disabled}: ChipProps): React.JSX.Element {
    const [removing, setRemoving] = React.useState<boolean>(false);

    function handleRemove(e: React.MouseEvent): void {
        e.stopPropagation();
        if (disabled) return;
        setRemoving(true);
        setTimeout(onRemove, 170);
    }

    return (
        <ChipWrapper removing={removing}>
            <span>{label}</span>
            <ChipRemoveBtn
                type="button"
                onClick={handleRemove}
                disabled={disabled}
                tabIndex={-1}
                aria-label={`Remove ${label}`}
            >
                <svg viewBox="0 0 10 10" fill="none">
                    <path
                        d="M2 2L8 8M8 2L2 8"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                    />
                </svg>
            </ChipRemoveBtn>
        </ChipWrapper>
    );
}


const TagInput = React.forwardRef<TagInputHandle, TagInputProps>(
    function TagInput(
        {
            label,
            hint,
            error,
            placeholder,
            defaultTags = [],
            disabled = false,
            id = createId("tag"),
            onChange,
        }: TagInputProps,
        ref: React.ForwardedRef<TagInputHandle>
    ): React.JSX.Element {
        const [tags, setTags] = React.useState<string[]>(defaultTags);
        const [inputValue, setInputValue] = React.useState<string>("");
        const [focused, setFocused] = React.useState<boolean>(false);
        const inputRef = React.useRef<HTMLInputElement>(null);
        const wrapRef = React.useRef<HTMLDivElement>(null);

        React.useImperativeHandle(ref, () => ({
            getValue: () => tags
        }));

        function addTag(raw: string): void {
            const value: string = raw.trim();
            if (value === "" || tags.includes(value)) return;

            const next: string[] = [...tags, value];
            setTags(next);
            setInputValue("");
            onChange?.(next);
        }

        function removeTag(index: number): void {
            const next: string[] = tags.filter((_: string, i: number) => i !== index);
            setTags(next);
            onChange?.(next);
        }

        function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
            if (e.key === "Enter") {
                if (e.nativeEvent.isComposing) return;

                e.preventDefault();
                addTag(inputValue);
                return;
            }

            if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
                removeTag(tags.length - 1);
            }
        }

        function onChangeInput(e: React.ChangeEvent<HTMLInputElement>): void {
            setInputValue(e.target.value);
        }

        function onWrapClick(): void {
            if (!disabled) inputRef.current?.focus();
        }

        return (
            <Field>
                {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}

                <InputWrap
                    ref={wrapRef}
                    focused={focused}
                    error={error !== undefined}
                    disabled={disabled}
                    onClick={onWrapClick}
                >
                    {tags.map((tag: string, i: number) => (
                        <Chip
                            key={tag}
                            label={tag}
                            onRemove={() => removeTag(i)}
                            disabled={disabled}
                        />
                    ))}

                    <InlineInput
                        ref={inputRef}
                        id={id}
                        value={inputValue}
                        placeholder={tags.length === 0 ? placeholder : ""}
                        disabled={disabled}
                        onChange={onChangeInput}
                        onKeyDown={onKeyDown}
                        onFocus={() => setFocused(true)}
                        onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                            setFocused(false);
                            if (e.target.value.trim() !== "") addTag(e.target.value);
                        }}
                    />
                </InputWrap>

                {error !== undefined
                    ? <ErrorMessage>{error}</ErrorMessage>
                    : hint !== undefined
                        ? <HintMessage>{hint}</HintMessage>
                        : undefined}
            </Field>
        );
    }
);

export default TagInput;
