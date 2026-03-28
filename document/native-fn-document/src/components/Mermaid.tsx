import React from "react";
import styled from "styled-components";
import mermaid, {type MermaidConfig, type RenderResult} from "mermaid";
import Panzoom, {type PanzoomObject} from "@panzoom/panzoom";
import {AppThemeContext, ThemeContextValue} from "../providers/AppThemeProvider";

export interface MermaidProps {
    chart: string;
}

type WheelHandler = (e: WheelEvent) => void;

type SvgMetrics = {
    svgWidth: number;
    svgHeight: number;
    containerWidth: number;
    containerHeight: number;
    fitScale: number;
};

let globalInstanceCounter: number = 0;

const DARK_THEME_CSS: MermaidConfig["themeCSS"] = `
.node rect, .node circle, .node ellipse, .node polygon, .node path {
    fill: #1e2a3a !important;
    stroke: #4a90d9 !important;
    stroke-width: 1.5px !important;
}
.node .label {
    color: #a8c8f0 !important;
}
.edgePath .path {
    stroke: #4a7ab5 !important;
    stroke-width: 1.5px !important;
}
.edgeLabel {
    background-color: #0d1b2a !important;
    color: #7ab3e0 !important;
}
.cluster rect {
    fill: rgba(30, 42, 58, 0.45) !important;
    stroke: #2d5a8e !important;
    stroke-dasharray: none !important;
}
.cluster .label {
    color: #5a9fd4 !important;
}
.label foreignObject code {
    background-color: #0a1628 !important;
    color: #79c0ff !important;
    border: 1px solid #2d5a8e !important;
    border-radius: 4px !important;
    padding: 1px 5px !important;
    font-family: 'Fira Code', monospace !important;
    font-size: 0.85em !important;
}
.label foreignObject div,
.label foreignObject p,
.label foreignObject span {
    font-weight: 500 !important;
    white-space: nowrap !important;
}
.label foreignObject small {
    color: #5a8db8 !important;
    font-weight: 400 !important;
    white-space: nowrap !important;
}
`;

const DARK_THEME_VARIABLES: MermaidConfig["themeVariables"] = {
    primaryColor: "#1e2a3a",
    primaryBorderColor: "#4a90d9",
    primaryTextColor: "#a8c8f0",
    lineColor: "#4a7ab5",
    secondaryColor: "#111e2e",
    tertiaryColor: "#0d1b2a",
    background: "#0d1117",
    mainBkg: "#1e2a3a",
    nodeBorder: "#4a90d9",
    clusterBkg: "#111e2e",
    titleColor: "#7ab3e0",
    edgeLabelBackground: "#0d1b2a",
};

const LIGHT_THEME_CSS: MermaidConfig["themeCSS"] = `
.node rect, .node circle, .node ellipse, .node polygon, .node path {
    fill: #ffffff !important;
    stroke: #3b82f6 !important;
    stroke-width: 1.5px !important;
}
.node .label {
    color: #1e3a5f !important;
}
.edgePath .path {
    stroke: #5a9bd4 !important;
    stroke-width: 1.5px !important;
}
.edgeLabel {
    background-color: #eef4ff !important;
    color: #2a5a8e !important;
}
.cluster rect {
    fill: rgba(210, 220, 240, 0.35) !important;
    stroke: #7aaad4 !important;
    stroke-dasharray: none !important;
}
.cluster .label {
    color: #2a5a8e !important;
}
.label foreignObject code {
    background-color: #f0eeff !important;
    color: #5b3fd4 !important;
    border: 1px solid #c4b5fd !important;
    border-radius: 4px !important;
    padding: 1px 5px !important;
    font-family: 'Fira Code', monospace !important;
    font-size: 0.85em !important;
}
.label foreignObject div,
.label foreignObject p,
.label foreignObject span {
    font-weight: 500 !important;
    white-space: nowrap !important;
}
.label foreignObject small {
    color: #4a7aaa !important;
    font-weight: 400 !important;
    white-space: nowrap !important;
}
`;

const LIGHT_THEME_VARIABLES: MermaidConfig["themeVariables"] = {
    primaryColor: "#ffffff",
    primaryBorderColor: "#3b82f6",
    primaryTextColor: "#1e3a5f",
    lineColor: "#5a9bd4",
    secondaryColor: "#f0eeff",
    tertiaryColor: "#eef4ff",
    background: "#f8f9fc",
    mainBkg: "#ffffff",
    nodeBorder: "#3b82f6",
    clusterBkg: "rgba(210, 220, 240, 0.35)",
    titleColor: "#2a5a8e",
    edgeLabelBackground: "#eef4ff",
};

function getMermaidConfig(isDark: boolean): MermaidConfig {
    return {
        startOnLoad: false,
        theme: isDark ? "dark" : "default",
        securityLevel: "loose",
        fontFamily: "Fira Code",
        flowchart: {
            htmlLabels: true,
            curve: "basis",
        },
        themeCSS: isDark ? DARK_THEME_CSS : LIGHT_THEME_CSS,
        themeVariables: isDark ? DARK_THEME_VARIABLES : LIGHT_THEME_VARIABLES,
    };
}

function getSvgMetrics(container: HTMLDivElement, svgElement: SVGSVGElement): SvgMetrics {
    const box: DOMRect = svgElement.getBoundingClientRect();
    const viewBoxWidth: number = svgElement.viewBox.baseVal.width || 1;
    const viewBoxHeight: number = svgElement.viewBox.baseVal.height || 1;
    const svgWidth: number = box.width || viewBoxWidth;
    const svgHeight: number = box.height || viewBoxHeight;
    const containerWidth: number = container.clientWidth || 1;
    const containerHeight: number = container.clientHeight || 1;
    const fitScale: number = Math.min(containerWidth / svgWidth, containerHeight / svgHeight, 1);

    return {svgWidth, svgHeight, containerWidth, containerHeight, fitScale};
}

const PanLayer = styled.div`
    transform-origin: 0 0;
`;

const SvgWrap = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
`;

const Container = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    cursor: grab;
    background-color: ${({theme}): string => theme.colors.bg ?? "#f8f9fc"};
    border: 1px solid ${({theme}) => theme.colors.border};
    border-radius: 0.5rem;
`;

const Controls = styled.div`
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    z-index: 10;
    display: flex;
    gap: 0.4375rem;
    align-items: center;
`;

const DotButton = styled.button`
    width: 0.8125rem;
    height: 0.8125rem;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    flex-shrink: 0;
    background-color: #cfcfcf;
    opacity: 0.5;
    transition: opacity 0.2s linear;

    &:hover {
        opacity: 0.85;
    }
`;

export default function Mermaid({chart}: MermaidProps): React.JSX.Element {
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const panLayerRef = React.useRef<HTMLDivElement | null>(null);
    const svgWrapRef = React.useRef<HTMLDivElement | null>(null);
    const panzoomRef = React.useRef<PanzoomObject | null>(null);
    const wheelHandlerRef = React.useRef<WheelHandler | null>(null);

    const instancePrefix = React.useRef<string>(`mermaid-inst-${++globalInstanceCounter}`);
    const renderSeq = React.useRef<number>(0);
    const theme: ThemeContextValue = React.useContext(AppThemeContext);

    function cleanupPanzoom(): void {
        const container = containerRef.current;
        const wheelHandler = wheelHandlerRef.current;

        if (container && wheelHandler) {
            container.removeEventListener("wheel", wheelHandler);
        }

        wheelHandlerRef.current = null;
        panzoomRef.current?.destroy();
        panzoomRef.current = null;
    }

    function getCurrentSvgElement(): SVGSVGElement | null {
        return svgWrapRef.current?.querySelector<SVGSVGElement>("svg") ?? null;
    }

    function initializePanzoom(container: HTMLDivElement, panLayer: HTMLDivElement, svgElement: SVGSVGElement): void {
        const metrics = getSvgMetrics(container, svgElement);

        panzoomRef.current = Panzoom(panLayer, {
            maxScale: 5,
            minScale: metrics.fitScale * 0.5,
            contain: "outside",
            canvas: true,
            startScale: metrics.fitScale,
            startX: (metrics.containerWidth - metrics.svgWidth * metrics.fitScale) / 2,
            startY: (metrics.containerHeight - metrics.svgHeight * metrics.fitScale) / 2,
        });

        if (wheelHandlerRef.current) {
            container.removeEventListener("wheel", wheelHandlerRef.current);
        }

        const wheelHandler: WheelHandler = (e: WheelEvent): void => {
            e.preventDefault();
            panzoomRef.current?.zoomWithWheel(e);
        };

        wheelHandlerRef.current = wheelHandler;
        container.addEventListener("wheel", wheelHandler, {passive: false});
    }

    async function renderDiagram(): Promise<void> {
        const container = containerRef.current;
        const panLayer = panLayerRef.current;
        const svgWrap = svgWrapRef.current;
        if (!container || !panLayer || !svgWrap) return;

        const seq = ++renderSeq.current;

        cleanupPanzoom();
        svgWrap.innerHTML = "";

        mermaid.initialize(getMermaidConfig(theme.isDark));

        const renderId = `${instancePrefix.current}-${seq}`;

        try {
            const result: RenderResult = await mermaid.render(renderId, chart.trim());

            if (renderSeq.current !== seq) return;

            svgWrap.innerHTML = result.svg;

            const svgEl = getCurrentSvgElement();

            if (svgEl) initializePanzoom(container, panLayer, svgEl);
        } catch (_) {
        }
    }

    function getFitScale(): number {
        const container = containerRef.current;
        const svgEl = getCurrentSvgElement();

        if (!container || !svgEl) return 1;

        return getSvgMetrics(container, svgEl).fitScale;
    }

    function handleReset(): void {
        const container = containerRef.current;
        const svgEl = getCurrentSvgElement();
        const panzoom = panzoomRef.current;

        if (!container || !svgEl || !panzoom) return;

        const metrics = getSvgMetrics(container, svgEl);

        panzoom.zoom(metrics.fitScale, {animate: true});
        panzoom.pan(
            (metrics.containerWidth - metrics.svgWidth * metrics.fitScale) / 2,
            (metrics.containerHeight - metrics.svgHeight * metrics.fitScale) / 2,
            {animate: true}
        );
    }

    function handleZoomIn(): void {
        const panzoom = panzoomRef.current;
        if (!panzoom) return;
        panzoom.zoom(panzoom.getScale() * 1.25, {animate: true});
    }

    function handleZoomOut(): void {
        const panzoom = panzoomRef.current;
        if (!panzoom) return;
        const nextScale = panzoom.getScale() / 1.25;
        panzoom.zoom(Math.max(nextScale, getFitScale() * 0.5), {animate: true});
    }

    React.useEffect((): (() => void) => {
        void renderDiagram();

        return (): void => {
            renderSeq.current += 1;
            cleanupPanzoom();
        };
    }, [chart, theme.isDark]);

    return (
        <Container ref={containerRef}>
            <Controls>
                <DotButton onClick={handleZoomOut} title="Zoom out" type="button">
                    <svg width="7" height="2" viewBox="0 0 7 2" fill="none">
                        <rect x="0" y="0" width="7" height="2" rx="0.5" fill="rgba(0,0,0,0.45)"/>
                    </svg>
                </DotButton>

                <DotButton onClick={handleReset} title="Reset view" type="button">
                    <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                        <path
                            d="M3.5 1.2 A2.3 2.3 0 1 0 5.5 4"
                            stroke="rgba(0,0,0,0.45)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            fill="none"
                        />
                        <polygon points="5.5,2.2 5.5,4 7,3.1" fill="rgba(0,0,0,0.45)"/>
                    </svg>
                </DotButton>

                <DotButton onClick={handleZoomIn} title="Zoom in" type="button">
                    <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                        <rect x="0" y="2.5" width="7" height="2" rx="0.5" fill="rgba(0,0,0,0.45)"/>
                        <rect x="2.5" y="0" width="2" height="7" rx="0.5" fill="rgba(0,0,0,0.45)"/>
                    </svg>
                </DotButton>
            </Controls>

            <PanLayer ref={panLayerRef}>
                <SvgWrap ref={svgWrapRef}/>
            </PanLayer>
        </Container>
    );
}
