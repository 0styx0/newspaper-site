import Notification from './Notification';

const httpStatusMessages = {

    "400": {

        "Invalid Username": "Username must be 1 word and less than 20 letters.",
        "Password": "Incorrect password",
        "Invalid Name": `Must have first and last name, and an optional middle name,
            which if given must be at most 3 letters.`,
        "Invalid Level": "Level must be 1-3.",
        "Invalid Email": `Email must not belong to any other account on this site,
            and it must be your TABC address.`,
        "Invalid Article": "Articles must have a heading 1, heading 4, and at least 1 paragraph (in that order).",
        "Invalid Tag": "Articles must have at least 1 tag and no more than 3",
        "Invalid Image": "Certain images cannot be accepted due to technical reasons. Please choose a different one",
        "Invalid URL": `Article name must be between 1 and 20 letters.
            Note that as spaces may count as 3 letters due to technical reasons,
            it is advised to use dashes instead.`,
        "Invalid Issue Name": `Issue name cannot be greater than 20 letters,
            and nor can it be blank when issue is made public.`,
        "Invalid Status": "Once an issue is made public, it cannot be made private again.",
        "Invalid Comment": "Comments must be at least 4 letters long.",
        "Invalid Password": "Invalid password",
        "Invalid Auth Code": `Authentication code is invalid. Please check your email and try again.
            If it still fails, please request another one by logging in again`,
        "Invalid Password Confirmation": "Your passwords do not match. Please try again."
    },

    "409": {
        "Email Already In Use": "Email is already in use by a different account. Please try a different one."
    },

    "422": {
        "Missing Required Field": "Please fill out all required fields."
    },

    "200": {
        'Edited': 'Edits have been saved.',
        "Email Sent": 'An email has been sent. It may take a few moments to arrive.',
        "User(s) Updated": 'Updates have been saved.',
        "Article(s) Updated": "Updates have been saved.",
        "Article(s) Deleted": "Updated have been saved.",
        "Issue Updated": "Updates have been saved.",
        "Mission Edited": "Update has been saved."
    },

    "201": {
        "User Created": 'Account has been created. A verification email has been sent.'
    },

    "500": {
        "Internal Server Error": "Unknown error. Please try again."
    }
};

function httpNotification(statusText: string, statusCode: number) {

    if (httpStatusMessages[statusText] && httpStatusMessages[statusText][statusCode]) {
        Notification({
            body: httpStatusMessages[statusText][statusCode]
        });
    }
}

export default httpNotification;