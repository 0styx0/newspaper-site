import Notification from './Notification';

const messages = {
    'userUpdate': 'User(s) have been updated',
    'userDeleted': 'User(s) have been deleted'
};

function notifyUserOf(notificationType: string) {

    if (messages[notificationType]) {
        Notification({
            body: messages[notificationType]
        });
    }
}

export default notifyUserOf;