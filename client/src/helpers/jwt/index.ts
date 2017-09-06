
interface Jwt {
    id: string;
    level: number;
    profileLink: string;
}

let jwt: Jwt = {
    id: '',
    level: 0,
    profileLink: ''
};

function getJWT(): Jwt {

    const encodedToken = window.localStorage.getItem('jwt');

    if (encodedToken) {

        const encodedBody = encodedToken.split('.')[1];
        const jsonString = atob(encodedBody);
        return JSON.parse(jsonString);

    } else {
        return jwt;
    }
}

function setJWT(newJwt: string) {

    window.localStorage.setItem('jwt', newJwt);
    return newJwt;
}

export {getJWT, setJWT, Jwt};