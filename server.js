require('./global');
const requests = require('./src/requests');
const app = require('express')();

let closing = false;
let clear = false;

function onExit(code) {
    if (!closing) { 
        closing = true;
        requests.stop();
        process.exit(0);
    }
}

for(let arg of process.argv) {
    if (arg === 'clear') {
        clear = true;
        break;
    }
}

requests.start(clear);

app.use(require('./src/routes/index'));
app.listen(process.env.PORT, process.env.IP);
console.log(`albionAPI listening on http://${process.env.IP}:${process.env.PORT}`);

process.on('SIGINT', onExit);
process.on('SIGTERM', onExit);
process.on('SIGUSR2', onExit);
process.on('exit', onExit);