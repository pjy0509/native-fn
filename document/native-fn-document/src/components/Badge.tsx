import styled, {css} from "styled-components";
import React from "react";

export type BadgeVariant = "Default" | "Success" | "Warning" | "Danger";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
    children?: React.ReactNode;
}

interface BadgeStyleProps {
    variant: BadgeVariant;
}

const badgeVariantMap: Record<BadgeVariant, ReturnType<typeof css>> = {
    Default: css`
        background: ${({theme}) => theme.colors.accentGlow};
        color: ${({theme}) => theme.colors.accent};
        border-color: ${({theme}) => theme.colors.border};
    `,
    Success: css`
        background: rgba(63, 185, 80, 0.15);
        color: #3fb950;
        border-color: rgba(63, 185, 80, 0.3);
    `,
    Warning: css`
        background: rgba(210, 153, 34, 0.15);
        color: #d2991a;
        border-color: rgba(210, 153, 34, 0.3);
    `,
    Danger: css`
        background: rgba(248, 81, 73, 0.15);
        color: #f85149;
        border-color: rgba(248, 81, 73, 0.3);
    `,
};

const StyledBadge = styled.span.withConfig({shouldForwardProp: (prop: string) => prop !== "variant",})<BadgeStyleProps>`
    display: inline-flex;
    align-items: center;
    padding: 0.125rem 0.5rem;
    border-radius: 1.25rem;
    font-size: 0.625rem;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    border: 1px solid transparent;
    ${({variant}) => badgeVariantMap[variant]}
`;

function CommonBadge({children, variant = "Default", ...rest}: BadgeProps) {
    return (
        <StyledBadge variant={variant} {...rest}>
            {children}
        </StyledBadge>
    );
}

function createPresetBadge(defaultVariant: BadgeVariant) {
    return function PresetBadge({variant, ...props}: BadgeProps) {
        return (
            <CommonBadge
                variant={variant ?? defaultVariant}
                {...props}
            />
        );
    };
}

type PresetBadgeComponent = React.FC<BadgeProps>;

type BadgeCompoundComponent = React.FC<BadgeProps> & {
    Default: PresetBadgeComponent;
    Success: PresetBadgeComponent;
    Warning: PresetBadgeComponent;
    Danger: PresetBadgeComponent;
};

const Badge: BadgeCompoundComponent = Object.assign(CommonBadge, {
    Default: createPresetBadge("Default"),
    Success: createPresetBadge("Success"),
    Warning: createPresetBadge("Warning"),
    Danger: createPresetBadge("Danger"),
}) as BadgeCompoundComponent;

export default Badge;
