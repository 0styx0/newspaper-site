
const Utilities = require('./Utilities');
const db = require('./db');
const bcrypt = require('bcrypt');
const SendMail = require('./SendMail');
const jwt = require('jwt-simple');
const JWT = require('../../config.json').JWT;
const randomstring = require('randomstring');

module.exports = class User {

    constructor() {

         this._username, this._firstName, this._middleName, this._lastName, this._password, this._email, this._level,
            this._twoFactorEnabled, this._notificationsEnabled, this._articles, this._views, this._id,
            this._authCode, this._authTime, this._settingChanged;
    }


    /**
      * Saves settings to db if any have been changed in current instantiation of this class
      */
    async destruct() {

        if (!this._settingChanged) {

            return false;
        }

        const asyncDB = await db;

        asyncDB.query(`UPDATE users SET password = ?, level = ?, two_fa_enabled = ?, email = ?, notifications = ?, auth = ?,
                            auth_time = ?, username = ?
                            WHERE id = ?`,
                            [this._password, this._level, this._twoFactorEnabled, this._email, this._notificationsEnabled,
                            this._authCode, this._authTime, this._username, this._id]);
    }

    /**
      * Creates new account
      * All params will be checked in accordance with their this.validate function before being entered into database
      * Email is prefixed by a . since has not been verified yet
      *
      * @return false if invalid input, true
      */
    async create(username, fullname, password, confirmation, email, level) {

        const allInputValid = this._validatePassword(password, confirmation) && this.validateUsername(username)
                         && this.validateFullName(fullname) && this.validateEmail(email) && this.validateLevel(level);


        if (!allInputValid || !await this._uniqueEmail(email)) {

            return false;
        }

        const nameArr = this.validateFullName(fullname);

        const asyncDB = await db;

        const hashedPassword = (await bcrypt.hash(password, 10)).replace(/^\$2a/, '$2y'); // replacing so compatible with php's password_hash

        asyncDB.query(`INSERT INTO users (username, f_name, m_name, l_name, password, level, email, notifications)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                            [username, nameArr[0], nameArr[1], nameArr[2], hashedPassword,
                            level, "."+email, 1]);

        this._email = "."+email;
        this._username = username;

        await this.sendEmailVerification();

        asyncDB.query("UPDATE users SET auth = ?, auth_time = ? WHERE username = ?",
                        [this._authCode, this._authTime, username]);

        if (!this.isLoggedIn()) {
            return this.login(username, password);
        }

        Utilities.setHeader(201, "user created");

        return true;
    }

    /**
      * Does HTTP REST for directly user related stuff
      *
      * PUT - login OR if already logged in, account
      * POST - create
      * GET - user info
      * DELETE - delete user
      *
      *
      *
    route(method, data) {

        if (!= "POST" && array_key_exists("user", data) && !this.exists(data["user"])) {

            Utilities.setHeader(404);
            return false;
        }

        if (!= "GET" && method != "POST" && !array_key_exists("lastAuth", data)) {
            this.defineInfoFor(this.getJWT()._id, true);
        }
        else if (method == "GET" || array_key_exists("lastAuth", data)) {
            this.defineInfoFor(data["user"]);
        }



        switch (method) {

            case "GET":
                return this.getAllUserInfo();

            case "PUT":
                return this.changeSettingsWhenRouting(data);

            case "DELETE":
                return this.destroy(data["delAcc"]);

            case "POST":
                return this.create(...array_values(data));
        }
    }*/

    async getAllUserInfo() {

        const token = this.getJWT();

        const asyncDB = await db;
        const toReturn = [
            {
                username: (this._id == token.id) ? this.getUsername() : null,
                name: this.getFullName(),
                level: this.getLevel(),
                articles: this.getArticleNum(),
                views: this.getViews()
            }
                        ];

        const artQuery = await asyncDB.query(`SELECT url, SUBSTRING_INDEX(created, 'T', 1) AS created, CONCAT(tag1, IFNULL(CONCAT(', ', tag2), ''),
                    IFNULL(CONCAT(', ', tag3), '')) AS tags, views,
                    pageinfo.id AS art_id, issue
                    FROM pageinfo
                    LEFT JOIN issues
                    ON pageinfo.issue = issues.num
                    JOIN tags
                    ON tags.art_id = pageinfo.id
                    WHERE authorid = (SELECT id FROM users WHERE username = ?) AND (ispublic = 1 OR ?)
                    ORDER BY issue, url`, [this._username, this.isLoggedIn()]);


        toReturn.push(await artQuery[0]);

        if (this.isLoggedIn() && token.id == this._id) {

            toReturn.push({
                notificationStatus: this.getNotificationStatus(),
                twoFactor: this.getTwoFactor(),
                email: this._email,
                emailConfirmed: !!this.validateEmail(this._email),
                id: this._id
            });
        }

        return toReturn;
    }

    _changeSettingsWhenRouting(data) {

        if (data.lastAuth) {

            return this.forgotPassword(data.email, data.lastAuth);
        }

        else if (data.userEmail && this.checkPassword(data.password)) {

            return this.setEmail(data.userEmail) &&
            this.setTwoFactor(data['2fa']) &&
            this.setNotificationStatus(data.notifications);

        }

        else if (this.checkPassword(data.password)) {

            return this.setPassword(data.newPass, data.passConf);
        }


    }

    async _uniqueEmail(email) {

        const asyncDB = await db;

        const duplicate = (await asyncDB.query("SELECT email FROM users WHERE email = ? OR email = ?",
                         ["."+email, email]))[0][0]


        if (!await duplicate || email.indexOf("meiseles") !== -1) { // lets me have many accounts with same email
            return true;
        }

        Utilities.setHeader(409, "email");
        return false;
    }

    /**
      * Removes account from database, all PAGEINFO.AUTHORID's with the id of Deleted User
      *  Also sets all instance variables to null
      *
      * @param id - id of user to destroy
      */
    async destroy(id) {

        const asyncDB = await db;
        const token = this.getJWT();

        if (this._id != token.id && token.level <= (await asyncDB.query("SELECT level FROM users WHERE id = ?", [id]))[0][0].level) {
            return false;
        }


        const deletedUserId = (await asyncDB.query("SELECT id FROM users WHERE username = ?", ["Deleted"]))[0][0].id

        const articleUpdate = asyncDB.query("UPDATE pageinfo SET authorid = ? WHERE authorid = ?", [await deletedUserId, id]);

        const commentUpdate = asyncDB.query("UPDATE comments SET authorid = ? WHERE authorid = ?", [await deletedUserId, id]);

        await Promise.all([articleUpdate, commentUpdate])
                     .then(() => asyncDB.query("DELETE FROM users WHERE id = ?", [id]));

        this._settingChanged = false;

        this._username = this._firstName = this._middleName = this._lastName = this._password = this._email =
        this._level = this._twoFactorEnabled = this._notificationsEnabled = this._publicArticlesNum = this._allArticlesNum = this._views =
        this._id = this._settingChanged = null;

        return true;

    }

    /**
      * Logs in user
      *
      * @param username - username in db
      * @param password - password that matches username
      * @param code - if 2fa code is given, will be it
      *
      * @return true if user has been successfully logged in, if 2fa is needed, returns false
      */
    async login(username, password, code = "") {

        const userId = await this.defineInfoFor(username);

        const token = this.getJWT();


        if (!await userId || !await this.checkPassword(password)) {
            Utilities.setHeader(400, "password");
            return false;
        }

        // get email. Match .words2018@tabc.org, name.nextName@tabc.org, and only takes words@2018 or name.nextName
        const emailInfo = this._email.match(/\w+\.?\d?\w+/)[0];

        this.changeJWT({
            email: emailInfo
        });

        if (this._email[0] == ".") {

            if (!await this.checkAuth(code)) {

                if (code) { // if user actually put in a code (opposed to this being called from this.create)
                    Utilities.setHeader(400, "auth code");
                    return;
                }
                Utilities.setHeader(200, "email sent");
                return;
            }
            this.makeEmailUsable();
        }

        // the check for _SESSION["user] is to make sure not to send another email every time page is refreshed
        if (this._twoFactorEnabled && !await this.checkAuth(code)) {

            if (code && token.id) {

                Utilities.setHeader(202);
                return;
            }

            this.changeJWT({
                id: this._id
            });  // put in 2 places to not send many emails if refresh auth page

            const fifteenMinutes = new Date(Date.now());
            fifteenMinutes.setMinutes(fifteenMinutes.getMinutes() + 15);

            const authCode = await this.set2FAInfo(fifteenMinutes);

            const SendMailInstance = new SendMail();

            Utilities.setHeader(200, "email sent");
            return (SendMailInstance.twoFactor(this._email, authCode)) ? 0 : false;
        }

        this.changeJWT({
            email: emailInfo,
            level: this._level,
            id: this._id
        });

        return true;
    }

    /**
      * Sets jwt payload to values specified by function params
      *
      * @param username - corresponds to "user" field
      * @param level - refers to "level" field
      * @param id - "id" field
      */
    changeJWT(fieldValues = {}) {

        const prevValues = this.getJWT();

        for (const idx in fieldValues) {
            prevValues[idx] = fieldValues[idx];
        }

        const token = [
            {
                iss: "https://tabceots.com",
                iat: Date.now()
            },
            prevValues
        ];

        const encodedJWT = jwt.encode(token, JWT.SECRET);

        Utilities.setCookies('jwt', encodedJWT);
    }


    getJWT() {

        const jwtCookie = Utilities.getCookies('jwt');

        const token = (jwtCookie) ? jwt.decode(jwtCookie, JWT.SECRET)[1] : {};

        return token;
    }

    getJWTHeaders() {

        const jwtCookie = Utilities.getCookies('jwt');

        return (jwtCookie) ? jwt.decode(jwtCookie, JWT_SECRET)[0] : null;
    }

    /**
      * Sets instance variables to info of user specified
      *
      * @param whereClause must be email (including anything past and including @) of existing account in db, id of exisitng account
      * @param isId - if true, whereClause is assumed to be an id, assumed to be username
      *
      * @return false if nonexistant user, with id of user if successful
      */
    async defineInfoFor(whereClause, isId = false) {

        const asyncDB = await db;

        const filtWhereClause = Utilities.filter(whereClause);

        let allInfo;

       if (!isId && !/^\d+$/.test(filtWhereClause)) {


            allInfo =
            await asyncDB.query(`SELECT username, f_name, m_name, l_name, users.id, password, email, level,
                                two_fa_enabled, notifications, auth, auth_time, COUNT(pageinfo.id) AS articles,
                                IFNULL(SUM(views), 0) AS views
                                FROM users
                                LEFT JOIN issues ON (ispublic = 1 OR ?)
                                LEFT JOIN pageinfo ON issue = num AND authorid = users.id
                                WHERE username = ? OR TRIM('.' FROM TRIM('@tabc.org' FROM users.email)) = ? LIMIT 1`,
                                [this.isLoggedIn(), filtWhereClause, filtWhereClause]);
        }
        else {

            allInfo =
            await asyncDB.query(`SELECT username, f_name, m_name, l_name, users.id AS id, password, email, level,
                                two_fa_enabled, notifications, auth, auth_time, COUNT(pageinfo.id) AS articles,
                                IFNULL(SUM(views), 0) AS views
                                FROM users
                                LEFT JOIN issues ON (ispublic = 1 OR ?)
                                LEFT JOIN pageinfo ON issue = issues.num AND authorid = ?
                                WHERE users.id = ?`, [this.isLoggedIn(), filtWhereClause, filtWhereClause]);
        }


        const dbVals = await allInfo[0][0];

        if (!dbVals.id) {
            return false;
        }

        this._username = dbVals.username;
        this.setFullName(`${dbVals.f_name} ${dbVals.m_name} ${dbVals.l_name}`.replace('null ', '')); // if no middle name
        this._password = dbVals.password;
        this._id = dbVals.id;
        this._email = dbVals.email;
        this._level = dbVals.level;
        this.setTwoFactor(dbVals.two_fa_enabled);
        this.setNotificationStatus(dbVals.notifications);
        this._articles = dbVals.articles;
        this._views = dbVals.views;
        this._authCode = dbVals.auth;
        this._authTime = dbVals.auth_time;

        this._settingChanged = false;

        return dbVals.id;
    }

    /**
      * Logs out user
      */
    logout() {

        Utilities.setCookies('jwt', null);
    }

    /**
      * @return true if this instance of user is logged in, false
      */
    isLoggedIn() {

        const token = this.getJWT();
        const isLoggedIn = token && token.level && token.email && token.id;
        return !!isLoggedIn;
    }

    async exists(username) {

        const asyncDB = await db;
        return !!(await asyncDB.query(`SELECT id FROM users WHERE username = ?
        OR TRIM('@tabc.org' FROM email) = ?`, [username, username]))[0][0].id
    }

    /**
      * If username is valid according to this.validateUsername, this._username as username
      *
      * @param username - potential username
      *
      * @return true if username is set as new username, false
      */
    setUsername(username) {

        const newUsername = this.validateUsername(username);

        if (!newUsername) {
            return false;
        }


        this._username = newUsername;

        this._settingChanged = true;
        return true;
    }

    /**
      * @param username - to be evaluated
      *
      * @return validated and sanitized username if string of < 20 chars containing no spaces, else
      */
    validateUsername(username) {

        if (username.length > 20 || username.indexOf(' ') != -1 || username.length < 1) {

            Utilities.setHeader(400, "username");
            return false;
        }

        return Utilities.filter(username);
    }

    getUsername() {
        return this._username;
    }

    /**
      * Sets the name of user by splitting input into first, last, middle name
      *
      * @param name - potential new name
      *
      * @return true if name is in accordance to this.validateFullName, false
      */
    setFullName(name) {

        const newName = this.validateFullName(name);

        if (!newName) {

            return false;
        }

        [this._firstName, this._middleName, this._lastName] = newName;

        this._settingChanged = true;

        return true;
    }

    /**
      * @param name - to be checked
      *
      * @return false if not 2-3 words, having > 10 chars, (provided) > 3, 3rd > 20. Else return sanitized string
      */
    validateFullName(name) {

        // word space word OR space word
        if (!/^[a-zA-Z.-]+\s?[a-zA-Z.-]{0,3}\s[a-zA-Z.-]+$/.test(name)) {
            Utilities.setHeader(400, "name");
            return false;
        }

        const nameArr = Utilities
                        .filter(name)
                        .split(" ");

        if (nameArr.length < 3) {

            nameArr.splice(1, 0, "");
        }

        if (nameArr[0].length > 10 || nameArr[1].length > 3 || nameArr[2].length > 20) {
            Utilities.setHeader(400, "name");
            return false;
        }

        return nameArr;
    }

    /**
      * @return user's first name
      */
    getFirstName() {
        return this._firstName;
    }

    /**
      * @return user's middle name (empty string if none)
      */
    getMiddleName() {
        return this._middleName;
    }

    /**
      * @return user's last name
      */
    getLastName() {
        return this._lastName;
    }

    /**
      * @return user's full name. Each part of name is separated by a space
      */
    getFullName() {
        return this._firstName + " "+this._middleName + " "+this._lastName;
    }

    /**
      * Sets this._password as hashed version of password
      *
      * @param password - string
      * @param confirmation - must be same as password
      *
      * @return true if password valid according to this._validatePassword, false
      */
    async setPassword(password, confirmation) {

        const newPassword = this._validatePassword(password, confirmation);

        if (!newPassword) {
            return false;
        }


        this._password = (await bcrypt.hash(newPassword, 10)).replace(/^\$2a/, '$2y');
        this._settingChanged = true;
        return true;
    }

    /**
      * @param password - to check
      *
      * @return false if password does not contain either at least 1 upper, lower, and at least 6 chars, is less than 15 chars,
      * else returns filtered password
      */
    _validatePassword(password, confirmation) {

        if (password != confirmation || (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*).{6,}$/.test(password) && password.length < 15)) {
            Utilities.setHeader(400, "password");
            return false;
        }

        return password;
    }

    /**
      * @param passwordGiven - to check
      *
      * @return true if passwordGiven is verified according to this._password else false
      */
    async checkPassword(passwordGiven = '') {

        return this._password && await bcrypt.compare(passwordGiven, this._password.replace(/^\$2y/, '$2a'));
    }

    /**
      * Sets this._email. If successful, email user a verification code
      *
      * @param email - potential new email of user
      *
      * @return true if email valid according to this.validateEmail, false
      */
    setEmail(email) {

        const newEmail = this.validateEmail(email);
         if (!newEmail) {
             return false;
         }

         if (newEmail == this._email) {
             return true;
         }

         this._email = "."+newEmail;

         this.sendEmailVerification();

         this._settingChanged = true;

         return true;
    }

    /**
      * @param email - to be checked
      *
      * @return false if invalid email format or doesn't end with (digits or word.word) and @tabc.org, return filtered email
      */
    validateEmail(email) {

         if (!/^(?:(?:\w+\d{4})|(?:[a-z]+\.[a-z]+))@tabc\.org$/.test(email)) {

            Utilities.setHeader(400, "email");
            return false;
        }

        return email;
    }

    /**
      * @return this._email
      */
    getEmail() {
        return this._email;
    }

    /**
      * If this._email starts with a dot (.) as all new emails are, removes it
      *
      * @return true
      */
    makeEmailUsable() {

        if (this._email[0] == ".") {
            this._email = this._email.substr(1);
            this._settingChanged = true;
        }
        return true;
    }

    /**
      * Sets level of user to lvl if successful
      *
      * @param lvl - number
      *
      * @return true if lvl in accordance with this.validateLevel, false
      */
    setLevel(lvl) {

        const newLvl = this.validateLevel(lvl);

        if (!newLvl) {
            return false;
        }


        this._level = newLvl;
        this._settingChanged = true;

        if (this.isLoggedIn()) {

           this._level = newLvl;
        }

        return true;
    }

    /**
      * @param lvl potential level of user
      *
      * @return filtered lvl if lvl is 1-3, false
      */
    validateLevel(lvl) {

        const currentLevel = this.getJWT().level;
        const loggedInLevel = (+!!currentLevel == 0) ? 0 : currentLevel;

        if (!/^[1-3]$/.test(lvl) || lvl > Math.max(loggedInLevel, 1)) {

            Utilities.setHeader(400, "level");
            return false;
        }

        return lvl;

    }

    /**
      * @return this._level
      */
    getLevel() {

        return this._level;
    }

    /**
      * Sets two factor authentication setting
      *
      * @return true
      */
    setTwoFactor(bool = null) {

        // doing ternary instead of directly assigning bool to prevent bad input
        this._twoFactorEnabled = (bool) ? 1 : 0;
        this._settingChanged = true;

        return true;
    }

    /**
      * @return this._twoFactorEnabled
      */
    getTwoFactor() {

        return this._twoFactorEnabled;
    }

    /**
      * Sets notification setting
      *
      * @return true
      */
    setNotificationStatus(bool = null) {
        this._notificationsEnabled = (bool) ? 1 : 0;
        this._settingChanged = true;

        return true;
    }

    /**
      * @return this._notificationsEnabled
      */
    getNotificationStatus() {
        return this._notificationsEnabled;
    }


    /**
      * @return this._articles; num of public articles user published. If user is not logged in, only see number that is public
      */
    getArticleNum() {

         return this._articles;
     }


    /**
      * @return this._views; how many people viewed article published by user
      */
    getViews() {
        return this._views;
    }

    /**
      * @param time - time authcode was generated
      *
      * @return true
      */
    async set2FAInfo(time) {

        const code = randomstring.generate(6);

        this._authCode = await bcrypt.hash(code, 10).then(hash => this._authCode = hash.replace(/^\$2a/, '$2y'))
        this._authTime = time;

        this._settingChanged = true;

        return code;
    }

    /**
      * Sends verification email (when user's email is changed)
      */
    sendEmailVerification() {

        const SendMailInstance = new SendMail();

        return Promise.resolve(new Date())
        .then(now => {
            now.setDate(now.getDate() + 1)
            return now;
        }).then(tomorrow =>
            tomorrow.toISOString()
            .split("T")
            .join(" ")
            .split(".")[0])
        .then(data => this.set2FAInfo(data))
        .then(code => SendMailInstance.emailAuth(this._email, this._username, code));
    }


    /**
      * @return true if correct auth code and within 15 minutes of it being generated, false
      */
    async checkAuth(toCheck, timeMatters = true) {

        return !!this._authCode &&
               await bcrypt.compare(toCheck, this._authCode.replace(/^\$2y/, '$2a')) &&
               (
                 !timeMatters ||
                 Date.parse(this._authTime) - Date.now() > 0
               );
    }

    /**
      * Changes user's password to randomly generated and sends user email containing new password
      *
      * @param email - user's email
      * @param lastAuth - last auth code the user used
      *
      * @return true if successful, false
      */
    async forgotPassword(email, lastAuth) {

        const newPassword = randomstring.generate(30);

        if (!await this.checkAuth(lastAuth, false) || email != this._email || !await this.setPassword(newPassword, newPassword)) {
            return false;
        }

        const SendMailInstance = new SendMail();
        Utilities.setHeader(200, "email sent");
        return SendMailInstance.passwordRecovery(newPassword, this._username, this._email);
    }

    /**
      * @return user's id
      */
    getId() {
        return this._id;
    }

}
