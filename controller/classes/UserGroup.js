
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
        const token = UserInstance.getJWT();


        if (!UserInstance.isLoggedIn()) {

            Utilities.setHeader(401);
            return false;
        }


        let inClause = '(' + (new Array(idsToDelete.length)).fill('?').join(",") + ')';

        const highestLvlQuery = asyncDB.query(`SELECT MAX(level) AS max FROM users WHERE id IN ${inClause}`, idsToDelete);
        let highestLvl;

        await Promise.all([
            UserInstance.defineInfoFor(token.id, true),
            highestLvlQuery.then(result => highestLvl = result[0][0].max)
            ]);

        if (!await UserInstance.checkPassword(password) || highestLvl >= token.level) {

            Utilities.setHeader(401);
            return false;
        }

        const delParams = idsToDelete;

        delParams.unshift("Deleted");

        await asyncDB.query(`UPDATE pageinfo SET authorid = (SELECT id FROM users WHERE username = ?) WHERE authorid IN ${inClause}`, delParams);

        await asyncDB.query(`UPDATE comments SET authorid = (SELECT id FROM users WHERE username = ?) WHERE authorid IN ${inClause}`, delParams);

        idsToDelete.shift();

        await asyncDB.query(`DELETE FROM users WHERE id IN ${inClause}`, idsToDelete);

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
        if (usernamesToPromote.length == 0 || !toLevel) {
            return true;
        }


        const inClause = '(' + (new Array(usernamesToPromote.length)).fill('?').join(',') + ')';

        const maxPreviousLvlQuery = asyncDB.query(`SELECT MAX(level) AS max
                                                       FROM users WHERE TRIM(TRAILING '@tabc.org' FROM email) IN ${inClause}`,
                                                       usernamesToPromote);
        let maxPreviousLvl;

        await Promise.all([
                UserInstance.defineInfoFor(token.id, true),
                maxPreviousLvlQuery.then(result => maxPreviousLvl = result[0][0].max)
            ]);


        if (!await UserInstance.checkPassword(password) || token.level < 2 || +toLevel > token.level || +maxPreviousLvl >= token.level) {

            Utilities.setHeader(401);
            return false;
        }

        const promoteParams = usernamesToPromote;

        promoteParams.unshift(toLevel);

        asyncDB.query(`UPDATE users SET level = ? WHERE TRIM(TRAILING '@tabc.org' FROM email) IN ${inClause}`, promoteParams);

        Utilities.setHeader(200, "user(s) updated");
        return true;
    }

}