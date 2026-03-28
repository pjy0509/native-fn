import styled, {css} from "styled-components";
import {fadeIn} from "../styled/keyframes";
import React, {ReactNode} from "react";
import Badge, {BadgeVariant} from "./Badge";

export interface CardProps {
    title?: string;
    subtitle?: string;
    badge?: string;
    badgeVariant?: BadgeVariant;
    children: ReactNode;
    footer?: ReactNode;
    hoverable?: boolean;
}

const CardRoot = styled.div.withConfig({shouldForwardProp: (prop) => prop !== "hoverable",})<{ hoverable?: boolean }>`
    background: ${({theme}) => theme.colors.surface};
    border: 1px solid ${({theme}) => theme.colors.border};
    border-radius: 0.75rem;
    overflow: hidden;
    animation: ${fadeIn} 0.35s ease;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;

    ${({hoverable, theme}) => hoverable && css`
        cursor: pointer;

        &:hover {
            border-color: ${theme.colors.borderActive};
            box-shadow: 0 0.5rem 1.5rem ${theme.colors.accentGlow};
        }
    `}
`;

const CardHeader = styled.div`
    padding: 1rem 1.25rem 0.875rem;
    border-bottom: 1px solid ${({theme}) => theme.colors.border};
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
`;

const CardTitle = styled.h3`
    font-size: 0.875rem;
    font-weight: 600;
    color: ${({theme}) => theme.colors.textStrong};
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const CardSubtitle = styled.p`
    font-size: 0.6875rem;
    color: ${({theme}) => theme.colors.textMuted};
    margin-top: 0.125rem;
`;

const CardBody = styled.div`
    padding: 1.25rem;
`;

const CardFooter = styled.div`
    padding: 0.875rem 1.25rem;
    border-top: 1px solid ${({theme}) => theme.colors.border};
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.625rem;
    background: ${({theme}) => theme.colors.pathBg};
`;

export default function Card({title, subtitle, badge, badgeVariant = "Default", children, footer, hoverable}: CardProps): React.JSX.Element {
    return (
        <CardRoot hoverable={hoverable}>
            {(title || subtitle || badge) && (
                <CardHeader>
                    <div>
                        <CardTitle>
                            {title}
                            {badge && <Badge variant={badgeVariant}>{badge}</Badge>}
                        </CardTitle>
                        {subtitle && <CardSubtitle>{subtitle}</CardSubtitle>}
                    </div>
                </CardHeader>
            )}
            <CardBody>{children}</CardBody>
            {footer && <CardFooter>{footer}</CardFooter>}
        </CardRoot>
    );
}
