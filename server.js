require('./src/global');
const file = require('./src/file');
const command = require('./src/command');
const express = require('express');
const app = express();
app.use(require('./routes/index'));

let closing = false;
let interval;

function onExit(code) {
    if (!closing) { 
        closing = true;   
        if (interval) {
            clearInterval(interval);
        }
        file.writeXML('STOPPED', command.max());
        process.exit(0);
    }
}

for(let arg of process.argv) {
    if (arg === 'clear') {
        file.manageScripts();
        command.reset();
    }
    else if (arg === 'scripts') {
        file.manageScripts();
    }
    else if(arg === 'file') {
        command.reset();
    }
}

file.writeXML('RUNNING', command.max(), command.get());
interval = setInterval(() => {
    file.writeXML('RUNNING', command.max(), command.get());
}, TICK);

app.listen(process.env.PORT, process.env.IP);
console.log(`albionAPI listening on http://${process.env.IP+':'+process.env.PORT}`);

process.on('SIGINT', onExit);
process.on('SIGTERM', onExit);
process.on('SIGUSR2', onExit);
process.on('exit', onExit);