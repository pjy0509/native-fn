import {Appearances, CONTEXT, MEDIA_QUERY_LIST, SVG_PIXEL_DATA_URL} from "../constants";
import {AppearanceInstance} from "../types";
import Platform from "../../platform/cores";
import {Browsers} from "../../platform";
import EventListener from "../../../utils/event-listener";
import {SubscriptionManager} from "../../../types/subscription-manager";
import createSubscriptionManager from "../../../utils/create-subscription-manager";

const onChangeSubscriptionManager: SubscriptionManager<AppearanceInstance, Appearances> = createSubscriptionManager<AppearanceInstance, Appearances>(attachOnChange, detachOnChange);
let appearanceRef: Appearances | null = null;
let pollingIntervalId: number | null = null;

const Appearance: AppearanceInstance = {
    get value(): Appearances {
        return getAppearance();
    },
    onChange: onChangeSubscriptionManager.subscribe,
    Constants: {
        Appearances: Appearances
    },
    Errors: {}
};

function getAppearanceFromEngine(): Appearances {
    const img: HTMLImageElement = new Image();

    img.src = SVG_PIXEL_DATA_URL;

    if (CONTEXT === null) return Appearances.Light;

    CONTEXT.drawImage(img, 0, 0);

    const data: Uint8ClampedArray = CONTEXT.getImageData(0, 0, 1, 1).data;

    if ((data[0] & data[1] & data[2]) < 255) return Appearances.Dark;
    else return Appearances.Light;
}

function getAppearanceFromMediaQuery(): Appearances {
    if (MEDIA_QUERY_LIST.media === 'not all') return Appearances.Unknown;
    if (MEDIA_QUERY_LIST.matches) return Appearances.Dark;
    return Appearances.Light;
}

function getAppearance(): Appearances {
    if (Platform.browser.name === Browsers.SamsungInternet) return getAppearanceFromEngine();
    return getAppearanceFromMediaQuery();
}

function startPolling(): void {
    appearanceRef = getAppearanceFromEngine();

    pollingIntervalId = globalThis.setInterval(function (): void {
        const appearance: Appearances = getAppearanceFromEngine();

        if (appearance !== appearanceRef) {
            appearanceRef = appearance;

            onChangeSubscriptionManager.emit(appearance);
        }
    }, 2000);
}

function stopPolling(): void {
    appearanceRef = null;

    if (pollingIntervalId !== null) {
        clearInterval(pollingIntervalId);
        pollingIntervalId = null;
    }
}

function attachOnChange(): void {
    appearanceRef = getAppearanceFromMediaQuery();

    EventListener.add(MEDIA_QUERY_LIST, {type: 'change', callback: onMediaChange});

    if (Platform.browser.name === Browsers.SamsungInternet) startPolling();
}

function detachOnChange(): void {
    appearanceRef = null;

    EventListener.remove(MEDIA_QUERY_LIST, {type: 'change', callback: onMediaChange});

    if (Platform.browser.name === Browsers.SamsungInternet) stopPolling();
}

function onMediaChange(this: MediaQueryList, event: MediaQueryListEventMap['change']): void {
    let appearance: Appearances;

    if (event.matches) appearance = Appearances.Dark;
    else appearance = Appearances.Light;

    if (appearance !== appearanceRef) onChangeSubscriptionManager.emit(appearanceRef = appearance);
}

export default Appearance;
