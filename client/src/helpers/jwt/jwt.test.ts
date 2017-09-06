import { getJWT, setJWT } from './';
import localStorageMock from '../../tests/localstorage.mock';
import { encodeJwt } from '../../tests/jwt.helper';

const jwtBody = {level: 123, id: 'hi'};
const encodedBody = encodeJwt(jwtBody);

beforeEach(() => localStorageMock.clear());

describe('#getJWT', () => {

    it('gets jwt body from window.localStorage', () => {

        localStorageMock.setItem('jwt', encodedBody);

        expect(getJWT()).toEqual(jwtBody);
    });
});

describe('#setJWT', () => {

    it('puts jwt into localStorage', () => {

        setJWT(encodedBody);

        expect(localStorageMock.getItem('jwt')).toBe(encodedBody);
    });
});

describe('#setJWT with #getJWT', () => {

    it('can work together', () => {

        setJWT(encodedBody);

        expect(getJWT()).toEqual(jwtBody);
    });
});

