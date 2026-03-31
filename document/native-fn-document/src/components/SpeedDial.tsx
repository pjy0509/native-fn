import React from "react";
import styled, {keyframes} from "styled-components";

interface IconProps {
    size?: number;
}

export function PlusIcon({size = 20}: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 3.5V16.5M3.5 10H16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
    );
}

export function CloseIcon({size = 20}: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
    );
}

const fadeUp = keyframes`
    from {
        opacity: 0;
        transform: translateY(6px) scale(0.88);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
`;

const Root = styled.div`
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.625rem;
    z-index: 200;

    @media (max-width: 720px) {
        bottom: 1.5rem;
        right: 1.5rem;
    }
`;

const ItemList = styled.div<{ expanded: boolean }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.625rem;
    opacity: ${({expanded}) => (expanded ? 1 : 0)};
    pointer-events: ${({expanded}) => (expanded ? "auto" : "none")};
    transition: opacity 0.2s ease;
`;

const AnimatedSlot = styled.div<{ delay: number }>`
    animation: ${fadeUp} 0.22s ease both;
    animation-delay: ${({delay}) => delay}s;
`;

const FabButton = styled.button`
    width: 46px;
    height: 46px;
    border-radius: 50%;
    border: 1px solid ${({theme}) => theme.colors.border};
    background: ${({theme}) => theme.colors.accent};
    color: #fff;
    cursor: pointer;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.18);

    &:hover {
        transform: scale(1.08);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.22);
    }

    &:active {
        transform: scale(0.96);
    }
`;

const FabIconBase = styled.span`
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    transition: opacity 0.2s ease, transform 0.2s ease;
`;

const FabPlusIcon = styled(FabIconBase)<{ active: boolean }>`
    opacity: ${({active}) => (active ? 0 : 1)};
    transform: ${({active}) => (active ? "rotate(45deg)" : "rotate(0deg)")};
`;

const FabCloseIcon = styled(FabIconBase)<{ active: boolean }>`
    opacity: ${({active}) => (active ? 1 : 0)};
    transform: ${({active}) => (active ? "rotate(0deg)" : "rotate(-45deg)")};
`;

const Btn = styled.button`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 1px solid ${({theme}) => theme.colors.border};
    background: ${({theme}) => theme.colors.surface};
    color: ${({theme}) => theme.colors.textMuted};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background 0.15s, border-color 0.15s, color 0.15s, transform 0.15s;

    &:hover {
        background: ${({theme}) => theme.colors.surfaceHover};
        border-color: ${({theme}) => theme.colors.borderActive};
        color: ${({theme}) => theme.colors.accent};
        transform: scale(1.1);
    }

    &:active {
        transform: scale(0.94);
    }
`;

const Tooltip = styled.span`
    position: absolute;
    right: calc(100% + 0.5rem);
    white-space: nowrap;
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.01em;
    background: ${({theme}) => theme.colors.surface};
    border: 1px solid ${({theme}) => theme.colors.border};
    color: ${({theme}) => theme.colors.text};
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    pointer-events: none;
    opacity: 0;
    transform: translateX(4px);
    transition: opacity 0.15s ease, transform 0.15s ease;
`;

const BtnWrap = styled.div`
    position: relative;
    display: flex;
    align-items: center;

    &:hover ${Tooltip} {
        opacity: 1;
        transform: translateX(0);
    }
`;

interface SpeedDialButtonProps {
    label: string;
    onClick?: () => void;
    children: React.ReactNode;
}

export function SpeedDialButton({label, onClick, children}: SpeedDialButtonProps) {
    return (
        <BtnWrap>
            <Btn onClick={onClick} aria-label={label}>
                {children}
            </Btn>
            <Tooltip>{label}</Tooltip>
        </BtnWrap>
    );
}

interface SpeedDialProps {
    children: React.ReactNode;
}

export default function SpeedDial({children}: SpeedDialProps) {
    const [open, setOpen] = React.useState(false);
    const [hovered, setHovered] = React.useState(false);

    const expanded = open || hovered;

    const handleRootLeave = React.useCallback(() => {
        setHovered(false);
        setOpen(false);
    }, []);

    const handleFabEnter = React.useCallback(() => {
        setHovered(true);
    }, []);

    const handleFabClick = React.useCallback(() => {
        setOpen((prev) => !prev);
    }, []);

    return (
        <Root onMouseLeave={handleRootLeave}>
            <ItemList expanded={expanded}>
                {React.Children.map(children, (child, i) => (
                    <AnimatedSlot key={i} delay={i * 0.04}>
                        {child}
                    </AnimatedSlot>
                ))}
            </ItemList>

            <FabButton
                onMouseEnter={handleFabEnter}
                onClick={handleFabClick}
                aria-label="Speed dial"
            >
                <FabPlusIcon active={expanded}><PlusIcon size={18}/></FabPlusIcon>
                <FabCloseIcon active={expanded}><CloseIcon size={18}/></FabCloseIcon>
            </FabButton>
        </Root>
    );
}
