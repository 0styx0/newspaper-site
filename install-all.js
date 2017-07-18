

const cp = require('child_process');

const commands = [
    ['npm', ['--prefix', './client', 'install']],
    ['npm', ['--prefix', './backend', 'install']]
];

commands.forEach(command => {

    const node_modulesInstallation = cp.spawn(command[0], command[1]);

    node_modulesInstallation.stdout.on('data', function(data) {
        console.log(data.toString());
    });

    node_modulesInstallation.on('close', function(code, signal) {
        console.log('Installation Complete for', command[1][1]);
    });
});