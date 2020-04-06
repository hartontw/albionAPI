const fs = require('fs');
const path = require('path');
const getPageLength = require('./file').getPageLength;
const limit = 9999 - 1;

let length = getPageLength();
let entries = [];

function getLogFilePath(number) {
    const fileName = 'log9' + number.toString().zlPad(4) + '.txt';
    return path.join(process.env.DATA_PATH, fileName);
}

function addCommand(command) {
    for(let i=0; i<length; i++) {
        if (!entries[i]) {
            command.index = i;
            entries[i] = command;
            return;     
        }
    }
    if (length > limit) {
        throw new Error(`How is even possible: albionAPI only can handle ${limit} requests at time`);
    }
    command.index = length;
    entries[length] = command;
    length++;
}

function sendCommand(command) {
    return new Promise( (resolve, reject) => {
        addCommand(command);
        const now = new Date();
        command.time = now.getTime();
        const filePath = getLogFilePath(command.index);
        fs.watchFile(filePath, {interval:TICK}, (curr, prev) => {              
            if (curr.mtime >= now) {
                fs.unwatchFile(filePath);
                const text = fs.readFileSync(filePath, 'utf8');
                try {
                    console.log(text);
                    const json = JSON.parse(text);
                    resolve(json);
                }
                catch(err) {
                    reject({code:500, message:"Wrong JSON format"});
                }
                finally {
                    entries[command.index] = undefined;
                    fs.unlink(filePath, function(){});
                }
            }
        });
        setTimeout( () => {
            entries[command.index] = undefined;
            reject({code:503, message:`Time out for order ${command.index}`});
        }, process.env.TIME_OUT);
    });
}

function sendRequest(req, res, command) {
    command.title = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    command.description = req.headers['user-agent'];
    command.command = command.command.toLowerCase();    
    for(let i in command.args) {
        command.args[i] = command.args[i].toLowerCase();
    }
    sendCommand(command)
    .then(json => {
        res.set('Player-Name', json.meta.player);
        res.set('Playing-Time', json.meta.playingTime);
        res.json(json.error ? json.error : json.response);
    })
    .catch(err => {
        console.error(err);
        res.json(err);
    });
}

function reset() {
    length = 0;
    entries = [];
}

function get() {
    return entries;
}

function max() {
    return length
}

module.exports = {
    sendRequest,
    reset,
    get,
    max
};