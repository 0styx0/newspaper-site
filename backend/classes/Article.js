const User = require('./User');
const db = require('./db');
const Utilities = require('./Utilities');
const Purifier = require('html-purify');
const fs = require('fs-extra')
const Issue = require('./Issue');
const SendMail = require('./SendMail');

module.exports = class Article {

    constructor() {

        this._url, this._issue, this._lede, this._pics, this._body,
         this._created, this._authorId, this._tags, this._views, this._id, this._isPublic, this._displayOrder, this._slideImg, this._settingsChanged;
    }

    /**
      * Saves settings to db if any have been changed in current instantiation of this class
      *
      * @return true if changes have been made and saved, else (if no changes have been made that must be saved) returns false
      */
    async destruct() {

        const UserInstance = new User();

        const token = UserInstance.getJWT();

        if (!this._settingsChanged || this._settingsChanged && (!UserInstance.isLoggedIn() || (token.id != this._authorId && token.level < 3))) {

            return false;
        }

        const asyncDB = await db;

        asyncDB.query(`UPDATE pageinfo SET created = ?, url = ?, lede = ?, img_url = ?, body = ?, issue = ?,
                        views = ?, display_order = ?, slide_img = ? WHERE id = ?`,
                           [this._created, this._url, this._lede, JSON.stringify(this._pics), this._body, this._issue,
                            this._views, this._displayOrder, JSON.stringify(this._slideImg), this._id]);

        this._tags.push(null, null); // in case of less than 3 tags

        asyncDB.query("UPDATE tags SET tag1 = ?, tag2 = ?, tag3 = ? WHERE art_id = ?",
                       [this._tags[0], this._tags[1], this._tags[2], this._id]);
        Utilities.setHeader(200, "edited");
        return true;
    }

    /**
      * Deletes current article from database
      */
    async destroy() {

        const asyncDB = await db;
        const UserInstance = new User();
        const token = UserInstance.getJWT();

        if (!UserInstance.isLoggedIn() || (token.level < 3 && token.id != this._authorId)) {
            Utilities.setHeader(401);
            return false;
        }

        fs.remove(__dirname+`/../../client/public/images/issue/${this._issue}/${this._id}`).catch(console.log)

        await asyncDB.query("DELETE FROM comments WHERE art_id = ?", [this._id]);
        await asyncDB.query("DELETE FROM tags WHERE art_id = ?", [this._id]);
        await asyncDB.query("DELETE FROM pageinfo WHERE id = ?", [this._id]);


        this._settingsChanged = false;

        Utilities.setHeader(200);
        return true;
    }

    /**
      * Creates new article: Separates first paragraph to be lede, replaces img urls with attr data-src
      *   and saves to database
      *
      * @param url - string, at most 75 chars
      * @param body - actual article. Must have at least 1 paragraph and a heading {@code<h1>}
      * @param tags - see this.validateTags
      */
    async create(url, body, tags) {

        const UserInstance = new User();
        const token = UserInstance.getJWT();

        let filteredBody = this._validatePiece(body);

        if (!UserInstance.isLoggedIn() || !filteredBody) {

            Utilities.setHeader(400, "article");
            return false;
        }

        this._authorId = token.id;

        const asyncDB = await db;

        const IssueInstance = new Issue();
        const maxPub = await IssueInstance.getMax(true);
        const maxPriv = await IssueInstance.getMax();

        if (maxPub > maxPriv || (!maxPub && !maxPriv)) {
            await IssueInstance.create();
        }

        this._issue = maxPub + 1;

        const tmpId = this._id = token.id + "-" + Math.random();

        // gets rid of random spaces, p tags, and style=""
        filteredBody = filteredBody.replace(/(&nbsp;\s)|(&nbsp;)|(<p><\/p>)|(style=\"\")/, "").trim();

        if (!await this._separatePics(filteredBody)) {

            Utilities.setHeader(400, "image");
            return;
        }
        if (!this.setTags(tags)) {

            Utilities.setHeader(400, "tag");
            return;
        }
        if (!this.setURL(url)) {

            Utilities.setHeader(400, "url");
            return;
        }

        const size = this._tags.length;

        if (!this._separateLede(this._body) || 3 - size < 0) {

            Utilities.setHeader(400, "article");
            return;
        }

        this._tags.push(null, null);

        await asyncDB.query(`INSERT INTO pageinfo (issue, created, url, lede, body, img_url,
                           authorid, slide_img) VALUES(?, CURDATE(), ?, ?, ?, ?, ?, ?)`,
                           [this._issue, this._url, this._lede, this._body, JSON.stringify(this._pics),
                           token.id, JSON.stringify(this._slideImg)]);

       await asyncDB.query(`INSERT INTO tags (art_id, tag1, tag2, tag3)
                      VALUES((SELECT id FROM pageinfo WHERE url = ? AND issue = ?), ?, ?, ?)`,
                      [this._url, this._issue, this._tags[0], this._tags[1], this._tags[2]]);

        const SendMailInstance = new SendMail();
        SendMailInstance.articlePublished(this.listTags(), this._issue, this._url);    // WHEN GET AROUND, make the tags into a nice list



        await asyncDB.query("SELECT MAX(id) AS id FROM pageinfo").then(response => {

            const id = response[0][0].id;

            const path = __dirname + `/../../client/public/images/issue/${this._issue}/${tmpId}`;

             return fs.pathExists(path).then(exists => {

                if (exists) {
                    return fs.move(path,  __dirname + `/../../client/public/images/issue/${this._issue}/${id}`).catch(console.log);
                }
                else {
                    Promise.resolve();
                }
            });
        });
        Utilities.setHeader(201, "article created", false);

        return {
            url: `/issue/${this._issue}/story/${this._url}`
        };
    }



    /**
      * Can edit current article
      *
      * @param body - article (string)
      */
    async edit(body) {

        const UserInstance = new User();
        const token = UserInstance.getJWT();

        let filteredBody = this._validatePiece(body);

        if (!this.canEdit()) {
            return Utilities.setHeader(401);
        }

        if (!filteredBody) {

            Utilities.setHeader(400, "article");
            return false;
        }

        this._authorId = token.id;


        // gets rid of random spaces, p tags, and style=""
        filteredBody = filteredBody.replace(/(<p><\/p>)|(style=\"\")/, "")
                                   .trim();

        if (!await this._separatePics(filteredBody) || !this._separateLede(this._body)) {

            Utilities.setHeader(400, "image");
            return false;
        }

        this._settingsChanged = true;
    }

    /**
      * Acts according to HTTP nouns GET, POST, PUT, DELETE for articles
      *
      * GET - get article
      * POST - create
      * PUT - edit
      * DELETE - delete
      *
    route(string method, array data) {

        const UserInstance = new User();
        const token = UserInstance.getJWT();

        if (method != "POST") {

            // the if statement is for when running test for article with space in name.
            // Couldn't get cURL to transfer it like it is being transferred by an actual browser request
            this.defineInfoFor(data["issue"], (token.automatedTest) ? rawurldecode(data["name"]) : data["name"]);
        }

        if (method == "DELETE") {

            UserInstance.defineInfoFor(token.id, true);

            if (!UserInstance.checkPassword(data["password"])) {
                return false;
            }
        }

        switch(method) {

            case "GET":

                const Comment = new Comment();

                if ((!UserInstance.isLoggedIn() && !this._isPublic) || !strlen(this._lede)) {

                    Utilities.setHeader(404);
                    return;
                }

                return ["BODY" => this.getBody(), "TAGS" => this.listTags(),
                       "COMMENTS"=>Comment.getAllByArticle(this.issue, this._url), "ID"=> this.id,
                       "CAN_EDIT" => this.canEdit()];

            case "POST":
                    return this.create(data["name"], data["txtArea"], data["type[]"]);

            case "PUT":

                if ((token.id == this.authorId && !this._isPublic) || token.level > 2) {
                    return this.edit(data["edit"]);
                }

            case "DELETE":
                return this.destroy();
        }
    }
*/
    /**
      * Given an article, this separates the article up until first {@code</p>} into this._lede
      *  and the rest of the article into this._body
      *
      * @param filteredBody - article (string)
      *
      * @return true
      */
    _separateLede(filteredBody) {

        let firstP = filteredBody.match(/[^\/>]<\/p>/);

        if (!firstP) {
           firstP = filteredBody.match(/<\/p>/);
        }

        this._lede = filteredBody.substring(0, filteredBody.indexOf(firstP[0]) + 5);

        this._body = filteredBody.substring(filteredBody.indexOf(firstP[0]) + 5);

        return true;
    }

    /**
      * Given an article, this separates all pictures into this.pics
      *   and replaces all `src="*"` with `data-src` from filteredBody, then saves it to this._body
      *
      * @param filteredBody - string
      *
      * @return false if there's an invalid pictures (according to this.__validatePics), else returns true
      */
    async _separatePics(filteredBody) {

       const pics = [];
       let match;
       const regex = /src="([^"]+)"/gi;


       while ((match = regex.exec(filteredBody)) !== null) {
           pics.push(match[1]);
       }

       this._pics = await this._validatePics(pics);

       this._slideImg = (new Array(Math.max(0, this._pics.length))).fill(1);


       if (!this._pics && !pics)  {
           return false;
       }

       this._body = filteredBody.replace(/src="[^"]+"/gi, "data-src");

       const images = this._body.match(/<img.[^>]+/gi) || [];

       for (let i = 0; i < images.length; i++) {

           if (images[i].indexOf("previewHidden") != -1) {
               this._slideImg[i] = 0;
           }
       }

       return true;
    }

    /**
      * Brings up all information about article specified in by parameters from the database,
      *   and initialized all instance variables that holds information about it (other than this._changeSettings)
      *
      * @param issue - issue the article is in
      * @param name - name of issue
      *
      * @return false if nothing in db matches parameters given, else returns id of article
      */
    async defineInfoFor(issue, name) {

        const asyncDB = await db;

        const filteredIssue = issue.match(/^\d+/)[0];
        const filteredName = this._validateURL(name);

        const allInfo =
        await asyncDB.query(`SELECT pageinfo.url, pageinfo.issue, pageinfo.lede, pageinfo.body, pageinfo.img_url,
                        pageinfo.created, pageinfo.authorid, tag1, tag2, tag3, pageinfo.views, pageinfo.id,
                        pageinfo.display_order, pageinfo.slide_img, issues.ispublic
                            FROM pageinfo
                            LEFT JOIN issues
                            ON pageinfo.issue = issues.num
                            LEFT JOIN tags
                            ON tags.art_id = pageinfo.id
                            WHERE pageinfo.issue = ? AND pageinfo.url = ?`, [filteredIssue, filteredName]);


        if (!await allInfo[0][0]) {
            Utilities.setHeader(404);
            return false;
        }

        const dbVals = await allInfo[0][0];
        this._isPublic = dbVals.ispublic;
        this._displayOrder = dbVals.display_order;
        this._slideImg = JSON.parse(dbVals.slide_img);
        this._url = dbVals.url;
        this._issue = dbVals.issue;
        this._lede = dbVals.lede.toString();
        this._body = dbVals.body.toString();
        this._pics = JSON.parse(dbVals.img_url.toString());
        this._created = dbVals.created;
        this._authorId = dbVals.authorid;
        this._tags = [dbVals.tag1, dbVals.tag2, dbVals.tag3].filter(elt => elt != null);
        this._views = dbVals.views;
        this._id = dbVals.id;

        return dbVals.id;
    }

    setDisplayOrder(num) {
        this._getDisplayOrder = (num > -1 && !isNaN(num)) ? num : 0;
    }

    getDisplayOrder() {
        return this._displayOrder;
    }

    /**
      * Sets url of article
      *
      * @param url - new url, according to this._validateURL
      *
      * @return true if valid url, else false
      */
    setURL(url) {

        const filtURL = this._validateURL(url);

        if (!filtURL) {
            return false;
        }

        this._url = filtURL;
        this._settingsChanged = true;
        return true;
    }

    /**     * @param issue - issue of article
      * @param url - string
      *
      * @return false if not valid according to built in FILTER_VALIDATE_URL, or url > 75 chars
      *   else returns sanitized version of url
      */
    _validateURL(url) {

        if (!isNaN(+url) || /^[\w\s-]{2, 75}$/.test(url)) {

            Utilities.setHeader(400, "url");
            return false;
        }

        url = url.replace(/[><]/g, "");

        return encodeURIComponent(url);
    }

    /**
      * Getter for this.url
      */
    getURL() {
        return this._url;
    }

    /**
      * Sets issue of article
      *
      * @param issue - number
      *
      * @return false if issue invalid according to this._validateIssue, else returns true
      */
    setIssue(issue) {

        const filtIssue = this._validateIssue(issue);

        if (!filtURL) {
            return false;
        }

        this._issue = filtIssue;
        this._settingsChanged = true;
        return true;
    }

    /**
      * @param issue - number
      *
      * @return false if issue isn't a number, or if it's less than 0, else returns sanitized version of issue
      */
    _validateIssue(issue) {
        // TODO: check if issue is greater than max issue
        if (!/^\d+$/.test(issue) || issue < 1) {

            Utilities.setHeader(400, "issue");
            return false;
        }

        return issue;
    }

    /**
      * Getter for this.issue
      */
    getIssue() {
        return this._issue;
    }

    /**
      * Saves lede as lede of article
      *
      * @param lede - string
      *
      * @return false if lede invalid according to this._validatePiece, else return true
      */
    setLede(lede) {

        const filtLede = this._validatePiece(lede);

        if (!filtLede) {
            return false;
        }

        this._lede = filtLede;
        this._settingsChanged = true;
        return true;
    }

    /**
      * Getter for this._lede
      */
    getLede() {
        return this._lede;
    }

    /**
      * Sets body as body of article
      *
      * @param body - string, valid acc to this.validateBody
      *
      * @return false if invalid, else true
      */
    setBody(body) {

        const filtBody = this._validatePiece(body);

        if (!filtBody) {
            return false;
        }

        this._body = filtBody;
        this._settingsChanged = true;
        return true;
    }

    /**
    * @return article without things needed for formatting (used for certain tests)
    */
    getBody() {

        const UserInstance = new User();

        if (!UserInstance.isLoggedIn() && !this.getPublic()) {

            Utilities.setHeader(404);
            return false;
        }

        let content = this._lede + this._body;


        for (const pic of (this._pics || [])) {

            const pos = content.indexOf("data-src");

            if (pos !== -1) {
                content = content.replace('data-src', `src='${pic}'`);
            }
        }

// PERHAPS MOVE ALL COOKIE related stuff to the actual router
     /*
        if (!UserInstance.isLoggedIn() && this.getPublic() && isset(_COOKIE["pagesViewed"]) && !in_array(this.IssueInstance. this.url, Utilities.cookieToArray("pagesViewed"))) {
            this._addCookieView();
        }
        if (!isset(_COOKIE["pagesViewed"]) && this.getPublic() && !UserInstance.isLoggedIn()) {
            const asyncDB = await db
            asyncDB.query("UPDATE pageinfo SET views = views + 1 WHERE id = ?", this._id);
        }*/

        return content;
    }

    /**
      * @param piece - string
      *
      * @return false if piece is empty, does not have a <p> tag, or whose `VIEWS` > 0
      *   If all's well, returns piece filtered through this.stripTags
      */
    _validatePiece(piece) {

        if (piece.indexOf('<p>') == -1 || !/^<h1>([\s\S]+)<\/h1>[\s\S]*<h4>.+/.test(piece)) {

            Utilities.setHeader(400, "article");
            return false;
        }

        return this.stripTags(piece).replace(/<section>|<\/section>/gi, ""); // sections are added in js to format
    }

    /**
      * @param toStrip - string
      *
      * @return toStrip, stripped of all dangerous tags and attrs
      */
    stripTags(toStrip) {

        const purifier = new Purifier();
        return purifier.purify(toStrip);
    }

    /**
      * Validates img urls
      *
      * @param pics - array of strings
      *
      * @return false if invalid url, if certain extensions. Else returns pics
      */
    async _validatePics(pics = []) {

        const acceptedImgExt = ["jpg", "jpeg", "png", "jif", "jfif", "tiff", "tif", "gif", "bmp"];

        let dataURINum = 0;
        let p = 0;

        // can't do data pics when article is created since don't have article id yet
        for (let pic of pics) {

            const foundPic = pic.match(/^.+\.(\w{3,4})/); // img type

            pics[p] = pic = await this._convertDataURI(pic, dataURINum);
            dataURINum = pic.indexOf("/images") != -1 ? dataURINum + 1 : dataURINum;

            const imgFormat = (/^\//.test(pic)) ? "data" : "png" // data uri or local imags

            if (!/^https?/.test(pic) ||
               (acceptedImgExt.indexOf(imgFormat) == -1 && (pic.indexOf("googleusercontent") == -1))) {

                if (!/^\//.test(pic)) {

                    Utilities.setHeader(400, "image");
                    return false;
                }
            }
            p++;
       }

       return (!pics) ? [] : pics;
    }

    /**
     * Saves data URI as local file
     *
     * @param pic - string
     * @param imgName - name of file to save data uri in (does not include tld)
     *
     * @return uri of image (if pic is data uri, it's a file relative to app.js)
     */
    async _convertDataURI(pic, imgName) {

        if (pic.indexOf(":image") != -1) {
            // data uris are stored in actual files since can't fit in db

            const url = __dirname + `/../../client/public/images/issue/${this._issue}/${this._id}/`;

            let imgData = pic.replace(/\s/g,'+');
            imgData =  imgData.substring(imgData.indexOf(',') + 1);
            imgData = Buffer.from(imgData, 'base64');

            await fs.ensureDir(url);

            await fs.writeFile(url + `${imgName}.png`, imgData);

            return `/images/issue/${this._issue}/${this._id}/${imgName}.png`;
        }
        else {
            return pic;
        }
    }

    /**
      * Getter for this.pics
      */
    getPics() {
        return this._pics;
    }

    /**
      * Sets article's tags
      *
      * @param tags - array of string(s)
      *
      * @return false if invalid acc to this.validateTags, else true
      */
    setTags(tags) {

        const filtTags = this._validateTags(tags);

        if (!filtTags) {
             return false;
        }

        this._tags = filtTags;
        this._settingsChanged = true;
        return true;
    }

    /**
      * Validates tags
      *
      * @param inputTtags - something
      *
      * @return false if not an array, empty array, array is not composed of strings.
      *   Else returns sanitized version of tags
      */
    _validateTags(inputTags = []) {

        const tags = (Array.isArray(inputTags)) ? inputTags : [inputTags];

        if (tags.length < 1) {
            return false;
        }

        for (let tag of tags) {

            if (typeof tag != 'string') {

                Utilities.setHeader(400, "tag");
                return false;
            }

            tag = Utilities.filter(tag);
        }

        return [...new Set(tags)];
    }

    /**
      * Getter for this._tags
      */
    getTags() {
        return this._tags;
    }

    /**
      * Gets number of views article has
      */
    getViews() {
        return this._views;
    }

    /**
      * @return true if article is not public, and user is either lvl 3 or the author of article. Else return false
      */
    canEdit() {

        const UserInstance = new User();
        const token = UserInstance.getJWT();

        const canEdit = UserInstance.isLoggedIn() && ((!this._isPublic && token.id == this._authorId) || token.level > 2);
        return !!canEdit;
    }

    async exists(issue, url) {

        const asyncDB = await db;
        const UserInstance = new User();

        const exists = await asyncDB.query(`SELECT id FROM pageinfo
        LEFT JOIN issues
        ON num = issue
        WHERE issue = ? AND url = ? AND (ispublic = ? OR ?)`,
        [issue, url, !UserInstance.isLoggedIn(), +UserInstance.isLoggedIn()]);

        return !!(await exists[0].id);
    }

    /**
      * If cookie 'pagesViewed' is set, adds current article to it and increases article's view by 1
      *
    _addCookieView() {

        // if article is public, add cookie that shows you visited page
        if (isset(_COOKIE["pagesViewed"]) && this.getPublic()) {

            const cookie = _COOKIE['pagesViewed'];
            const cookie = stripslashes(cookie);
            const savedCardArray = JSON.parse(cookie, true);

            if (!in_array(this.issue . this.url, savedCardArray)) {

                savedCardArray[] = this.issue . this.url;

                const json = JSON.stringify(savedCardArray);

                setcookie('pagesViewed', json, null, "/");

                const asyncDB = await db
                asyncDB.query("UPDATE pageinfo SET views = views + 1 WHERE id = ?", this._id);
            }
        }
    }*/

    /**
      * @return true if article is public, else false
      */
    getPublic() {
        return this._isPublic;
    }

    /**
      * @return author's id
      */
    getAuthorId() {
        return this._authorId;
    }

    /**
      * @return article's id
      */
    getId() {
        return this._id;
    }

    /**
    * @param encodedTags is a json encoded array of tags
    * @return comma separated list of tags (string)
    */
    listTags() {

        let toReturn = "";

        this._tags.forEach(elt => {
            toReturn += elt + ", ";
        });

        return toReturn.substring(0, toReturn.length - 2);
    }

    /**
      * @return date article was published
      */
    getCreated() {
        return this._created;
    }

}