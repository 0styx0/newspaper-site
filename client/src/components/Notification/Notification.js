

function Notification(options = {}) {

    window.Notification.requestPermission().then(function(result) {

        options.icon = "/images/favicons/favicon.ico";
        new window.Notification("TABC Eye of the Storm", options);
    });
}

export default Notification;
