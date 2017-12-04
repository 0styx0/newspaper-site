import Notification from './Notification';

const messages = {
    'userCreated': 'User has been created',
    'userUpdate': 'User(s) have been updated',
    'userDeleted': 'User(s) have been deleted',
    'commentDeleted': 'Comment has been deleted',
    'commentCreated': 'Comment has been saved',
    'articleUpdated': 'Article(s) have been updated',
    'articleEdited': 'Edit has been saved',
    'articleDeleted': 'Article(s) have been deleted',
    'authEmail': 'A code has been emailed to you. It should arrive in the next few minutes',
    'issueUpdated': 'Issue has been updated',
    'missionUpdated': 'Mission has been edited',
    'passwordUpdated': 'Password has been changed',
    'unconfirmedPassword': 'Password does not match confirmation',
};

function notifyUserOf(notificationType: string) {

    if (messages[notificationType]) {
        Notification({
            body: messages[notificationType]
        });
    }
}

export default notifyUserOf;