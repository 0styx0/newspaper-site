

const cp = require('child_process');

const commands = [
    ['npm', ['--prefix', './backend', 'start']],
    ['npm', ['--prefix', './client',  'start']]
];

commands.forEach(command => {

    const node_modulesInstallation = cp.spawn(command[0], command[1]);

    node_modulesInstallation.stdout.on('data', data  => console.log(data.toString()));
});