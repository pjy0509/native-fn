import React from "react";
import Native from "native-fn";
import Button from "../components/form/Button";
import Checkbox from "../components/form/Checkbox";
import HintMessage from "../components/form/HintMessage";
import Input from "../components/form/Input";
import RadioGroup from "../components/form/RadioGroup";
import Select from "../components/form/Select";
import Spacing from "../components/form/Spacing";
import TagInput, {TagInputHandle} from "../components/form/TagInput";
import Textarea from "../components/form/Textarea";
import InspectButton from "../components/InspectButton";
import styled from "styled-components";
import FieldLabel from "../components/form/FieldLabel";
import Editable from "../components/form/Editable";
import Video from "../components/form/Video";
import {AppOpenState, CameraType, CaptureType, Contact, DirectoryExploreMode, ExplorerStartIn, type FileWithPath, SettingType} from "native-fn/open";
import {PermissionType} from "native-fn/permission";
import ErrorMessage from "../components/form/ErrorMessage";
import ColorPicker from "../components/form/ColorPicker";

interface DocumentReturns {
    type: string;
    description?: string;
}

interface DocumentEntry {
    signature: string;
    description: string;
    flowchart?: string;
    example: string;
    returns: DocumentReturns;
    throws: string[];
    tryItOut?: () => React.JSX.Element;
}

interface BatteryManager {
    readonly charging: boolean;
    readonly chargingTime: number;
    readonly dischargingTime: number;
    readonly level: number;
}

type TryResultProps = {
        ok: boolean;
        text: string;
    }
    | null;

interface SubscribeButtonsProps {
    subscribed: boolean;
    onSubscribe: () => void;
    onUnsubscribe: () => void;
}

type Documents = Record<string, Record<string, DocumentEntry>>;

function safeStr(value: unknown): string {
    try {
        if (value instanceof Error) return value.message;

        if (Object.prototype.toString.call(value) === '[object BatteryManager]') {
            return JSON.stringify(
                {
                    charging: (value as BatteryManager).charging,
                    level: (value as BatteryManager).level,
                    chargingTime: (value as BatteryManager).chargingTime,
                    dischargingTime: (value as BatteryManager).dischargingTime,
                },
                null,
                4
            )
        }

        if (typeof value === "object" && value !== null) {
            return JSON.stringify(
                value,
                (_, value) => typeof value === "number" && !isFinite(value) ? value > 0 ? "Infinity" : "-Infinity" : value,
                4
            );
        }

        return String(value);
    } catch (_) {
        return String(value);
    }
}

const TryContainer = styled.div`
    border-radius: 6px;
    padding: 0.875rem;
    border: 1px dashed ${({theme}) => theme.colors.border};
`;

const TryResultPre = styled.pre.withConfig({shouldForwardProp: (prop: string) => prop !== "ok"})<{ ok?: boolean }>`
    font-size: 0.75rem;
    color: ${({ok}) => ok ? "#34c759" : "#ff373c"};
    margin-top: 0.475rem;
`

const SubscribeButtonsContainer = styled.div`
    display: flex;
    gap: 0.5rem;
`

function TryResult({result}: { result: TryResultProps; }): React.JSX.Element | null {
    if (!result) return null;

    return <TryResultPre ok={result.ok}>
        {result.text}
    </TryResultPre>;
}

function SubscribeButtons({subscribed, onSubscribe, onUnsubscribe}: SubscribeButtonsProps): React.JSX.Element {
    return (
        <SubscribeButtonsContainer>
            <Button.Primary.Small onClick={onSubscribe} disabled={subscribed}>Subscribe</Button.Primary.Small>

            <Button.Secondary.Small onClick={onUnsubscribe} disabled={!subscribed}>Unsubscribe</Button.Secondary.Small>
        </SubscribeButtonsContainer>
    );
}

const TRY_IT_OUT = {
    appearance: {
        value: function TryItOut(): React.JSX.Element {
            const [result, setResult] = React.useState<TryResultProps>(null);

            function run(): void {
                setResult({
                    ok: true,
                    text: safeStr(Native.appearance.value)
                });
            }

            async function openAppearanceSetting(): Promise<void> {
                await Native.open.setting(SettingType.Appearance);
            }

            return <TryContainer>
                <Button.Secondary.Small onClick={openAppearanceSetting}>Open Setting</Button.Secondary.Small>

                <Spacing height="0.5rem"/>

                <Button.Primary.Small onClick={run}>Run</Button.Primary.Small>

                <TryResult result={result}/>
            </TryContainer>;
        },
        onChange: function TryItOut(): React.JSX.Element {
            const [result, setResult] = React.useState<TryResultProps>(null);
            const [subscribed, setSubscribed] = React.useState<boolean>(false);
            const unsubRef = React.useRef<(() => void) | null>(null);

            function subscribe(): void {
                if (unsubRef.current) return;

                unsubRef.current = Native.appearance.onChange((appearance) => {
                    setResult({ok: true, text: safeStr(appearance)});
                });

                setSubscribed(true);
            }

            function unsubscribe(): void {
                unsubRef.current?.();
                unsubRef.current = null;
                setSubscribed(false);
            }

            async function openAppearanceSetting(): Promise<void> {
                await Native.open.setting(SettingType.Appearance);
            }

            return <TryContainer>
                <Button.Secondary.Small onClick={openAppearanceSetting}>Open Setting</Button.Secondary.Small>

                <Spacing height="0.5rem"/>

                <SubscribeButtons subscribed={subscribed} onSubscribe={subscribe} onUnsubscribe={unsubscribe}/>

                <TryResult result={result}/>
            </TryContainer>;
        }
    },

    badge: {
        set: function TryItOut(): React.JSX.Element {
            const [count, setCount] = React.useState<number>(1);
            const [result, setResult] = React.useState<TryResultProps>(null);

            async function run(): Promise<void> {
                try {
                    await Native.badge.set(Number(count));

                    setResult({ok: true, text: "Badge set to " + count});
                } catch (e) {
                    setResult({ok: false, text: safeStr(e)});
                }
            }

            return <TryContainer>
                <Input label="Count" type="number" value={count} onChange={setCount} min={0}/>
                <Button.Primary.Small onClick={run}>Run</Button.Primary.Small>
                <TryResult result={result}/>
            </TryContainer>;
        },
        clear: function TryItOut(): React.JSX.Element {
            const [result, setResult] = React.useState<TryResultProps>(null);

            async function run(): Promise<void> {
                try {
                    await Native.badge.clear();

                    setResult({ok: true, text: "Badge cleared."});
                } catch (e) {
                    setResult({ok: false, text: safeStr(e)});
                }
            }

            return <TryContainer>
                <Button.Primary.Small onClick={run}>Run</Button.Primary.Small>
                <TryResult result={result}/>
            </TryContainer>;
        }
    },

    battery: {
        value: function TryItOut(): React.JSX.Element {
            const [result, setResult] = React.useState<TryResultProps>(null);

            async function run(): Promise<void> {
                try {
                    const battery = await Native.battery.value;

                    setResult({ok: true, text: safeStr(battery)});
                } catch (e) {
                    setResult({ok: false, text: safeStr(e)});
                }
            }

            return <TryContainer>
                <Button.Primary.Small onClick={run}>Run</Button.Primary.Small>

                <TryResult result={result}/>
            </TryContainer>;
        },
        onChange: function TryItOut(): React.JSX.Element {
            const [result, setResult] = React.useState<TryResultProps>(null);
            const [subscribed, setSubscribed] = React.useState<boolean>(false);
            const unsubRef = React.useRef<(() => void) | null>(null);

            function subscribe(): void {
                if (unsubRef.current) return;

                unsubRef.current = Native.battery.onChange((battery) => {
                    setResult({ok: true, text: safeStr(battery),});
                });

                setSubscribed(true);
            }

            function unsubscribe(): void {
                unsubRef.current?.();
                unsubRef.current = null;
                setSubscribed(false);
            }

            return <TryContainer>
                <SubscribeButtons subscribed={subscribed} onSubscribe={subscribe} onUnsubscribe={unsubscribe}/>

                <TryResult result={result}/>
            </TryContainer>;
        }
    },

    clipboard: {
        copy: function TryItOut(): React.JSX.Element {
            const [mode, setMode] = React.useState<string>("string");
            const [text, setText] = React.useState<string>("");
            const [cssPath, setCssPath] = React.useState<string>("");
            const [result, setResult] = React.useState<TryResultProps>(null);

            async function run(): Promise<void> {
                try {
                    let item: unknown = text;

                    if (mode === "element") {
                        const element: Element | null = cssPath ? document.querySelector(cssPath) : null;

                        if (!element) {
                            setResult({ok: false, text: "No element selected."});
                            return;
                        }

                        item = element;
                    }

                    const ok = await Native.clipboard.copy(item);

                    setResult({ok, text: ok ? "Copied successfully." : "Copy failed."});
                } catch (e) {
                    setResult({ok: false, text: safeStr(e)});
                }
            }

            return <TryContainer>
                <RadioGroup
                    label="Type"
                    value={mode}
                    onChange={setMode}
                    options={[
                        {value: "string", label: "String"},
                        {value: "element", label: "Element"},
                    ]}
                />

                {
                    mode === "string"
                    && <Textarea
						label="Value"
						value={text}
						onChange={setText}
						rows={3}
						placeholder="Text to copy..."
					/>
                }

                {
                    mode === "element" && (
                        <>
                            <InspectButton onSelectElement={setCssPath}/>

                            {
                                cssPath
                                && <>
									<FieldLabel>Selected</FieldLabel>

									<HintMessage>{cssPath}</HintMessage>
								</>
                            }
                        </>
                    )
                }

                <Spacing height="0.5rem"/>

                <Button.Primary.Small onClick={run}>Run</Button.Primary.Small>

                <TryResult result={result}/>
            </TryContainer>;
        },
        paste: function TryItOut(): React.JSX.Element {
            const [text, setText] = React.useState<string>("");
            const [result, setResult] = React.useState<TryResultProps>(null);


            async function run(): Promise<void> {
                try {
                    const text = await Native.clipboard.paste();

                    setText(text);
                    setResult({ok: true, text: "Pasted successfully."});
                } catch (e) {
                    setResult({ok: false, text: safeStr(e)});
                }
            }

            return <TryContainer>
                <Button.Primary.Small onClick={run}>Run</Button.Primary.Small>

                <Spacing height="0.5rem"/>

                <Editable content={text}/>

                <TryResult result={result}/>
            </TryContainer>;
        }
    },

    dimension: {
        value: function TryItOut(): React.JSX.Element {
            const [result, setResult] = React.useState<TryResultProps>(null);

            function run(): void {
                setResult({ok: true, text: safeStr(Native.dimension.value)});
            }

            return <TryContainer>
                <Button.Primary.Small onClick={run}>Run</Button.Primary.Small>

                <TryResult result={result}/>
            </TryContainer>;
        },
        environment: function TryItOut(): React.JSX.Element {
            const [preset, setPreset] = React.useState<string>("safeAreaInset");
            const [result, setResult] = React.useState<TryResultProps>(null);

            function run(): void {
                try {
                    const env = Native.dimension.environment as any;

                    setResult({ok: true, text: safeStr(env[preset].value)});
                } catch (e) {
                    setResult({ok: false, text: safeStr(e)});
                }
            }

            return <TryContainer>
                <Select
                    label="Preset"
                    value={preset}
                    onChange={setPreset}
                    options={[
                        {value: "safeAreaInset", label: "safeAreaInset"},
                        {value: "safeAreaMaxInset", label: "safeAreaMaxInset"},
                        {value: "keyboardInset", label: "keyboardInset"},
                        {value: "titlebarArea", label: "titlebarArea"},
                        {value: "viewportSegment", label: "viewportSegment"},
                    ]}
                />

                <Button.Primary.Small onClick={run}>Run</Button.Primary.Small>

                <TryResult result={result}/>
            </TryContainer>;
        },
        onChange: function TryItOut(): React.JSX.Element {
            const [result, setResult] = React.useState<TryResultProps>(null);
            const [subscribed, setSubscribed] = React.useState<boolean>(false);
            const unsubRef = React.useRef<(() => void) | null>(null);

            function subscribe(): void {
                if (unsubRef.current) return;

                unsubRef.current = Native.dimension.onChange((dimension) => {
                    setResult({ok: true, text: safeStr(dimension)});
                });

                setSubscribed(true);
            }

            function unsubscribe(): void {
                unsubRef.current?.();
                unsubRef.current = null;
                setSubscribed(false);
            }

            return <TryContainer>
                <SubscribeButtons subscribed={subscribed} onSubscribe={subscribe} onUnsubscribe={unsubscribe}/>

                <TryResult result={result}/>
            </TryContainer>;
        },
    },

    fullscreen: {
        request: function TryItOut(): React.JSX.Element {
            const [cssPath, setCssPath] = React.useState<string>("");
            const [result, setResult] = React.useState<TryResultProps>(null);

            async function run(): Promise<void> {
                try {
                    let element: Element | null = null;

                    try {
                        element = document.querySelector(cssPath);
                    } catch (_) {
                    }

                    if (element === null) await Native.fullscreen.request();
                    else await Native.fullscreen.request(element);

                    setResult({ok: true, text: "Fullscreen requested."});
                } catch (e) {
                    setResult({ok: false, text: safeStr(e)});
                }
            }

            return <TryContainer>
                <Video src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" title="Big Buck Bunny" showTitle/>

                <Spacing height="0.75rem"/>

                <InspectButton onSelectElement={setCssPath}/>

                {
                    cssPath
                    && <>
						<FieldLabel>Selected</FieldLabel>

						<HintMessage>{cssPath}</HintMessage>
					</>
                }

                <Spacing height="0.75rem"/>

                <Button.Primary.Small onClick={run}>Run</Button.Primary.Small>

                <TryResult result={result}/>
            </TryContainer>;
        },
        exit: function TryItOut(): React.JSX.Element {
            const [result, setResult] = React.useState<TryResultProps>(null);

            async function run(): Promise<void> {
                try {
                    await Native.fullscreen.exit();

                    setResult({ok: true, text: "Exited fullscreen."});
                } catch (e) {
                    setResult({ok: false, text: safeStr(e)});
                }
            }

            return <TryContainer>
                <Button.Primary.Small onClick={run}>Run</Button.Primary.Small>

                <TryResult result={result}/>
            </TryContainer>;
        },
        onChange: function TryItOut(): React.JSX.Element {
            const [result, setResult] = React.useState<TryResultProps>(null);
            const [subscribed, setSubscribed] = React.useState<boolean>(false);
            const unsubRef = React.useRef<(() => void) | null>(null);

            function subscribe(): void {
                if (unsubRef.current) return;

                unsubRef.current = Native.fullscreen.onChange((payload) => {
                    setResult({
                        ok: true,
                        text: safeStr({
                            nativeEvent: payload.nativeEvent.type,
                            element: payload.element.tagName,
                            isFullscreen: payload.isFullscreen,
                        }),
                    });
                });

                setSubscribed(true);
            }

            function unsubscribe(): void {
                unsubRef.current?.();
                unsubRef.current = null;
                setSubscribed(false);
            }

            return <TryContainer>
                <SubscribeButtons subscribed={subscribed} onSubscribe={subscribe} onUnsubscribe={unsubscribe}/>

                <TryResult result={result}/>
            </TryContainer>;
        },
        onError: function TryItOut(): React.JSX.Element {
            const [result, setResult] = React.useState<TryResultProps>(null);
            const [subscribed, setSubscribed] = React.useState<boolean>(false);
            const unsubRef = React.useRef<(() => void) | null>(null);

            function subscribe(): void {
                if (unsubRef.current) return;

                unsubRef.current = Native.fullscreen.onError((payload) => {
                    setResult({
                        ok: true,
                        text: safeStr({
                            nativeEvent: payload.nativeEvent.type,
                            element: payload.element.tagName,
                            isFullscreen: payload.isFullscreen,
                        }),
                    });
                });

                setSubscribed(true);
            }

            function unsubscribe(): void {
                unsubRef.current?.();
                unsubRef.current = null;
                setSubscribed(false);
            }

            return <TryContainer>
                <SubscribeButtons subscribed={subscribed} onSubscribe={subscribe} onUnsubscribe={unsubscribe}/>

                <TryResult result={result}/>
            </TryContainer>;
        },
    },

    geolocation: {
        value: function TryItOut(): React.JSX.Element {
            const [result, setResult] = React.useState<TryResultProps>(null);
            const [loading, setLoading] = React.useState<boolean>(false);

            async function run(): Promise<void> {
                setLoading(true);

                try {
                    const coords: GeolocationCoordinates = await Native.geolocation.value;

                    setResult({ok: true, text: safeStr(coords)});
                } catch (e) {
                    setResult({ok: false, text: safeStr(e)});
                } finally {
                    setLoading(false);
                }
            }

            return <TryContainer>
                <Button.Primary.Small onClick={run} disabled={loading}>
                    {loading ? "Locating…" : "Run"}
                </Button.Primary.Small>

                <TryResult result={result}/>
            </TryContainer>;
        },
        onChange: function TryItOut(): React.JSX.Element {
            const [result, setResult] = React.useState<TryResultProps>(null);
            const [subscribed, setSubscribed] = React.useState<boolean>(false);
            const unsubRef = React.useRef<(() => void) | null>(null);

            function subscribe(): void {
                if (unsubRef.current) return;

                unsubRef.current = Native.geolocation.onChange((coords: GeolocationCoordinates) => {
                    setResult({ok: true, text: safeStr(coords)});
                });

                setSubscribed(true);
            }

            function unsubscribe(): void {
                unsubRef.current?.();
                unsubRef.current = null;
                setSubscribed(false);
            }

            return <TryContainer>
                <SubscribeButtons subscribed={subscribed} onSubscribe={subscribe} onUnsubscribe={unsubscribe}/>

                <TryResult result={result}/>
            </TryContainer>
        },
    },

    notification: {
        send: function TryItOut(): React.JSX.Element {
            const [title, setTitle] = React.useState<string>("Hello");
            const [body, setBody] = React.useState<string>("You have a new message.");
            const [icon, setIcon] = React.useState<string>("");
            const [result, setResult] = React.useState<TryResultProps>(null);

            function onShow(): void {
                setResult({ok: true, text: "Notification shown."});
            }

            function onClick(): void {
                setResult({ok: true, text: "Notification clicked."});
            }

            function onClose(): void {
                setResult({ok: true, text: "Notification closed."});
            }

            function onError(): void {
                setResult({ok: false, text: "Failed to show notification."});
            }

            async function run(): Promise<void> {
                try {
                    await Native.notification.send({title, body: body || undefined, icon: icon || undefined, onShow, onClick, onClose, onError});
                } catch (e) {
                    setResult({ok: false, text: safeStr(e)});
                }
            }

            return <TryContainer>
                <Input label="Title" value={title} onChange={setTitle}/>
                <Input label="Body" value={body} onChange={setBody}/>
                <Input label="Icon URL" value={icon} onChange={setIcon} placeholder="https://..."/>

                <Button.Primary.Small onClick={run}>Run</Button.Primary.Small>

                <TryResult result={result}/>
            </TryContainer>;
        },
    },

    open: {
        app: function TryItOut(): React.JSX.Element {
            const [scheme, setScheme] = React.useState<string>("ms-excel://");
            const [androidPackage, setAndroidPackage] = React.useState<string>("");
            const [iosTrackId, setIosTrackId] = React.useState<string>("");
            const [windowsProductId, setWindowsProductId] = React.useState<string>("");
            const [macosTrackId, setMacosTrackId] = React.useState<string>("");
            const [allowAppStore, setAllowAppStore] = React.useState<boolean>(true);
            const [result, setResult] = React.useState<TryResultProps>(null);

            async function run(): Promise<void> {
                try {
                    const options: Record<string, unknown> = {};

                    options.android = {scheme, packageName: androidPackage, allowAppStore};
                    options.ios = {scheme, trackId: iosTrackId, allowAppStore};
                    options.windows = {scheme, productId: windowsProductId, allowAppStore};
                    options.macos = {scheme, trackId: macosTrackId, allowAppStore};

                    const result: AppOpenState = await Native.open.app(options);

                    setResult({ok: true, text: "Opened via " + AppOpenState[result] + "."});
                } catch (e) {
                    setResult({ok: false, text: safeStr(e)});
                }
            }

            return <TryContainer>
                <Input label="Scheme" value={scheme} onChange={setScheme} placeholder="ms-excel://"/>
                <Input label="Android — Package Name" value={androidPackage} onChange={setAndroidPackage} placeholder="com.microsoft.office.excel"/>
                <Input label="iOS — Track ID" value={iosTrackId} onChange={setIosTrackId} placeholder="586683407"/>
                <Input label="Windows — Product ID" value={windowsProductId} onChange={setWindowsProductId} placeholder="cfq7ttc0pr28"/>
                <Input label="macOS — Track ID" value={macosTrackId} onChange={setMacosTrackId} placeholder="462058435"/>
                <Checkbox label="Allow App Store" checked={allowAppStore} onChange={setAllowAppStore}/>

                <Spacing height="0.75rem"/>

                <Button.Primary.Small onClick={run}>Run</Button.Primary.Small>

                <TryResult result={result}/>
            </TryContainer>;
        },
        telephone: function TryItOut(): React.JSX.Element {
            const [to, setTo] = React.useState<string>("");
            const [result, setResult] = React.useState<TryResultProps>(null);

            async function run(): Promise<void> {
                try {
                    await Native.open.telephone({to: to});

                    setResult({ok: true, text: "Phone dialer opened."});
                } catch (e) {
                    setResult({ok: false, text: safeStr(e)});
                }
            }

            return <TryContainer>
                <Input label="To" value={to} onChange={setTo}/>

                <Button.Primary.Small onClick={run}>Run</Button.Primary.Small>

                <TryResult result={result}/>
            </TryContainer>;
        },
        message: function TryItOut(): React.JSX.Element {
            const [to, setTo] = React.useState<string>("");
            const [body, setBody] = React.useState<string>("");
            const [result, setResult] = React.useState<TryResultProps>(null);

            async function run(): Promise<void> {
                try {
                    await Native.open.message({to: to, body: body});

                    setResult({ok: true, text: "SMS app opened."});
                } catch (e) {
                    setResult({ok: false, text: safeStr(e)});
                }
            }

            return <TryContainer>
                <Input label="To" value={to} onChange={setTo}/>

                <Textarea label="Body" value={body} onChange={setBody} rows={3}/>

                <Button.Primary.Small onClick={run}>Run</Button.Primary.Small>

                <TryResult result={result}/>
            </TryContainer>;
        },
        mail: function TryItOut(): React.JSX.Element {
            const toRef = React.useRef<TagInputHandle>(null);
            const ccRef = React.useRef<TagInputHandle>(null);
            const bccRef = React.useRef<TagInputHandle>(null);
            const [subject, setSubject] = React.useState<string>("");
            const [body, setBody] = React.useState<string>("");
            const [result, setResult] = React.useState<TryResultProps>(null);

            async function run(): Promise<void> {
                try {
                    const to = toRef.current?.getValue() ?? [];
                    const cc = ccRef.current?.getValue() ?? [];
                    const bcc = bccRef.current?.getValue() ?? [];

                    await Native.open.mail({to: to, cc: cc, bcc: bcc, subject: subject, body: body});

                    setResult({ok: true, text: "Mail client opened."});
                } catch (e) {
                    setResult({ok: false, text: safeStr(e)});
                }
            }

            return (
                <TryContainer>
                    <TagInput ref={toRef} label="To" placeholder="Add address and press Enter"/>
                    <TagInput ref={ccRef} label="Cc" placeholder="Add address and press Enter"/>
                    <TagInput ref={bccRef} label="Bcc" placeholder="Add address and press Enter"/>
                    <Input label="Subject" value={subject} onChange={setSubject}/>
                    <Textarea label="Body" value={body} onChange={setBody} rows={4}/>

                    <Button.Primary.Small onClick={run}>Run</Button.Primary.Small>

                    <TryResult result={result}/>
                </TryContainer>
            );
        },
        file: function TryItOut(): React.JSX.Element {
            const acceptRef = React.useRef<TagInputHandle>(null);
            const [startIn, setStartIn] = React.useState<string>("");
            const [multiple, setMultiple] = React.useState<boolean>(false);
            const [result, setResult] = React.useState<TryResultProps>(null);

            async function run(): Promise<void> {
                try {
                    const accept = acceptRef.current?.getValue() ?? [];
                    const files = await Native.open.file({
                        multiple,
                        accept: accept as any,
                        startIn: (startIn !== "" ? startIn : undefined) as ExplorerStartIn
                    });

                    setResult({
                        ok: true,
                        text: safeStr(files.map((file: File) => ({name: file.name, size: file.size, type: file.type}))),
                    });
                } catch (e) {
                    setResult({ok: false, text: safeStr(e)});
                }
            }

            return <TryContainer>
                <TagInput ref={acceptRef} label="Accept" placeholder="e.g. .pdf, image/webp — press Enter"/>
                <Select
                    label="Start In"
                    value={startIn}
                    onChange={setStartIn}
                    options={[
                        {value: "", label: ""},
                        {value: ExplorerStartIn.Desktop, label: ExplorerStartIn.Desktop},
                        {value: ExplorerStartIn.Documents, label: ExplorerStartIn.Documents},
                        {value: ExplorerStartIn.Downloads, label: ExplorerStartIn.Downloads},
                        {value: ExplorerStartIn.Music, label: ExplorerStartIn.Music},
                        {value: ExplorerStartIn.Pictures, label: ExplorerStartIn.Pictures},
                        {value: ExplorerStartIn.Videos, label: ExplorerStartIn.Videos},
                    ]}
                />
                <Checkbox label="Multiple" checked={multiple} onChange={setMultiple}/>

                <Spacing height="0.75rem"/>

                <Button.Primary.Small onClick={run}>Run</Button.Primary.Small>

                <TryResult result={result}/>
            </TryContainer>;
        },
        directory: function TryItOut(): React.JSX.Element {
            const [startIn, setStartIn] = React.useState<string>("");
            const [mode, setMode] = React.useState<string>("");
            const [result, setResult] = React.useState<TryResultProps>(null);

            async function run(): Promise<void> {
                try {
                    const files = await Native.open.directory({
                        startIn: (startIn !== "" ? startIn : undefined) as ExplorerStartIn,
                        mode: (mode !== "" ? mode : undefined) as DirectoryExploreMode,
                    });

                    setResult({
                        ok: true,
                        text: safeStr(files.map((fileWithPath: FileWithPath) => ({relativePath: fileWithPath.relativePath, name: fileWithPath.file.name, size: fileWithPath.file.size, type: fileWithPath.file.type}))),
                    });
                } catch (e) {
                    setResult({ok: false, text: safeStr(e)});
                }
            }

            return <TryContainer>
                {
                    !Native.open.supported.directory
                    && <>
						<ErrorMessage>Native.open.directory doesn't supported in {Native.platform.os.name} {Native.platform.os.version}</ErrorMessage>
						<Spacing height="0.75rem"/>
					</>
                }

                <Select
                    label="Start In"
                    value={startIn}
                    onChange={setStartIn}
                    options={[
                        {value: "", label: ""},
                        {value: ExplorerStartIn.Desktop, label: ExplorerStartIn.Desktop},
                        {value: ExplorerStartIn.Documents, label: ExplorerStartIn.Documents},
                        {value: ExplorerStartIn.Downloads, label: ExplorerStartIn.Downloads},
                        {value: ExplorerStartIn.Music, label: ExplorerStartIn.Music},
                        {value: ExplorerStartIn.Pictures, label: ExplorerStartIn.Pictures},
                        {value: ExplorerStartIn.Videos, label: ExplorerStartIn.Videos},
                    ]}
                />
                <Select
                    label="Mode"
                    value={mode}
                    onChange={setMode}
                    options={[
                        {value: "", label: ""},
                        {value: DirectoryExploreMode.Read, label: DirectoryExploreMode.Read},
                        {value: DirectoryExploreMode.ReadWrite, label: DirectoryExploreMode.ReadWrite},
                    ]}
                />

                <Spacing height="0.75rem"/>

                <Button.Primary.Small onClick={run}>Run</Button.Primary.Small>

                <TryResult result={result}/>
            </TryContainer>;
        },
        setting: function TryItOut(): React.JSX.Element {
            const [type, setType] = React.useState<string>(SettingType.General);
            const [result, setResult] = React.useState<TryResultProps>(null);

            async function run(): Promise<void> {
                try {
                    await Native.open.setting(type as SettingType);

                    setResult({ok: true, text: "Settings opened."});
                } catch (e) {
                    setResult({ok: false, text: safeStr(e)});
                }
            }

            return <TryContainer>
                {
                    !Native.open.supported.setting
                    && <>
						<ErrorMessage>Native.open.setting doesn't supported in {Native.platform.os.name} {Native.platform.os.version}</ErrorMessage>
						<Spacing height="0.75rem"/>
					</>
                }

                <Select
                    label="Type"
                    value={type}
                    onChange={setType}
                    options={[
                        {value: SettingType.General, label: SettingType.General},
                        {value: SettingType.Network, label: SettingType.Network},
                        {value: SettingType.Display, label: SettingType.Display},
                        {value: SettingType.Appearance, label: SettingType.Appearance},
                        {value: SettingType.Accessibility, label: SettingType.Accessibility},
                        {value: SettingType.Battery, label: SettingType.Battery},
                        {value: SettingType.Datetime, label: SettingType.Datetime},
                        {value: SettingType.Language, label: SettingType.Language},
                        {value: SettingType.Accounts, label: SettingType.Accounts},
                        {value: SettingType.Storage, label: SettingType.Storage},
                    ]}
                />

                <Button.Primary.Small onClick={run}>Run</Button.Primary.Small>

                <TryResult result={result}/>
            </TryContainer>;
        },
        camera: function TryItOut(): React.JSX.Element {
            const [cameraType, setCameraType] = React.useState<string>(CameraType.Image);
            const [captureType, setCaptureType] = React.useState<string>(CaptureType.User);
            const [result, setResult] = React.useState<TryResultProps>(null);

            async function run(): Promise<void> {
                try {
                    const files = await Native.open.camera({
                        type: cameraType as CameraType,
                        capture: captureType as CaptureType,
                    });

                    setResult({
                        ok: true,
                        text: safeStr(files.map((file: File) => ({name: file.name, size: file.size, type: file.type}))),
                    });
                } catch (e) {
                    setResult({ok: false, text: safeStr(e)});
                }
            }

            return <TryContainer>
                {
                    !Native.open.supported.camera
                    && <>
						<ErrorMessage>Native.open.camera doesn't supported in {Native.platform.os.name} {Native.platform.os.version}</ErrorMessage>
						<Spacing height="0.75rem"/>
					</>
                }

                <Select
                    label="Type"
                    value={cameraType}
                    onChange={setCameraType}
                    options={[
                        {value: CameraType.Image, label: CameraType.Image},
                        {value: CameraType.Video, label: CameraType.Video},
                    ]}
                />
                <Select
                    label="Capture"
                    value={captureType}
                    onChange={setCaptureType}
                    options={[
                        {value: CaptureType.User, label: CaptureType.User},
                        {value: CaptureType.Environment, label: CaptureType.Environment},
                    ]}
                />

                <Button.Primary.Small onClick={run}>Run</Button.Primary.Small>

                <TryResult result={result}/>
            </TryContainer>;
        },
        contact: function TryItOut(): React.JSX.Element {
            const [multiple, setMultiple] = React.useState<boolean>(false);
            const [result, setResult] = React.useState<TryResultProps>(null);

            async function run(): Promise<void> {
                try {
                    const contacts = await Native.open.contact({multiple});

                    setResult({
                        ok: true,
                        text: safeStr(contacts.map((contact: Contact) => ({name: contact.name, email: contact.email, tel: contact.tel, address: contact.address, icon: contact.icon?.map(URL.createObjectURL)}))),
                    });
                } catch (e) {
                    setResult({ok: false, text: safeStr(e)});
                }
            }

            return <TryContainer>
                {
                    !Native.open.supported.contact
                    && <>
						<ErrorMessage>Native.open.contact doesn't supported in {Native.platform.os.name} {Native.platform.os.version}</ErrorMessage>
						<Spacing height="0.75rem"/>
					</>
                }

                <Checkbox
                    label="Multiple"
                    checked={multiple}
                    onChange={setMultiple}
                />

                <Spacing height="0.75rem"/>

                <Button.Primary.Small onClick={run}>Run</Button.Primary.Small>

                <TryResult result={result}/>
            </TryContainer>;
        },
        share: function TryItOut(): React.JSX.Element {
            const [title, setTitle] = React.useState<string>("native-fn");
            const [text, setText] = React.useState<string>("");
            const [url, setUrl] = React.useState<string>("https://www.npmjs.com/package/native-fn");
            const [result, setResult] = React.useState<TryResultProps>(null);

            async function run(): Promise<void> {
                try {
                    await Native.open.share({title: title || undefined, text: text || undefined, url: url || undefined});

                    setResult({ok: true, text: "Share sheet opened."});
                } catch (e) {
                    setResult({ok: false, text: safeStr(e)});
                }
            }

            return <TryContainer>
                {
                    !Native.open.supported.share
                    && <>
						<ErrorMessage>Native.open.share doesn't supported in {Native.platform.os.name} {Native.platform.os.version}</ErrorMessage>
						<Spacing height="0.75rem"/>
					</>
                }

                <Input label="Title" value={title} onChange={setTitle}/>
                <Input label="Text" value={text} onChange={setText}/>
                <Input label="URL" value={url} onChange={setUrl} placeholder="https://..."/>

                <Button.Primary.Small onClick={run}>Run</Button.Primary.Small>

                <TryResult result={result}/>
            </TryContainer>;
        },
        calendar: function TryItOut(): React.JSX.Element {
            const [title, setTitle] = React.useState<string>("Team Sync");
            const [description, setDescription] = React.useState<string>("");
            const [location, setLocation] = React.useState<string>("");
            const [startDate, setStartDate] = React.useState<string>("2026-04-01T10:00");
            const [endDate, setEndDate] = React.useState<string>("2026-04-01T11:00");
            const [result, setResult] = React.useState<TryResultProps>(null);

            function run(): void {
                try {
                    Native.open.calendar({
                        title,
                        description: description || undefined,
                        location: location || undefined,
                        startDate: new Date(startDate),
                        endDate: new Date(endDate),
                    });

                    setResult({ok: true, text: ".ics download triggered."});
                } catch (e) {
                    setResult({ok: false, text: safeStr(e)});
                }
            }

            return <TryContainer>
                {
                    !Native.open.supported.calendar
                    && <>
						<ErrorMessage>Native.open.calendar doesn't supported in {Native.platform.os.name} {Native.platform.os.version}</ErrorMessage>
						<Spacing height="0.75rem"/>
					</>
                }

                <Input label="Title" value={title} onChange={setTitle}/>
                <Input label="Description" value={description} onChange={setDescription}/>
                <Input label="Location" value={location} onChange={setLocation}/>
                <Input label="Start Date" type="datetime-local" value={startDate} onChange={setStartDate}/>
                <Input label="End Date" type="datetime-local" value={endDate} onChange={setEndDate}/>

                <Button.Primary.Small onClick={run}>Run</Button.Primary.Small>

                <TryResult result={result}/>
            </TryContainer>;
        },
    },

    permission: {
        request: function TryItOut(): React.JSX.Element {
            const [type, setType] = React.useState<string>("notifications");
            const [result, setResult] = React.useState<TryResultProps>(null);

            async function run(): Promise<void> {
                try {
                    const state = await Native.permission.request(type as PermissionType);

                    setResult({ok: true, text: safeStr(state)});
                } catch (e) {
                    setResult({ok: false, text: safeStr(e)});
                }
            }

            return <TryContainer>
                <Select
                    label="Type"
                    value={type}
                    onChange={setType}
                    options={[
                        {value: PermissionType.Camera, label: PermissionType.Camera},
                        {value: PermissionType.ClipboardRead, label: PermissionType.ClipboardRead},
                        {value: PermissionType.Microphone, label: PermissionType.Microphone},
                        {value: PermissionType.Geolocation, label: PermissionType.Geolocation},
                        {value: PermissionType.Notification, label: PermissionType.Notification},
                        {value: PermissionType.MIDI, label: PermissionType.MIDI},
                    ]}
                />

                <Button.Primary.Small onClick={run}>Run</Button.Primary.Small>

                <TryResult result={result}/>
            </TryContainer>;
        },
        check: function TryItOut(): React.JSX.Element {
            const [type, setType] = React.useState<string>("notifications");
            const [result, setResult] = React.useState<TryResultProps>(null);

            async function run(): Promise<void> {
                try {
                    const state = await Native.permission.check(type as PermissionType);

                    setResult({ok: true, text: safeStr(state)});
                } catch (e) {
                    setResult({ok: false, text: safeStr(e)});
                }
            }

            return <TryContainer>
                <Select
                    label="Type"
                    value={type}
                    onChange={setType}
                    options={[
                        {value: PermissionType.Camera, label: PermissionType.Camera},
                        {value: PermissionType.ClipboardRead, label: PermissionType.ClipboardRead},
                        {value: PermissionType.Microphone, label: PermissionType.Microphone},
                        {value: PermissionType.Geolocation, label: PermissionType.Geolocation},
                        {value: PermissionType.Notification, label: PermissionType.Notification},
                        {value: PermissionType.MIDI, label: PermissionType.MIDI},
                    ]}
                />

                <Button.Primary.Small onClick={run}>Run</Button.Primary.Small>

                <TryResult result={result}/>
            </TryContainer>;
        },
    },

    pip: {
        request: function TryItOut(): React.JSX.Element {
            const [cssPath, setCssPath] = React.useState<string>("");
            const [result, setResult] = React.useState<TryResultProps>(null);

            async function run(): Promise<void> {
                try {
                    let element: Element | null = null;

                    try {
                        element = document.querySelector(cssPath);
                    } catch (_) {
                    }

                    if (element === null) await Native.pip.request();
                    else if (element instanceof HTMLVideoElement) await Native.pip.request(element)
                    else return setResult({ok: false, text: 'The "' + element.tagName + '" element does not support Picture-in-Picture requests.'});

                    setResult({ok: true, text: "Picture-in-Picture requested."});
                } catch (e) {
                    setResult({ok: false, text: safeStr(e)});
                }
            }

            return <TryContainer>
                <Video src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" title="For Bigger Blazes" showTitle/>

                <Spacing height="0.75rem"/>

                <InspectButton onSelectElement={setCssPath}/>

                {
                    cssPath
                    && <>
						<FieldLabel>Selected</FieldLabel>

						<HintMessage>{cssPath}</HintMessage>
					</>
                }

                <Spacing height="0.75rem"/>

                <Button.Primary.Small onClick={run}>Run</Button.Primary.Small>

                <TryResult result={result}/>
            </TryContainer>;
        },
        exit: function TryItOut(): React.JSX.Element {
            const [result, setResult] = React.useState<TryResultProps>(null);

            async function run(): Promise<void> {
                try {
                    await Native.pip.exit();

                    setResult({ok: true, text: "Exited Picture-in-Picture."});
                } catch (e) {
                    setResult({ok: false, text: safeStr(e)});
                }
            }

            return <TryContainer>
                <Button.Primary.Small onClick={run}>Run</Button.Primary.Small>

                <TryResult result={result}/>
            </TryContainer>;
        },
        onChange: function TryItOut(): React.JSX.Element {
            const [result, setResult] = React.useState<TryResultProps>(null);
            const [subscribed, setSubscribed] = React.useState<boolean>(false);
            const unsubRef = React.useRef<(() => void) | null>(null);

            function subscribe(): void {
                if (unsubRef.current) return;

                unsubRef.current = Native.pip.onChange((payload) => {
                    setResult({
                        ok: true,
                        text: safeStr({
                            nativeEvent: payload.nativeEvent.type,
                            element: payload.element.tagName,
                            isPip: payload.isPip,
                        }),
                    });
                });

                setSubscribed(true);
            }

            function unsubscribe(): void {
                unsubRef.current?.();
                unsubRef.current = null;
                setSubscribed(false);
            }

            return <TryContainer>
                <SubscribeButtons subscribed={subscribed} onSubscribe={subscribe} onUnsubscribe={unsubscribe}/>

                <TryResult result={result}/>
            </TryContainer>;
        },
        onError: function TryItOut(): React.JSX.Element {
            const [result, setResult] = React.useState<TryResultProps>(null);
            const [subscribed, setSubscribed] = React.useState<boolean>(false);
            const unsubRef = React.useRef<(() => void) | null>(null);

            function subscribe(): void {
                if (unsubRef.current) return;

                unsubRef.current = Native.pip.onError((payload) => {
                    setResult({
                        ok: true,
                        text: safeStr({
                            nativeEvent: payload.nativeEvent.type,
                            element: payload.element.tagName,
                            isPip: payload.isPip,
                        }),
                    });
                });

                setSubscribed(true);
            }

            function unsubscribe(): void {
                unsubRef.current?.();
                unsubRef.current = null;
                setSubscribed(false);
            }

            return <TryContainer>
                <SubscribeButtons subscribed={subscribed} onSubscribe={subscribe} onUnsubscribe={unsubscribe}/>

                <TryResult result={result}/>
            </TryContainer>;
        },
    },

    platform: {
        os: function TryItOut(): React.JSX.Element {
            const [result, setResult] = React.useState<TryResultProps>(null);

            function run(): void {
                setResult({ok: true, text: safeStr(Native.platform.os)});
            }

            return <TryContainer>
                <Button.Primary.Small onClick={run}>Run</Button.Primary.Small>

                <TryResult result={result}/>
            </TryContainer>;
        },
        browser: function TryItOut(): React.JSX.Element {
            const [result, setResult] = React.useState<TryResultProps>(null);

            function run(): void {
                setResult({ok: true, text: safeStr(Native.platform.browser)});
            }

            return <TryContainer>
                <Button.Primary.Small onClick={run}>Run</Button.Primary.Small>

                <TryResult result={result}/>
            </TryContainer>;
        },
        engine: function TryItOut(): React.JSX.Element {
            const [result, setResult] = React.useState<TryResultProps>(null);

            function run(): void {
                setResult({ok: true, text: safeStr(Native.platform.engine)});
            }

            return <TryContainer>
                <Button.Primary.Small onClick={run}>Run</Button.Primary.Small>

                <TryResult result={result}/>
            </TryContainer>;
        },
        device: function TryItOut(): React.JSX.Element {
            const [result, setResult] = React.useState<TryResultProps>(null);

            function run(): void {
                setResult({ok: true, text: safeStr(Native.platform.device)});
            }

            return <TryContainer>
                <Button.Primary.Small onClick={run}>Run</Button.Primary.Small>

                <TryResult result={result}/>
            </TryContainer>;
        },
        locale: function TryItOut(): React.JSX.Element {
            const [result, setResult] = React.useState<TryResultProps>(null);

            function run(): void {
                setResult({ok: true, text: safeStr(Native.platform.locale)});
            }

            return <TryContainer>
                <Button.Primary.Small onClick={run}>Run</Button.Primary.Small>

                <TryResult result={result}/>
            </TryContainer>;
        },
        gpu: function TryItOut(): React.JSX.Element {
            const [result, setResult] = React.useState<TryResultProps>(null);

            function run(): void {
                setResult({ok: true, text: safeStr(Native.platform.gpu)});
            }

            return <TryContainer>
                <Button.Primary.Small onClick={run}>Run</Button.Primary.Small>

                <TryResult result={result}/>
            </TryContainer>;
        },
        userAgent: function TryItOut(): React.JSX.Element {
            const [ua, setUa] = React.useState<string>("");
            const [result, setResult] = React.useState<TryResultProps>(null);

            function get(): void {
                setResult({ok: true, text: Native.platform.userAgent});
            }

            function set(): void {
                if (ua.trim()) {
                    Native.platform.userAgent = ua.trim();

                    setResult({ok: true, text: "UA set. os: " + Native.platform.os.name});
                }
            }

            function reset(): void {
                Native.platform.userAgent = navigator.userAgent;

                setResult({ok: true, text: "UA restored."});
                setUa("");
            }

            return <TryContainer>
                <Button.Primary.Small onClick={get}>Get</Button.Primary.Small>

                <Spacing height="0.75rem"/>

                <Textarea label="Override UA" value={ua} onChange={setUa} rows={3} placeholder="Mozilla/5.0 ..."/>

                <div style={{display: "flex", gap: "0.5rem"}}>
                    <Button.Primary.Small onClick={set} disabled={!ua.trim()}>Set</Button.Primary.Small>

                    <Button.Secondary.Small onClick={reset}>Reset</Button.Secondary.Small>
                </div>

                <TryResult result={result}/>
            </TryContainer>;
        },
        ready: function TryItOut(): React.JSX.Element {
            const [result, setResult] = React.useState<TryResultProps>(null);
            const [loading, setLoading] = React.useState<boolean>(false);

            async function run(): Promise<void> {
                setLoading(true);

                await Native.platform.ready;

                setResult({
                    ok: true,
                    text: safeStr({os: Native.platform.os, browser: Native.platform.browser, gpu: Native.platform.gpu}),
                });

                setLoading(false);
            }

            return <TryContainer>
                <Button.Primary onClick={run} disabled={loading}>{loading ? "Waiting…" : "Run"}</Button.Primary>

                <TryResult result={result}/>
            </TryContainer>;
        },
        isWebview: function TryItOut(): React.JSX.Element {
            const [result, setResult] = React.useState<TryResultProps>(null);

            function run(): void {
                setResult({ok: true, text: safeStr(Native.platform.isWebview)});
            }

            return <TryContainer>
                <Button.Primary.Small onClick={run}>Run</Button.Primary.Small>

                <TryResult result={result}/>
            </TryContainer>;
        },
        isNode: function TryItOut(): React.JSX.Element {
            const [result, setResult] = React.useState<TryResultProps>(null);

            function run(): void {
                setResult({ok: true, text: safeStr(Native.platform.isNode)});
            }

            return <TryContainer>
                <Button.Primary.Small onClick={run}>Run</Button.Primary.Small>

                <TryResult result={result}/>
            </TryContainer>;
        },
        isStandalone: function TryItOut(): React.JSX.Element {
            const [result, setResult] = React.useState<TryResultProps>(null);

            function run(): void {
                setResult({ok: true, text: safeStr(Native.platform.isStandalone)});
            }

            return <TryContainer>
                <Button.Primary.Small onClick={run}>Run</Button.Primary.Small>

                <TryResult result={result}/>
            </TryContainer>;
        },
    },

    theme: {
        value: function TryItOut(): React.JSX.Element {
            const [color, setColor] = React.useState<string>("#1a1a2e");
            const [result, setResult] = React.useState<TryResultProps>(null);

            function get(): void {
                setResult({ok: true, text: Native.theme.value ?? "undefined"});
            }

            function set(): void {
                Native.theme.value = color || undefined;

                setResult({ok: true, text: "Theme color set to: " + (color || "undefined")});
            }

            function reset(): void {
                Native.theme.value = undefined;

                setResult({ok: true, text: "Theme color removed."});
            }

            return <TryContainer>
                <Button.Secondary.Small onClick={get}>Get</Button.Secondary.Small>

                <Spacing height="0.75rem"/>

                <ColorPicker value={color} onChange={setColor} label="Color"/>

                <div style={{display: "flex", gap: "0.5rem"}}>
                    <Button.Primary.Small onClick={set}>Set</Button.Primary.Small>
                    <Button.Secondary.Small onClick={reset}>Remove</Button.Secondary.Small>
                </div>

                <TryResult result={result}/>
            </TryContainer>
        },
    },

    vibration: {
        run: function TryItOut(): React.JSX.Element {
            const [pattern, setPattern] = React.useState<string>("200");
            const [result, setResult] = React.useState<TryResultProps>(null);

            function run(): void {
                try {
                    const raw = pattern.trim();
                    const parsed = raw.includes(",") ? raw.split(",").map((v) => Number(v.trim())) : Number(raw);
                    const ok = Native.vibration.run(parsed);

                    setResult({ok, text: ok ? "Vibration started." : "Request rejected."});
                } catch (e) {
                    setResult({ok: false, text: safeStr(e)});
                }
            }

            return <TryContainer>
                <Input label="Pattern" value={pattern} onChange={setPattern} placeholder="200 or 100, 50, 200" hint="Single number for one pulse. Comma-separated for pattern."/>

                <Button.Primary.Small onClick={run}>Run</Button.Primary.Small>

                <TryResult result={result}/>
            </TryContainer>;
        },
        stop: function TryItOut(): React.JSX.Element {
            const [result, setResult] = React.useState<TryResultProps>(null);

            function run(): void {
                try {
                    const ok = Native.vibration.stop();

                    setResult({ok, text: ok ? "Vibration stopped." : "Request rejected."});
                } catch (e) {
                    setResult({ok: false, text: safeStr(e)});
                }
            }

            return <TryContainer>
                <Button.Primary.Small onClick={run}>Run</Button.Primary.Small>

                <TryResult result={result}/>
            </TryContainer>;
        },
    }
}

const DOCUMENTS: Documents = {
    appearance: {
        value: {
            signature: `get value(): Appearances`,
            description: `Returns the current color scheme of the device.`,
            example: `
console.log(Native.appearance.value); // 'dark' | 'light' | 'unknown'
            `,
            returns: {
                type: `Appearances`,
                description: `enum Appearances {
    Unknown = 'unknown',
    Light   = 'light',
    Dark    = 'dark',
}`,
            },
            throws: [],
            tryItOut: TRY_IT_OUT.appearance.value,
        },
        onChange: {
            signature: `onChange(listener: (appearance: Appearances) => void, options?: AddEventListenerOptions): () => void`,
            description: `Subscribes to device color scheme changes.`,
            example: `
const unsubscribe = Native.appearance.onChange((appearance) => {
    console.log(appearance); // 'dark' | 'light'
});

unsubscribe();
            `,
            returns: {
                type: `() => void`,
                description: `// call to remove the listener\nunsubscribe();`,
            },
            throws: [],
            tryItOut: TRY_IT_OUT.appearance.onChange,
        },
    },

    badge: {
        supported: {
            signature: `get supported(): boolean`,
            description: `Returns whether badge is supported in the current environment.`,
            example: `
if (Native.badge.supported) {
    await Native.badge.set(5);
}
            `,
            returns: {
                type: `boolean`,
                description: `// true  — badge API support,
// false — no badge support`,
            },
            throws: [],
        },
        set: {
            signature: `set(contents: number): Promise<void>`,
            description: `Sets the app badge count.`,
            example: `
await Native.badge.set(5);
            `,
            returns: {type: `Promise<void>`},
            throws: [`throw new NotSupportedError // navigator.setAppBadge unavailable`],
            tryItOut: TRY_IT_OUT.badge.set,
        },
        clear: {
            signature: `clear(): Promise<void>`,
            description: `Clears the app badge.`,
            example: `
await Native.badge.clear();
            `,
            returns: {type: `Promise<void>`},
            throws: [`throw new NotSupportedError // navigator.setAppBadge unavailable`],
            tryItOut: TRY_IT_OUT.badge.clear,
        },
    },

    battery: {
        supported: {
            signature: `get supported(): boolean`,
            description: `Returns whether battery is supported in the current environment.`,
            example: `
if (Native.battery.supported) {
    const battery = await Native.battery.value;
    
    console.log(battery.level); // 0.0 – 1.0
}
            `,
            returns: {
                type: `boolean`,
                description: `// true  — battery API support,
// false — no battery support`,
            },
            throws: [],
        },
        value: {
            signature: `get value(): Promise<BatteryManager>`,
            description: `Returns the current battery status.`,
            example: `
const battery = await Native.battery.value;

console.log(battery.level);           // 0.0 – 1.0
console.log(battery.charging);        // true | false
console.log(battery.chargingTime);    // seconds until full
console.log(battery.dischargingTime); // seconds until empty
            `,
            returns: {
                type: `Promise<BatteryManager>`,
                description: `interface BatteryManager {
    readonly charging:          boolean;
    readonly chargingTime:      number;
    readonly dischargingTime:   number;
    readonly level:             number;
}`,
            },
            throws: [`throw new NotSupportedError // navigator.getBattery unavailable`],
            tryItOut: TRY_IT_OUT.battery.value,
        },
        onChange: {
            signature: `onChange(listener: (battery: BatteryManager) => void, options?: AddEventListenerOptions): () => void`,
            description: `Subscribes to battery status changes.`,
            example: `
const unsubscribe = Native.battery.onChange((battery) => {
    console.log(battery.level);    // 0.0 – 1.0
    console.log(battery.charging); // true | false
});

unsubscribe();
            `,
            returns: {
                type: `() => void`,
                description: `// call to remove the listener\nunsubscribe();`,
            },
            throws: [],
            tryItOut: TRY_IT_OUT.battery.onChange,
        },
    },

    clipboard: {
        copy: {
            signature: `copy(item: any): Promise<boolean>`,
            description: `Copies a value to the clipboard. Accepts string, Element, Selection, object, or array.`,
            flowchart: `
flowchart TD
    A([clipboard.copy called]) --> B[Convert item to text and html]
    B --> C{Clipboard API available?}
    C -->|yes| D[copyViaClipboardAPI]
    C -->|no| E[copyViaLegacy]
    D --> F{Success?}
    F -->|yes| G([return true])
    F -->|no| E
    E --> H{ClipboardItem + write available?}
    H -->|yes| I[navigator.clipboard.write with text/html + text/plain]
    H -->|no| J{writeText available?}
    J -->|yes| K[navigator.clipboard.writeText]
    J -->|no| L[copyViaSelection via execCommand]
    L --> M{execCommand success?}
    M -->|yes| G
    M -->|no| N[copyViaClipboardData IE fallback]
    N --> O([return boolean])
            `,
            example: `
// String
await Native.clipboard.copy('Hello world');

// DOM element (copies outerHTML + textContent)
await Native.clipboard.copy(document.querySelector('.content'));

// Object → serialized as JSON
await Native.clipboard.copy({ key: 'value' });

// Current selection
await Native.clipboard.copy(window.getSelection());
            `,
            returns: {type: `Promise<boolean>`},
            throws: [],
            tryItOut: TRY_IT_OUT.clipboard.copy,
        },
        paste: {
            signature: `paste(): Promise<string>`,
            description: `Reads the current clipboard content as a string.`,
            flowchart: `
flowchart TD
    A([clipboard.paste called]) --> B{Clipboard API available?}
    B -->|yes| C[pasteViaClipboardAPI]
    B -->|no| D[pasteViaLegacy]
    C --> E{ClipboardItem + read available?}
    E -->|yes| F[navigator.clipboard.read]
    E -->|no| G[navigator.clipboard.readText]
    F --> H{text/html type found?}
    H -->|yes| I([return html string])
    H -->|no| J{text/plain found?}
    J -->|yes| K([return plain string])
    J -->|no| D
    G --> L{Success?}
    L -->|yes| M([return string])
    L -->|no| D
    D --> N[pasteViaSelection via execCommand]
    N --> O{Success?}
    O -->|yes| P([return string])
    O -->|no| Q[pasteViaClipboardData IE fallback]
    Q --> R([return string])
            `,
            example: `
const text = await Native.clipboard.paste();

console.log(text); // HTML string if available, plain text otherwise
            `,
            returns: {type: `Promise<string>`},
            throws: [],
            tryItOut: TRY_IT_OUT.clipboard.paste,
        },
    },

    dimension: {
        value: {
            signature: `get value(): Dimensions`,
            description: `Returns current viewport dimensions, device pixel ratio, and orientation.`,
            example: `
const { innerWidth, innerHeight, outerWidth, outerHeight, scale, orientation } = Native.dimension.value;

console.log(innerWidth, innerHeight); // visible viewport size
console.log(scale);                   // device pixel ratio e.g. 2, 3

if (orientation === Orientation.Portrait) {
    console.log('Portrait mode');
}
            `,
            returns: {
                type: `Dimensions`,
                description: `interface Dimensions {
    outerWidth:  number;
    outerHeight: number;
    innerWidth:  number;
    innerHeight: number;
    scale:       number;
    orientation: Orientation;
}

enum Orientation {
    Portrait  = 'portrait',
    Landscape = 'landscape',
    Unknown   = 'unknown',
}`,
            },
            throws: [],
            tryItOut: TRY_IT_OUT.dimension.value,
        },
        environment: {
            signature: `environment: Environment`,
            description: `Provides access to CSS environment variable values: safe-area-inset, keyboard-inset, titlebar-area, and viewport-segment.`,
            example: `
// Safe area insets (e.g. iPhone notch / Dynamic Island)
const inset = Native.dimension.environment.safeAreaInset.value;
console.log(inset.top, inset.bottom, inset.left, inset.right);

// Virtual keyboard height
const kb = Native.dimension.environment.keyboardInset.value;
console.log(kb.height); // 0 when keyboard is hidden

// Subscribe to safe area changes
const unsubscribe = Native.dimension.environment.safeAreaInset.onChange((inset) => {
    document.body.style.paddingBottom = inset.bottom + 'px';
});
unsubscribe();
            `,
            returns: {
                type: `Environment`,
                description: `interface Environment {
    safeAreaInset:    EnvironmentPreset<'safe-area-inset'>;
    safeAreaMaxInset: EnvironmentPreset<'safe-area-max-inset'>;
    keyboardInset:    EnvironmentPreset<'keyboard-inset'>;
    titlebarArea:     EnvironmentPreset<'titlebar-area'>;
    viewportSegment:  EnvironmentPreset<'viewport-segment'>;
}

interface EnvironmentPreset<K> {
    get value(): EnvironmentPresetValues<K>;
    onChange(listener: (value: EnvironmentPresetValues<K>) => void, options?: AddEventListenerOptions): () => void;
}`,
            },
            throws: [],
            tryItOut: TRY_IT_OUT.dimension.environment,
        },
        onChange: {
            signature: `onChange(listener: (dimension: Dimensions) => void, options?: AddEventListenerOptions): () => void`,
            description: `Subscribes to viewport dimension and orientation changes.`,
            example: `
const unsubscribe = Native.dimension.onChange((dimension) => {
    console.log(dimension.innerWidth, dimension.innerHeight);
    console.log(dimension.orientation); // 'portrait' | 'landscape'
});

unsubscribe();
            `,
            returns: {
                type: `() => void`,
                description: `// call to remove the listener\nunsubscribe();`,
            },
            throws: [],
            tryItOut: TRY_IT_OUT.dimension.onChange,
        },
    },

    fullscreen: {
        supported: {
            signature: `get supported(): boolean`,
            description: `Returns whether fullscreen is supported in the current environment.`,
            example: `
if (Native.fullscreen.supported) {
    await Native.fullscreen.request();
}
            `,
            returns: {
                type: `boolean`,
                description: `// true  — standard or vendor-prefixed fullscreen API detected,
//         or iOS video with webkitSupportsFullscreen
// false — no fullscreen support`,
            },
            throws: [],
        },
        element: {
            signature: `get element(): Element | null`,
            description: `Returns the element currently displayed in fullscreen, or null if not in fullscreen.`,
            example: `
const el = Native.fullscreen.element;
 
if (el !== null) {
    console.log(el.tagName); // e.g. 'VIDEO', 'DIV'
}
            `,
            returns: {
                type: `Element | null`,
                description: `// Element — the current fullscreen element
// null    — not in fullscreen`,
            },
            throws: [],
        },
        isFullscreen: {
            signature: `get isFullscreen(): boolean`,
            description: `Returns whether fullscreen is currently active.`,
            example: `
console.log(Native.fullscreen.isFullscreen); // true | false
            `,
            returns: {type: `boolean`},
            throws: [],
        },
        request: {
            signature: `request(target?: Element, options?: FullscreenOptions): Promise<void>`,
            description: `Requests fullscreen for an element.`,
            flowchart: `
flowchart TD
    A([Fullscreen.request called]) --> B{target defined?}
    B -->|no| C[getDefaultTarget]
    B -->|yes| D{api available?}
    C --> D
    D -->|yes| E[Call element api.request]
    D -->|no| F[fallbackToIOSVideo]
    E --> G{Promise returned?}
    G -->|yes| H{Resolved?}
    H -->|yes| I([resolve])
    H -->|no| F
    G -->|no| I
    F --> J{iOS + VIDEO + webkitSupportsFullscreen?}
    J -->|yes| K[video.webkitEnterFullscreen]
    K --> I
    J -->|no| L([Throw NotSupportedError])
            `,
            example: `
// Default: documentElement on desktop, first video on iOS
await Native.fullscreen.request();
 
// Specific element
await Native.fullscreen.request(document.getElementById('player'));
 
// With options
await Native.fullscreen.request(element, { navigationUI: 'hide' });
            `,
            returns: {type: `Promise<void>`},
            throws: [
                `throw new NotSupportedError // element does not support fullscreen`,
                `throw new NotSupportedError // iOS video lacks webkitEnterFullscreen`,
                `throw new InvalidStateError // iOS video not yet played`,
            ],
            tryItOut: TRY_IT_OUT.fullscreen.request,
        },
        exit: {
            signature: `exit(): Promise<void>`,
            description: `Exits fullscreen.`,
            flowchart: `
flowchart TD
    A([Fullscreen.exit called]) --> B{api available?}
    B -->|yes| C[Call document api.exit]
    B -->|no| D[fallbackToIOSVideo]
    C --> E{Promise returned?}
    E -->|yes| F{Resolved?}
    F -->|yes| G([resolve])
    F -->|no| D
    E -->|no| G
    D --> H{iOS + displaying fullscreen video found?}
    H -->|yes| I[webkitExitFullscreen]
    I --> G
    H -->|no| J{getElement null?}
    J -->|yes| G
    J -->|no| K([Throw NotSupportedError])
            `,
            example: `
await Native.fullscreen.exit();
            `,
            returns: {type: `Promise<void>`},
            throws: [`throw new NotSupportedError // failed to exit fullscreen`],
            tryItOut: TRY_IT_OUT.fullscreen.exit,
        },
        onChange: {
            signature: `onChange(listener: (payload: FullscreenEventPayload) => void, options?: AddEventListenerOptions): () => void`,
            description: `Subscribes to fullscreen state changes.`,
            example: `
const unsubscribe = Native.fullscreen.onChange((payload) => {
    console.log(payload.isFullscreen); // true | false
    console.log(payload.element);      // Element
    console.log(payload.nativeEvent);  // Event
});
 
unsubscribe();
            `,
            returns: {
                type: `() => void`,
                description: `// call to remove the listener\nunsubscribe();`,
            },
            throws: [],
            tryItOut: TRY_IT_OUT.fullscreen.onChange,
        },
        onError: {
            signature: `onError(listener: (payload: FullscreenEventPayload) => void, options?: AddEventListenerOptions): () => void`,
            description: `Subscribes to fullscreen errors.`,
            example: `
const unsubscribe = Native.fullscreen.onError((payload) => {
    console.log(payload.isFullscreen); // boolean
    console.log(payload.element);      // Element
    console.log(payload.nativeEvent);  // Event
});
 
unsubscribe();
            `,
            returns: {
                type: `() => void`,
                description: `// call to remove the listener\nunsubscribe();`,
            },
            throws: [],
            tryItOut: TRY_IT_OUT.fullscreen.onError,
        },
    },

    geolocation: {
        supported: {
            signature: `get supported(): boolean`,
            description: `Returns whether geolocation is supported in the current environment.`,
            example: `
if (Native.geolocation.supported) {
    const coords = await Native.geolocation.value;

    console.log(coords.latitude, coords.longitude);
}
            `,
            returns: {
                type: `boolean`,
                description: `// true  — geolocation API support,
// false — no geolocation support`,
            },
            throws: [],
        },
        value: {
            signature: `get value(): Promise<GeolocationCoordinates>`,
            description: `Returns the current geographic coordinates. Falls back to IP-based location if the Geolocation API is unavailable or permission is denied.`,
            flowchart: `
flowchart TD
    A([geolocation.value called]) --> B{navigator.geolocation supported?}
    B -->|no| F[Fallback to ip-api.com]
    B -->|yes| C[Permission.request geolocation]
    C --> D{Permission granted?}
    D -->|no| F
    D -->|yes| E[getCurrentPosition]
    E --> G{Success?}
    G -->|yes| H([Resolve GeolocationCoordinates])
    G -->|no| F
    F --> I{ip-api.com responded?}
    I -->|yes| J([Resolve approximate coordinates])
    I -->|no| K([Throw original error])
            `,
            example: `
const coords = await Native.geolocation.value;

console.log(coords.latitude, coords.longitude);
console.log(coords.accuracy); // -1 when resolved via IP fallback
            `,
            returns: {
                type: `Promise<GeolocationCoordinates>`,
                description: `interface GeolocationCoordinates {
    readonly latitude:         number;
    readonly longitude:        number;
    readonly accuracy:         number;  // -1 when resolved via IP fallback
    readonly altitude:         number | null;
    readonly altitudeAccuracy: number | null;
    readonly heading:          number | null;
    readonly speed:            number | null;
}`,
            },
            throws: [
                `throw new NotSupportedError // geolocation unavailable and IP fallback failed`,
                `throw new PermissionNotGrantedError // permission denied and IP fallback failed`,
            ],
            tryItOut: TRY_IT_OUT.geolocation.value,
        },
        onChange: {
            signature: `onChange(listener: (coordinates: GeolocationCoordinates) => void, options?: AddEventListenerOptions): () => void`,
            description: `Subscribes to geographic position changes.`,
            example: `
const unsubscribe = Native.geolocation.onChange((coords) => {
    console.log(coords.latitude, coords.longitude);
    console.log(coords.accuracy); // meters
});

unsubscribe();
            `,
            returns: {
                type: `() => void`,
                description: `// call to remove the listener\nunsubscribe();`,
            },
            throws: [],
            tryItOut: TRY_IT_OUT.geolocation.onChange,
        },
    },

    notification: {
        supported: {
            signature: `get supported(): boolean`,
            description: `Returns whether notification is supported in the current environment.`,
            example: `
if (Native.notification.supported) {
    await Native.notification.send({
        title: 'Hello',
        body:  'You have a new message.',
        icon:  '/icon.png',
    });
}
            `,
            returns: {
                type: `boolean`,
                description: `// true  — notification API support,
// false — no notification support`,
            },
            throws: [],
        },
        send: {
            signature: `send(options: NotificationOptions): Promise<Notification>`,
            description: `Sends a native notification after requesting permission.`,
            example: `
// Basic notification
const notification = await Native.notification.send({
    title: 'Hello',
    body:  'You have a new message.',
    icon:  '/icon.png',
});

// With event handlers
const notification = await Native.notification.send({
    title:   'Download complete',
    body:    'your-file.zip is ready.',
    onClick: () => window.focus(),
    onClose: () => console.log('dismissed'),
});

// Close the notification programmatically.
notification.close();
            `,
            returns: {
                type: `Promise<Notification>`,
                description: `interface NotificationOptions {
    title:               string;
    badge?:              string;
    body?:               string;
    data?:               any;
    dir?:                NotificationDirection;
    icon?:               string;
    lang?:               string;
    requireInteraction?: boolean;
    silent?:             boolean | null;
    tag?:                string;
    onClick?:            (event: Event) => any;
    onClose?:            (event: Event) => any;
    onError?:            (event: Event) => any;
    onShow?:             (event: Event) => any;
}`,
            },
            throws: [
                `throw new NotSupportedError // window.Notification unavailable`,
                `throw new PermissionNotGrantedError // notification permission denied`,
            ],
            tryItOut: TRY_IT_OUT.notification.send,
        },
    },

    open: {
        app: {
            signature: `app(options: AppOpenOptions): Promise<AppOpenState>`,
            description: `Opens a native app. Falls back through multiple URL strategies until one succeeds.`,
            flowchart: `
flowchart TD
    A([Native.open.app called]) --> B[Detect current OS]
    B --> C[Extract app info by OS]
    C --> D[Build URL priority list]
    D --> E[tryOpenURL sequentially]
    E --> F{Success?}
    F -->|yes| G([Resolve AppOpenState])
    F -->|no| H{URLs remaining?}
    H -->|yes| E
    H -->|no| I([Throw URLOpenError])

    subgraph tryOpenURL
        T1([Register blur and focus events]) --> T2[Open URL via href / iframe / cordova]
        T2 --> T3{blur fired?}
        T3 -->|yes| T4([resolve])
        T3 -->|no| T5([reject via timeout])
    end

    E -.->|delegates to| T1
            `,
            example: `
try {
    const result = await Native.open.app({
        android: {
            scheme: 'ms-excel://',
            packageName: 'com.microsoft.office.excel',
            allowAppStore: true,
            // allowWebStore: false,
            // intent: 'intent://#Intent;scheme=ms-excel;...',
            // fallback: 'https://www.microsoft.com/ko-kr/microsoft-365/excel',
            // timeout: 1000,
        },
        ios: {
            scheme: 'ms-excel://',
            trackId: '586683407',
            allowAppStore: true,
            // allowWebStore: false,
            // universal: '',
            // bundleId: 'com.microsoft.Office.Excel',
            // fallback: 'https://www.microsoft.com/ko-kr/microsoft-365/excel',
            // timeout: 2000,
        },
        windows: {
            scheme: 'ms-excel://',
            productId: 'cfq7ttc0pr28',
            allowAppStore: true,
            // allowWebStore: false,
            // fallback: 'https://www.microsoft.com/ko-kr/microsoft-365/excel',
            // timeout: 750,
        },
        macos: {
            scheme: 'ms-excel://',
            trackId: '462058435',
            allowAppStore: true,
            // allowWebStore: false,
            // bundleId: 'com.microsoft.Excel',
            // fallback: 'https://www.microsoft.com/ko-kr/microsoft-365/excel',
            // timeout: 750,
        },
    });

    switch (result) {
        AppOpenState.Intent:
            console.log('Opened via Android intent.');    break;
        AppOpenState.Universal:
            console.log('Opened via Universal Link.');    break;
        AppOpenState.Scheme:
            console.log('Opened via custom scheme.');     break;
        AppOpenState.Fallback:
            console.log('Opened via fallback URL.');      break;
        AppOpenState.Store:
            console.log('Redirected to App Store.');      break;
    }
} catch (e) {
    if (e instanceof Native.open.Errors.URLOpenError) {
        console.error('All URLs exhausted:', e.message);
    }
}
            `,
            returns: {
                type: `Promise<AppOpenState>`,
                description: `enum AppOpenState {
    Intent    = 'Intent',
    Universal = 'Universal',
    Scheme    = 'Scheme',
    Fallback  = 'Fallback',
    Store     = 'Store',
}`,
            },
            throws: [`throw new URLOpenError // all candidate URLs were tried and none succeeded`],
            tryItOut: TRY_IT_OUT.open.app,
        },
        telephone: {
            signature: `telephone(options: TelephoneOptions): Promise<void>`,
            description: `Opens the native phone dialer.`,
            example: `
await Native.open.telephone({ to: '+821012345678' });
            `,
            returns: {type: `Promise<void>`},
            throws: [`throw new URLOpenError // failed to open the phone dialer`],
            tryItOut: TRY_IT_OUT.open.telephone,
        },
        message: {
            signature: `message(options: MessageOptions): Promise<void>`,
            description: `Opens the native SMS app.`,
            example: `
// With pre-filled body
await Native.open.message({
    to:   '+821012345678',
    body: 'Hello from Native.open!',
});
            `,
            returns: {type: `Promise<void>`},
            throws: [`throw new URLOpenError // failed to open the SMS app`],
            tryItOut: TRY_IT_OUT.open.message,
        },
        mail: {
            signature: `mail(options: MailOptions): Promise<void>`,
            description: `Opens the native mail client.`,
            example: `
// Single recipient
await Native.open.mail({
    to:      'hello@example.com',
    subject: 'Greetings',
    body:    'Hi there!',
});

// Multiple recipients with cc / bcc
await Native.open.mail({
    to:      ['hello@example.com', 'world@example.com'],
    cc:      'cc@example.com',
    bcc:     'bcc@example.com',
    subject: 'Greetings',
    body:    'Hi there!',
});
            `,
            returns: {type: `Promise<void>`},
            throws: [`throw new URLOpenError // failed to open the mail client`],
            tryItOut: TRY_IT_OUT.open.mail,
        },
        file: {
            signature: `file(options?: FileOptions): Promise<File[]>`,
            description: `Opens a file picker dialog.`,
            example: `
// Single file
const [file] = await Native.open.file({
    accept: ['.pdf'],
});

// Multiple files with type filter
const files = await Native.open.file({
    multiple: true,
    accept:   ['.png', '.jpg', 'image/webp'],
    startIn:  ExplorerStartIn.Pictures,
});
            `,
            returns: {type: `Promise<File[]>`},
            throws: [
                `throw new UserCancelledError // user dismissed the picker`,
                `throw new NotSupportedError // showOpenFilePicker and input fallback both unavailable`,
            ],
            tryItOut: TRY_IT_OUT.open.file,
        },
        directory: {
            signature: `directory(options?: DirectoryOptions): Promise<FileWithPath[]>`,
            description: `Opens a directory picker and returns all files with their relative paths.`,
            example: `
// Read-only
const entries = await Native.open.directory();

// Read-write
const entries = await Native.open.directory({
    mode: DirectoryExploreMode.ReadWrite,
});

entries.forEach(({ file, relativePath }) => {
    console.log(relativePath, file.size); // 'src/index.ts', 1024
});
            `,
            returns: {
                type: `Promise<FileWithPath[]>`,
                description: `interface FileWithPath {
    file:         File;
    relativePath: string;
}`,
            },
            throws: [
                `throw new NotSupportedError // showDirectoryPicker and webkitdirectory both unavailable`,
                `throw new UserCancelledError // user dismissed the picker`,
            ],
            tryItOut: TRY_IT_OUT.open.directory,
        },
        setting: {
            signature: `setting(type: SettingType): Promise<void>`,
            description: `Opens a system settings screen. iOS is unsupported.`,
            example: `
// General settings
await Native.open.setting(SettingType.General);

// Accessibility settings
await Native.open.setting(SettingType.Accessibility);

// Battery settings (Android 5.1+)
await Native.open.setting(SettingType.Battery);
            `,
            returns: {type: `Promise<void>`},
            throws: [
                `throw new URLOpenError // canOpenSetting() returned false`,
                `throw new URLOpenError // all setting URLs failed`,
            ],
            tryItOut: TRY_IT_OUT.open.setting,
        },
        camera: {
            signature: `camera(options?: CameraOptions): Promise<File[]>`,
            description: `Opens the device camera.`,
            example: `
// Rear-facing photo (default)
const [photo] = await Native.open.camera();

// Front-facing video
const [video] = await Native.open.camera({
    type:    CameraType.Video,
    capture: CaptureType.User,
});
            `,
            returns: {type: `Promise<File[]>`},
            throws: [`throw new UserCancelledError // user dismissed the camera UI`],
            tryItOut: TRY_IT_OUT.open.camera,
        },
        contact: {
            signature: `contact(options?: ContactOptions): Promise<Contact[]>`,
            description: `Opens the native contact picker.`,
            example: `
// Single contact
const [contact] = await Native.open.contact();
console.log(contact.name, contact.tel);

// Multiple contacts
const contacts = await Native.open.contact({ multiple: true });
contacts.forEach((c) => console.log(c.name, c.email));
            `,
            returns: {
                type: `Promise<Contact[]>`,
                description: `interface Contact {
    name?:    string;
    email?:   string;
    tel?:     string;
    address?: string;
    icon?:    Blob[];
}`,
            },
            throws: [`throw new NotSupportedError // navigator.contacts unavailable`],
            tryItOut: TRY_IT_OUT.open.contact,
        },
        share: {
            signature: `share(options: ShareData): Promise<void>`,
            description: `Opens the native OS share sheet.`,
            example: `
// Share a URL
await Native.open.share({
    title: 'Check this out',
    url:   'https://example.com',
});

// Share text and URL
await Native.open.share({
    title: 'Check this out',
    text:  'Shared via Native.open',
    url:   'https://example.com',
});
            `,
            returns: {type: `Promise<void>`},
            throws: [
                `throw new NotSupportedError // navigator.share unavailable or canShare() false`,
                `throw new UserCancelledError // user dismissed the share sheet`,
            ],
            tryItOut: TRY_IT_OUT.open.share,
        },
        calendar: {
            signature: `calendar(options: CalendarOptions): void`,
            description: `Generates an RFC 5545 .ics file and triggers a download to open in the default calendar app.`,
            example: `
// Basic event
Native.open.calendar({
    title:       'Team Sync',
    description: 'Weekly alignment meeting',
    location:    'Seoul, Korea',
    startDate:   new Date('2026-04-01T10:00:00Z'),
    endDate:     new Date('2026-04-01T11:00:00Z'),
});

// Recurring event with alarm
Native.open.calendar({
    title:     'Weekly Standup',
    startDate: new Date('2026-04-01T09:00:00Z'),
    endDate:   new Date('2026-04-01T09:15:00Z'),
    alarm:     [{ minutes: 10, before: true }],
    recur:     { frequency: 'WEEKLY', byDay: ['MO'], count: 12 },
});

// All-day event
Native.open.calendar({
    title:     'Company Holiday',
    allDay:    true,
    startDate: new Date('2026-05-05T00:00:00Z'),
    endDate:   new Date('2026-05-05T00:00:00Z'),
});
            `,
            returns: {type: `void`},
            throws: [],
            tryItOut: TRY_IT_OUT.open.calendar,
        },
    },

    permission: {
        supported: {
            signature: `get supported(): boolean`,
            description: `Returns whether permission is supported in the current environment.`,
            example: `
if (Native.permission.supported) {
    const state = await Native.permission.check(PermissionType.Geolocation);
}
            `,
            returns: {
                type: `boolean`,
                description: `// true  — permission API support,
// false — no permission support`,
            },
            throws: [],
        },
        request: {
            signature: `request(type: PermissionType): Promise<PermissionState>`,
            description: `Requests a permission. Resolves immediately if already granted.`,
            flowchart: `
flowchart TD
    A([permission.request called]) --> B[check current state]
    B --> C{Already granted?}
    C -->|yes| D([Resolve Grant])
    C -->|no| E{PermissionType?}
    E -->|Notification| F[Notification.requestPermission]
    E -->|Geolocation| G[getCurrentPosition to trigger prompt]
    E -->|Camera| H[getUserMedia video=true]
    E -->|ClipboardRead| I[clipboard.read]
    E -->|Microphone| J[getUserMedia audio=true]
    E -->|MIDI| k[requestMIDIAccess]
    E -->|unknown| L([Resolve Unsupported])
    F & G & H & I & J --> M[check state again]
    M --> N([Resolve PermissionState])
            `,
            example: `
const state = await Native.permission.request(PermissionType.Notification);

switch (state) {
    case PermissionState.Grant:
        console.log('Permission granted.');  break;
    case PermissionState.Denied:
        console.log('Permission denied.');   break;
    case PermissionState.Prompt:
        console.log('Not yet decided.');     break;
    case PermissionState.Unsupported:
        console.log('Not supported.');       break;
}
            `,
            returns: {
                type: `Promise<PermissionState>`,
                description: `enum PermissionType {
    Notification  = 'notifications',
    Geolocation   = 'geolocation',
    Camera        = 'camera',
    ClipboardRead = 'clipboard-read',
    Microphone    = 'microphone',
    MIDI          = 'midi',
}

enum PermissionState {
    Grant       = 'grant',
    Denied      = 'denied',
    Prompt      = 'prompt',
    Unsupported = 'unsupported',
}`,
            },
            throws: [],
            tryItOut: TRY_IT_OUT.permission.request,
        },
        check: {
            signature: `check(type: PermissionType): Promise<PermissionState>`,
            description: `Returns the current permission state without triggering a prompt.`,
            example: `
// Check before accessing a feature
const state = await Native.permission.check(PermissionType.Geolocation);

if (state === PermissionState.Grant) {
    const coords = await Native.geolocation.value;
}
            `,
            returns: {
                type: `Promise<PermissionState>`,
                description: `enum PermissionState {
    Grant       = 'grant',
    Denied      = 'denied',
    Prompt      = 'prompt',
    Unsupported = 'unsupported',
}`,
            },
            throws: [],
            tryItOut: TRY_IT_OUT.permission.check,
        },
    },

    pip: {
        supported: {
            signature: `get supported(): boolean`,
            description: `Returns whether Picture-in-Picture is supported in the current environment.`,
            example: `
if (Native.pip.supported) {
    await Native.pip.request();
}
            `,
            returns: {
                type: `boolean`,
                description: `// true  — document.pictureInPictureEnabled is true,
//         or a video with webkitSupportsPresentationMode('picture-in-picture') exists
// false — no PiP support`,
            },
            throws: [],
        },
        element: {
            signature: `get element(): HTMLVideoElement | null`,
            description: `Returns the video element currently in Picture-in-Picture, or null if not active.`,
            example: `
const el = Native.pip.element;
 
if (el !== null) {
    console.log(el.src); // currently PiP video source
}
            `,
            returns: {
                type: `HTMLVideoElement | null`,
                description: `// HTMLVideoElement — the current PiP video
// null            — not in PiP`,
            },
            throws: [],
        },
        isPip: {
            signature: `get isPip(): boolean`,
            description: `Returns whether Picture-in-Picture is currently active.`,
            example: `
console.log(Native.pip.isPip); // true | false
            `,
            returns: {type: `boolean`},
            throws: [],
        },
        request: {
            signature: `request(target?: HTMLVideoElement): Promise<void>`,
            description: `Requests Picture-in-Picture for a video element.`,
            flowchart: `
flowchart TD
    A([Pip.request called]) --> B{target defined?}
    B -->|no| C[getDefaultTarget]
    B -->|yes| D{target is video element?}
    C --> D
    D -->|no| Z([Throw NotSupportedError])
    D -->|yes| E{requestPictureInPicture available?}
    E -->|yes| F[Call video.requestPictureInPicture]
    E -->|no| G[fallbackToWebkit]
    F --> H{Promise returned?}
    H -->|yes| I{Resolved?}
    I -->|yes| J([resolve])
    I -->|no| G
    H -->|no| J
    G --> K{webkitSupportsPresentationMode PIP?}
    K -->|yes| L[webkitSetPresentationMode picture-in-picture]
    L --> J
    K -->|no| M([Throw NotSupportedError])
            `,
            example: `
// Default: first video element
await Native.pip.request();
 
// Specific video element
await Native.pip.request(document.querySelector('video#player'));
            `,
            returns: {type: `Promise<void>`},
            throws: [
                `throw new NotSupportedError // target is not a video element`,
                `throw new NotSupportedError // PiP disabled on this element (disablePictureInPicture)`,
                `throw new NotSupportedError // requestPictureInPicture and webkitSetPresentationMode both unavailable`,
                `throw new InvalidStateError // PiP transition already in progress`,
            ],
            tryItOut: TRY_IT_OUT.pip.request,
        },
        exit: {
            signature: `exit(): Promise<void>`,
            description: `Exits Picture-in-Picture.`,
            flowchart: `
flowchart TD
    A([Pip.exit called]) --> B{exitPictureInPicture available?}
    B -->|yes| C[Call document.exitPictureInPicture]
    B -->|no| D[fallbackToWebkit]
    C --> E{Promise returned?}
    E -->|yes| F{Resolved?}
    F -->|yes| G([resolve])
    F -->|no| D
    E -->|no| G
    D --> H{webkit PiP video found?}
    H -->|yes| I[webkitSetPresentationMode inline]
    I --> G
    H -->|no| J{any video in PIP mode found?}
    J -->|yes| I
    J -->|no| K{pictureInPictureElement null?}
    K -->|yes| G
    K -->|no| L([Throw NotSupportedError])
            `,
            example: `
await Native.pip.exit();
            `,
            returns: {type: `Promise<void>`},
            throws: [`throw new NotSupportedError // failed to exit PiP`],
            tryItOut: TRY_IT_OUT.pip.exit,
        },
        onChange: {
            signature: `onChange(listener: (payload: PipEventPayload) => void, options?: AddEventListenerOptions): () => void`,
            description: `Subscribes to Picture-in-Picture state changes.`,
            example: `
const unsubscribe = Native.pip.onChange((payload) => {
    console.log(payload.isPip);       // true | false
    console.log(payload.element);     // HTMLVideoElement
    console.log(payload.nativeEvent); // Event
});
 
unsubscribe();
            `,
            returns: {
                type: `() => void`,
                description: `// call to remove the listener\nunsubscribe();`,
            },
            throws: [],
            tryItOut: TRY_IT_OUT.pip.onChange,
        },
        onError: {
            signature: `onError(listener: (payload: PipEventPayload) => void, options?: AddEventListenerOptions): () => void`,
            description: `Subscribes to Picture-in-Picture errors.`,
            example: `
const unsubscribe = Native.pip.onError((payload) => {
    console.log(payload.isPip);       // boolean
    console.log(payload.element);     // HTMLVideoElement
    console.log(payload.nativeEvent); // Event
});
 
unsubscribe();
            `,
            returns: {
                type: `() => void`,
                description: `// call to remove the listener\nunsubscribe();`,
            },
            throws: [],
            tryItOut: TRY_IT_OUT.pip.onError,
        },
    },

    platform: {
        os: {
            signature: `get os(): NameVersionPair<OS>`,
            description: `Returns the detected OS name and version.`,
            example: `
const { name, version } = Native.platform.os;

switch (name) {
    case OS.iOS:
        console.log('iOS', version);     break;
    case OS.Android:
        console.log('Android', version); break;
    case OS.Windows:
        console.log('Windows', version); break;
    case OS.MacOS:
        console.log('macOS', version);   break;
}
            `,
            returns: {
                type: `NameVersionPair<OS>`,
                description: `interface NameVersionPair<T> {
    name:    T;
    version: string;
}

enum OS {
    Unknown = 'Unknown',
    Android = 'Android',
    iOS     = 'iOS',
    Windows = 'Windows',
    MacOS   = 'MacOS',
}`,
            },
            throws: [],
            tryItOut: TRY_IT_OUT.platform.os,
        },
        browser: {
            signature: `get browser(): NameVersionPair<Browsers>`,
            description: `Returns the detected browser name and version.`,
            example: `
const { name, version } = Native.platform.browser;

if (name === Browsers.Safari) {
    console.log('Safari', version); // e.g. '17.0'
}
            `,
            returns: {
                type: `NameVersionPair<Browsers>`,
                description: `enum Browsers {
    Unknown         = 'Unknown',
    Chrome          = 'Chrome',
    Safari          = 'Safari',
    Edge            = 'Edge',
    Firefox         = 'Firefox',
    Opera           = 'Opera',
    IE              = 'IE',
    SamsungInternet = 'SamsungInternet',
}`,
            },
            throws: [],
            tryItOut: TRY_IT_OUT.platform.browser,
        },
        engine: {
            signature: `get engine(): NameVersionPair<Engines>`,
            description: `Returns the detected rendering engine name and version.`,
            example: `
const { name, version } = Native.platform.engine;

if (name === Engines.Blink) {
    console.log('Blink', version); // e.g. '120.0.6099.62'
}
            `,
            returns: {
                type: `NameVersionPair<Engines>`,
                description: `enum Engines {
    Unknown  = 'Unknown',
    EdgeHTML = 'EdgeHTML',
    ArkWeb   = 'ArkWeb',
    Blink    = 'Blink',
    Presto   = 'Presto',
    WebKit   = 'WebKit',
    Trident  = 'Trident',
    Gecko    = 'Gecko',
}`,
            },
            throws: [],
            tryItOut: TRY_IT_OUT.platform.engine,
        },
        device: {
            signature: `get device(): Devices`,
            description: `Returns the device category: Mobile, Desktop, or Unknown.`,
            example: `
if (Native.platform.device === Devices.Mobile) {
    console.log('Running on a mobile device');
}
            `,
            returns: {
                type: `Devices`,
                description: `enum Devices {
    Unknown = 'Unknown',
    Mobile  = 'Mobile',
    Desktop = 'Desktop',
}`,
            },
            throws: [],
            tryItOut: TRY_IT_OUT.platform.device,
        },
        locale: {
            signature: `get locale(): Locale`,
            description: `Returns the current locale, timezone, UTC offset, and text direction.`,
            example: `
const { language, languages, timezone, offset, isRTL } = Native.platform.locale;

console.log(language);   // 'ko-KR'
console.log(languages);  // ['ko-KR', 'en-US']
console.log(timezone);   // 'Asia/Seoul'
console.log(offset);     // 540  (UTC+9 in minutes)
console.log(isRTL);      // false
            `,
            returns: {
                type: `Locale`,
                description: `interface Locale {
    language:  string | null;
    languages: string[];
    timezone:  string | null;
    offset:    number;
    isRTL:     boolean;
}`,
            },
            throws: [],
            tryItOut: TRY_IT_OUT.platform.locale,
        },
        gpu: {
            signature: `get gpu(): GPU`,
            description: `Returns GPU information. Await Native.platform.ready for guaranteed complete data.`,
            example: `
// Guaranteed complete data
await Native.platform.ready;
const { vendor, architecture, device, description } = Native.platform.gpu;

console.log(vendor);       // 'apple'
console.log(architecture); // 'common-3'
console.log(device);       // 'Apple M2'
            `,
            returns: {
                type: `GPU`,
                description: `interface GPU {
    vendor?:       string;
    architecture?: string;
    device?:       string;
    description?:  string;
}`,
            },
            throws: [],
            tryItOut: TRY_IT_OUT.platform.gpu,
        },
        userAgent: {
            signature: `get userAgent(): string\nset userAgent(value: string)`,
            description: `Gets or sets the User-Agent string used for all platform detection. The setter invalidates all parsed caches.`,
            example: `
// Read current UA
console.log(Native.platform.userAgent);

// Override for testing
Native.platform.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)...';
console.log(Native.platform.os.name); // 'iOS'

// Restore original UA
Native.platform.userAgent = originalUA;
await Native.platform.ready;
            `,
            returns: {type: `string`},
            throws: [],
            tryItOut: TRY_IT_OUT.platform.userAgent,
        },
        ready: {
            signature: `get ready(): Promise<void>`,
            description: `Resolves when all async platform detection has settled.`,
            example: `
await Native.platform.ready;

// All values now reflect high-entropy and WebGPU data
console.log(Native.platform.os.name);
console.log(Native.platform.browser.name);
console.log(Native.platform.gpu.vendor);
            `,
            returns: {type: `Promise<void>`},
            throws: [],
            tryItOut: TRY_IT_OUT.platform.ready,
        },
        isWebview: {
            signature: `get isWebview(): boolean`,
            description: `Returns true when running inside a native WebView.`,
            example: `
if (Native.platform.isWebview) {
    console.log('Running inside a native WebView');
}
            `,
            returns: {type: `boolean`},
            throws: [],
            tryItOut: TRY_IT_OUT.platform.isWebview,
        },
        isNode: {
            signature: `get isNode(): boolean`,
            description: `Returns true when running in a Node.js environment.`,
            example: `
if (Native.platform.isNode) {
    console.log('Running in Node.js');
}
            `,
            returns: {type: `boolean`},
            throws: [],
            tryItOut: TRY_IT_OUT.platform.isNode,
        },
        isStandalone: {
            signature: `get isStandalone(): boolean`,
            description: `Returns true when running as an installed PWA.`,
            example: `
if (Native.platform.isStandalone) {
    console.log('Running as installed PWA');
}
            `,
            returns: {type: `boolean`},
            throws: [],
            tryItOut: TRY_IT_OUT.platform.isStandalone,
        },
    },

    theme: {
        value: {
            signature: `get value(): string | undefined\nset value(color: string | undefined)`,
            description: `Gets or sets the browser theme color via the meta theme-color tag.`,
            example: `
// Read
console.log(Native.theme.value); // '#ffffff' | undefined

// Set
Native.theme.value = '#1a1a2e';

// Remove
Native.theme.value = undefined;
            `,
            returns: {type: `string | undefined`},
            throws: [],
            tryItOut: TRY_IT_OUT.theme.value,
        },
    },

    vibration: {
        supported: {
            signature: `get supported(): boolean`,
            description: `Returns whether vibration is supported in the current environment.`,
            example: `
if (Native.vibration.supported) {
    Native.vibration.run([100, 50, 200]);
}
            `,
            returns: {
                type: `boolean`,
                description: `// true  — vibration API support,
// false — no vibration support`,
            },
            throws: [],
        },
        run: {
            signature: `run(pattern: number | number[]): boolean`,
            description: `Triggers device vibration. Pass a number for a single pulse or an array to define a pattern.`,
            example: `
// Single pulse — 200ms
Native.vibration.run(200);

// Pattern — vibrate 100ms, pause 50ms, vibrate 200ms
Native.vibration.run([100, 50, 200]);

// Stop any ongoing vibration
Native.vibration.run(0);
            `,
            returns: {type: `boolean`},
            throws: [`throw new NotSupportedError // navigator.vibrate unavailable`],
            tryItOut: TRY_IT_OUT.vibration.run,
        },
        stop: {
            signature: `stop(): boolean`,
            description: `Stops any ongoing vibration.`,
            example: `
Native.vibration.stop();
            `,
            returns: {
                type: `boolean`,
                description: `// true  — stop request accepted by the browser\n// false — document is hidden or vibration is unsupported`,
            },
            throws: [`throw new NotSupportedError // navigator.vibrate unavailable`],
            tryItOut: TRY_IT_OUT.vibration.stop,
        },
    },
};

const CHANGELOG = {
    "1.2.0": [
        "Fix Promise deadlock in Native.pip.request and Native.pip.exit caused by concurrent calls during PiP transition animation",
        "Fix Promise deadlock in Native.fullscreen.request and Native.fullscreen.exit caused by concurrent calls during fullscreen transition animation",
        "Add PipEventPayload and FullscreenEventPayload — onChange and onError listeners now receive structured payloads instead of raw Event",
    ],
    "1.1.9": ["Update README.md"],
    "1.1.8": ["Fix type mismatch in Contact that did not reflect actual values"],
    "1.1.7": ["Add clipboard-read permission type to Native.permission"],
    "1.1.6": ["Export constants and types to enable external imports"],
    "1.1.5": ["First stable release"],
};

interface DocumentReturns {
    type: string;
    description?: string;
}

function trim(s: string): string {
    return s.replace(/^\n+|\n+$/g, "").trimEnd();
}

function anchor(namespace: string, method: string): string {
    return `${namespace}-${method}`.toLowerCase().replace(/[^a-z0-9-]/g, "-");
}


function renderEntry(namespace: string, method: string, entry: DocumentEntry): string {
    const lines: string[] = [];
    const id = anchor(namespace, method);

    // ── heading
    lines.push(`<h3 id="${id}"><code>${namespace}.${method}</code></h3>`);
    lines.push("");

    // ── signature
    lines.push("**Signature**");
    lines.push("");
    lines.push("```ts");
    lines.push(trim(entry.signature));
    lines.push("```");
    lines.push("");

    // ── description
    lines.push(trim(entry.description));
    lines.push("");

    // ── flowchart (optional)
    if (entry.flowchart) {
        lines.push("**Flowchart**");
        lines.push("");
        lines.push("```mermaid");
        lines.push(trim(entry.flowchart));
        lines.push("```");
        lines.push("");
    }

    // ── example
    lines.push("**Example**");
    lines.push("");
    lines.push("```ts");
    lines.push(trim(entry.example));
    lines.push("```");
    lines.push("");

    // ── returns
    lines.push("**Returns**");
    lines.push("");
    lines.push("```ts");
    lines.push(trim(entry.returns.type));
    lines.push("```");
    lines.push("");

    if (entry.returns.description) {
        lines.push("");
        lines.push("```ts");
        lines.push(trim(entry.returns.description));
        lines.push("```");
    }

    lines.push("");

    // ── throws
    if (entry.throws.length > 0) {
        lines.push("**Throws**");
        lines.push("");

        for (const t of entry.throws) {
            lines.push("```ts");
            lines.push(trim(t));
            lines.push("```");
        }

        lines.push("");
    }

    lines.push("---");
    lines.push("");

    return lines.join("\n");
}

function renderNamespace(namespace: string, entries: Record<string, DocumentEntry>): string {
    const lines: string[] = [];

    lines.push(`## ${namespace}`);
    lines.push("");

    // method index
    const methods = Object.keys(entries);
    lines.push(
        methods
            .map((m) => `[\`${m}\`](#${anchor(namespace, m)})`)
            .join(" · ")
    );
    lines.push("");

    // entries
    for (const [method, entry] of Object.entries(entries)) {
        lines.push(renderEntry(namespace, method, entry));
    }

    return lines.join("\n");
}

function renderTOC(docs: Documents): string {
    const lines: string[] = [];

    lines.push("## Table of Contents");
    lines.push("");

    for (const [namespace, entries] of Object.entries(docs)) {
        lines.push(`- **[${namespace}](#${namespace})**`);
        for (const method of Object.keys(entries)) {
            lines.push(`  - [${method}](#${anchor(namespace, method)})`);
        }
    }

    lines.push("");
    return lines.join("\n");
}

console.log(generateMarkdown(DOCUMENTS));

export function generateMarkdown(docs: Documents): string {
    const lines: string[] = [];

    lines.push("# native-fn API Reference");
    lines.push("<a href=\"https://www.npmjs.com/package/native-fn\">![NPM Version](https://nodei.co/npm/native-fn.png?downloads=true&downloadRank=true&stars=true)</a><br/>");
    lines.push("<a href=\"https://www.npmjs.com/package/native-fn\">![NPM Downloads](https://img.shields.io/npm/d18m/native-fn?style=flat&logo=npm&logoColor=%23CB3837&label=Download&color=%23CB3837&link=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fnative-fn)</a>");
    lines.push("<a href=\"https://www.npmjs.com/package/native-fn\">![GitHub Repo stars](https://img.shields.io/github/stars/pjy0509/native-fn?style=flat&logo=github&logoColor=181717&label=Stars&color=181717&link=https%3A%2F%2Fgithub.com%2Fpjy0509%2Fnative-fn)</a>");
    lines.push("<a href=\"https://github.com/pjy0509/native-fn\">![Static Badge](https://img.shields.io/badge/Typescript-8A2BE2?logo=typescript&color=000000)</a>");
    lines.push("<br/>");
    lines.push("<a href=\"https://www.jsdelivr.com/package/npm/native-fn\" target=\"_blank\"><img alt=\"jsDelivr\" src=\"https://www.google.com/s2/favicons?sz=16&domain=www.jsdelivr.com/\"></a>");
    lines.push("<a href=\"https://www.npmjs.com/package/native-fn\" target=\"_blank\"><img alt=\"npm\" src=\"https://www.google.com/s2/favicons?sz=16&domain=www.npmjs.com/\"></a>");
    lines.push("<a href=\"https://github.com/pjy0509/native-fn\" target=\"_blank\"><img alt=\"repository\" src=\"https://www.google.com/s2/favicons?sz=16&domain=https://github.com/pjy0509/native-fn.git/\"></a>");
    // lines.push("<a href=\"https://pjy0509.github.io/example/native-fn/\" target=\"_blank\"><img alt=\"homepage\" src=\"https://www.google.com/s2/favicons?sz=16&domain=https://pjy0509.github.io/example/native-fn//\"></a>");

    lines.push("## Installation");
    lines.push("");
    lines.push("**npm**");
    lines.push("");
    lines.push("```shell");
    lines.push("npm i native-fn");
    lines.push("```");
    lines.push("");
    lines.push("**yarn**");
    lines.push("");
    lines.push("```shell");
    lines.push("yarn add native-fn");
    lines.push("```");
    lines.push("");
    lines.push("**unpkg**");
    lines.push("");
    lines.push("```html");
    lines.push("<script src=\"https://unpkg.com/native-fn\"></script>");
    lines.push("```");
    lines.push("");
    lines.push("**jsdelivr**");
    lines.push("");
    lines.push("```html");
    lines.push("<script src=\"https://cdn.jsdelivr.net/npm/native-fn\"></script>");
    lines.push("```");
    lines.push("");
    lines.push(renderTOC(docs));

    for (const [namespace, entries] of Object.entries(docs)) {
        lines.push(renderNamespace(namespace, entries));
    }

    return lines.join("\n");
}

export {DOCUMENTS, CHANGELOG};
