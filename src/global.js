const path = require('path');
const fs = require('fs');

const config = fs.existsSync('config.json') ? JSON.parse(fs.readFileSync('config.json', 'utf8')) : {};
process.env.IP = process.env.IP || config.ip || '127.0.0.1';
process.env.PORT = process.env.PORT || config.port || 8080;
process.env.TIME_OUT = process.env.TIME_OUT || config.timeout || 5000;
process.env.TICK = process.env.TICK || config.tick || 1000;
process.env.DEBUG = process.env.DEBUG || config.debug || 0;
process.env.GAME_TICK = process.env.GAME_TICK || config.gameTick
process.env.GAME_DEBUG = process.env.GAME_DEBUG || config.gameDebug
process.env.GAME_PATH = process.env.GAME_PATH || config.gamePath || 'C:/Program Files (x86)/Steam/steamapps/common/x3 terran conflict';
process.env.DATA_PATH = process.env.DATA_PATH || config.dataPath || 'C:/Users/Default/Documents/Egosoft/X3AP';
process.env.LANGUAGE = process.env.LANGUAGE || config.language;
process.env.ADDON = process.env.ADDON || config.addon;
if (process.env.ADDON) {
    process.env.GAME_PATH = path.join(process.env.GAME_PATH, 'addon');
}

global.TICK = parseInt(process.env.TICK, 10);

String.prototype.zlPad = function(length) {
    let str = this;
    while (str.length < length)
        str = '0' + str;
    return str;
}