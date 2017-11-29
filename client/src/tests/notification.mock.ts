
/**
 * Mock of window.Notification
 */
class NotificationMock {

    static async requestPermission() {
        return true;
    }

    constructor(title: string, options: { icon: string, body: string }) {
        return;
    }

}

Object.defineProperty(window, 'Notification', { value: NotificationMock });

export default NotificationMock;