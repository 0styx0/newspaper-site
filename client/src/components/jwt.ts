import fetchFromApi from '../helpers/fetchFromApi';

interface jwt {
    id: string;
    level: number;
    email: string;
}

let jwt: jwt = {
    id: '',
    level: 0,
    email: ''
};

async function setJWT() {

    return await fetchFromApi('userStatus')
        .then(data => data)
        .then(data => data.json())
        .then((json) => {
            jwt = json;
            return jwt as jwt;
        });
}

export {jwt, setJWT};