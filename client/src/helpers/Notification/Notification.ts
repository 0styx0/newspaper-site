
interface Window {
    // tslint:disable-next-line:no-any
    Notification?: any;
}

declare const window: Window;

function Notification(options: {icon?: string, body: string}) {

    window.Notification.requestPermission().then(() => {

        options.icon = '/images/favicons/favicon.ico';
        return new window.Notification('TABC Eye of the Storm', options);
    });
}

export default Notification;
