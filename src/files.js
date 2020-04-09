const fs = require('fs');
const path = require('path');
const translates = fs.existsSync(`./translates/${process.env.GAME_LANG}`) 
    ? require(`./translates/${process.env.GAME_LANG}`) 
    : require('./translates/44');

function getShortVersion(version) {
    const groups = version.match(/(\d+)\.(\d)\.(\d)/);
    return groups[1] * 100 + groups[2] * 10 + groups[3] * 1;
}

const longVersion = process.env.npm_package_version;
const shortVersion = getShortVersion(longVersion);

function getLogFilePath(index) {
    const fileName = 'log' + process.env.LOG_INDEX + index.toString().zlPad(4) + '.txt';
    return path.join(process.env.DATA_PATH, fileName);
}

function getLanguageFilePath() {
    const lang = process.env.GAME_LANG;
    const sufix = lang && lang != 44 ? '-L' + lang.toString().zlPad(3) : '';
    const fileName = `${process.env.ID}${sufix}.xml`;
    return path.join(process.env.GAME_PATH, 't', fileName);
}

function getPageLength() {
    const languagePath = getLanguageFilePath();
    if (fs.existsSync(languagePath)) {
        const text = fs.readFileSync(languagePath, 'utf8');
        const pages = [...text.matchAll(/<page id="\d+"/)];
        return pages.length - 1;
    }
    return 0;
}

function writeXML(state, max, requests = []) {
    let xml = '<?xml version="1.0" encoding="utf-8" ?>\n';    
    xml += `<language id="${process.env.GAME_LANG || 44}">\n`;

    xml += `<page id="1" title="albionAPI" descr="State, settings and logs">\n`;
    xml += `<t id="1">${state}</t>\n`;
    if (process.env.GAME_TICK) {
        xml += `<t id="2">${process.env.GAME_TICK}</t>\n`;
    }
    if (process.env.GAME_DEBUG) {
        xml += `<t id="3">${process.env.GAME_DEBUG}</t>\n`;
    }
    xml += `<t id="4">[author][yellow]albionAPI ${longVersion}[/yellow][/author]</t>\n`;
    xml += `<t id="5">\\033YalbionAPI\\033X</t>\n`;
    xml += `<t id="6">\\n</t>\n`;
    xml += `<t id="7">\\033A%s\\033X</t>\n`;
    xml += `<t id="8">\\033O%s\\033X</t>\n`;
    xml += `<t id="9">\\033M%s\\033X</t>\n`;
    xml += `<t id="10">\\033C%s\\033X</t>\n`;
    xml += `<t id="11">\\033R%s\\033X</t>\n`;
    xml += `<t id="12">\\033Y%s\\033X</t>\n`;
    xml += `<t id="13">\\033G%s\\033X</t>\n`;
    xml += `<t id="14">\\033W%s\\033X</t>\n`;
    xml += `<t id="15">\\033B%s\\033X</t>\n`;
    let id = 16;
    for(let t in translates) {
        xml += `<t id="${id++}">${translates[t]}</t>\n`;
    }
    xml += '</page>\n';

    for(let i=0; i<max; i++) {
        if (requests[i]) {
            xml += `<page id="${i+2}" title="${requests[i].title}" descr="${requests[i].description}">\n`;
            xml += `<t id="1">${requests[i].time}</t>\n`;
            xml += `<t id="2">${process.env.LOG_INDEX}${requests[i].index.toString().zlPad(4)}</t>\n`;
            xml += `<t id="3">${requests[i].script}</t>\n`;
            for(let a in requests[i].args) {
                xml += `<t id="${a*1+4}">${requests[i].args[a]}</t>\n`;
            }
        }
        else {
            xml += `<page id="${i+2}" title="" descr="">\n`;
            xml += `<t id="1"></t>\n`;
        }
        xml += '</page>\n';
    }

    xml += '</language>';
    fs.writeFileSync(getLanguageFilePath(), xml);
}

function manageScripts(overwrite) {
    const scriptsPath = path.join(process.env.GAME_PATH, 'scripts');
    let scripts = fs.readdirSync(scriptsPath);
    for(let script of scripts) {
        if (script.match(/^api\.albion/)) {
            fs.unlinkSync(path.join(scriptsPath, script));
        }
    }

    scripts = fs.readdirSync('scripts');
    for(let script of scripts) {        
        const scriptPath = path.join('scripts', script);
        if (path.extname(script) === '.xml') {
            let file = fs.readFileSync(scriptPath, 'utf8');
            file = file.replace(/<version>\d+<\/version>/, `<version>${shortVersion}</version>`)
            fs.writeFileSync(path.join(scriptsPath, script), file);
            if (overwrite) {
                fs.writeFileSync(scriptPath, file);
            }
        }
        else {
            fs.unlinkSync(scriptPath);
        }
    }
}

module.exports = {
    getLogFilePath,
    getLanguageFilePath,
    getPageLength,
    writeXML,
    manageScripts,
    translate: key => translates[key]
};