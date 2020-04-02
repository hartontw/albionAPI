require('./global');
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const limit = 9999;
const hostName = process.env.IP+':'+process.env.PORT;
const tick = parseInt(process.env.TICK, 10);

let interval
let max = getMaxPage();
let commands = [];

function getMaxPage() {
    const languagePath = getLanguageFilePath();
    if (fs.existsSync(languagePath)) {
        const text = fs.readFileSync(languagePath, 'utf8');
        const pages = [...text.matchAll(/<page id="\d+"/)];
        return pages.length;
    }
    return 0;
}

function manageScripts() {
    const scriptPath = path.join(process.env.GAME_PATH, 'scripts');

    let scripts = fs.readdirSync(scriptPath);
    for(let script of scripts) {
        if (script.match(/^api\.terran/)) {
            fs.unlinkSync(path.join(scriptPath, script));
        }
    }

    scripts = fs.readdirSync('scripts');
    for(let script of scripts) {
        fs.copyFileSync(path.join('scripts', script), path.join(scriptPath, script));
    }
}

function writeXML(entries) {
    const stop = !entries
    let xml = '<?xml version="1.0" encoding="utf-8" ?>\n';    
    xml += `<language id="${process.env.LANGUAGE || 44}">\n`;
    for(let i=0; i<max; i++) {
        if (stop) {
            xml += `<page id="${i+1}" title="${hostName}" descr="STOP">\n`;
            xml += `<t id="1">${new Date().getTime()}</t>\n`;
            xml += `<t id="2">0</t>\n`;
        }
        else if (entries[i]) {
            xml += `<page id="${i+1}" title="${entries[i].title}" descr="${entries[i].description}">\n`;
            xml += `<t id="1">${new Date().getTime()}</t>\n`;
            xml += `<t id="2">9${entries[i].index.toString().zlPad(4)}</t>\n`;
            xml += `<t id="3">${entries[i].command}</t>\n`;
            for(let a in entries[i].args) {
                xml += `<t id="${a*1+4}">${entries[i].args[a]}</t>\n`;
            }
        }
        else {
            xml += `<page id="${i+1}" title="" descr="">\n`;
            xml += `<t id="1"></t>\n`;
        }
        xml += '</page>\n';
    }
    xml += '</language>';
    fs.writeFileSync(getLanguageFilePath(), xml);
}

function onStart() {
    for(let arg of process.argv) {
        if (arg === 'clear') {
            manageScripts();
            max = 0;
        }
        else if (arg === 'scripts') {
            manageScripts();
        }
        else if(arg === 'file') {
            max = 0;
        }        
    }
    writeXML([]);
}

function onExit() {
    let closing = false;
    const handler = code => {
        if (!closing) { 
            closing = true;   
            if (interval) {
                clearInterval(interval);
            }
            writeXML();
            process.exit(0);
        }
    };
    process.on('SIGINT', handler);
}

function addCommand(command) {
    for(let i=0; i<max; i++) {
        if (!commands[i]) {
            command.index = i;
            commands[i] = command;
            return;     
        }
    }
    if (max > limit) {
        throw new Error(`How is even possible: terranAPI only can handle ${limit} requests at time`);
    }
    command.index = max;
    commands[max] = command;
    max++;
}

function sendCommand(command) {
    return new Promise( (resolve, reject) => {
        addCommand(command);
        const now = new Date();
        const filePath = getLogFilePath(command.index);
        fs.watchFile(filePath, {interval:tick}, (curr, prev) => {              
            if (curr.mtime >= now) {
                fs.unwatchFile(filePath);
                const text = fs.readFileSync(filePath, 'utf8');
                try {
                    const json = JSON.parse(text);
                    resolve(json);
                }
                catch(err) {
                    reject({code:err});
                }
                finally {
                    commands[command.index] = undefined;
                    fs.unlink(filePath, function(){});
                }
            }
        });
        setTimeout( () => {
            commands[command.index] = undefined;
            reject({code:`Time out for order ${command.index}`});
        }, process.env.TIME_OUT);
    });
}

function sendRequest(req, res, command) {
    command.title = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    command.description = req.headers['user-agent'];
    sendCommand(command)
    .then(json => {
        res.json(json);
    })
    .catch(err => {
        console.error(err);
        res.json(err);
    });
}

onStart();
onExit();

app.listen(process.env.PORT, process.env.IP);
console.log(`terranAPI listening on http://${hostName}`);

app.get("/player", (req, res, next) => {
    sendRequest(req, res, {
        command:'api.terran.get.player',
        args: [
            'ship'
        ]
    });
});

interval = setInterval(() => {
    writeXML(commands);
}, tick);

// http://192.168.1.48:8080/player;