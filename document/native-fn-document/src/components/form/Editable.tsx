import React from "react";
import styled, { css } from "styled-components";
import globalInputStyle from "../../styled/globalInputStyle";

export interface EditableProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "children"> {
    content?: string;
    error?: boolean;
    onChange?: (html: string) => void;
}

const StyledDiv = styled.div.withConfig({shouldForwardProp: (prop: string) => prop !== "error"})<{ error: boolean }>`
    ${css<{ error: boolean }>`
        ${globalInputStyle};
        resize: vertical;
    `}
`;

const Editable = React.forwardRef<HTMLDivElement, EditableProps>(({content, error = false, onChange, ...rest}: EditableProps, ref): React.JSX.Element => {
        const innerRef = React.useRef<HTMLDivElement | null>(null);

        React.useImperativeHandle(ref, () => innerRef.current as HTMLDivElement, []);
        React.useEffect(() => {
            const element = innerRef.current;

            if (!element || content === undefined) return;

            element.innerHTML = content;
        });

        function handleInput(e: React.FormEvent<HTMLDivElement>): void {
            onChange?.(e.currentTarget.innerHTML);
        }

        return <StyledDiv
            ref={innerRef}
            error={error}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            {...rest}
        />;
    }
);

Editable.displayName = "Editable";

export default Editable;
