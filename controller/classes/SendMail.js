
const nodemailer = require('nodemailer');
const db = require('./db');
const Utilities = require('./Utilities');
const {unused1, EMAIL, unused, EMAIL_HOST} = require('../../config.json');

module.exports = class SendMail {

    /**
      * Given proper parameters, this emails a user
      *
      * @param email - valid email address (lowercase.lowercase@domain.tld OR lettersnnnn@domain.tld where n is a digit)
      * @param subject - string that will be sent at email subject
      * @param message - string, will be sent as email body
      *
      * @return true if successful, else false
      */
    specific(email, subject, message) {

        return this._mail(email, subject, message);
    }

    /**
      * Sends an email notifying level 3 users that an article has been published
      *
      * @param tags - string should consist of tags the article can be found under
      * @param issueNum - name of issue article has been pubished in
      * @param name - name of article
      *
      * @return true if sent, else false
      */
    articlePublished(tags, issueNum,name) {

        const subject = "An article has been published";

        const message = 'A user '+
            `has published a ${tags} article for issue ${issueNum} called `+
            `<a href="https://tabceots.com/issue/${issueNum}/story/${name}">${decodeURIComponent(name)}</a>`+
            '<br />' +
            "View details <a href='https://tabceots.com/modifyArticles'>here</a>";

        return this.toLevel(3, subject, message);
    }

    /**
      * Sends an email to all users of level specified
      *
      * @param lvl - int 1-3 (inclusive), email will be sent to users of this level
      * @param subject - email subject
      * @param message - email body
      *
      * @return true if sent, else false
      */
    async toLevel(lvl,subject = "",message = "") {

        const asyncDB = await db;

        const filteredLvl = lvl.toString().match(/[1-3]/)[0];

        const toEmail = await asyncDB.query("SELECT DISTINCT email FROM users WHERE level IN (1,2,?) AND SUBSTRING(email, 0, 1) != ? AND notifications = 1", [filteredLvl, "."]);

        const arrOfEmails = [];

        toEmail[0].forEach(elt => arrOfEmails.push(elt.email));

        return this._mail(arrOfEmails, subject, message);
    }

    /**
      * Sends email to user that gives them code when logging in with 2fa enabled
      *
      * @param email - email address of user
      * @param emailVerifyCode - code that will be sent. Must be unencrypted for obvious reasons
      *
      * @return true if email sent, else false
      */
    twoFactor(email,emailVerifyCode) {

        const message = "Your code is <br />" + emailVerifyCode + "<br/>This code is valid for 10 minutes.";

        return this._mail([email], "Auth code for Eye Of The Storm", message);
    }

    /**
      * Sends email user gets either right after signing up, or after changing email
      *
      * @param email - valid email address of user EXCEPT that a dot (.) must be preceeding the address
      * @param username - username of user
      * @param code - decrypted version of auth code
      *
      * @return true if sent, else false
      */
    emailAuth(email,username,code) {


        const message = "Your code is <br />" + code + "<br/>This code is valid for 1 day. "+
                    "Your account may be deleted if this is not "+
                    "<a href='https://tabceots.com/u/"+username+"'>verified</a>.";

        return this._mail([email.substr(1)], "Verify Your EOTS Account", message);
    }

    /**
      * Sends email when users forgets password. Contains new password
      *
      * @param newPassword - new, unencrypted password of user
      * @param username - username of user
      * @param email - email address of user
      *
      * @return true if sent, else false
      */
    passwordRecovery(newPassword,username,email) {

        const message = "Your new password is <br />"+
                      newPassword
                      +`<br /> You are strongly advised to <a href='https://tabceots.com/u/${username}'>change</a> `+
                      "it as soon as possible."+
                      "<br />To prevent passwords from being forgotten, consider using a password manager such as "+
                      "1Password or LastPass";

        return this._mail([email], "Recovery Code for Eye Of The Storm", message);

    }

    /**
      * Actually sends emails. Uses phpmailer library to do so
      *
      * @param to - 1 or more valid email addresses (if 1, string, else array of strings)
      * @param subject - subject of email
      * @param message - email body
      *
      * @return true if all emails to to have been sent, else false
      */
    _mail(to = [], subject, message) {

       const cookie = Utilities.getCookies('jwt');
       if (cookie && cookie[1].automatedTest) {

           return true;
       }

        to = to.filter((elt) => new RegExp('^[\\w\\.]+'+EMAIL_HOST+'$', 'i').test(elt));

        if (!to) {
            return true;
        }


        const transporter = nodemailer.createTransport({
            host: EMAIL.HOST,
            port: EMAIL.PORT,
            auth: {
                user: EMAIL.ADDR,
                pass: EMAIL.PASS
            }
        });

        // setup email data with unicode symbols
        const mailOptions = {
            from: '"'+EMAIL.NAME+'" <'+EMAIL.ADDR+'>', // sender address
            to: to.join(', '),
            subject: subject,
            html: message
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                Utilities.setHeader(500, "server error");
                return console.log("SendMail Error:", error);
            }
            console.log('Message %s sent: %s', info.messageId, info.response);
        });

        return true;
    }

}