import config from '../../config';
import * as validator from 'validator';

export default {

    /**
     * @param level - level to check
     * @param userLevel - if an already logged in user is creating an account, should be `jwt.level`
     *
     * @throws {RangeError} when level is not 1-3 or
     *  when user creating the account has a level greater than the user trying to create
     *
     * @return level (unmodified)
     */
    level(level: number, userLevel?: number) {

        if (userLevel && userLevel < level) {
            throw new RangeError('Cannot have a level greater than the one signing you up');
        }

        if (level > 3 || level < 1) {
            throw new RangeError('Level must be between 1 and 3 (inclusive)');
        }

        return level ? level : 1;
    },

    /**
     * @param password - of user
     *
     * @throws {RangeError} if password length is less than 6
     *
     * @return password
     */
    password(password: string) {

        if (password.length < 6) {
            throw new RangeError('Password must be at least 6 characters');
        }

        return password;
    },

    /**
     * @param email - of user
     *
     * @throws {RangeError} if invalid email format or email host is not as specified in config.EMAIL_HOST
     *
     * @return email (unmodified)
     */
    email(email: string) {
        
        if (validator.isEmail(email) &&
            (config.EMAIL_HOST === '*' || email.split('@')[1] === config.EMAIL_HOST)) {

            return email;
        }

        throw new RangeError('Invalid email');
    }
}