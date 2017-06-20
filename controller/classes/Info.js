
const User = require("./User");
const db = require("./db");
let Issue = require("./Issue");

module.exports = class Info {


    /**
    * @param username - valid username
    *
    * @return all article info published by username
    */
    async getArticlesFrom(username) {

        const UserInstance = new User();

        const asyncDB = await db;

        if (!UserInstance.exists(username)) {
            return false;
        }


       const artQuery = await asyncDB.query(`SELECT url, created, CONCAT(tag1, IFNULL(CONCAT(', ', tag2), ''),
                           IFNULL(CONCAT(', ', tag3), '')) AS tags, views,
                           pageinfo.id AS art_id, issue
                           FROM pageinfo
                            LEFT JOIN issues
                            ON pageinfo.issue = issues.num
                            JOIN tags
                            ON tags.art_id = pageinfo.id
                            WHERE authorid = (SELECT id FROM users WHERE username = ?) AND (ispublic = ? OR ?)`,
                            [username, !UserInstance.isLoggedIn(), UserInstance.isLoggedIn()]);

        return artQuery[0];
    }


    /**
      * @param issue - valid issue number or tag name
      */
    async getLedesFromIssue(getFrom = "") {

        const isTag = isNaN(+getFrom);

        const asyncDB = await db;
        const UserInstance = new User();

        let pageinfo;

        if (!getFrom || !isTag || getFrom == "all") {


            const IssueInstance = new Issue();

            const maxIssue = (!!UserInstance.isLoggedIn()) ? Math.max(await IssueInstance.getMax(true), await IssueInstance.getMax()) : await IssueInstance.getMax(true);

            getFrom = (getFrom == "all") ? maxIssue : getFrom;

            const issueToGet = (!getFrom || (getFrom + 1) > maxIssue) ? maxIssue : getFrom;

            pageinfo = await asyncDB.query(`SELECT url, lede, views, issue
                                             FROM pageinfo
                                             WHERE issue = ?
                                             ORDER BY display_order DESC`, [issueToGet]);
        }

        else {

            pageinfo = await asyncDB.query(`SELECT url, lede, views, issue
                                               FROM pageinfo
                                               LEFT JOIN issues
                                               ON num = issue
                                               WHERE id
                                                   IN (SELECT art_id FROM tags WHERE ? IN (tag1, tag2, tag2))
                                               AND (ispublic = ? OR ?)
                                               ORDER BY issue`, [getFrom, !UserInstance.isLoggedIn(), UserInstance.isLoggedIn()]);
        }

        return pageinfo[0];
   }


    /**
      * @return table form with info about all users in the form array[0] = current user's level, rest of indices objects
      */
    async getUsersInfo() {

        const asyncDB = await db;
        const UserInstance = new User();
        const token = UserInstance.getJWT();

        let queryInfo;

        if (UserInstance.isLoggedIn()) {

            queryInfo = await asyncDB.query(`SELECT
                CONCAT(users.l_name, ', ', users.f_name, ' ', IFNULL(users.m_name, '')) AS name, level,
                COUNT(pageinfo.id) AS articles,
                IFNULL(SUM(pageinfo.views), 0) AS views, users.id,
                TRIM(
                    LEADING '.' FROM TRIM(
                        TRAILING '@tabc.org' FROM email
                        )
                    ) AS profile_link
                FROM users
                LEFT JOIN pageinfo
                ON users.id = pageinfo.authorid
                GROUP BY users.id
                ORDER BY users.l_name DESC`);
        }

        else {

            queryInfo = await asyncDB.query(`SELECT
                            CONCAT(users.l_name, ', ', users.f_name, ' ', IFNULL(users.m_name, '')) AS name,
                            COUNT(pageinfo.id) AS articles,
                            IFNULL(SUM(views), 0) AS views, users.id,
                            TRIM(
                                LEADING '.' FROM TRIM(
                                    TRAILING '@tabc.org' FROM email
                                    )
                                ) AS profile_link
                            FROM users
                            LEFT JOIN pageinfo
                            ON users.id = pageinfo.authorid AND pageinfo.issue IN (SELECT num FROM issues WHERE ispublic)
                            GROUP BY users.id
                            ORDER BY users.l_name DESC`);
        }


        return queryInfo[0];
    }


    /**
      * @return table for issue name, number, total views, and date made public (for /issue)
      * Admins can also see issue info that isn't public
    */
    async getIssues() {

        const UserInstance = new User();
        const asyncDB = await db;

        // the SUBSTRING_INDEX is to chop up everything but y-m-d
        const info = await asyncDB.query(`SELECT num, IFNULL(name, 'N/A') AS name, IFNULL(SUM(views), 0) AS views,
                                    SUBSTRING_INDEX(madepub, 'T', 1) AS madepub
                                    FROM issues
                                    LEFT JOIN pageinfo
                                    ON num = issue
                                    WHERE (ispublic = 1 OR ?)
                                    GROUP BY num
                                    ORDER BY num DESC`, [UserInstance.isLoggedIn()]);


        return info[0];
    }

}