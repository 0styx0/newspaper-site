
const db = require("./db");
const Utilities = require("./Utilities");
const User = require("./User");
const Info = require("./Info");

module.exports = class Issue {

    constructor() {

        // all are private
        this._num = this._name = this._madePub = this._views = this._articles = this._isPublic = this._settingChanged;
    }

    /**
      * Sets private variables to info of user specified
      *
      * @param num - issue number
      *
      * @return false if issue by num doesn't exist, else returns issue name
      */
    async defineInfoFor(num = null) {

        if (!num || !/^\d+?$/.test(num)) {
            return false;
        }

        const asyncDB = await db;

        const allInfo = await asyncDB.query(`SELECT num, name, madepub, ispublic, SUM(pageinfo.views) AS views
                                        FROM issues
                                        LEFT JOIN pageinfo
                                        ON pageinfo.issue = issues.num
                                        WHERE issues.num = ?
                                         OR
                                        pageinfo.id IN (
                                            SELECT art_id FROM tags WHERE ? IN (tag1, tag2, tag3)
                                            )`,
                                        [num, num]);

        if (!allInfo) {
            return false;
        }

        const dbVals = allInfo[0][0];

        const articleQuery =
           await asyncDB.query("SELECT id FROM pageinfo WHERE issue = ?", [dbVals.num]);

        const articleIds = articleQuery[0];



        this._num = dbVals.num;
        this._name = dbVals.name;
        this._madePub = dbVals.madepub;
        this._isPublic = dbVals.ispublic;
        this._views = dbVals.views;
        this._articles = articleIds;

        return dbVals.name;
    }
/*
    route(method, data) {

        UserInstance = new User();

        if (method == "PUT") {

            token = UserInstance.getJWT();
            UserInstance.defineInfoFor(token.id, true);

            if((!UserInstance.checkPassword(data["password"]) || token.level < 3)) {

                Utilities::setHeader(401);
                return false;
            }
        }


        switch(method) {

            case "GET":
                InfoInstance = new Info();
                return InfoInstance.getIssues();

            case "PUT":
                this.defineInfoFor(data["issue"]);

                if (array_key_exists("issueName", data)) {
                    this.setName(data["issueName"]);
                }

                if (array_key_exists("pub", data)) {
                    this.setPublic(data["pub"]);
                }

                Utilities::setHeader(200, "issue updated");
        }
    }
*/

    async getPreviews(data) {

        const UserInstance = new User();
        const InfoInstance = new Info();

        const maxIssue = (UserInstance.isLoggedIn()) ? Math.max(await this.getMax(true), await this.getMax()) : await this.getMax(true);

        const issueNum = (data.issueNum) ? maxIssue : data.issueNum;

        // if there's no issue
        if (!issueNum) {
            Utilities.setHeader(404, "issue");
            return;
        }

        this.defineInfoFor(issueNum);

        const toReturn = {
            articles: await this.getLedesFromIssue(issueNum),
            slides: await this.getSlideInfo(issueNum),
            maxIssue: maxIssue,
            name: this.getName()
        };

        return toReturn;
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


            const maxIssue = (!!UserInstance.isLoggedIn()) ? Math.max(await this.getMax(true), await this.getMax()) : await this.getMax(true);

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

        pageinfo[0].map((obj) => obj.lede = obj.lede.toString());

        return pageinfo[0];
   }


    /**
      * Saves settings to db if any have been changed in current instantiation of this class
      */
    async destruct() {

        if (!this._settingChanged) {
            return false;
        }

        const asyncDB = await db;
        asyncDB.query(`UPDATE issues SET ispublic = ?, name = ?, madepub = ?
                            WHERE num = ?`, [this._isPublic, this._name, this._madePub, this._num]);
    }

    /**
      * @param issueNum - either number of issue, or a tag
      *
      * @return associative array containing img urls, issue, and article url of articles that have picture in them
      *  and that are in the issue/have the tag
      */
    async getSlideInfo(issueNum = "") {

        issueNum = Utilities.filter(issueNum);

        const asyncDB = await db;
        const UserInstance = new User();
        const token = UserInstance.getJWT();

        const maxIssue = await this.getMax(true);

        const tagQuery = await asyncDB.query("SELECT id FROM tags WHERE ? IN (tag1, tag2, tag3)", [issueNum]);

        const tagExists = await tagQuery[0][0];

        let slides;

        if (!issueNum || (!tagExists && /^(\d+)|all$/.test(issueNum))) {

            if (issueNum > maxIssue || issueNum === "") {

                issueNum = maxIssue;

                if (token.level) {

                    issueNum = Math.max(maxIssue, await this.getMax());
                }
            }

            const slidePrep = await asyncDB.query("SELECT img_url, url, issue, slide_img FROM pageinfo WHERE issue = ?", [issueNum]);

            slides = await slidePrep[0];

        }
        else if (tagExists) {

            const slidePrep = await asyncDB.query("SELECT img_url, url, issue, slide_img FROM pageinfo WHERE id IN (SELECT art_id FROM tags WHERE ? IN (tag1, tag2, tag3)) AND ((SELECT ispublic FROM issues WHERE num = issue) OR ?) ORDER BY issue", [issueNum, UserInstance.isLoggedIn()]);
            slides = await slidePrep[0];
        }

        (await slides).map(elt => elt.img_url = elt.img_url.toString());

        return (slides) ? await slides : [];
    }

    /**
      * Creates new issue. Relies on ISSUE.NUM being autoincremented
      */
    async create() {

        const asyncDB = await db;

        asyncDB.query("INSERT INTO issues (name) VALUES(NULL)");
    }

    /**
      * @param isPublic - boolean
      *
      * @return max issue that is public if isPublic is true, else returns max issue that is private
      */
    async getMax(isPublic = false) {

        const asyncDB = await db;

        let max;

        if (isPublic) {
            max = await asyncDB.query("SELECT MAX(num) AS max FROM issues WHERE ispublic = ?", [1]);
        }
        else {
            max = await asyncDB.query("SELECT MAX(num) AS max FROM issues WHERE ispublic = ?", [0]);
        }

        return max[0][0].max;
    }

    /**
      * Changes issue name
      *
      * @param name - string
      *
      * @return false if name is invalid acc to this._validateName, else return true
      */
    setName(name) {

        const filtName = this._validateName(name);

        if (!filtName) {
            return false;
        }

        this._name = filtName;
        this._settingChanged = true;

        return true;
    }

    /**
      * Getter for name
      */
    getName() {
        return this._name;
    }

    /**
      * Checks if name is valid
      *
      * @param name - string
      *
      * @return false if name > 20 chars or article is already public, else returns filtered name
      */
    _validateName(name) {

        if (name.length > 20 || this._isPublic) {

            Utilities.setHeader(400, "issue name");
            return false;
        }

        return Utilities.filter(name);
    }

    /**
      * Makes issue public and sets current date as time issue was made public
      *
      * @return true
      */
    setPublic(status = true) {

        if (!status || this._name.length == 0) {

            Utilities.setHeader(400, "status");
            return false;
        }

        this._isPublic = true;

        // credit to https://stackoverflow.com/a/28431880
        this._madePub = today.toISOString().substring(0, 10);
        return true;
    }

    /**
      * Getter for isPublic
      */
   getPublic() {
        return this._isPublic;
    }

    /**
      * Getter for date article was made public
      */
   getMadePub() {
        return this._madePub;
    }

    /**
      * Gets number articles in issue
      */
    getArticles() {
        return this._articles;
    }

    /**
      * Gets number of views the issue has
      */
    getViews() {
        return this._views;
    }
}
