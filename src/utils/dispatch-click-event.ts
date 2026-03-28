export default function dispatchClickEvent(element: HTMLElement, view: WindowProxy = window): void {
    let fake: MouseEvent;

    try {
        fake = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: view
        });
    } catch (_: unknown) {
        // ES5 or Browsers in the ES5~ES6 transition period
        fake = globalThis.document.createEvent('MouseEvents');

        fake.initMouseEvent('click', true, true, view, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    }

    element.dispatchEvent(fake);
}
