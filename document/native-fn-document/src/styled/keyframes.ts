import {keyframes} from "styled-components";

export const checkPop = keyframes`
    0% {
        transform: scale(0.5);
        opacity: 0;
    }
    60% {
        transform: scale(1.2);
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
`;

export const fadeIn = keyframes`
    from {
        opacity: 0;
        transform: translateY(6px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;

export const rippleAnim = keyframes`
    0% {
        transform: scale(0);
        opacity: 0.4;
    }
    100% {
        transform: scale(2.5);
        opacity: 0;
    }
`;

export const pulseGlow = keyframes`
    0%, 100% {
        box-shadow: 0 0 0 0 rgba(74, 144, 217, 0.35);
    }
    50% {
        box-shadow: 0 0 0 5px rgba(74, 144, 217, 0);
    }
`;
