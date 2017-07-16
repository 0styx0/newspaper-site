import fetchFromApi from '../helpers/fetchFromApi';

let jwt = {};

async function setJWT() {

    return await fetchFromApi('userStatus')
        .then(data => data)
        .then(data => data.json())
        .then((json) => {
            jwt = json;
            return jwt;
        });
}

export {jwt, setJWT};