import React from "react";
import styled, {css, keyframes, RuleSet} from "styled-components";

type TypographyVariant =
    | "H1" | "H2" | "H3" | "H4" | "H5" | "H6"
    | "Body1" | "Body2"
    | "Caption"
    | "Label"
    | "Code"
    | "Overline";

type TypographyTag =
    | "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
    | "p" | "span" | "label" | "code" | "div";

export interface TypographyProps {
    as?: TypographyTag;
    children?: React.ReactNode;
    loading?: boolean;
    skeletonWidth?: string;
    className?: string;
    style?: React.CSSProperties;
    htmlFor?: string;
}

interface StyledTypographyProps {
    loading: boolean;
    skeletonWidth: string;
    variant: TypographyVariant;
}

const shimmer = keyframes`
    0% {
        opacity: 0.4;
    }
    50% {
        opacity: 1;
    }
    100% {
        opacity: 0.4;
    }
`;

const variantMap: Record<TypographyVariant, RuleSet> = {
    H1: css`
        font-size: 2rem;
        font-weight: 700;
        line-height: 1.2;
        letter-spacing: -0.02em;
        color: ${({theme}) => theme.colors.textStrong};
    `,
    H2: css`
        font-size: 1.5rem;
        font-weight: 700;
        line-height: 1.25;
        letter-spacing: -0.015em;
        color: ${({theme}) => theme.colors.textStrong};
    `,
    H3: css`
        font-size: 1.25rem;
        font-weight: 600;
        line-height: 1.3;
        letter-spacing: -0.01em;
        color: ${({theme}) => theme.colors.textStrong};
    `,
    H4: css`
        font-size: 1.0625rem;
        font-weight: 600;
        line-height: 1.35;
        color: ${({theme}) => theme.colors.textStrong};
    `,
    H5: css`
        font-size: 0.9375rem;
        font-weight: 600;
        line-height: 1.4;
        color: ${({theme}) => theme.colors.textStrong};
    `,
    H6: css`
        font-size: 0.875rem;
        font-weight: 600;
        line-height: 1.4;
        color: ${({theme}) => theme.colors.text};
    `,
    Body1: css`
        font-size: 0.9375rem;
        font-weight: 400;
        line-height: 1.65;
        color: ${({theme}) => theme.colors.text};
    `,
    Body2: css`
        font-size: 0.8125rem;
        font-weight: 400;
        line-height: 1.6;
        color: ${({theme}) => theme.colors.text};
    `,
    Caption: css`
        font-size: 0.6875rem;
        font-weight: 400;
        line-height: 1.5;
        color: ${({theme}) => theme.colors.textMuted};
    `,
    Label: css`
        font-size: 0.6875rem;
        font-weight: 600;
        line-height: 1.4;
        letter-spacing: 0.6px;
        text-transform: uppercase;
        color: ${({theme}) => theme.colors.textMuted};
    `,
    Code: css`
        font-size: 0.8125rem;
        font-weight: 400;
        line-height: 1.6;
        font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
        background: ${({theme}) => theme.colors.pathBg};
        border: 1px solid ${({theme}) => theme.colors.border};
        border-radius: 0.25rem;
        padding: 0.125rem 0.375rem;
        color: ${({theme}) => theme.colors.accent};
    `,
    Overline: css`
        font-size: 0.625rem;
        font-weight: 700;
        line-height: 1.4;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: ${({theme}) => theme.colors.textMuted};
    `,
};

const skeletonHeightMap: Record<TypographyVariant, string> = {
    H1: "2rem",
    H2: "1.5rem",
    H3: "1.25rem",
    H4: "1.0625rem",
    H5: "0.9375rem",
    H6: "0.875rem",
    Body1: "0.9375rem",
    Body2: "0.8125rem",
    Caption: "0.6875rem",
    Label: "0.6875rem",
    Code: "0.8125rem",
    Overline: "0.625rem",
};

const skeletonStyle = css<StyledTypographyProps>`
    width: ${({skeletonWidth}) => skeletonWidth};
    height: ${({variant}) => skeletonHeightMap[variant]};
    border-radius: 0.375rem;
    background: ${({theme}) => theme.colors.border};
    animation: ${shimmer} 1.4s ease-in-out infinite;

    color: transparent !important;
    border-color: transparent !important;

    &::before, &::after {
        display: none;
    }
`;

const StyledTypography = styled.span.withConfig({shouldForwardProp: (prop: string) => !["loading", "skeletonWidth", "variant"].includes(prop)})<StyledTypographyProps>`
    display: block;
    margin: 0;
    padding: 0;

    ${({variant}) => variantMap[variant]}

    ${({loading}) => loading && skeletonStyle}
`;

const defaultTagMap: Record<TypographyVariant, TypographyTag> = {
    H1: "h1",
    H2: "h2",
    H3: "h3",
    H4: "h4",
    H5: "h5",
    H6: "h6",
    Body1: "p",
    Body2: "p",
    Caption: "span",
    Label: "label",
    Code: "code",
    Overline: "span",
};

function createTypography(variant: TypographyVariant) {
    return function TypographyVariantComponent({as, children, loading = false, skeletonWidth = "70%", ...rest}: TypographyProps): React.JSX.Element {
        return (
            <StyledTypography
                as={as ?? defaultTagMap[variant]}
                variant={variant}
                loading={loading}
                skeletonWidth={skeletonWidth}
                {...rest}
            >
                {loading ? null : children}
            </StyledTypography>
        );
    };
}

function CommonTypography({as, children, loading = false, skeletonWidth = "70%", variant = "H1", ...rest}: TypographyProps & { variant?: TypographyVariant }): React.JSX.Element {
    return (
        <StyledTypography
            as={as ?? defaultTagMap[variant]}
            variant={variant}
            loading={loading}
            skeletonWidth={skeletonWidth}
            {...rest}
        >
            {loading ? null : children}
        </StyledTypography>
    );
}

type TypographyPreset = React.FC<TypographyProps>;

type TypographyCompoundComponent = React.FC<TypographyProps & { variant?: TypographyVariant }> & {
    H1: TypographyPreset;
    H2: TypographyPreset;
    H3: TypographyPreset;
    H4: TypographyPreset;
    H5: TypographyPreset;
    H6: TypographyPreset;
    Body1: TypographyPreset;
    Body2: TypographyPreset;
    Caption: TypographyPreset;
    Label: TypographyPreset;
    Code: TypographyPreset;
    Overline: TypographyPreset;
};

const Typography: TypographyCompoundComponent = Object.assign(CommonTypography, {
    H1: createTypography("H1"),
    H2: createTypography("H2"),
    H3: createTypography("H3"),
    H4: createTypography("H4"),
    H5: createTypography("H5"),
    H6: createTypography("H6"),
    Body1: createTypography("Body1"),
    Body2: createTypography("Body2"),
    Caption: createTypography("Caption"),
    Label: createTypography("Label"),
    Code: createTypography("Code"),
    Overline: createTypography("Overline"),
}) as TypographyCompoundComponent;

export default Typography;
