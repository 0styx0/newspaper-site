import localStorageMock from './localstorage.mock';

/*

    const encodedToken = window.localStorage.getItem('jwt');

    if (encodedToken) {

        const encodedBody = encodedToken.split('.')[1];
        const jsonString = atob(encodedBody);
        return JSON.parse(jsonString);


*/

// basically the opposite of components/jwt#getJWT
export default function setFakeJwt(payload: Object) {

    const jsonString = JSON.stringify(payload);
    const encodedBody = btoa(jsonString);
    const encodedToken = `.${encodedBody}.`;

    localStorageMock.setItem('jwt', encodedToken);
}
