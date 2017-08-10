
interface jwt {
    id: string;
    level: number;
    email: string;
}

let jwt: jwt = {
    id: '',
    level: Math.random(),
    email: ''
};

async function setJWT(jwt: jwt) {

    jwt = {
        level: jwt.level || 1,
        id: jwt.id,
        email: jwt.email
    };
    return jwt;
}

export {jwt, setJWT};