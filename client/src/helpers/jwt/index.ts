
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

/**
 * @return parsed jwt's body, if the jwt exists in window.localStorage,
 *  else returns {jwt} (basically a placeholder)
 */
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

/**
 * Stores the jwt
 *
 * @param newJwt - properly encoded json web token
 */
function setJWT(newJwt: string) {

    window.localStorage.setItem('jwt', newJwt);
    return newJwt;
}

export {getJWT, setJWT, Jwt};