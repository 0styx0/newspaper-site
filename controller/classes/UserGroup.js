
const User = require('./User');
const db = require('./db');
const Utilities = require('./Utilities');

module.exports = class UserGroup {


   /*
    route(method, data) {

        switch (method) {

            case "DELETE":
                return this.delete(data["delAcc[]"], data["password"]);

            case "PUT":
                const Utilities = new Utilities();

                const sorted = Utilities.splitArrayByUniq(data["lvl[]"], data["name[]"]);

                const i = 0;

                while (i < count(sorted)) {

                    if (!this.promote(sorted[i][0], sorted[i][1], data["pass"])) {
                        exit("fail");
                    }

                    i++;
                }
                return true;

            case "GET":
                const Info = new Info();
                return Info.getUsersInfo();
        }
    }
    */

    /**
      * Deleted all users whose id is in idsToDelete
      *
      * @param idsToDelete - array of existing ids
      * @param password - password of user
      *
      * @return false if bad password, or user is less than lvl 2. Else return true
      */
    async delete(idsToDelete, password) {

        const UserInstance = new User();
        const asyncDB = await db;
        const Utilities = new Utilities();
        const token = UserInstance.getJWT();


        if (!UserInstance.isLoggedIn()) {

            Utilities.setHeader(401);
            return false;
        }

        UserInstance.defineInfoFor(token.id, true);

        let inClause = '(' + [].fill('?', 0, idsToDelete.length - 1).join(",") + ')';

        const highestLvl = await asyncDB.catchMistakes(`SELECT MAX(level) AS max FROM users WHERE id IN ${inClause}`, [idsToDelete])[0][0].max;

        if (!await UserInstance.checkPassword(password) || highestLvl >= token.level) {

            Utilities.setHeader(401);
            return false;
        }

        const delParams = idsToDelete;

        delParams.unshift("Deleted");

        await asyncDB.catchMistakes(`UPDATE pageinfo SET authorid = (SELECT id FROM users WHERE username = ?) WHERE authorid IN ${inClause}`, [delParams]);

        await asyncDB.catchMistakes(`UPDATE comments SET authorid = (SELECT id FROM users WHERE username = ?) WHERE authorid IN ${inClause}`, [delParams]);

        asyncDB.catchMistakes(`DELETE FROM users WHERE id IN ${inClause}`, [idsToDelete]);

        Utilities.setHeader(200, "user(s) updated");
        return true;
    }

    /**
      * Changes level of all whose users who's usernames are in usernamesToPromote to level specified by toLevel
      *
      * @param usernamesToPromote - valid usernames of existing users
      * @param toLevel - 1-3, users level will be changed to this
      * @param password - password of user
      *
      * @return false if bad password or user is lvl 1. Else true
      */
    async promote(usernamesToPromote, toLevel, password) {

        const asyncDB = await db;
        const UserInstance = new User();
        const token = UserInstance.getJWT();


        if (!UserInstance.isLoggedIn()) {
            Utilities.setHeader(401);
            return false;
        }

        UserInstance.defineInfoFor(token.id, true);

        const inClause = [].fill('?', 0, usernamesToPromote.length - 1).join(',');

        const maxPreviousLvl = await asyncDB.catchMistakes(`SELECT MAX(level) AS max
                                                       FROM users WHERE username IN ${inClause}`,
                                                       [usernamesToPromote])[0][0].max;

        if (!await UserInstance.checkPassword(password) || token.level < 2 || +toLevel > token.level || +maxPreviousLvl >= token.level) {

            Utilities.setHeader(401);
            return false;
        }

        const promoteParams = usernamesToPromote;
        array_unshift(promoteParams, toLevel);
        promoteParams.unshift(toLevel);


        asyncDB.catchMistakes(`UPDATE users SET level = ? WHERE TRIM(TRAILING '@tabc.org' FROM email) IN ${inClause}`,
                         [promoteParams]);

        Utilities.setHeader(200, "user(s) updated");
        return true;
    }

}