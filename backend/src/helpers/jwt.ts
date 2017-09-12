import * as jsonwebtoken from 'jsonwebtoken';

export interface jwt {
    id: string;
    level: number;
    profileLink: string;
}

export function getJWT(req) {

    const token = (req.get('authorization') || '').split('Bearer ')[1];

    return token ? jsonwebtoken.verify(token, process.env.JWT_SECRET) as jwt : {} as jwt;
};

/**
 * Object that must include {jwt} interface
 * Making it not be exactly the interface so can just pass an entire db row
 */
export function setJWT(user: jwt) {

    const payload = {
        id: user.id,
    } as jwt;

    // if email is verified
    if (user.profileLink[0] !== '.') {

        payload.profileLink = user.profileLink;
        payload.level = user.level;
    }

    return jsonwebtoken.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '1h',
            subject: user.id.toString()
    });
}