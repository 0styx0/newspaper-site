import localStorageMock from './localstorage.mock';


export function encodeJwt(payload: Object) {

    const jsonString = JSON.stringify(payload);
    const encodedBody = btoa(jsonString);
    return `.${encodedBody}.`;
}

// basically the opposite of components/jwt#getJWT
export default function setFakeJwt(payload: Object) {

    localStorageMock.setItem('jwt', encodeJwt(payload));
}
