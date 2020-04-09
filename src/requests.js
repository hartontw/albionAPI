const files = require('./files')
const fs = require('fs');
const limit = 9999;

let requests = [];
let length = 0;
let interval;

function addRequest(body) {
    for(let i=0; i<length; i++) {
        if (!requests[i]) {
            body.index = i;
            requests[i] = body;
            return;
        }
    }
    if (length > limit) {
        throw new Error(`How is even possible: albionAPI only can handle ${limit} requests at time`);
    }
    body.index = length;
    requests[length] = body;
    length++;
}

function sendRequest(body) {
    return new Promise( (resolve, reject) => {
        const now = new Date();

        body.time = now.getTime();
        addRequest(body);

        console.log(body);

        const filePath = files.getLogFilePath(body.index);
        fs.watchFile(filePath, {interval:TICK}, curr => {
            if (curr.mtime > now) {
                fs.unwatchFile(filePath);
                const text = fs.readFileSync(filePath, 'utf8');
                try {
                    console.log(text); //BORRAR
                    const json = JSON.parse(text);
                    resolve(json);
                }
                catch(err) {
                    reject({code:500, message:"Wrong JSON format"});
                }
                finally {
                    requests[body.index] = undefined;
                    fs.unlink(filePath, function(){});
                }
            }
        });
        setTimeout( () => {
            requests[body.index] = undefined;
            reject({code:503, message:`Time out for order ${body.index}`});
        }, process.env.TIME_OUT);
    });
}

function processRequest(req, res) {
    sendRequest(req.body)
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

function start(clear) {    
    if (!clear) {
        const languagePath = files.getLanguageFilePath();
        clear = !fs.existsSync(languagePath)
    }

    if (clear) {
        files.manageScripts(true);
        length = 0;
    }
    else {
        length = files.getPageLength();
    }

    files.writeXML('RUNNING', length);
    interval = setInterval(() => {
        files.writeXML('RUNNING', length, requests);
    }, TICK);
}

function stop() {
    if (interval) {
        clearInterval(interval);
        files.writeXML('STOPPED', length);
    }
}

module.exports = {
    processRequest,
    start,
    stop
};