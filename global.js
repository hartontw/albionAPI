const fs = require('fs');
const path = require('path');
const package = require('./package')
const config = fs.existsSync('config.json') ? require('./config') : {};

process.env.npm_package_version = process.env.npm_package_version || package.version

process.env.IP = process.env.IP || config.ip || '127.0.0.1';
process.env.PORT = process.env.PORT || config.port || 8080;
process.env.TIME_OUT = process.env.TIME_OUT || config.timeout || 5000;
process.env.TICK = process.env.TICK || config.tick || 1000;
process.env.DEBUG = process.env.DEBUG || config.debug || 0;
process.env.ID = process.env.ID || config.id || 9999;
process.env.LOG_INDEX = process.env.LOG_INDEX || config.logIndex || 9;
if (process.env.LOG_INDEX.length * 1 === 'NaN' || process.env.LOG_INDEX.length > 1) {
    throw new Error('LOG_INDEX must be single digit');
}
process.env.GAME_TICK = process.env.GAME_TICK || config.gameTick;
process.env.GAME_DEBUG = process.env.GAME_DEBUG || config.gameDebug
process.env.GAME_LANG = process.env.GAME_LANG || config.gameLang;
process.env.GAME_PATH = process.env.GAME_PATH || config.gamePath || 'C:/Program Files (x86)/Steam/steamapps/common/x3 terran conflict';
process.env.DATA_PATH = process.env.DATA_PATH || config.dataPath || 'C:/Users/Default/Documents/Egosoft/X3AP';
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

String.prototype.srPad = function(length) {
    let str = this;
    while (str.length < length)
        str += ' ';
    return str;
}