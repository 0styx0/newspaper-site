

function Notification(options = {}) {

    window.Notification.requestPermission().then(function(result) {

        options.icon = "/images/tabc_logo.png";
        new window.Notification("TABC Eye of the Storm", options);
    });
}

export default Notification;
