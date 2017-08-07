
import User from './User';
import Utilities from './Utilities';
import * as Purifier from 'html-purify';
import db from './db';

/**
  * Represents a comment to an article
  * RI: Comments must be at most 500 chars and at least 10
  */
export default class Comment {

    constructor() {

        this._id, this._content, this._artId, this._authorId, this._created;
    }


    /**
      * Fills instance variables with info about comment whose id is commentId
      *
      * @param commentId - id of comment
      */
    async defineInfo(commentId) {

        const asyncDB = await db;

        const infoRow = (await asyncDB.query("SELECT id, content, art_id, authorid, created FROM comments WHERE id = ?", [commentId]))[0][0];

        if (!infoRow) {
            Utilities.setHeader(404);
            return false;
        }
        else {
            this._id = infoRow.id;
            this._content = infoRow.content;
            this._artId = infoRow.art_id;
            this._authorId = infoRow.authorid;
            this._created = infoRow.created;
            return true;
        }

    }

    /*
    route(string method, array data) {

        switch(method) {

            case "GET":
                return this.getAllByArticle(data["issue"], data["url"]);

            case "POST":
                return this.create(data["issue"], data["url"], data["content"]);

            case "DELETE":
                this.defineInfo(data["id"]);
                return this.delete();
        }
    }*/


    /**
       * Creates a comment. Requires user to be logged in
       *
       * @param issue - issue of article
       * @param url - url of article
       * @param text - text of comment. Must be at least 10 chars (magic num) and <= 500 chars
       * @return id if saved successfully, else false
       */
    async create(issue, url, text) {

        const UserInstance = new User();
        const asyncDB = await db;
        const token = UserInstance.getJWT();

        const filteredText = this._stripTags(text);

        const artIdRow = (await asyncDB.query("SELECT id FROM pageinfo WHERE issue = ? AND url = ?", [issue, encodeURIComponent(url)]))[0][0];

        if (!UserInstance.isLoggedIn()) {
            Utilities.setHeader(401);
            return false;
        }

        if (!artIdRow) {

            Utilities.setHeader(404, "article");
            return false;
        }

        if (filteredText.length < 4 || filteredText.length > 500) {

            Utilities.setHeader(400, "comment");
            return false;
        }

        const artId = artIdRow.id;

        const insertRow = await asyncDB.query("INSERT INTO comments (art_id, authorid, content, created) VALUES(?, ?, ?, CURRENT_TIMESTAMP)",
        [artId, token.id, filteredText]);

        return await insertRow.insertId;
    }


    /**
      * Deletes current comment (defined in this.defineInfo) by
      *  replacing content with 'deleted' and authorid with Deleted User's id
      */
    async delete() {

        const UserInstance = new User();
        const asyncDB = await db;
        const token = UserInstance.getJWT();

        if (!UserInstance.isLoggedIn() || (token.id != this._authorId && token.level < 3)) {

            Utilities.setHeader(401);
            return false;
        }

        await asyncDB.query("UPDATE comments SET authorid = (SELECT id FROM users WHERE username = ?), content = ? WHERE id = ?",
        ["Deleted", "deleted", this._id]);

        this.defineInfo(this._id); // load new info into class

        return true;
    }

    getContent() {

        return this._content;
    }


    getCreated() {

        return this._created;
    }

    getAuthorId() {

        return this._authorId;
    }

    getArticleId() {

        return this._artId;
    }

    async getAllByUserId(authorId) {

        const asyncDB = await db;

        const query = await asyncDB.query(`SELECT id, art_id, content, created FROM comments WHERE authorid = ?
          ORDER BY created ASC`, authorId);

        return await query[0][0];

    }

    async getAllByArticle(issue, url) {

        const asyncDB = await db;
        const UserInstance = new User();

        // if private and user not logged in
        if (!await asyncDB.query("SELECT ispublic FROM issues WHERE num = ?", [issue]) && !UserInstance.isLoggedIn()) {
            return [];
        }

        const query = await asyncDB.query(`SELECT comments.id, authorid,
                                     CONCAT(f_name, ' ', IFNULL(m_name, ''), ' ', l_name) AS author_name,
                                     TRIM(TRAILING SUBSTRING(email, INSTR(email, "@")) FROM email) AS profile_link, content,
                                     SUBSTRING_INDEX(created, 'T', 1) AS created
                                    FROM comments
                                    LEFT JOIN users
                                    ON users.id = authorid
                                    WHERE art_id = (
                                        SELECT id FROM pageinfo WHERE issue = ? AND url = ?
                                    )
                                    ORDER BY created ASC`, [issue, encodeURIComponent(url)]);
        const comments = await query[0];

        return (comments) ? await comments : [];
    }


    /**
      * Strips unwanted tags from comment
      *
      */
    _stripTags(toStrip) {

        const purifier = new Purifier();
        return purifier.purify(toStrip);
    }
}