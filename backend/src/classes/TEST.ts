
import * as jwt from 'jwt-simple';

const JWT = {
    SECRET: "test"
};

export default function changeJWT(fieldValues = {}) {

    const token = [
        {
            iss: "https://tabceots.com",
            iat: Date.now()
        },
        {
            email: fieldValues.email,
            level: fieldValues.level,
            id: fieldValues.id,
            automatedTest: !!fieldValues.automatedTest
        }
    ];

    const encodedJWT = jwt.encode(token, JWT.SECRET);

    return encodedJWT;
}
