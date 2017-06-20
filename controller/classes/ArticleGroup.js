const db = require('./db');
const User = require('./User');
const Utilities = require('./Utilities');
const Issue = require('./Issue');

module.exports = class ArticleGroup {


   /*
    route(method, data) {

        if ((!empty(data["tag[]"]) && count(data["artId[]"]) != count(data["tag[]"])) ||
            !empty(data["order[]"]) && count(data["tag[]"]) != count(data["order[]"])) {
            return false;
        }

        switch(method) {

            case "GET":
                const InfoInstance = new Info();
                issue = (is_numeric(data["articlesFor"])) ? data["articlesFor"] : null;

                return Info.getPageInfo(issue);

            case "DELETE":

                const result = this.delete(data["delArt[]"], data["password"]);

                if (result) {
                    Utilities.setHeader(200, "article(s) deleted");
                }

            case "PUT":

                for (const i = 0; i < count(data["artId[]"]); i++) {

                    this.setMultiTags(data["artId[]"][i], data["tag[]"][i], data["password"]);

                    if (!empty(data["order[]"])) {

                        this.setDisplay(data["artId[]"][i], data["order[]"][i]);
                    }
                }

                if (i == count("artId[]")) {
                    Utilities.setHeader(200, "article(s) updated");
                }
                return true;
        }
    }
   */

    /**
      * Deletes articles whose id is in array provided
      *
      * @param ids - array of article ids
      * @param password - password of user logged in
      *
      * @return false if user is either not lvl 3, not the author of the article provided, or incorrect password
      */
    async delete(ids = [], password) {

        const UtilitiesInstance = new Utilities();
        const asyncDB = await db;
        const UserInstance = new User();
        const token = UserInstance.getJWT();
        UserInstance.defineInfoFor(token.id, true);


        const inForArts = '(' + [].fill('?', 0, ids.length - 1).join(',') + ')';

        const uniqAuthors = await asyncDB.query(`SELECT DISTINCT authorid FROM pageinfo WHERE id IN ${inForArts}`,
                                                                                                        [ids])[0];


            // not logged in, less than lvl 3 and not deleting own article, or invalid password
        if (!UserInstance.isLoggedIn() || ([token.id] != uniqAuthors && token.level < 3) ||
            !await UserInstance.checkPassword(password)) {

                return false;
        }

        asyncDB.query(`DELETE FROM comments WHERE art_id IN ${inForArts}`, [ids])
        .then(() =>
        asyncDB.query(`DELETE FROM tags WHERE art_id IN ${inForArts}`, [ids]))
        .then(() =>
        asyncDB.query(`DELETE FROM pageinfo WHERE id IN ${inForArts}`, [ids]));

        return true;
    }

    /**
      * Sets tags of article specified by id
      *
      * @param artId - id of article
      * @param newTag - array of tags to give article
      * @param pass - password of currently logged in user
      *
      * @return false if user's less than lvl 3, not the author of article, or password is incorrect. Else true
      */
    async setMultiTags(artId, newTag, pass) {

        const UserInstance = new User();
        const asyncDB = await db;
        const token = UserInstance.getJWT();


        const authorId = (await asyncDB.query("SELECT authorid FROM pageinfo WHERE id = ?", [artId]))[0][0].authorid

        const size = newTag.length;

        await UserInstance.defineInfoFor(token.id, true);

        if (!UserInstance.isLoggedIn() ||
            !await UserInstance.checkPassword(pass) ||
            (UserInstance.getLevel() < 3 && UserInstance.getId() != authorId)
            || 3 - size < 0) {
            return false;
        }

        newTag.push(null, null); // so no undefined indexes

        asyncDB.query("UPDATE tags SET tag1 = ?, tag2 = ?, tag3 = ? WHERE art_id = ?", [newTag[0], newTag[1], newTag[2], artId]);

        Utilities.setHeader(200, "article(s) updated");

        return true;
    }

    /**
    * Sets the order articles display in on the main page. Higher the number, the higher on page it should be
    *
    * @param id - id of article to change
    * @param num - number the display_order should be set to
    */
    async setDisplay(id, num) {

        const asyncDB = await db;

        const fId = Utilities.filter(id);
        const fNum = (+num > -1 && !isNaN(+num)) ? num : 0;

        asyncDB.query("UPDATE pageinfo SET display_order = ? WHERE id = ?", [fNum, fId]);


        Utilities.setHeader(200, "article(s) updated");
        return true;
    }

    /**
    * @param issue - issue number
    *
    * @return info about articles for admins (/modifyArticles), array of associative arrays
    *  [0] is array of "URL", "CREATED", "AUTHOR_NAME", csv of "TAGS", "VIEWS", "DISPLAY_ORDER", "art_id", "author_username"
    *  [1] is all tags ever used for articles
    *  [2] - "NAME", "ISPUBLIC", "NUM", "MAX"
    */
    async getPageInfo(issue = null) {

        const IssueInstance = new Issue();
        const UserInstance = new User();
        const asyncDB = await db;
        const token = UserInstance.getJWT();

        if (!UserInstance.isLoggedIn() || token.level < 3) {
            Utilities.setHeader(401);
            return false;
        }

        const max = Math.max(await IssueInstance.getMax(true), await IssueInstance.getMax());

        const getFrom = (issue && /^\d+?/.test(issue) && issue < max) ? issue : max;

        const query = await asyncDB.query(`SELECT url, SUBSTRING_INDEX(created, 'T', 1) AS created, CONCAT(f_name, ' ', IFNULL(m_name, ''), ' ', l_name) AS author_name,
                             CONCAT(tag1, IFNULL(CONCAT(', ', tag2), ''), IFNULL(CONCAT(', ', tag3), '')) AS tags, views, display_order,
                             pageinfo.id AS art_id, username AS author_username
                             FROM pageinfo
                             LEFT JOIN users
                             ON users.id = authorid
                             LEFT JOIN tags
                             ON art_id = pageinfo.id
                             WHERE issue = ?`, [getFrom]);

        const tagQuery = await asyncDB.query("SELECT DISTINCT tag1, tag2, tag3 FROM tags");

        const issueInfo = (await asyncDB.query("SELECT name, ispublic, num FROM issues WHERE num = ?", [getFrom]))[0][0];


        if (!issueInfo) {
            return false;
        }

        issueInfo.max = max;

        const uniqTags = new Set();

        tagQuery[0].forEach(function(elt) {

            for (const key in elt) {

                uniqTags.add(elt[key]);
            }
        });

        uniqTags.delete(null);

        return [query[0], [...uniqTags]].concat(issueInfo);
    }


}