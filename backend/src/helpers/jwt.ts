import * as jsonwebtoken from 'jsonwebtoken';
import config from '../../config';

export interface jwt {
    id: string;
    level: number;
    profileLink: string;
}

export function getJWT(req) {

    const token = (req.get('authorization') || '').split('Bearer ')[1];

    return token ? jsonwebtoken.verify(token, config.JWT.SECRET) as jwt : {} as jwt;
};
