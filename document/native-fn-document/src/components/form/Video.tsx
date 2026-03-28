import React from "react";
import styled, {keyframes} from "styled-components";

export interface VideoProps
    extends Omit<React.VideoHTMLAttributes<HTMLVideoElement>, "controls"> {
    src: string;
    poster?: string;
    label?: string;
    showTitle?: boolean;
    title?: string;
    aspectRatio?: string;
}

const fadeUp = keyframes`
    from {
        opacity: 0;
        transform: translateY(8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;

const spin = keyframes`
    to {
        transform: rotate(360deg);
    }
`;

const barGrow = keyframes`
    from {
        transform: scaleX(0);
    }
    to {
        transform: scaleX(1);
    }
`;

const Wrapper = styled.div<{ ratio: string }>`
    position: relative;
    width: 100%;
    aspect-ratio: ${({ratio}) => ratio};
    background: #000;
    border-radius: 0.75rem;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);

    &:hover .ctrl-bar,
    &.paused .ctrl-bar {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
    }

    &:hover .top-bar,
    &.paused .top-bar {
        opacity: 1;
        pointer-events: auto;
    }
`;

const StyledVideo = styled.video`
    width: 100%;
    height: 100%;
    display: block;
    object-fit: contain;
    background: #000;
`;

const TopBar = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding: 0.625rem 0.875rem;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.72), transparent);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.4px;
    color: rgba(255, 255, 255, 0.9);
    opacity: 0;
    transition: opacity 0.25s ease;
    pointer-events: none;
    user-select: none;
    z-index: 10;
`;

const Spinner = styled.div`
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 5;
    pointer-events: none;

    &::after {
        content: "";
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 50%;
        border: 3px solid rgba(255, 255, 255, 0.15);
        border-top-color: ${({theme}) => theme.colors.accent};
        animation: ${spin} 0.8s linear infinite;
    }
`;

const CenterBtn = styled.button<{ visible: boolean }>`
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    cursor: pointer;
    z-index: 6;
    opacity: ${({visible}) => (visible ? 1 : 0)};
    transition: opacity 0.2s ease;
    pointer-events: ${({visible}) => (visible ? "auto" : "none")};

    span {
        width: 4rem;
        height: 4rem;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.55);
        backdrop-filter: blur(6px);
        border: 1.5px solid rgba(255, 255, 255, 0.22);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.15s ease, background 0.15s ease;

        svg {
            color: #fff;
            flex-shrink: 0;
        }
    }

    &:hover span {
        background: rgba(0, 0, 0, 0.75);
        transform: scale(1.08);
    }
`;

const ControlBar = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 0.5rem 0.75rem 0.625rem;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.82), transparent);
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    opacity: 0;
    transform: translateY(6px);
    transition: opacity 0.22s ease, transform 0.22s ease;
    pointer-events: none;
    z-index: 10;
    animation: ${fadeUp} 0.25s ease;
`;

const ProgressWrap = styled.div`
    position: relative;
    height: 0.25rem;
    cursor: pointer;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.18);

    &:hover {
        height: 0.375rem;
    }

    transition: height 0.15s ease;
`;

const ProgressFill = styled.div<{ pct: number }>`
    height: 100%;
    width: ${({pct}) => pct}%;
    background: ${({theme}) => theme.colors.accent};
    border-radius: 9999px;
    position: relative;
    transform-origin: left;
    animation: ${barGrow} 0s ease;

    &::after {
        content: "";
        position: absolute;
        right: -5px;
        top: 50%;
        transform: translateY(-50%);
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #fff;
        box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
        opacity: 0;
        transition: opacity 0.15s ease;
    }

    ${ProgressWrap}:hover &::after {
        opacity: 1;
    }
`;

const BufferFill = styled.div<{ pct: number }>`
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${({pct}) => pct}%;
    background: rgba(255, 255, 255, 0.25);
    border-radius: 9999px;
    pointer-events: none;
`;

const SeekInput = styled.input`
    position: absolute;
    inset: -6px 0;
    width: 100%;
    opacity: 0;
    cursor: pointer;
    margin: 0;
    padding: 0;
    height: calc(100% + 12px);
    z-index: 1;
`;

const BottomRow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.375rem;
`;

const ControlButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.85);
    padding: 0.25rem;
    border-radius: 0.3125rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: color 0.15s ease, background 0.15s ease;

    &:hover {
        color: #fff;
        background: rgba(255, 255, 255, 0.1);
    }

    svg {
        display: block;
    }
`;

const VolumeGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 0.25rem;

    &:hover .vol-slider {
        width: 4.5rem;
        opacity: 1;
    }
`;

const VolumeSliderWrap = styled.div`
    width: 0;
    opacity: 0;
    overflow: hidden;
    transition: width 0.22s ease, opacity 0.22s ease;
    display: flex;
    align-items: center;
    height: 24px;
`;

const VolumeSlider = styled.input`
    -webkit-appearance: none;
    appearance: none;
    width: 4.5rem;
    height: 3px;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.25);
    outline: none;
    cursor: pointer;

    &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: ${({theme}) => theme.colors.accent};
        cursor: pointer;
    }

    &::-moz-range-thumb {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: ${({theme}) => theme.colors.accent};
        cursor: pointer;
        border: none;
    }
`;

const TimeDisplay = styled.span`
    font-size: 0.6875rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.7);
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.3px;
    white-space: nowrap;
    margin-left: 0.125rem;
    user-select: none;
`;

const Spacer = styled.div`
    flex: 1;
`;

const QualityBadge = styled.span`
    font-size: 0.5625rem;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 0.25rem;
    padding: 0.1rem 0.3rem;
    user-select: none;
`;

function fmt(second: number): string {
    if (!isFinite(second)) return "0:00";

    return `${Math.floor(second / 60)}:${Math.floor(second % 60).toString().padStart(2, "0")}`;
}

function PlayIcon() {
    return <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M4 2.5l9 5.5-9 5.5V2.5z" fill="currentColor"/>
    </svg>;
}

function PauseIcon() {
    return <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="3.5" y="2.5" width="3" height="11" rx="1" fill="currentColor"/>
        <rect x="9.5" y="2.5" width="3" height="11" rx="1" fill="currentColor"/>
    </svg>;
}

function VolumeIcon({muted, level}: { muted: boolean; level: number }) {
    if (muted || level === 0) {
        return <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2.5L4.5 5.5H2v5h2.5L8 13.5V2.5z" fill="currentColor"/>
            <line x1="10.5" y1="6" x2="14.5" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="14.5" y1="6" x2="10.5" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>;
    }

    if (level < 0.5) {
        return <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2.5L4.5 5.5H2v5h2.5L8 13.5V2.5z" fill="currentColor"/>
            <path d="M10 6.5a2.5 2.5 0 010 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
        </svg>;
    }

    return <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 2.5L4.5 5.5H2v5h2.5L8 13.5V2.5z" fill="currentColor"/>
        <path d="M10 5a4 4 0 010 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
        <path d="M11.5 3.5a6.5 6.5 0 010 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
    </svg>;
}

function FullscreenIcon({active}: { active: boolean }) {
    if (active) {
        return <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M5.5 2.5v3H2.5M10.5 2.5v3h3M5.5 13.5v-3H2.5M10.5 13.5v-3h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>;
    }

    return <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2.5 5.5v-3h3M13.5 5.5v-3h-3M2.5 10.5v3h3M13.5 10.5v3h-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>;
}

function PipIcon() {
    return <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1.5" y="3" width="13" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4" fill="none"/>
        <rect x="8" y="7.5" width="5.5" height="4" rx="0.75" fill="currentColor" opacity="0.85"/>
    </svg>;
}

export default function Video({src, poster, label, showTitle = false, title, aspectRatio = "16/9", ...rest}: VideoProps): React.JSX.Element {
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const wrapRef = React.useRef<HTMLDivElement>(null);

    const [playing, setPlaying] = React.useState<boolean>(false);
    const [waiting, setWaiting] = React.useState<boolean>(false);
    const [currentDuration, setCurrentDuration] = React.useState<number>(0);
    const [duration, setDuration] = React.useState<number>(0);
    const [buffered, setBuffered] = React.useState<number>(0);
    const [volume, setVolume] = React.useState<number>(1);
    const [muted, setMuted] = React.useState<boolean>(false);
    const [fullscreen, setFullscreen] = React.useState<boolean>(false);
    const [pipActive, setPipActive] = React.useState<boolean>(false);
    const [showCenter, setShowCenter] = React.useState<boolean>(true);

    const percent = duration > 0 ? (currentDuration / duration) * 100 : 0;
    const bufferPercent = duration > 0 ? (buffered / duration) * 100 : 0;

    React.useEffect(() => {
        function onFsChange(): void {
            setFullscreen(!!document.fullscreenElement);
        }

        document.addEventListener("fullscreenchange", onFsChange);

        return () => document.removeEventListener("fullscreenchange", onFsChange);
    }, []);

    React.useEffect(() => {
        const video = videoRef.current;

        if (!video) return;

        function onEnterPip(): void {
            setPipActive(true);
        }

        function onLeavePip(): void {
            setPipActive(false);
        }

        video.addEventListener("enterpictureinpicture", onEnterPip);
        video.addEventListener("leavepictureinpicture", onLeavePip);

        return () => {
            video.removeEventListener("enterpictureinpicture", onEnterPip);
            video.removeEventListener("leavepictureinpicture", onLeavePip);
        };
    }, []);

    function togglePlay(): void {
        const video = videoRef.current;

        if (!video) return;

        if (video.paused) {
            void video.play();
            setShowCenter(false);
        } else {
            video.pause();
            setShowCenter(true);
        }
    }

    function onSeek(e: React.ChangeEvent<HTMLInputElement>): void {
        const video = videoRef.current;

        if (!video || !isFinite(video.duration)) return;

        const duration = (Number(e.target.value) / 100) * video.duration;

        video.currentTime = duration;
        setCurrentDuration(duration);
    }

    function onVolumeChange(e: React.ChangeEvent<HTMLInputElement>): void {
        const volume = Number(e.target.value);
        const video = videoRef.current;

        if (video) {
            video.volume = volume;
            video.muted = volume === 0;
        }

        setVolume(volume);
        setMuted(volume === 0);
    }

    function toggleMute(): void {
        const video = videoRef.current;

        if (!video) return;

        const next = !video.muted;

        video.muted = next;

        setMuted(next);
    }

    function toggleFullscreen(): void {
        const wrap = wrapRef.current;

        if (!wrap) return;
        if (!document.fullscreenElement) void wrap.requestFullscreen();

        else void document.exitFullscreen();
    }

    async function togglePip(): Promise<void> {
        const video = videoRef.current;

        if (!video) return;

        if (document.pictureInPictureElement) await document.exitPictureInPicture();
        else if (document.pictureInPictureEnabled) await video.requestPictureInPicture();
    }

    function updateBuffered(video: HTMLVideoElement): void {
        if (video.buffered.length > 0) setBuffered(video.buffered.end(video.buffered.length - 1));
    }

    const isPipSupported = typeof document !== "undefined" && "pictureInPictureEnabled" in document;

    return (
        <div>
            {
                label
                && <div style={{fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: "0.375rem", userSelect: "none"}}>
                    {label}
				</div>
            }

            <Wrapper
                ref={wrapRef}
                ratio={aspectRatio}
                className={!playing ? "paused" : undefined}
            >
                <StyledVideo
                    ref={videoRef}
                    src={src}
                    poster={poster}
                    onPlay={() => {
                        setPlaying(true);
                        setWaiting(false);
                    }}
                    onPause={() => setPlaying(false)}
                    onWaiting={() => setWaiting(true)}
                    onCanPlay={() => setWaiting(false)}
                    onTimeUpdate={() => {
                        const video = videoRef.current;

                        if (!video) return;

                        setCurrentDuration(video.currentTime);
                        updateBuffered(video);
                    }}
                    onLoadedMetadata={() => {
                        const video = videoRef.current;

                        if (video) setDuration(video.duration);
                    }}
                    onEnded={() => {
                        setPlaying(false);
                        setShowCenter(true);
                    }}
                    onClick={togglePlay}
                    {...rest}
                />

                {
                    waiting && <Spinner/>
                }

                {
                    showTitle
                    && title
                    && <TopBar className="top-bar">{title}</TopBar>
                }

                <CenterBtn visible={showCenter && !playing} onClick={togglePlay} tabIndex={-1}>
                    <span>
                        <PlayIcon/>
                    </span>
                </CenterBtn>

                <ControlBar className="ctrl-bar">
                    <ProgressWrap>
                        <BufferFill pct={bufferPercent}/>
                        <ProgressFill pct={percent}/>
                        <SeekInput
                            type="range"
                            min={0}
                            max={100}
                            step={0.05}
                            value={percent}
                            onChange={onSeek}
                        />
                    </ProgressWrap>

                    <BottomRow>
                        <ControlButton onClick={togglePlay} aria-label={playing ? "Pause" : "Play"}>
                            {playing ? <PauseIcon/> : <PlayIcon/>}
                        </ControlButton>

                        <VolumeGroup>
                            <ControlButton onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"}>
                                <VolumeIcon muted={muted} level={volume}/>
                            </ControlButton>

                            <VolumeSliderWrap className="vol-slider">
                                <VolumeSlider
                                    type="range"
                                    min={0}
                                    max={1}
                                    step={0.02}
                                    value={muted ? 0 : volume}
                                    onChange={onVolumeChange}
                                    aria-label="Volume"
                                />
                            </VolumeSliderWrap>
                        </VolumeGroup>

                        <TimeDisplay>
                            {fmt(currentDuration)} / {fmt(duration)}
                        </TimeDisplay>

                        <Spacer/>

                        {
                            duration > 0
                            && <QualityBadge>HD</QualityBadge>
                        }

                        {
                            isPipSupported
                            && <ControlButton onClick={() => void togglePip()} aria-label="Picture in picture">
								<PipIcon/>
							</ControlButton>
                        }

                        <ControlButton onClick={toggleFullscreen} aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}>
                            <FullscreenIcon active={fullscreen}/>
                        </ControlButton>
                    </BottomRow>
                </ControlBar>
            </Wrapper>
        </div>
    );
}
