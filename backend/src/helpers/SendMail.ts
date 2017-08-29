import * as nodemailer from 'nodemailer';
import config from '../../config';
import db from '../db/models';

export default {

    /**
      * Sends an email notifying level 3 users that an article has been published
      *
      * @param tags - string should consist of tags the article can be found under
      * @param issueNum - name of issue article has been pubished in
      * @param name - name of article
      *
      * @return true if sent, else false
      */
    articlePublished(tags: string[], issue: number, name: string) {

        const subject = "An article has been published";

        const message = 'A user '+
            `has published a ${tags.join(', ')} article for issue ${issue} called `+
            `<a href="https://tabceots.com/issue/${issue}/story/${name}">${decodeURIComponent(name)}</a>`+
            '<br />' +
            "View details <a href='https://tabceots.com/modifyArticles'>here</a>";

        return this.toLevel(3, subject, message);
    },


    /**
      * Sends an email to all users of level specified
      *
      * @param lvl - int 1-3 (inclusive), email will be sent to users of this level
      * @param subject - email subject
      * @param message - email body
      *
      * @return true if sent, else false
      */
    async toLevel(lvl: number, subject = "", message = "") {

        const users = await db.models.users.findAll({
            attributes: ['email'],
            where: {
                level: lvl,
                notifications: true
            }
        });

        console.log('====================================');
        console.log(users);
        console.log('====================================');

        throw new Error('Check if `users` gives array of emails before proceeding');

        // return this.mail(arrOfEmails, subject, message);
    },

    /**
      * Sends email user gets either right after signing up, or after changing email
      *
      * @param email - valid email address of user EXCEPT that a dot (.) must be preceeding the address
      * @param username - username of user
      * @param code - decrypted version of auth code
      *
      * @return true if sent, else false
      */
    emailAuth(email: string, profileLink: string, code: string) {


        const message = "Your code is <br />" + code + "<br/>This code is valid for 1 day. "+
                    "Your account may be deleted if this is not "+
                    `<a href='https://tabceots.com/u/${profileLink}'>verified</a>.`;

        return this.mail(email, "Verify Your EOTS Account", message);
    },

    /**
      * Sends email when users forgets password. Contains new password
      *
      * @param newPassword - new, unencrypted password of user
      * @param username - username of user
      * @param email - email address of user
      *
      * @return true if sent, else false
      */
    passwordRecovery(newPassword: string, username: string, email: string) {

        const message = "Your new password is <br />"+
                      newPassword
                      +`<br /> You are strongly advised to <a href='https://tabceots.com/u/${username}'>change</a> `+
                      "it as soon as possible."+
                      "<br />To prevent passwords from being forgotten, consider using a password manager such as "+
                      "1Password or LastPass";

        return this.mail([email], "Recovery Code for Eye Of The Storm", message);

    },

    /**
      * Actually sends emails. Uses phpmailer library to do so
      *
      * @param to - 1 or more valid email addresses (if 1, string, else array of strings)
      * @param subject - subject of email
      * @param message - email body
      *
      * @return true if all emails to to have been sent, else false
      */
    mail(to: string[] = [], subject: string, message: string) {

        const transporter = nodemailer.createTransport({
            host: config.EMAIL.HOST,
            port: config.EMAIL.PORT,
            auth: {
                user: config.EMAIL.ADDR,
                pass: config.EMAIL.PASS
            }
        });

        // setup email data with unicode symbols
        const mailOptions = {
            from: `"${config.EMAIL.NAME}" <${config.EMAIL.ADDR}>`, // sender address
            to: to.join(', '),
            subject: subject,
            html: message
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log("SendMail Error:", error);
            }
            console.log('Message %s sent: %s', info.messageId, info.response);
        });

        return true;
    }
}