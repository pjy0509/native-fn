import React from "react";
import styled, {css} from "styled-components";
import {rippleAnim} from "../../styled/keyframes";

type ButtonVariant = "Primary" | "Secondary" | "Ghost" | "Danger";
type ButtonSize = "Small" | "Medium" | "Large";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    children: React.ReactNode;
}

interface ButtonStyleProps {
    variant: ButtonVariant;
    size: ButtonSize;
    full: boolean;
}

interface Ripple {
    id: number;
    x: number;
    y: number;
}

const variantMap: Record<ButtonVariant, ReturnType<typeof css>> = {
    Primary: css`
        background: ${({theme}) => theme.colors.accent};
        color: #fff;

        &:hover:not(:disabled) {
            filter: brightness(1.12);
            box-shadow: 0 4px 16px ${({theme}) => theme.colors.accentGlow};
        }
    `,
    Secondary: css`
        background: ${({theme}) => theme.colors.surface};
        color: ${({theme}) => theme.colors.text};
        border-color: ${({theme}) => theme.colors.border};

        &:hover:not(:disabled) {
            background: ${({theme}) => theme.colors.surfaceHover};
            border-color: ${({theme}) => theme.colors.borderActive};
        }
    `,
    Ghost: css`
        background: transparent;
        color: ${({theme}) => theme.colors.accent};

        &:hover:not(:disabled) {
            background: ${({theme}) => theme.colors.accentGlow};
        }
    `,
    Danger: css`
        background: rgba(248, 81, 73, 0.12);
        color: #f85149;
        border-color: rgba(248, 81, 73, 0.35);

        &:hover:not(:disabled) {
            background: rgba(248, 81, 73, 0.2);
            border-color: #f85149;
        }
    `,
};

const sizeMap: Record<ButtonSize, ReturnType<typeof css>> = {
    Small: css`
        padding: 0.375rem 0.75rem;
        font-size: 0.6875rem;
        border-radius: 0.375rem;
    `,
    Medium: css`
        padding: 0.5625rem 1.125rem;
        font-size: 0.8125rem;
        border-radius: 0.5rem;
    `,
    Large: css`
        padding: 0.75rem 1.5rem;
        font-size: 0.875rem;
        border-radius: 0.625rem;
    `,
};

const RippleElement = styled.span`
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.28);
    width: 120px;
    height: 120px;
    margin-top: -60px;
    margin-left: -60px;
    pointer-events: none;
    animation: ${rippleAnim} 0.55s linear forwards;
`;

const StyledButton = styled.button.withConfig({shouldForwardProp: (prop: string) => !["variant", "size", "full"].includes(prop),})<ButtonStyleProps>`
    position: relative;
    overflow: hidden;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4375rem;
    font-family: inherit;
    font-weight: 600;
    border: 1.5px solid transparent;
    cursor: pointer;
    transition: all 0.18s ease;
    user-select: none;
    letter-spacing: 0.3px;
    width: ${({full}) => (full ? "100%" : "auto")};

    ${({variant}) => variantMap[variant]}
    ${({size}) => sizeMap[size]}
    
    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
        filter: none !important;
        box-shadow: none !important;
    }

    &:active:not(:disabled) {
        transform: scale(0.97);
    }
`;

function CommonButton({children, variant = "Primary", size = "Medium", fullWidth = false, onClick, ...rest}: ButtonProps) {
    const [ripples, setRipples]: [Ripple[], React.Dispatch<React.SetStateAction<Ripple[]>>] = React.useState<Ripple[]>([]);
    const ref: React.RefObject<HTMLButtonElement | null> = React.useRef<HTMLButtonElement>(null);

    function onClickButton(event: React.MouseEvent<HTMLButtonElement>): void {
        if (!ref.current) return;

        const rect: DOMRect = ref.current.getBoundingClientRect();
        const id: number = Date.now() + Math.random();

        setRipples((prev: Ripple[]) => [
            ...prev,
            {
                id,
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
            },
        ]);

        setTimeout(() => setRipples((prev: Ripple[]) => prev.filter((ripple: Ripple) => ripple.id !== id)), 600);

        if (onClick !== undefined) onClick(event);
    }

    return (
        <StyledButton
            ref={ref}
            variant={variant}
            size={size}
            full={fullWidth}
            onClick={onClickButton}
            {...rest}
        >
            {
                ripples.map((ripple: Ripple) => <RippleElement key={ripple.id} style={{left: ripple.x, top: ripple.y}}/>)
            }
            {children}
        </StyledButton>
    );
}

function createPresetButton(defaultVariant: ButtonVariant, defaultSize: ButtonSize = "Medium") {
    return function PresetButton({variant, size, ...props}: Omit<ButtonProps, "variant" | "size"> & { variant?: ButtonVariant; size?: ButtonSize; }) {
        return (
            <CommonButton
                variant={variant ?? defaultVariant}
                size={size ?? defaultSize}
                {...props}
            />
        );
    };
}

type PresetButtonComponent = React.FC<
    Omit<ButtonProps, "variant" | "size">
    & {
    variant?: ButtonVariant;
    size?: ButtonSize;
}
>;

type ButtonCompoundComponent = React.FC<ButtonProps> & {
    Primary: PresetButtonComponent & {
        Small: PresetButtonComponent;
        Medium: PresetButtonComponent;
        Large: PresetButtonComponent;
    };
    Secondary: PresetButtonComponent & {
        Small: PresetButtonComponent;
        Medium: PresetButtonComponent;
        Large: PresetButtonComponent;
    };
    Ghost: PresetButtonComponent & {
        Small: PresetButtonComponent;
        Medium: PresetButtonComponent;
        Large: PresetButtonComponent;
    };
    Danger: PresetButtonComponent & {
        Small: PresetButtonComponent;
        Medium: PresetButtonComponent;
        Large: PresetButtonComponent;
    };
};

const Primary: React.FC<ButtonProps> & Record<ButtonSize, React.FC<ButtonProps>> = Object.assign(createPresetButton("Primary", "Medium"), {
    Small: createPresetButton("Primary", "Small"),
    Medium: createPresetButton("Primary", "Medium"),
    Large: createPresetButton("Primary", "Large"),
});

const Secondary: React.FC<ButtonProps> & Record<ButtonSize, React.FC<ButtonProps>> = Object.assign(createPresetButton("Secondary", "Medium"), {
    Small: createPresetButton("Secondary", "Small"),
    Medium: createPresetButton("Secondary", "Medium"),
    Large: createPresetButton("Secondary", "Large"),
});

const Ghost: React.FC<ButtonProps> & Record<ButtonSize, React.FC<ButtonProps>> = Object.assign(createPresetButton("Ghost", "Medium"), {
    Small: createPresetButton("Ghost", "Small"),
    Medium: createPresetButton("Ghost", "Medium"),
    Large: createPresetButton("Ghost", "Large"),
});

const Danger: React.FC<ButtonProps> & Record<ButtonSize, React.FC<ButtonProps>> = Object.assign(createPresetButton("Danger", "Medium"), {
    Small: createPresetButton("Danger", "Small"),
    Medium: createPresetButton("Danger", "Medium"),
    Large: createPresetButton("Danger", "Large"),
});

const Button: ButtonCompoundComponent = Object.assign(CommonButton, {
    Primary,
    Secondary,
    Ghost,
    Danger,
}) as ButtonCompoundComponent;

export default Button;
