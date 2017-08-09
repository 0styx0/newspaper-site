
interface jwt {
    id: string;
    level: number;
    email: string;
}

let jwt: jwt = {
    id: '',
    level: 1,
    email: ''
};

async function setJWT() {

    jwt = {
        level: 1,
        id: '',
        email: ''
    };
    return jwt;
}

export {jwt, setJWT};