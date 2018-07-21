
interface Window {
    // tslint:disable-next-line:no-any
    Notification?: any;
}

declare const window: Window;

function Notification(options: {icon?: string, body: string}) {

    window.Notification.requestPermission().then(() => {

        options.icon = process.env.REACT_APP_LOGO_PATH;
        return new window.Notification(process.env.REACT_APP_FULL_NAME, options);
    });
}

export default Notification;
