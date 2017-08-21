
interface Jwt {
    id: string;
    level: number;
    email: string;
}

let jwt: Jwt = {
    id: '',
    level: 0,
    email: ''
};

function getJWT(): Jwt {

    return JSON.parse(
        window.localStorage.getItem('jwt') ||
        JSON.stringify([, jwt]))[1];
}

async function setJWT(newJwt: Jwt) {

    window.localStorage.setItem('jwt', JSON.stringify(newJwt));
    return newJwt;
}

export {getJWT, setJWT, Jwt};