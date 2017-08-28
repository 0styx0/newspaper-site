
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

    const encodedToken = window.localStorage.getItem('jwt');

    if (encodedToken) {

        const encodedBody = encodedToken.split('.')[1];
        const jsonString = atob(encodedBody);
        return JSON.parse(jsonString);

    } else {
        return jwt;
    }
}

async function setJWT(newJwt: string) {

    window.localStorage.setItem('jwt', newJwt);
    return newJwt;
}

export {getJWT, setJWT, Jwt};