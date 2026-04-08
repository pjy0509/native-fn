import React, {RefObject, useEffect, useMemo, useRef, useState} from "react";
import styled, {DefaultTheme, useTheme} from "styled-components";
import Scrollbar from "smooth-scrollbar";
import {DeviceOrientationValue, Dimensions, EnvironmentPresetValues, Orientation} from "native-fn/dimension";
import Native from "native-fn";
import Button from "./form/Button";
import Typography from "./form/Typography";
import {OS} from "native-fn/platform";

type OrientationLockType =
    | "any"
    | "natural"
    | "landscape"
    | "portrait"
    | "portrait-primary"
    | "portrait-secondary"
    | "landscape-primary"
    | "landscape-secondary";

declare global {
    interface ScreenOrientation {
        lock(orientation: OrientationLockType): Promise<void>;

        unlock(): void;

        readonly type: OrientationType;
        readonly angle: number;

        addEventListener(
            type: "change",
            listener: (this: ScreenOrientation, ev: Event) => any,
            options?: boolean | AddEventListenerOptions
        ): void;

        removeEventListener(
            type: "change",
            listener: (this: ScreenOrientation, ev: Event) => any,
            options?: boolean | EventListenerOptions
        ): void;
    }
}

interface DeviceOrientationEventConstructorWithPermission {
    requestPermission(): Promise<PermissionState>;
}

const MINIMAP_SHORT_SIDE = 180;
const PADDING = 12;
const BUTTON_PROTRUSION = 4;
const VIEWBOX_MARGIN = 3;

const IOS_MUTE_OFFSET = 14;
const IOS_MUTE_SIZE = 10;
const IOS_VOL_UP_OFFSET = 30;
const IOS_VOL_SIZE = 18;
const IOS_VOL_DN_OFFSET = 54;
const IOS_POWER_OFFSET = 40;
const IOS_POWER_SIZE = 30;
const IOS_DI_INSET = 5;
const IOS_DI_SHORT = 14;
const IOS_DI_LONG = 44;
const IOS_DI_CAM_OFFSET = 10;
const IOS_EARPIECE_INSET = 5;
const IOS_EARPIECE_SHORT = 3;
const IOS_EARPIECE_LONG = 28;
const IOS_HOME_INSET = 10;
const IOS_HOME_SHORT = 4;
const IOS_HOME_LONG = 56;
const IOS_SPEAKER_INSET = 5;
const IOS_SPEAKER_HALF_SPAN = 14;
const IOS_SPEAKER_GAP = 7;

const ANDROID_POWER_OFFSET = 28;
const ANDROID_POWER_SIZE = 22;
const ANDROID_VOL_OFFSET = 58;
const ANDROID_VOL_SIZE = 30;
const ANDROID_CAM_INSET = 10;
const ANDROID_NAV_INSET = 9;
const ANDROID_NAV_HALF_W = 24;
const ANDROID_NAV_H = 3;
const ANDROID_L_POWER_X_OFFSET = 60;
const ANDROID_L_VOL_X_OFFSET = 98;

const DESKTOP_TITLEBAR_H = 16;

const BASE_TILT_X = 0;
const BASE_TILT_Y = 0;
const MOTION_TILT_SCALE = 0.25;
const MOTION_TILT_CLAMP = 28;

const CORNER_POLYGON_STEPS = 15;

interface LayerColor {
    fill: string;
    stroke: string;
    label: string;
}

const LAYER_COLORS: Record<string, LayerColor> = {
    safeAreaInset: {fill: "rgba(96,165,250,0.20)", stroke: "#3b82f6", label: "Safe Area Inset"},
    safeAreaMaxInset: {fill: "rgba(167,139,250,0.20)", stroke: "#8b5cf6", label: "Safe Area Max Inset"},
    keyboardInset: {fill: "rgba(251,191,36,0.20)", stroke: "#f59e0b", label: "Keyboard Inset"},
    titlebarArea: {fill: "rgba(52,211,153,0.20)", stroke: "#10b981", label: "Titlebar Area"},
    viewportSegment: {fill: "rgba(248,113,113,0.20)", stroke: "#ef4444", label: "Viewport Segment"},
};

type LayerVisibilityState = Record<keyof typeof LAYER_COLORS, boolean>;

interface Bazel {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

interface DeviceSpec {
    bezel: Bazel;
    outerRadius: number;
    screenRadius: number;
}

interface FramePalette {
    body: string;
    bodyStroke: string;
    button: string;
    buttonStroke: string;
    camera: string;
    indicator: string;
    cameraStroke: string;
    cameraLens: string;
    sensor: string;
    webcamLens: string;
    titlebarBg: string;
    titlebarIcon: string;
    titlebarBtnBg: string;
}

interface DeviceThicknessProps {
    viewBoxResult: ViewBoxResult;
    isDarkMode: boolean;
    dynamicTiltX: number;
    dynamicTiltY: number;
    depth?: number;
}

const DEVICE_SPECIFICATIONS: Record<OS, DeviceSpec> = {
    [OS.iOS]: {bezel: {top: 16, right: 6, bottom: 20, left: 6}, outerRadius: 22, screenRadius: 18},
    [OS.Android]: {bezel: {top: 12, right: 5, bottom: 18, left: 5}, outerRadius: 6, screenRadius: 3},
    [OS.Windows]: {bezel: {top: 16, right: 0, bottom: 0, left: 0}, outerRadius: 0, screenRadius: 3},
    [OS.MacOS]: {bezel: {top: 16, right: 0, bottom: 0, left: 0}, outerRadius: 0, screenRadius: 3},
    [OS.Unknown]: {bezel: {top: 0, right: 0, bottom: 0, left: 0}, outerRadius: 0, screenRadius: 0},
};

interface ViewBoxResult {
    viewBox: string;
    svgWidth: number;
    svgHeight: number;
    deviceX: number;
    deviceY: number;
    deviceWidth: number;
    deviceHeight: number;
    bezel: Bazel;
    outerRadius: number;
    screenRadius: number;
    isLandscape: boolean;
    isClockwiseRotation: boolean;
}

function rotateClockwise(bezelSides: Bazel): Bazel {
    return {top: bezelSides.left, right: bezelSides.top, bottom: bezelSides.right, left: bezelSides.bottom};
}

function rotateCounterClockwise(bezelSides: Bazel): Bazel {
    return {top: bezelSides.right, right: bezelSides.bottom, bottom: bezelSides.left, left: bezelSides.top};
}

function computeViewBox(os: OS, minimapWidth: number, minimapHeight: number, orientation: Orientation): ViewBoxResult {
    const isLandscape: boolean = Orientation.isLandscape(orientation);
    const isClockwiseRotation: boolean = orientation === Orientation.LandscapePrimary;

    const deviceSpecification: DeviceSpec = DEVICE_SPECIFICATIONS[os];
    const isMobileLandscape: boolean = isLandscape && (os === OS.iOS || os === OS.Android);
    const bezel: Bazel = isMobileLandscape ? (isClockwiseRotation ? rotateClockwise(deviceSpecification.bezel) : rotateCounterClockwise(deviceSpecification.bezel)) : deviceSpecification.bezel;

    const deviceX: number = PADDING - bezel.left;
    const deviceY: number = PADDING - bezel.top;
    const deviceWidth: number = minimapWidth + bezel.left + bezel.right;
    const deviceHeight: number = minimapHeight + bezel.top + bezel.bottom;

    const hasButtonLeft: boolean = !isLandscape && os === OS.iOS;
    const hasButtonRight: boolean = !isLandscape && (os === OS.iOS || os === OS.Android);
    const hasButtonTop: boolean = isLandscape && os === OS.iOS;
    const hasButtonBottom: boolean = isLandscape && (os === OS.iOS || os === OS.Android);

    const expandLeft: number = Math.max(0, bezel.left - PADDING + (hasButtonLeft ? BUTTON_PROTRUSION : 0) + VIEWBOX_MARGIN);
    const expandRight: number = Math.max(0, bezel.right - PADDING + (hasButtonRight ? BUTTON_PROTRUSION : 0) + VIEWBOX_MARGIN);
    const expandTop: number = Math.max(0, bezel.top - PADDING + (hasButtonTop ? BUTTON_PROTRUSION : 0) + VIEWBOX_MARGIN);
    const expandBottom: number = Math.max(0, bezel.bottom - PADDING + (hasButtonBottom ? BUTTON_PROTRUSION : 0) + VIEWBOX_MARGIN);

    const viewBoxMinX: number = -expandLeft;
    const viewBoxMinY: number = -expandTop;
    const viewBoxWidth: number = minimapWidth + PADDING * 2 + expandLeft + expandRight;
    const viewBoxHeight: number = minimapHeight + PADDING * 2 + expandTop + expandBottom;

    return {
        viewBox: `${viewBoxMinX} ${viewBoxMinY} ${viewBoxWidth} ${viewBoxHeight}`,
        svgWidth: viewBoxWidth,
        svgHeight: viewBoxHeight,
        deviceX,
        deviceY,
        deviceWidth,
        deviceHeight,
        bezel,
        outerRadius: deviceSpecification.outerRadius,
        screenRadius: deviceSpecification.screenRadius,
        isLandscape,
        isClockwiseRotation,
    };
}

function remapTiltAxes(rawX: number, rawY: number, orientation: Orientation): [number, number] {
    switch (orientation) {
        case Orientation.LandscapePrimary:
            return [rawY, -rawX];
        case Orientation.PortraitSecondary:
            return [-rawX, -rawY];
        case Orientation.LandscapeSecondary:
            return [-rawY, rawX];
        default:
            return [rawX, rawY];
    }
}

function makeFramePalette(isDarkMode: boolean): FramePalette {
    if (isDarkMode) return {
        body: "#334d6e", bodyStroke: "#4e6f96", button: "#263d58", buttonStroke: "#3d5c7e",
        camera: "#060c18", indicator: "#5878a0", cameraStroke: "#1a2e48", cameraLens: "#080f1c",
        sensor: "#0d1824", webcamLens: "#0d1828",
        titlebarBg: "rgba(255,255,255,0.03)",
        titlebarIcon: "rgba(255,255,255,0.6)",
        titlebarBtnBg: "rgba(255,255,255,0.05)",
    };
    return {
        body: "#dde4ef", bodyStroke: "#b5c2d5", button: "#c8d0df", buttonStroke: "#9aaac0",
        camera: "#080f1c", indicator: "#8898b5", cameraStroke: "#141e2e", cameraLens: "#080f1c",
        sensor: "#0d1624", webcamLens: "#0d1628",
        titlebarBg: "rgba(0,0,0,0.03)",
        titlebarIcon: "rgba(0,0,0,0.5)",
        titlebarBtnBg: "rgba(0,0,0,0.04)",
    };
}

interface DeviceFrameProps {
    viewBoxResult: ViewBoxResult;
    minimapWidth: number;
    minimapHeight: number;
    isDarkMode: boolean;
    isClockwiseRotation?: boolean;
}

function buildCornerBandPath(cx: number, cy: number, startAngleDeg: number, endAngleDeg: number, radius: number, backDx: number, backDy: number): string {
    const frontPts: Array<[number, number]> = [];
    const backPts: Array<[number, number]> = [];

    for (let i: number = 0; i <= CORNER_POLYGON_STEPS; i++) {
        const t: number = i / CORNER_POLYGON_STEPS;
        const angleRad: number = ((startAngleDeg + t * (endAngleDeg - startAngleDeg)) * Math.PI) / 180;
        const px: number = cx + radius * Math.cos(angleRad);
        const py: number = cy + radius * Math.sin(angleRad);

        frontPts.push([px, py]);
        backPts.push([px + backDx, py + backDy]);
    }

    const parts: string[] = [`M ${frontPts[0][0]} ${frontPts[0][1]}`];

    for (let i: number = 1; i < frontPts.length; i++) parts.push(`L ${frontPts[i][0]} ${frontPts[i][1]}`);
    for (let i: number = backPts.length - 1; i >= 0; i--) parts.push(`L ${backPts[i][0]} ${backPts[i][1]}`);

    parts.push("Z");

    return parts.join(" ");
}

function DeviceThickness({viewBoxResult, isDarkMode, dynamicTiltX, dynamicTiltY, depth = 10}: DeviceThicknessProps): React.JSX.Element {
    const {deviceX, deviceY, deviceWidth, deviceHeight, outerRadius} = viewBoxResult;

    const faceFillColor: string = isDarkMode ? "#0b111c" : "#9aaac0";
    const faceStrokeColor: string = isDarkMode ? "#1a2535" : "#8898b5";

    const x: number = deviceX;
    const y: number = deviceY;
    const w: number = deviceWidth;
    const h: number = deviceHeight;
    const r: number = outerRadius;

    const effectiveTiltX: number = BASE_TILT_X + dynamicTiltX;
    const effectiveTiltY: number = BASE_TILT_Y + dynamicTiltY;

    const AMPLIFY: number = 3;
    const backDx: number = -depth * Math.sin((effectiveTiltY * Math.PI) / 180) * AMPLIFY;
    const backDy: number = depth * Math.sin((effectiveTiltX * Math.PI) / 180) * AMPLIFY;

    const verticalFace: "top" | "bottom" = effectiveTiltX < 0 ? "top" : "bottom";
    const horizontalFace: "left" | "right" = effectiveTiltY > 0 ? "left" : "right";
    const visibleFaceSet: Set<string> = new Set<string>([verticalFace, horizontalFace]);

    const faceSharedProps = {fill: faceFillColor, stroke: faceStrokeColor, strokeWidth: "0.6"} as const;

    const facePathMap: Record<string, React.JSX.Element> = {
        top: <path key="face-top" {...faceSharedProps} d={[`M ${x + r} ${y}`, `L ${x + w - r} ${y}`, `L ${x + w - r + backDx} ${y + backDy}`, `L ${x + r + backDx} ${y + backDy}`, "Z"].join(" ")}/>,
        bottom: <path key="face-bottom" {...faceSharedProps} d={[`M ${x + r} ${y + h}`, `L ${x + w - r} ${y + h}`, `L ${x + w - r + backDx} ${y + h + backDy}`, `L ${x + r + backDx} ${y + h + backDy}`, "Z"].join(" ")}/>,
        left: <path key="face-left" {...faceSharedProps} d={[`M ${x} ${y + r}`, `L ${x} ${y + h - r}`, `L ${x + backDx} ${y + h - r + backDy}`, `L ${x + backDx} ${y + r + backDy}`, "Z"].join(" ")}/>,
        right: <path key="face-right" {...faceSharedProps} d={[`M ${x + w} ${y + r}`, `L ${x + w} ${y + h - r}`, `L ${x + w + backDx} ${y + h - r + backDy}`, `L ${x + w + backDx} ${y + r + backDy}`, "Z"].join(" ")}/>,
    };

    const cornerPaths: React.JSX.Element[] = [];

    if (r > 0) {
        if (visibleFaceSet.has("top") || visibleFaceSet.has("left")) cornerPaths.push(<path key="corner-tl"{...faceSharedProps} d={buildCornerBandPath(x + r, y + r, 180, 270, r, backDx, backDy)}/>);
        if (visibleFaceSet.has("top") || visibleFaceSet.has("right")) cornerPaths.push(<path key="corner-tr"{...faceSharedProps} d={buildCornerBandPath(x + w - r, y + r, 270, 360, r, backDx, backDy)}/>);
        if (visibleFaceSet.has("bottom") || visibleFaceSet.has("right")) cornerPaths.push(<path key="corner-br"{...faceSharedProps} d={buildCornerBandPath(x + w - r, y + h - r, 0, 90, r, backDx, backDy)}/>);
        if (visibleFaceSet.has("bottom") || visibleFaceSet.has("left")) cornerPaths.push(<path key="corner-bl"{...faceSharedProps} d={buildCornerBandPath(x + r, y + h - r, 90, 180, r, backDx, backDy)}/>);
    }

    return <>
        {[verticalFace, horizontalFace].map((face: string) => facePathMap[face])}
        {cornerPaths}
    </>;
}

function DeviceBackground({viewBoxResult, isDarkMode}: DeviceFrameProps): React.JSX.Element {
    const {deviceX, deviceY, deviceWidth, deviceHeight, outerRadius} = viewBoxResult;
    const palette: FramePalette = makeFramePalette(isDarkMode);

    return <rect x={deviceX} y={deviceY} width={deviceWidth} height={deviceHeight} rx={outerRadius} ry={outerRadius} fill={palette.body} stroke={palette.bodyStroke} strokeWidth="1.2"/>;
}

function IOSPortraitOverlay({viewBoxResult, minimapWidth, isDarkMode}: DeviceFrameProps): React.JSX.Element {
    const {deviceX, deviceY, deviceWidth, deviceHeight} = viewBoxResult;
    const palette: FramePalette = makeFramePalette(isDarkMode);
    const screenX: number = PADDING;
    const screenY: number = PADDING;
    const screenCenterX: number = screenX + minimapWidth / 2;
    const dynamicIslandCenterY: number = screenY + IOS_DI_INSET + IOS_DI_SHORT / 2;

    return <>
        <rect x={deviceX - BUTTON_PROTRUSION} y={screenY + IOS_MUTE_OFFSET} width={BUTTON_PROTRUSION} height={IOS_MUTE_SIZE} rx={1.5} fill={palette.button} stroke={palette.buttonStroke} strokeWidth="0.7"/>
        <rect x={deviceX - BUTTON_PROTRUSION} y={screenY + IOS_VOL_UP_OFFSET} width={BUTTON_PROTRUSION} height={IOS_VOL_SIZE} rx={1.5} fill={palette.button} stroke={palette.buttonStroke} strokeWidth="0.7"/>
        <rect x={deviceX - BUTTON_PROTRUSION} y={screenY + IOS_VOL_DN_OFFSET} width={BUTTON_PROTRUSION} height={IOS_VOL_SIZE} rx={1.5} fill={palette.button} stroke={palette.buttonStroke} strokeWidth="0.7"/>
        <rect x={deviceX + deviceWidth} y={screenY + IOS_POWER_OFFSET} width={BUTTON_PROTRUSION} height={IOS_POWER_SIZE} rx={1.5} fill={palette.button} stroke={palette.buttonStroke} strokeWidth="0.7"/>
        <rect x={screenCenterX - IOS_EARPIECE_LONG / 2} y={deviceY + IOS_EARPIECE_INSET} width={IOS_EARPIECE_LONG} height={IOS_EARPIECE_SHORT} rx={1.5} fill={palette.camera} opacity="0.8"/>
        <rect x={screenCenterX - IOS_DI_LONG / 2} y={screenY + IOS_DI_INSET} width={IOS_DI_LONG} height={IOS_DI_SHORT} rx={7} fill={palette.camera}/>
        <circle cx={screenCenterX + IOS_DI_CAM_OFFSET} cy={dynamicIslandCenterY} r={4} fill={palette.camera} stroke={palette.cameraStroke} strokeWidth="1"/>
        <circle cx={screenCenterX + IOS_DI_CAM_OFFSET} cy={dynamicIslandCenterY} r={2} fill={palette.cameraLens} opacity="0.6"/>
        <circle cx={screenCenterX - IOS_DI_CAM_OFFSET} cy={dynamicIslandCenterY} r={1.5} fill={palette.sensor} opacity="0.7"/>
        <rect x={screenCenterX - IOS_HOME_LONG / 2} y={deviceY + deviceHeight - IOS_HOME_INSET} width={IOS_HOME_LONG} height={IOS_HOME_SHORT} rx={2} fill={palette.indicator} opacity="0.7"/>
        {Array.from({length: 5}, (_: unknown, index: number) => <rect key={index} x={screenCenterX - IOS_SPEAKER_HALF_SPAN + index * IOS_SPEAKER_GAP} y={deviceY + deviceHeight - IOS_SPEAKER_INSET} width={3} height={2} rx={1} fill={palette.camera} opacity="0.7"/>)}
    </>;
}

function IOSLandscapeOverlay({viewBoxResult, minimapWidth, minimapHeight, isDarkMode, isClockwiseRotation = true}: DeviceFrameProps): React.JSX.Element {
    const {deviceX, deviceY, deviceWidth, deviceHeight} = viewBoxResult;
    const palette: FramePalette = makeFramePalette(isDarkMode);
    const screenX: number = PADDING;
    const screenY: number = PADDING;
    const screenWidth: number = minimapWidth;
    const screenHeight: number = minimapHeight;

    const dynamicIslandX: number = isClockwiseRotation ? screenX + screenWidth - (IOS_DI_SHORT + IOS_DI_INSET) : screenX + IOS_DI_INSET;
    const dynamicIslandY: number = screenY + screenHeight / 2 - IOS_DI_LONG / 2;
    const pillCenterY: number = dynamicIslandY + IOS_DI_LONG / 2;
    const cameraCenterY: number = isClockwiseRotation ? pillCenterY + IOS_DI_CAM_OFFSET : pillCenterY - IOS_DI_CAM_OFFSET;
    const sensorCenterY: number = isClockwiseRotation ? pillCenterY - IOS_DI_CAM_OFFSET : pillCenterY + IOS_DI_CAM_OFFSET;
    const earpieceX: number = isClockwiseRotation ? deviceX + deviceWidth - (IOS_EARPIECE_SHORT + IOS_EARPIECE_INSET) : deviceX + IOS_EARPIECE_INSET;
    const homeIndicatorX: number = isClockwiseRotation ? deviceX + (IOS_HOME_INSET - IOS_HOME_SHORT) : deviceX + deviceWidth - IOS_HOME_INSET;
    const homeIndicatorY: number = screenY + screenHeight / 2 - IOS_HOME_LONG / 2;
    const speakerDotsX: number = isClockwiseRotation ? deviceX + (IOS_SPEAKER_INSET - 2) : deviceX + deviceWidth - IOS_SPEAKER_INSET;
    const muteButtonX: number = isClockwiseRotation ? screenX + screenWidth - (IOS_MUTE_SIZE + IOS_MUTE_OFFSET) : screenX + IOS_MUTE_OFFSET;
    const volUpButtonX: number = isClockwiseRotation ? screenX + screenWidth - (IOS_VOL_SIZE + IOS_VOL_UP_OFFSET) : screenX + IOS_VOL_UP_OFFSET;
    const volDnButtonX: number = isClockwiseRotation ? screenX + screenWidth - (IOS_VOL_SIZE + IOS_VOL_DN_OFFSET) : screenX + IOS_VOL_DN_OFFSET;
    const volumeButtonY: number = isClockwiseRotation ? deviceY - BUTTON_PROTRUSION : deviceY + deviceHeight;
    const powerButtonX: number = isClockwiseRotation ? screenX + screenWidth - (IOS_POWER_OFFSET + IOS_POWER_SIZE) : screenX + IOS_POWER_OFFSET;
    const powerButtonY: number = isClockwiseRotation ? deviceY + deviceHeight : deviceY - BUTTON_PROTRUSION;

    return <>
        <rect x={muteButtonX} y={volumeButtonY} width={IOS_MUTE_SIZE} height={BUTTON_PROTRUSION} rx={1.5} fill={palette.button} stroke={palette.buttonStroke} strokeWidth="0.7"/>
        <rect x={volUpButtonX} y={volumeButtonY} width={IOS_VOL_SIZE} height={BUTTON_PROTRUSION} rx={1.5} fill={palette.button} stroke={palette.buttonStroke} strokeWidth="0.7"/>
        <rect x={volDnButtonX} y={volumeButtonY} width={IOS_VOL_SIZE} height={BUTTON_PROTRUSION} rx={1.5} fill={palette.button} stroke={palette.buttonStroke} strokeWidth="0.7"/>
        <rect x={powerButtonX} y={powerButtonY} width={IOS_POWER_SIZE} height={BUTTON_PROTRUSION} rx={1.5} fill={palette.button} stroke={palette.buttonStroke} strokeWidth="0.7"/>
        <rect x={earpieceX} y={screenY + screenHeight / 2 - IOS_EARPIECE_LONG / 2} width={IOS_EARPIECE_SHORT} height={IOS_EARPIECE_LONG} rx={1.5} fill={palette.camera} opacity="0.8"/>
        <rect x={dynamicIslandX} y={dynamicIslandY} width={IOS_DI_SHORT} height={IOS_DI_LONG} rx={7} fill={palette.camera}/>
        <circle cx={dynamicIslandX + IOS_DI_SHORT / 2} cy={cameraCenterY} r={4} fill={palette.camera} stroke={palette.cameraStroke} strokeWidth="1"/>
        <circle cx={dynamicIslandX + IOS_DI_SHORT / 2} cy={cameraCenterY} r={2} fill={palette.cameraLens} opacity="0.6"/>
        <circle cx={dynamicIslandX + IOS_DI_SHORT / 2} cy={sensorCenterY} r={1.5} fill={palette.sensor} opacity="0.7"/>
        <rect x={homeIndicatorX} y={homeIndicatorY} width={IOS_HOME_SHORT} height={IOS_HOME_LONG} rx={2} fill={palette.indicator} opacity="0.7"/>
        {Array.from({length: 5}, (_: unknown, index: number) => <rect key={index} x={speakerDotsX} y={screenY + screenHeight / 2 - IOS_SPEAKER_HALF_SPAN + index * IOS_SPEAKER_GAP} width={2} height={3} rx={1} fill={palette.camera} opacity="0.7"/>)}
    </>;
}

function AndroidPortraitOverlay({viewBoxResult, minimapWidth, minimapHeight, isDarkMode}: DeviceFrameProps): React.JSX.Element {
    const {deviceX, deviceWidth} = viewBoxResult;
    const palette: FramePalette = makeFramePalette(isDarkMode);
    const screenX: number = PADDING;
    const screenY: number = PADDING;
    const screenCenterX: number = screenX + minimapWidth / 2;

    return <>
        <rect x={deviceX + deviceWidth} y={screenY + ANDROID_POWER_OFFSET} width={BUTTON_PROTRUSION} height={ANDROID_POWER_SIZE} rx={1.5} fill={palette.button} stroke={palette.buttonStroke} strokeWidth="0.7"/>
        <rect x={deviceX + deviceWidth} y={screenY + ANDROID_VOL_OFFSET} width={BUTTON_PROTRUSION} height={ANDROID_VOL_SIZE} rx={1.5} fill={palette.button} stroke={palette.buttonStroke} strokeWidth="0.7"/>
        <circle cx={screenCenterX} cy={screenY + ANDROID_CAM_INSET} r={5.5} fill={palette.camera}/>
        <circle cx={screenCenterX} cy={screenY + ANDROID_CAM_INSET} r={2.5} fill={palette.cameraLens} opacity="0.5"/>
        <rect x={screenCenterX - ANDROID_NAV_HALF_W} y={screenY + minimapHeight - ANDROID_NAV_INSET} width={ANDROID_NAV_HALF_W * 2} height={ANDROID_NAV_H} rx={1.5} fill={palette.indicator} opacity="0.6"/>
    </>;
}

function AndroidLandscapeOverlay({viewBoxResult, minimapWidth, minimapHeight, isDarkMode, isClockwiseRotation = true}: DeviceFrameProps): React.JSX.Element {
    const {deviceY, deviceHeight} = viewBoxResult;
    const palette: FramePalette = makeFramePalette(isDarkMode);
    const screenX: number = PADDING;
    const screenY: number = PADDING;
    const screenWidth: number = minimapWidth;
    const screenHeight: number = minimapHeight;
    const cameraCenterX: number = isClockwiseRotation ? screenX + screenWidth - ANDROID_CAM_INSET : screenX + ANDROID_CAM_INSET;
    const powerX: number = isClockwiseRotation ? screenX + screenWidth - ANDROID_L_POWER_X_OFFSET : screenX + ANDROID_L_POWER_X_OFFSET - ANDROID_POWER_SIZE;
    const volX: number = isClockwiseRotation ? screenX + screenWidth - ANDROID_L_VOL_X_OFFSET : screenX + ANDROID_L_VOL_X_OFFSET - ANDROID_VOL_SIZE;
    const cameraCenterY: number = screenY + screenHeight / 2;
    const physicalButtonY: number = isClockwiseRotation ? deviceY + deviceHeight : deviceY - BUTTON_PROTRUSION;
    const navX: number = isClockwiseRotation ? screenX + ANDROID_NAV_INSET - ANDROID_NAV_H : screenX + screenWidth - ANDROID_NAV_INSET;

    return <>
        <rect x={powerX} y={physicalButtonY} width={ANDROID_POWER_SIZE} height={BUTTON_PROTRUSION} rx={1.5} fill={palette.button} stroke={palette.buttonStroke} strokeWidth="0.7"/>
        <rect x={volX} y={physicalButtonY} width={ANDROID_VOL_SIZE} height={BUTTON_PROTRUSION} rx={1.5} fill={palette.button} stroke={palette.buttonStroke} strokeWidth="0.7"/>
        <circle cx={cameraCenterX} cy={cameraCenterY} r={5.5} fill={palette.camera}/>
        <circle cx={cameraCenterX} cy={cameraCenterY} r={2.5} fill={palette.cameraLens} opacity="0.5"/>
        <rect x={navX} y={cameraCenterY - ANDROID_NAV_HALF_W} width={ANDROID_NAV_H} height={ANDROID_NAV_HALF_W * 2} rx={1.5} fill={palette.indicator} opacity="0.6"/>
    </>;
}

function WindowsOverlay({viewBoxResult, minimapWidth, isDarkMode}: DeviceFrameProps): React.JSX.Element {
    const {deviceY} = viewBoxResult;
    const palette: FramePalette = makeFramePalette(isDarkMode);
    const screenX: number = PADDING;
    const centerY: number = deviceY + DESKTOP_TITLEBAR_H / 2;
    const btnW: number = 14;
    const p: number = 4;
    const closeX: number = screenX + minimapWidth - btnW;
    const maxX: number = closeX - btnW;
    const minX: number = maxX - btnW;

    return <>
        <rect x={screenX} y={deviceY} width={minimapWidth} height={DESKTOP_TITLEBAR_H} fill={palette.titlebarBg}/>

        <rect x={minX} y={deviceY} width={btnW} height={DESKTOP_TITLEBAR_H} fill={palette.titlebarBtnBg}/>
        <line x1={minX + p} y1={centerY} x2={minX + btnW - p} y2={centerY} stroke={palette.titlebarIcon} strokeWidth="1.2" strokeLinecap="round"/>

        <rect x={maxX} y={deviceY} width={btnW} height={DESKTOP_TITLEBAR_H} fill={palette.titlebarBtnBg}/>
        <rect x={maxX + p} y={centerY - 3} width={btnW - p * 2} height={btnW - p * 2 - 1} fill="none" stroke={palette.titlebarIcon} strokeWidth="0.9"/>

        <rect x={closeX} y={deviceY} width={btnW} height={DESKTOP_TITLEBAR_H} fill={palette.titlebarBtnBg}/>
        <line x1={closeX + p} y1={centerY - 3} x2={closeX + btnW - p} y2={centerY + 3} stroke={palette.titlebarIcon} strokeWidth="1.2" strokeLinecap="round"/>
        <line x1={closeX + p} y1={centerY + 3} x2={closeX + btnW - p} y2={centerY - 3} stroke={palette.titlebarIcon} strokeWidth="1.2" strokeLinecap="round"/>
    </>;
}

function MacOSOverlay({viewBoxResult, minimapWidth, isDarkMode}: DeviceFrameProps): React.JSX.Element {
    const {deviceY} = viewBoxResult;
    const palette: FramePalette = makeFramePalette(isDarkMode);
    const screenX: number = PADDING;
    const centerY: number = deviceY + DESKTOP_TITLEBAR_H / 2;
    const r: number = 3.5;
    const gap: number = 10;
    const startX: number = screenX + 8;

    return <>
        <rect x={screenX} y={deviceY} width={minimapWidth} height={DESKTOP_TITLEBAR_H} fill={palette.titlebarBg}/>
        <circle cx={startX} cy={centerY} r={r} fill="#ff5f57"/>
        <circle cx={startX + gap} cy={centerY} r={r} fill="#febc2e"/>
        <circle cx={startX + gap * 2} cy={centerY} r={r} fill="#28c840"/>
    </>;
}

function DeviceOverlay(props: DeviceFrameProps & { os: OS }): React.JSX.Element | null {
    const {os, viewBoxResult} = props;
    switch (os) {
        case OS.iOS:
            return viewBoxResult.isLandscape ? <IOSLandscapeOverlay {...props}/> : <IOSPortraitOverlay {...props}/>;
        case OS.Android:
            return viewBoxResult.isLandscape ? <AndroidLandscapeOverlay {...props}/> : <AndroidPortraitOverlay {...props}/>;
        case OS.Windows:
            return <WindowsOverlay {...props}/>;
        case OS.MacOS:
            return <MacOSOverlay {...props}/>;
        default:
            return null;
    }
}

const Wrapper = styled.div`
    padding: 1.25rem;
    box-sizing: border-box;
`;

const Header = styled.div`
    margin-bottom: 1rem;
`;

const DimensionCaption = styled.p`
    margin: 0.25rem 0 0;
    font-size: 0.75rem;
    color: ${({theme}) => theme.colors.textMuted};
    font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
`;

const Body = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    width: 100%;
`;

const Card = styled.div`
    background: ${({theme}) => theme.colors.surface};
    border: 1px solid ${({theme}) => theme.colors.border};
    border-radius: 0.625rem;
    padding: 0.875rem;
    width: 100%;
    box-sizing: border-box;
`;

const MinimapCard = styled(Card)`
    border-radius: 0.75rem;
    padding: 1.25rem;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const MinimapSvg = styled.svg`
    display: block;
    overflow: visible;
`;

const MinimapBackground = styled.rect`
    fill: ${({theme}) => theme.colors.pathBg};
    stroke: ${({theme}) => theme.colors.border};
    stroke-width: 1;
`;

const CardTitle = styled.div`
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.4px;
    color: ${({theme}) => theme.colors.textStrong};
    margin-bottom: 0.5rem;
`;

const ButtonRow = styled.div`
    display: flex;
    gap: 0.5rem;
`;

const LegendScrollContainer = styled.div`
    overflow: hidden;
`;

const LegendScrollContent = styled.div`
    display: flex;
    flex-direction: row;
    gap: 0.375rem;
    width: max-content;
    padding-bottom: 0.675rem;
`;

const LegendItem = styled.div<{ active: boolean }>`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    cursor: pointer;
    user-select: none;
    flex-shrink: 0;
    opacity: ${({active}) => (active ? 1 : 0.3)};
    transition: opacity 0.15s ease, background 0.15s ease;

    &:hover {
        background: ${({theme}) => theme.colors.surfaceHover};
    }
`;

const LegendSwatch = styled.div<{ fill: string; stroke: string }>`
    width: 0.8125rem;
    height: 0.8125rem;
    border-radius: 0.1875rem;
    flex-shrink: 0;
    background: ${({fill}) => fill};
    border: 2px solid ${({stroke}) => stroke};
`;

const LegendLabel = styled.span`
    font-size: 0.75rem;
    color: ${({theme}) => theme.colors.text};
    white-space: nowrap;
`;

const PerspectiveStage = styled.div`
    perspective: 900px;
    perspective-origin: 50% 40%;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const RotatingDevice = styled.div<{ deviceTransform: string }>`
    transform: ${({deviceTransform}) => deviceTransform};
    transition: transform 0.55s cubic-bezier(0.34, 1.36, 0.64, 1);
    display: inline-flex;
    filter: drop-shadow(0 20px 32px rgba(0, 0, 0, 0.38));
    will-change: transform;
`;

declare global {
    interface Navigator {
        readonly virtualKeyboard?: VirtualKeyboard;
    }
}

interface VirtualKeyboardEventMap {
    geometrychange: Event;
}

interface VirtualKeyboard extends EventTarget {
    overlaysContent: boolean;
}

export default function EnvironmentVisualizer(): React.JSX.Element {
    if ("virtualKeyboard" in navigator && typeof navigator.virtualKeyboard !== "undefined" && "overlaysContent" in navigator.virtualKeyboard) navigator.virtualKeyboard.overlaysContent = true;

    const theme: DefaultTheme = useTheme();
    const isDarkMode: boolean = theme.mode === "dark";
    const hiddenInputRef: RefObject<HTMLInputElement | null> = useRef<HTMLInputElement>(null);
    const legendScrollRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null);

    const [dimensions, setDimensions] = useState<Dimensions>(Native.dimension.value);
    const [screenOrientation, setScreenOrientation] = useState<Orientation>(Native.dimension.screenOrientation.value);
    const [safeAreaInset, setSafeAreaInset] = useState<EnvironmentPresetValues<"safe-area-inset">>(Native.dimension.environment.safeAreaInset.value);
    const [safeAreaMaxInset, setSafeAreaMaxInset] = useState<EnvironmentPresetValues<"safe-area-max-inset">>(Native.dimension.environment.safeAreaMaxInset.value);
    const [keyboardInset, setKeyboardInset] = useState<EnvironmentPresetValues<"keyboard-inset">>(Native.dimension.environment.keyboardInset.value);
    const [titlebarArea, setTitlebarArea] = useState<EnvironmentPresetValues<"titlebar-area">>(Native.dimension.environment.titlebarArea.value);
    const [viewportSegments, setViewportSegments] = useState<EnvironmentPresetValues<"viewport-segment">[]>(Native.dimension.environment.viewportSegment.value);
    const [layerVisibility, setLayerVisibility] = useState<LayerVisibilityState>({safeAreaInset: true, safeAreaMaxInset: true, keyboardInset: true, titlebarArea: true, viewportSegment: true});
    const [isOrientationLocked, setIsOrientationLocked] = useState<boolean>(false);

    const [deviceBeta, setDeviceBeta] = useState<number>(0);
    const [deviceGamma, setDeviceGamma] = useState<number>(0);

    const [isMotionPermissionGranted, setIsMotionPermissionGranted] = useState<boolean>(
        Native.platform.os.name !== OS.iOS,
    );

    useEffect(() => {
        if (!legendScrollRef.current) return;

        const scrollbar = Scrollbar.init(legendScrollRef.current, {
            damping: 0.08,
            renderByPixels: true,
            alwaysShowTracks: false,
            continuousScrolling: true,
        });
        return () => scrollbar.destroy();
    }, []);

    useEffect(() => {
        const unsubscribers: (() => void)[] = [
            Native.dimension.onChange(setDimensions),
            Native.dimension.screenOrientation.onChange(setScreenOrientation),
            Native.dimension.environment.safeAreaInset.onChange(setSafeAreaInset),
            Native.dimension.environment.safeAreaMaxInset.onChange(setSafeAreaMaxInset),
            Native.dimension.environment.keyboardInset.onChange(setKeyboardInset),
            Native.dimension.environment.titlebarArea.onChange(setTitlebarArea),
            Native.dimension.environment.viewportSegment.onChange(setViewportSegments),
        ];
        return () => unsubscribers.forEach((unsubscribe: () => void) => unsubscribe());
    }, []);

    useEffect(() => {
        if (!isMotionPermissionGranted) return;

        return Native.dimension.deviceOrientation.onChange((value: DeviceOrientationValue) => {
            setDeviceBeta(value.beta ?? 0);
            setDeviceGamma(value.gamma ?? 0);
        });
    }, [isMotionPermissionGranted]);

    useEffect(() => {
        function onFullscreenChange(): void {
            if (!document.fullscreenElement) setIsOrientationLocked(false);
        }

        document.addEventListener("fullscreenchange", onFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
    }, []);

    async function requestMotionPermission(): Promise<void> {
        try {
            const DeviceOrientationEventWithPermission = DeviceOrientationEvent as unknown as DeviceOrientationEventConstructorWithPermission;
            if (typeof DeviceOrientationEventWithPermission.requestPermission === "function") {
                const permissionState: PermissionState = await DeviceOrientationEventWithPermission.requestPermission();
                setIsMotionPermissionGranted(permissionState === "granted");
            } else {
                setIsMotionPermissionGranted(true);
            }
        } catch {
            setIsMotionPermissionGranted(false);
        }
    }

    const isLandscape: boolean = Orientation.isLandscape(screenOrientation);
    const isClockwiseRotation: boolean = screenOrientation === Orientation.LandscapeSecondary;

    const clampedTiltX: number = Math.max(-MOTION_TILT_CLAMP, Math.min(MOTION_TILT_CLAMP, deviceBeta * MOTION_TILT_SCALE));
    const clampedTiltY: number = Math.max(-MOTION_TILT_CLAMP, Math.min(MOTION_TILT_CLAMP, deviceGamma * MOTION_TILT_SCALE));
    const [dynamicTiltX, dynamicTiltY]: [number, number] = remapTiltAxes(clampedTiltX, clampedTiltY, screenOrientation);
    const deviceTransform: string = [`rotateX(${BASE_TILT_X + dynamicTiltX}deg)`, `rotateY(${BASE_TILT_Y + dynamicTiltY}deg)`].join(" ");

    const viewportWidth: number = dimensions.innerWidth;
    const viewportHeight: number = dimensions.innerHeight;
    const scale: number = MINIMAP_SHORT_SIDE / (isLandscape ? viewportHeight : viewportWidth);
    const minimapWidth: number = Math.round(viewportWidth * scale);
    const minimapHeight: number = Math.round(viewportHeight * scale);

    const isDesktopOS: boolean = Native.platform.os.name === OS.Windows || Native.platform.os.name === OS.MacOS;

    const viewBoxData: ViewBoxResult = useMemo(
        () => computeViewBox(Native.platform.os.name, minimapWidth, minimapHeight, screenOrientation),
        [Native.platform.os.name, minimapWidth, minimapHeight, screenOrientation],
    );

    const svgWidth: number = viewBoxData ? viewBoxData.svgWidth : minimapWidth + PADDING * 2;
    const svgHeight: number = viewBoxData ? viewBoxData.svgHeight : minimapHeight + PADDING * 2;
    const viewBoxString: string = viewBoxData ? viewBoxData.viewBox : `0 0 ${minimapWidth + PADDING * 2} ${minimapHeight + PADDING * 2}`;
    const screenBorderRadius: number = viewBoxData ? viewBoxData.screenRadius : 0;

    function computeInsetRects(insetValue: EnvironmentPresetValues<"safe-area-inset"> | EnvironmentPresetValues<"safe-area-max-inset">): Bazel {
        return {
            top: insetValue.top * scale,
            right: insetValue.right * scale,
            bottom: insetValue.bottom * scale,
            left: insetValue.left * scale,
        };
    }

    const safeAreaInsetRect: Bazel = computeInsetRects(safeAreaInset);
    const safeAreaMaxInsetRect: Bazel = computeInsetRects(safeAreaMaxInset);
    const keyboardHeight: number = keyboardInset.height * scale;
    const keyboardWidth: number = keyboardInset.width * scale;
    const keyboardX: number = keyboardInset.left * scale;
    const keyboardY: number = keyboardInset.top * scale;
    const titlebarWidth: number = titlebarArea.width * scale;
    const titlebarHeight: number = titlebarArea.height * scale;
    const titlebarX: number = titlebarArea.x * scale;
    const titlebarY: number = titlebarArea.y * scale;

    async function forceOrientation(): Promise<void> {
        try {
            if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
            await window.screen.orientation.lock("landscape");
            setIsOrientationLocked(true);
        } catch {
            setIsOrientationLocked(false);
        }
    }

    async function releaseOrientation(): Promise<void> {
        window.screen.orientation.unlock();
        if (document.fullscreenElement) await document.exitFullscreen();
    }

    function toggleLayerVisibility(key: string): void {
        setLayerVisibility((previousVisibility: LayerVisibilityState) => ({
            ...previousVisibility,
            [key]: !previousVisibility[key as keyof LayerVisibilityState],
        }));
    }

    const isMobilePlatform: boolean = Native.platform.os.name === OS.Android || Native.platform.os.name === OS.iOS;

    return (
        <Wrapper>
            <input
                ref={hiddenInputRef}
                tabIndex={-1}
                aria-hidden="true"
                style={{position: "fixed", left: -9999, top: -9999, width: 1, height: 1, opacity: 0, pointerEvents: "none"}}
            />

            <Header>
                <Typography.H6>Environment Visualizer</Typography.H6>
                <DimensionCaption>
                    Resolution&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;· {viewportWidth} × {viewportHeight}px<br/>
                    Scale&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;· 1:{Math.round(1 / scale)}×<br/>
                    DPR&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;· {dimensions.scale}<br/>
                    Screen Orientation&nbsp;· {screenOrientation}<br/>
                    Device Orientation&nbsp;· β: {Math.round(deviceBeta)}° γ: {Math.round(deviceGamma)}°
                </DimensionCaption>
            </Header>

            <Body>
                <Card>
                    <CardTitle>Legend</CardTitle>
                    <LegendScrollContainer ref={legendScrollRef}>
                        <LegendScrollContent>
                            {
                                Object.entries(LAYER_COLORS).map(([key, layerColor]: [string, LayerColor]) => (
                                    <LegendItem key={key} active={layerVisibility[key as keyof LayerVisibilityState]} onClick={() => toggleLayerVisibility(key)}>
                                        <LegendSwatch fill={layerColor.fill} stroke={layerColor.stroke}/>
                                        <LegendLabel>{layerColor.label}</LegendLabel>
                                    </LegendItem>
                                ))
                            }
                        </LegendScrollContent>
                    </LegendScrollContainer>
                </Card>

                <MinimapCard>
                    <PerspectiveStage>
                        <RotatingDevice deviceTransform={deviceTransform}>
                            <MinimapSvg width={svgWidth} height={svgHeight} viewBox={viewBoxString}>
                                {
                                    !isDesktopOS
                                    && <DeviceThickness
										viewBoxResult={viewBoxData}
										isDarkMode={isDarkMode}
										dynamicTiltX={dynamicTiltX}
										dynamicTiltY={dynamicTiltY}
									/>
                                }

                                {
                                    !isDesktopOS
                                    && <DeviceBackground viewBoxResult={viewBoxData} minimapWidth={minimapWidth} minimapHeight={minimapHeight} isDarkMode={isDarkMode}/>
                                }

                                <MinimapBackground x={PADDING} y={PADDING} width={minimapWidth} height={minimapHeight} rx={screenBorderRadius} ry={screenBorderRadius}/>

                                <g transform={`translate(${PADDING}, ${PADDING})`}>
                                    {
                                        layerVisibility.viewportSegment
                                        && viewportSegments.map((segment: EnvironmentPresetValues<"viewport-segment">, index: number) => <rect key={index}
                                                                                                                                               x={segment.left * scale}
                                                                                                                                               y={segment.top * scale}
                                                                                                                                               width={segment.width * scale}
                                                                                                                                               height={segment.height * scale}
                                                                                                                                               fill={LAYER_COLORS.viewportSegment.fill}
                                                                                                                                               stroke={LAYER_COLORS.viewportSegment.stroke}
                                                                                                                                               strokeWidth="0.8"/>)
                                    }

                                    {
                                        layerVisibility.safeAreaMaxInset && <>
											<rect x={0} y={0} width={minimapWidth} height={safeAreaMaxInsetRect.top} fill={LAYER_COLORS.safeAreaMaxInset.fill} stroke={LAYER_COLORS.safeAreaMaxInset.stroke} strokeWidth="0.8"/>
											<rect x={0} y={minimapHeight - safeAreaMaxInsetRect.bottom} width={minimapWidth} height={safeAreaMaxInsetRect.bottom} fill={LAYER_COLORS.safeAreaMaxInset.fill} stroke={LAYER_COLORS.safeAreaMaxInset.stroke} strokeWidth="0.8"/>
											<rect x={0} y={safeAreaMaxInsetRect.top} width={safeAreaMaxInsetRect.left} height={minimapHeight - safeAreaMaxInsetRect.top - safeAreaMaxInsetRect.bottom} fill={LAYER_COLORS.safeAreaMaxInset.fill}
												  stroke={LAYER_COLORS.safeAreaMaxInset.stroke} strokeWidth="0.8"/>
											<rect x={minimapWidth - safeAreaMaxInsetRect.right} y={safeAreaMaxInsetRect.top} width={safeAreaMaxInsetRect.right} height={minimapHeight - safeAreaMaxInsetRect.top - safeAreaMaxInsetRect.bottom} fill={LAYER_COLORS.safeAreaMaxInset.fill}
												  stroke={LAYER_COLORS.safeAreaMaxInset.stroke} strokeWidth="0.8"/>
										</>
                                    }

                                    {
                                        layerVisibility.safeAreaInset && <>
											<rect x={0} y={0} width={minimapWidth} height={safeAreaInsetRect.top} fill={LAYER_COLORS.safeAreaInset.fill} stroke={LAYER_COLORS.safeAreaInset.stroke} strokeWidth="0.8"/>
											<rect x={0} y={minimapHeight - safeAreaInsetRect.bottom} width={minimapWidth} height={safeAreaInsetRect.bottom} fill={LAYER_COLORS.safeAreaInset.fill} stroke={LAYER_COLORS.safeAreaInset.stroke} strokeWidth="0.8"/>
											<rect x={0} y={safeAreaInsetRect.top} width={safeAreaInsetRect.left} height={minimapHeight - safeAreaInsetRect.top - safeAreaInsetRect.bottom} fill={LAYER_COLORS.safeAreaInset.fill} stroke={LAYER_COLORS.safeAreaInset.stroke}
												  strokeWidth="0.8"/>
											<rect x={minimapWidth - safeAreaInsetRect.right} y={safeAreaInsetRect.top} width={safeAreaInsetRect.right} height={minimapHeight - safeAreaInsetRect.top - safeAreaInsetRect.bottom} fill={LAYER_COLORS.safeAreaInset.fill}
												  stroke={LAYER_COLORS.safeAreaInset.stroke} strokeWidth="0.8"/>
										</>
                                    }

                                    {
                                        layerVisibility.titlebarArea
                                        && <rect x={titlebarX} y={titlebarY} width={titlebarWidth} height={titlebarHeight} fill={LAYER_COLORS.titlebarArea.fill} stroke={LAYER_COLORS.titlebarArea.stroke} strokeWidth="0.8"/>
                                    }

                                    {
                                        layerVisibility.keyboardInset
                                        && <rect x={keyboardX} y={keyboardY} width={keyboardWidth} height={keyboardHeight} fill={LAYER_COLORS.keyboardInset.fill} stroke={LAYER_COLORS.keyboardInset.stroke} strokeWidth="0.8"/>
                                    }
                                </g>

                                <DeviceOverlay viewBoxResult={viewBoxData} minimapWidth={minimapWidth} minimapHeight={minimapHeight} isDarkMode={isDarkMode} isClockwiseRotation={isClockwiseRotation} os={Native.platform.os.name}/>
                            </MinimapSvg>
                        </RotatingDevice>
                    </PerspectiveStage>
                </MinimapCard>

                {
                    isMobilePlatform
                    && <Card>
						<CardTitle>Keyboard</CardTitle>
						<ButtonRow>
							<Button.Primary.Small onClick={() => hiddenInputRef.current?.focus()}>Show</Button.Primary.Small>
							<Button.Danger.Small onClick={() => hiddenInputRef.current?.blur()}>Hide</Button.Danger.Small>
						</ButtonRow>
					</Card>
                }

                {
                    Native.platform.os.name === OS.iOS && !isMotionPermissionGranted
                    && <Card>
						<CardTitle>Motion</CardTitle>
						<ButtonRow>
							<Button.Primary.Small onClick={requestMotionPermission}>Enable Tilt Tracking</Button.Primary.Small>
						</ButtonRow>
					</Card>
                }

                {
                    Native.platform.os.name === OS.Android
                    && <Card>
						<CardTitle>Orientation</CardTitle>
						<ButtonRow>
                            {
                                isOrientationLocked
                                    ? <Button.Danger.Small onClick={releaseOrientation}>Unlock</Button.Danger.Small>
                                    : <Button.Primary.Small onClick={forceOrientation} disabled={isLandscape}>
                                        {isLandscape ? "Landscape" : "→ Landscape"}
                                    </Button.Primary.Small>
                            }
						</ButtonRow>
					</Card>
                }
            </Body>
        </Wrapper>
    );
}
