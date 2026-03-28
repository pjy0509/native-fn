import React from "react";
import Scrollbar from "smooth-scrollbar";
import type {Scrollbar as ScrollbarInstance} from "smooth-scrollbar/scrollbar";
import styled, {createGlobalStyle} from "styled-components";
import GlobalStyle from "./styled/GlobalStyle";
import FieldLabel from "./components/form/FieldLabel";
import Card from "./components/Card";
import Code from "./components/form/Code";
import ThemeToggleBtn from "./components/form/ThemeToggleButton";
import Typography from "./components/form/Typography";
import Mermaid from "./components/Mermaid";
import Spacing from "./components/form/Spacing";
import DOCUMENTS from "./constants/documents";
import Divider from "./components/Driver";
import Grid from "./components/Grid";
import Row from "./components/Row";

const PACKAGE_NAME = 'native-fn' as const;

const NavOverflowLock = createGlobalStyle<{ active: boolean }>`
    html {
        @media (max-width: 720px) {
            overflow: ${({active}) => (active ? "hidden" : "auto")};
        }
    }
`;

const Layout = styled.div`
    display: flex;
    min-height: 100vh;
`;

const Sidebar = styled.nav<{ open: boolean }>`
    width: 280px;
    background: ${({theme}) => theme.colors.surface};
    border-right: 1px solid ${({theme}) => theme.colors.border};
    position: fixed;
    height: 100vh;
    display: flex;
    flex-direction: column;
    z-index: 100;
    transform: ${({open}) => (open ? "translateX(0)" : "translateX(-100%)")};
    transition: transform 0.3s ease;
    line-height: 1.375;

    @media (max-width: 720px) {
        width: 100%;
    }
`;

const SidebarHeader = styled.div`
    padding: 2rem 1.5rem 1.5rem;
    border-bottom: 1px solid ${({theme}) => theme.colors.border};
    position: relative;
    flex-shrink: 0;
`;

const NavigationScrollArea = styled.div`
    flex: 1;
    overflow: hidden;
    padding: 0.375rem 0;
`;

const SidebarLogo = styled.div`
    font-size: 1.375rem;
    font-weight: 700;
    color: ${({theme}) => theme.colors.accent};
    margin-bottom: 0.25rem;
    letter-spacing: -0.03em;
`;

const SidebarVersion = styled.div`
    font-size: 0.75rem;
    color: ${({theme}) => theme.colors.textMuted};
`;

const NavigationOpenButton = styled.button<{ open: boolean }>`
    position: fixed;
    top: 50%;
    left: 0;
    width: 28px;
    height: 28px;
    border-radius: 0 6px 6px 0;
    background: ${({theme}) => theme.colors.surfaceHover};
    color: ${({theme}) => theme.colors.accent};
    border: 1px solid ${({theme}) => theme.colors.border};
    border-left: 0;
    cursor: pointer;
    display: ${({open}) => (open ? "none" : "flex")};
    align-items: center;
    justify-content: center;
    font-size: 14px;
    z-index: 101;
    transform: translateY(-50%);
    transition: background 0.2s, border-color 0.2s;

    &:hover {
        border-color: ${({theme}) => theme.colors.borderActive};
    }
`;

const NavigationCloseButton = styled.button`
    position: absolute;
    z-index: 9999;
    top: 50%;
    right: 0;
    width: 28px;
    height: 28px;
    border-radius: 6px 0 0 6px;
    background: ${({theme}) => theme.colors.surfaceHover};
    color: ${({theme}) => theme.colors.accent};
    border: 1px solid ${({theme}) => theme.colors.border};
    border-right: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    transform: translateY(-50%);
    transition: background 0.2s, border-color 0.2s;

    &:hover {
        border-color: ${({theme}) => theme.colors.borderActive};
    }
`;

const NavigationSection = styled.div`
    padding: 0.375rem 0;
`;

const NavigationList = styled.ul`
    list-style: none;
`;

const NavigationItem = styled.li``;

const NavigationLink = styled.a<{ active: boolean }>`
    display: block;
    padding: 0.25rem 1.5rem;
    font-size: 0.825rem;
    font-weight: ${({active}) => (active ? 600 : 400)};
    color: ${({active, theme}) => active ? theme.colors.accent : theme.colors.textMuted};
    background: ${({active, theme}) => active ? theme.colors.accentGlow : "transparent"};
    border-left: 3px solid ${({active, theme}) => active ? theme.colors.accent : "transparent"};
    text-decoration: none;
    margin-top: 0.375rem;
    cursor: pointer;
    transition: color 0.15s, background 0.15s, border-color 0.15s;

    &:hover {
        color: ${({theme}) => theme.colors.text};
        background: ${({theme}) => theme.colors.surfaceHover};
    }
`;

const NavigationSublist = styled.ul`
    list-style: none;
    padding-left: 1rem;
`;

const NavigationSublink = styled.a<{ active: boolean }>`
    display: block;
    padding: 0.175rem 1.5rem;
    font-size: 0.75rem;
    color: ${({active, theme}) => active ? theme.colors.accent : theme.colors.textMuted};
    text-decoration: none;
    cursor: pointer;
    transition: color 0.15s;

    &:hover {
        color: ${({theme}) => theme.colors.text};
    }
`;

const MainContent = styled.main<{ open: boolean }>`
    flex: 1;
    height: 100vh;
    margin-left: ${({open}) => (open ? "280px" : "0")};
    min-width: 0;
    overflow: hidden;
    transition: margin-left 0.3s ease;

    @media (max-width: 720px) {
        margin-left: 0;
    }
`;

const Container = styled.div`
    max-width: 860px;
    margin: 0 auto;
    padding: 3rem;

    @media (max-width: 720px) {
        padding: 2rem 1.5rem;
    }

    @media (max-width: 500px) {
        padding: 1rem;
    }
`;

function useSmoothScrollbar(elementRef: React.RefObject<HTMLElement | null>, options?: Parameters<typeof Scrollbar.init>[1]) {
    const scrollbarRef = React.useRef<ScrollbarInstance | null>(null);

    React.useEffect(() => {
        if (!elementRef.current) return;

        scrollbarRef.current = Scrollbar.init(elementRef.current, {
            damping: 0.08,
            thumbMinSize: 20,
            renderByPixels: true,
            alwaysShowTracks: false,
            continuousScrolling: true,
            ...options,
        });

        return () => {
            scrollbarRef.current?.destroy();
            scrollbarRef.current = null;
        };
    }, [elementRef]);

    return scrollbarRef;
}

function useActiveSection(ids: string[], scrollbarRef: React.MutableRefObject<ScrollbarInstance | null>) {
    const [activeId, setActiveId] = React.useState<string>("");
    const idsKey = ids.join(",");

    React.useEffect(() => {
        if (ids.length === 0) return;

        const THRESHOLD = window.innerHeight * 0.25;

        function update() {
            let next = "";

            for (const id of ids) {
                const element = document.getElementById(id);

                if (!element) continue;
                if (element.getBoundingClientRect().top <= THRESHOLD) next = id;
            }

            setActiveId(next);
        }

        const scrollbar = scrollbarRef.current;

        if (scrollbar) {
            scrollbar.addListener(update);
            update();

            return () => scrollbar.removeListener(update);
        }

        window.addEventListener("scroll", update, {passive: true});
        update();

        return () => window.removeEventListener("scroll", update);
    }, [idsKey, scrollbarRef.current]);

    return activeId;
}

function scrollToId(id: string, scrollbar: ScrollbarInstance | null, onScrolled?: () => void): void {
    const element = document.getElementById(id);

    if (!element) return;

    if (scrollbar) {
        scrollbar.scrollIntoView(element, {
            offsetTop: window.innerHeight * 0.05,
            onlyScrollIfNeeded: false,
        });
    } else {
        element.scrollIntoView({behavior: "smooth", block: "start"});
    }

    onScrolled?.();
}

export default function App() {
    const isDesktop = typeof window !== "undefined" && window.innerWidth > 720;
    const [navigationOpen, setNavigationOpen] = React.useState(isDesktop);
    const [homepage, setHomepage] = React.useState<string | undefined>(undefined);
    const [repository, setRepository] = React.useState<string | undefined>(undefined);
    const [version, setVersion] = React.useState<string | undefined>(undefined);

    const navScrollRef = React.useRef<HTMLDivElement>(null);
    const mainScrollRef = React.useRef<HTMLElement>(null);

    const navigationScrollbarRef = useSmoothScrollbar(navScrollRef);
    const mainScrollbarRef = useSmoothScrollbar(mainScrollRef, {damping: 0.1});

    React.useEffect(() => {
        function handleResize() {
            if (window.innerWidth > 720) setNavigationOpen(true);
        }

        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    React.useEffect(() => {
        fetch("https://registry.npmjs.org/native-fn")
            .then(response => response.json())
            .then(response => {
                const repository: string | undefined = response.repository?.url;
                const version: string | undefined = response['dist-tags']?.latest;

                if (repository) setRepository((repository.match(/https:\/\/.*$/g) ?? [])[0]);
                if (version) setVersion(version);

                setHomepage(response.homepage);
            })
    }, []);

    const sectionIds = React.useMemo(() => Object.keys(DOCUMENTS), []);
    const subsectionIds = React.useMemo(
        () =>
            Object.entries(DOCUMENTS)
                .flatMap(([entryPoint, methods]) =>
                    Object.keys(methods)
                        .map(method => `${entryPoint}-${method}`)
                ),
        []
    );

    const activeSection = useActiveSection(sectionIds, mainScrollbarRef);
    const activeSubsection = useActiveSection(subsectionIds, mainScrollbarRef);
    const closeNavOnMobile = React.useCallback(() => {
        if (window.innerWidth <= 720) setNavigationOpen(false);
    }, []);

    return (
        <>
            <GlobalStyle/>
            <NavOverflowLock active={navigationOpen}/>
            <ThemeToggleBtn size={38}/>

            <Layout>
                <NavigationOpenButton open={navigationOpen} onClick={() => setNavigationOpen(true)} aria-label="Open navigation">☰</NavigationOpenButton>

                <Sidebar open={navigationOpen}>
                    <NavigationCloseButton onClick={() => setNavigationOpen(false)} aria-label="Close navigation">‹</NavigationCloseButton>

                    <SidebarHeader>
                        <SidebarLogo>{PACKAGE_NAME}</SidebarLogo>
                        <Typography.Label skeletonWidth="20%" loading={!version}>{version}</Typography.Label>
                        <SidebarVersion>API Reference</SidebarVersion>
                    </SidebarHeader>

                    <NavigationScrollArea ref={navScrollRef}>
                        {Object.entries(DOCUMENTS).map(
                            ([entryPoint, methods]) => (
                                <NavigationSection key={entryPoint}>
                                    <NavigationList>
                                        <NavigationItem>
                                            <NavigationLink
                                                active={activeSection === entryPoint}
                                                onClick={() =>
                                                    scrollToId(
                                                        entryPoint,
                                                        mainScrollbarRef.current,
                                                        closeNavOnMobile
                                                    )
                                                }
                                            >
                                                Native.{entryPoint}
                                            </NavigationLink>

                                            <NavigationSublist>
                                                {Object.keys(methods).map(
                                                    method => {
                                                        const id = `${entryPoint}-${method}`;
                                                        return (
                                                            <li key={id}>
                                                                <NavigationSublink
                                                                    active={activeSubsection === id}
                                                                    onClick={() =>
                                                                        scrollToId(
                                                                            id,
                                                                            mainScrollbarRef.current,
                                                                            closeNavOnMobile
                                                                        )
                                                                    }
                                                                >
                                                                    .{method}
                                                                </NavigationSublink>
                                                            </li>
                                                        );
                                                    }
                                                )}
                                            </NavigationSublist>
                                        </NavigationItem>
                                    </NavigationList>
                                </NavigationSection>
                            )
                        )}
                    </NavigationScrollArea>
                </Sidebar>

                <MainContent open={navigationOpen} ref={mainScrollRef}>
                    <Container>
                        <Typography.H2>{PACKAGE_NAME}</Typography.H2>

                        <div>
                            <Row gap="0.25rem">
                                <a href={"https://www.jsdelivr.com/package/npm/" + PACKAGE_NAME} target="_blank">
                                    <img src="http://www.google.com/s2/favicons?domain=www.jsdelivr.com/" alt="jsDelivr"/>
                                </a>

                                <a href={"https://www.npmjs.com/package/" + PACKAGE_NAME} target="_blank">
                                    <img src="http://www.google.com/s2/favicons?domain=www.npmjs.com/" alt="npm"/>
                                </a>

                                {
                                    repository
                                    && <a href={repository} target="_blank">
										<img src={"http://www.google.com/s2/favicons?domain=" + repository + "/"} alt="repository"/>
									</a>
                                }

                                {
                                    homepage
                                    && <a href={homepage} target="_blank">
										<img src={"http://www.google.com/s2/favicons?domain=" + homepage + "/"} alt="homepage"/>
									</a>
                                }
                            </Row>
                        </div>

                        {/*<Typography.Body2>*/}
                        {/*    <img src="https://img.shields.io/npm/dm/native-fn?color=red&logo=npm&label=NPM%20DOWNLOADS&style=for-the-badge" alt=""/>*/}
                        {/*    <img src="https://img.shields.io/github/stars/faisalman/native-fn?color=yellow&logo=github&style=for-the-badge" alt=""/>*/}
                        {/*</Typography.Body2>*/}

                        <Spacing height="4rem"/>

                        {
                            Object.entries(DOCUMENTS)
                                .map(
                                    ([entryPoint, methods]) => <div key={entryPoint} id={entryPoint}>
                                        {
                                            Object.entries(methods).map(
                                                ([method, document]) => {
                                                    const id = `${entryPoint}-${method}`;

                                                    return <div key={id} id={id}>
                                                        <Card title={`Native.${entryPoint}.${method}`} subtitle={document.returns.type}>
                                                            <FieldLabel>Signature</FieldLabel>
                                                            <Code language="typescript" code={document.signature}/>

                                                            <Divider marginY="1.5rem"/>
                                                            <FieldLabel>Description</FieldLabel>
                                                            <Typography.Body2>{document.description}</Typography.Body2>

                                                            {
                                                                "flowchart" in document
                                                                && <>
																	<Divider marginY="1.5rem"/>
																	<FieldLabel>Flowchart</FieldLabel>
																	<div style={{height: 400}}>
																		<Mermaid chart={document.flowchart!}/>
																	</div>
																</>
                                                            }

                                                            <Divider marginY="1.5rem"/>
                                                            <FieldLabel>Example</FieldLabel>
                                                            <Code language="typescript" code={document.example} lineNumber showLanguage/>

                                                            <Divider marginY="1.5rem"/>
                                                            <FieldLabel>Returns</FieldLabel>
                                                            <Code language="typescript" code={document.returns.type}/>

                                                            {
                                                                document.returns.description
                                                                && <>
																	<Spacing height="0.75rem"/>
																	<Code
																		language="typescript"
																		code={document.returns.description}
																	/>
																</>
                                                            }

                                                            {
                                                                document.throws.length > 0
                                                                && <>
																	<Divider marginY="1.5rem"/>
																	<FieldLabel>Throws</FieldLabel>
                                                                    {
                                                                        document.throws.map((error, i) => <>
                                                                            {
                                                                                i > 0 && <Spacing height="0.75rem"/>
                                                                            }
                                                                            <Code
                                                                                key={`${error}-${i}`}
                                                                                language="typescript"
                                                                                code={error}
                                                                            />
                                                                        </>)
                                                                    }
																</>
                                                            }

                                                            {
                                                                "tryItOut" in document
                                                                && <>
																	<Divider marginY="1.5rem"/>
																	<FieldLabel>Try It Out</FieldLabel>
                                                                    {document.tryItOut!()}
																</>
                                                            }
                                                        </Card>

                                                        <Spacing height="3rem"/>
                                                    </div>;
                                                }
                                            )
                                        }
                                    </div>
                                )
                        }
                    </Container>
                </MainContent>
            </Layout>
        </>
    );
}
