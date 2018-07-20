export default function setupDocument() {

    Object.defineProperty(document, 'queryCommandSupported', { value: () => true });
}
