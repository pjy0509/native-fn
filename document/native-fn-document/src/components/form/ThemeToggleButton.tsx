import React from "react";
import styled, {keyframes, css} from "styled-components";
import {AppThemeContext, ThemeContextValue} from "../../providers/AppThemeProvider";
import Native from "native-fn";

export interface ThemeToggleBtnProps {
    size?: number;
}

interface DecoRect {
    x: number;
    y: number;
    size: number;
    opacity: number;
    delay: number;
}

interface WrapperProps {
    isDark: boolean;
    size: number;
}

interface OrbitArmProps {
    phase: "enter" | "exit";
    radius: number;
}

interface IconNodeProps {
    radius: number;
    size: number;
}

function SunIcon(): React.JSX.Element {
    return (
        <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
            <defs>
                <clipPath clipPathUnits="userSpaceOnUse" id="cp1">
                    <path
                        d="m198.59 400.08c0 53.41 21.22 104.64 58.99 142.41 37.78 37.77 89 58.99 142.42 58.99 53.42 0 104.64-21.22 142.42-58.99 37.77-37.77 58.99-89 58.99-142.41 0-53.42-21.22-104.65-58.99-142.42-37.78-37.77-89-58.99-142.42-58.99-53.42 0-104.64 21.22-142.42 58.99-37.77 37.77-58.99 89-58.99 142.42z"/>
                </clipPath>
            </defs>
            <path fill="#fcd170"
                  d="M 672.724 513.018 L 785.628 400.114 L 672.724 287.21 L 672.724 127.404 L 513.018 127.404 L 400.014 14.5 L 287.01 127.404 L 127.304 127.404 L 127.304 287.21 L 14.4 400.114 L 127.304 513.018 L 127.304 672.724 L 287.01 672.724 L 400.014 785.728 L 513.018 672.724 L 672.724 672.724 L 672.724 513.018 Z"/>
            <g clip-path="url(#cp1)" transform="matrix(1.000036, 0, 0, 1.000036, -0.000523, -0.000526)">
                <path fill="#fa9409" d="m198.6 400.1c0 53.4 21.2 104.6 59 142.4 37.8 37.8 89 59 142.4 59 53.4 0 104.6-21.2 142.4-59 37.8-37.8 59-89 59-142.4 0-53.4-21.2-104.7-59-142.4-37.8-37.8-89-59-142.4-59-53.4 0-104.6 21.2-142.4 59-37.8 37.7-59 89-59 142.4z"/>
                <path fill="#ffc509" d="m218.6 390.1c0 53.4 21.2 104.6 59 142.4 37.8 37.8 89 59 142.4 59 53.4 0 104.6-21.2 142.4-59 37.8-37.8 59-89 59-142.4 0-53.4-21.2-104.7-59-142.4-37.8-37.8-89-59-142.4-59-53.4 0-104.6 21.2-142.4 59-37.8 37.7-59 89-59 142.4z"/>
            </g>
            <ellipse fill="none" stroke="rgb(255, 255, 255)" stroke-width="15" stroke-linecap="round" stroke-dasharray="30, 30, 240, 30, 0, 900" stroke-dashoffset="440.56" transform-box="fill-box" transform-origin="50% 50%" cx="401.781" cy="400.514" rx="175.365" ry="175.365"
                     transform="matrix(0.707107, 0.707107, -0.707107, 0.707107, -0.000001, 0.000244)"/>
        </svg>
    );
}

function MoonIcon(): React.JSX.Element {
    return (
        <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
            <defs>
                <clipPath clipPathUnits="userSpaceOnUse" id="cp1">
                    <path
                        d="m400 733.33c184.09 0 333.33-149.24 333.33-333.33 0-15.42-23.11-17.97-31.09-4.77-37.94 62.79-106.86 104.77-185.57 104.77-119.67 0-216.67-97-216.67-216.67 0-78.72 41.98-147.63 104.77-185.57 13.2-7.98 10.65-31.09-4.77-31.09-184.09 0-333.33 149.23-333.33 333.33 0 184.09 149.24 333.33 333.33 333.33z"/>
                </clipPath>
            </defs>
            <g clip-path="url(#cp1)">
                <path fill="#fa9409"
                      d="m400 733.3c184.1 0 333.3-149.2 333.3-333.3 0-15.4-23.1-18-31.1-4.8-37.9 62.8-106.8 104.8-185.5 104.8-119.7 0-216.7-97-216.7-216.7 0-78.7 42-147.6 104.8-185.5 13.2-8 10.6-31.1-4.8-31.1-184.1 0-333.3 149.2-333.3 333.3 0 184.1 149.2 333.3 333.3 333.3z"/>
                <path fill="#ffc509"
                      d="m86.6 390.2c0 88.4 35.1 173.3 97.7 235.8 62.5 62.6 147.4 97.7 235.8 97.7 88.5 0 173.3-35.1 235.8-97.7 62.6-62.5 97.7-147.4 97.7-235.8 0-88.5-35.1-173.3-97.7-235.8-62.5-62.6-147.3-97.7-235.8-97.7-88.4 0-173.3 35.1-235.8 97.7-62.6 62.5-97.7 147.3-97.7 235.8z"/>
            </g>
            <ellipse fill="none" stroke="rgb(255, 255, 255)" stroke-width="15" stroke-linecap="round" stroke-dasharray="30, 30, 240, 30, 0, 1800" stroke-dashoffset="-1182.27" transform-origin="-515.207px -373.821px" cx="-515.2" cy="-373.83" rx="235.827" ry="240.716"
                     transform="matrix(0.642788, 0.766044, 0.766044, -0.642788, 1034.776079, 660.319986)"
            />
        </svg>
    );
}

function CloudIcon({size, opacity}: { size: number; opacity: number }) {
    return (
        <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width={size} height={size} style={{opacity, display: "block"}}>
            <path
                fill-rule="evenodd"
                fill="#ffffff"
                d="m681.6 666.2v0.5h-524.3v-0.3c-42.5-0.6-83.1-18-112.7-48.6-29.6-30.5-45.8-71.6-44.9-114.2 0.8-42.5 18.5-83 49.3-112.3 30.7-29.4 72-45.3 114.5-44.2q2.4 0 4.9 0.1 2.4 0.1 4.9 0.2 2.4 0.2 4.8 0.4 2.5 0.2 4.9 0.5-0.3-2.4-0.5-4.8-0.1-2.4-0.3-4.8-0.1-2.4-0.2-4.9 0-2.4 0-4.8c1.9-51 23-99.4 59-135.6 36-36.2 84.3-57.5 135.3-59.7 51-2.2 101 14.9 140 47.9 38.9 33 64.1 79.4 70.4 130.1q1.6-0.2 3.3-0.3 1.6-0.2 3.3-0.3 1.7 0 3.3-0.1 1.7 0 3.4 0c16.1-0.2 32 2.7 47 8.6 15 5.8 28.7 14.5 40.4 25.5 11.7 11 21.2 24.1 28 38.7 6.7 14.6 10.6 30.3 11.5 46.4 10.8 4.8 20.8 11.2 29.7 18.9 9 7.7 16.8 16.6 23.3 26.5 6.4 9.9 11.4 20.7 14.8 32 3.4 11.3 5.2 23.1 5.2 34.9-0.1 15.7-3.3 31.3-9.3 45.9-5.9 14.6-14.6 27.9-25.4 39.3-10.9 11.4-23.9 20.6-38.2 27.2-14.3 6.6-29.7 10.4-45.4 11.3z"/>
        </svg>
    )
}

function seededRandom(seed: number, index: number): number {
    const x: number = Math.sin(seed * 9301 + index * 49297 + 233) * 93847;
    return x - Math.floor(x);
}

function cloudRandom(seed: number, i: number, number: number): number {
    return seededRandom(seed, i * 10 + number);
}

function starDotsRandom(seed: number, i: number, number: number): number {
    return seededRandom(seed, i * 10 + number + 100);
}

function starCrossRandom(seed: number, i: number, number: number): number {
    return seededRandom(seed, i * 10 + number + 200);
}

function generateClouds(seed: number, btnSize: number): DecoRect[] {
    return Array.from({length: 8}, (_: unknown, i: number): DecoRect => {
        return {
            x: cloudRandom(seed, i, 0) * 80 - 10,
            y: 45 + cloudRandom(seed, i, 1) * 45,
            size: btnSize * (0.36 + cloudRandom(seed, i, 2) * 0.33),
            opacity: 0.45 + cloudRandom(seed, i, 3) * 0.45,
            delay: cloudRandom(seed, i, 4) * 2.5,
        };
    });
}

function generateStarDots(seed: number, btnSize: number): DecoRect[] {
    return Array.from({length: 8}, (_: unknown, i: number): DecoRect => {
        return {
            x: 5 + starDotsRandom(seed, i, 0) * 80,
            y: 5 + starDotsRandom(seed, i, 1) * 55,
            size: Math.max(1.5, btnSize * (0.025 + starDotsRandom(seed, i, 2) * 0.04)),
            opacity: 0.4 + starDotsRandom(seed, i, 3) * 0.6,
            delay: starDotsRandom(seed, i, 4) * 2.5,
        };
    });
}

function generateStarCross(seed: number, btnSize: number): DecoRect[] {
    return Array.from({length: 2}, (_: unknown, i: number): DecoRect => {
        return {
            x: 10 + starCrossRandom(seed, i, 0) * 65,
            y: 5 + starCrossRandom(seed, i, 1) * 45,
            size: Math.max(4, btnSize * (0.08 + starCrossRandom(seed, i, 2) * 0.08)),
            opacity: 0.65 + starCrossRandom(seed, i, 3) * 0.35,
            delay: starCrossRandom(seed, i, 4) * 2.0,
        };
    });
}

const orbitEnter = keyframes`
    0% {
        transform: rotate(-180deg);
        opacity: 0;
    }
    50% {
        opacity: 1;
    }
    100% {
        transform: rotate(0deg);
        opacity: 1;
    }
`;

const orbitExit = keyframes`
    0% {
        transform: rotate(0deg);
        opacity: 1;
    }
    50% {
        opacity: 0;
    }
    100% {
        transform: rotate(180deg);
        opacity: 0;
    }
`;

const rippleFx = keyframes`
    0% {
        transform: scale(1);
        opacity: 0.2;
    }
    100% {
        transform: scale(2.8);
        opacity: 0;
    }
`;

const twinkle = keyframes`
    0%, 100% {
        opacity: 1;
        transform: scale(1);
    }
    50% {
        opacity: 0.15;
        transform: scale(0.4);
    }
`;

const drift = keyframes`
    0%, 100% {
        transform: translateX(0);
    }
    50% {
        transform: translateX(3px);
    }
`;

const Wrapper = styled.button<WrapperProps>`
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 200;
    width: ${({size}) => size}px;
    height: ${({size}) => size}px;
    border-radius: 50%;
    border: ${({size}) => Math.max(1, Math.round(size * 0.03))}px solid ${({theme}) => theme.colors.border};
    cursor: pointer;
    outline: none;
    padding: 0;
    overflow: hidden;
    background: ${({isDark}) =>
    isDark
        ? "linear-gradient(160deg,#0b1735 0%,#162448 55%,#0e1f3f 100%)"
        : "linear-gradient(160deg,#d6eeff 0%,#bfe0ff 55%,#e8f6ff 100%)"
};
    box-shadow: ${({isDark}) =>
    isDark
        ? "0 4px 18px rgba(80,120,255,0.22),inset 0 1px 0 rgba(255,255,255,0.05)"
        : "0 4px 18px rgba(100,180,255,0.28),inset 0 1px 0 rgba(255,255,255,0.6)"
};
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform .15s ease, border-color .3s, box-shadow .4s, background .6s;

    &:hover {
        transform: scale(1.08);
        border-color: ${({theme}) => theme.colors.borderActive};
    }

    &:active {
        transform: scale(0.91);
    }
`;

const OrbitArm = styled.span<OrbitArmProps>`
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 0;
    transform-origin: 0 ${({radius}) => radius}px;
    pointer-events: none;

    ${({phase}) => phase === "enter"
    ? css`animation: ${orbitEnter} 0.52s cubic-bezier(0.34, 1.28, 0.64, 1) forwards;`
    : css`animation: ${orbitExit} 0.34s ease-in forwards;`
}
`;

const IconNode = styled.span<IconNodeProps>`
    position: absolute;
    left: ${({size}) => -size / 2}px;
    bottom: ${({radius, size}) => radius - size / 2}px;
    width: ${({size}) => size}px;
    height: ${({size}) => size}px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const RippleElement = styled.span`
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: ${({theme}) => theme.colors.accent};
    opacity: 0;
    pointer-events: none;

    ${Wrapper}:active & {
        animation: ${rippleFx} .45s ease-out forwards;
    }
`;

const DecoLayer = styled.div`
    position: absolute;
    inset: 0;
    pointer-events: none;
`;

const CloudWrap = styled.span<DecoRect>`
    position: absolute;
    left: ${({x}) => x}%;
    top: ${({y}) => y}%;
    animation: ${drift} ${({delay}) => 2.6 + delay}s ease-in-out infinite;
    animation-delay: ${({delay}) => delay}s;
`;

const StarDotElement = styled.span<DecoRect>`
    position: absolute;
    left: ${({x}) => x}%;
    top: ${({y}) => y}%;
    width: ${({size}) => size}px;
    height: ${({size}) => size}px;
    border-radius: 50%;
    background: #fff;
    opacity: ${({opacity}) => opacity};
    animation: ${twinkle} ${({delay}) => 1.6 + delay}s ease-in-out infinite;
    animation-delay: ${({delay}) => delay}s;
`;

const StarCrossElement = styled.span<DecoRect>`
    position: absolute;
    left: ${({x}) => x}%;
    top: ${({y}) => y}%;
    width: ${({size}) => size}px;
    height: ${({size}) => size}px;
    opacity: ${({opacity}) => opacity};
    animation: ${twinkle} ${({delay}) => 1.6 + delay}s ease-in-out infinite;
    animation-delay: ${({delay}) => delay}s;

    &::before, 
    &::after {
        content: "";
        position: absolute;
        background: #fff;
        border-radius: 99px;
    }

    &::before {
        width: 100%;
        height: ${({size}) => Math.max(1, Math.round(size * 0.18))}px;
        top: 50%;
        left: 0;
        transform: translateY(-50%);
    }

    &::after {
        height: 100%;
        width: ${({size}) => Math.max(1, Math.round(size * 0.18))}px;
        left: 50%;
        top: 0;
        transform: translateX(-50%);
    }
`;

export default function ThemeToggleBtn({size = 48}: ThemeToggleBtnProps): React.JSX.Element {
    const theme: ThemeContextValue = React.useContext<ThemeContextValue>(AppThemeContext);
    const [animKey, setAnimKey]: [number, React.Dispatch<React.SetStateAction<number>>] = React.useState<number>(0);
    const [showExit, setShowExit]: [boolean, React.Dispatch<React.SetStateAction<boolean>>] = React.useState<boolean>(false);
    const [seed, setSeed]: [number, React.Dispatch<React.SetStateAction<number>>] = React.useState<number>(1);
    const radius: number = size / 2;
    const iconSize: number = Math.round(size * 0.42);
    const clouds: DecoRect[] = React.useMemo((): DecoRect[] => generateClouds(seed, size), [seed, size]);
    const starDots: DecoRect[] = React.useMemo((): DecoRect[] => generateStarDots(seed, size), [seed, size]);
    const starCross: DecoRect[] = React.useMemo((): DecoRect[] => generateStarCross(seed, size), [seed, size]);

    function handleClick(): void {
        setShowExit(true);
        setAnimKey((key: number): number => key + 1);
        setSeed((seed: number): number => seed + 1);
        theme.setTheme(
            theme.isDark
                ? Native.appearance.Constants.Appearances.Light
                : Native.appearance.Constants.Appearances.Dark
        );
        setTimeout(() => setShowExit(false), 360);
    }

    return (
        <Wrapper isDark={theme.isDark} size={size} onClick={handleClick}>
            <RippleElement/>

            {
                <DecoLayer>
                    {
                        theme.isDark
                            ? <>
                                {starDots.map((rect: DecoRect, i: number): React.JSX.Element => <StarDotElement key={i} {...rect}/>)}
                                {starCross.map((rect: DecoRect, i: number): React.JSX.Element => <StarCrossElement key={i} {...rect}/>)}
                            </>
                            : <>
                                {
                                    clouds.map((rect: DecoRect, i: number): React.JSX.Element => <CloudWrap key={i} {...rect}>
                                        <CloudIcon size={rect.size} opacity={rect.opacity}/>
                                    </CloudWrap>)
                                }
                            </>
                    }
                </DecoLayer>
            }

            {showExit && (
                <OrbitArm key={`exit-${animKey}`} phase="exit" radius={radius}>
                    <IconNode radius={radius} size={iconSize}>
                        {theme.isDark ? <SunIcon/> : <MoonIcon/>}
                    </IconNode>
                </OrbitArm>
            )}

            <OrbitArm key={`enter-${animKey}`} phase="enter" radius={radius}>
                <IconNode radius={radius} size={iconSize}>
                    {theme.isDark ? <MoonIcon/> : <SunIcon/>}
                </IconNode>
            </OrbitArm>
        </Wrapper>
    );
}
