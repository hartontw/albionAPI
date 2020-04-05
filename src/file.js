const fs = require('fs');
const path = require('path');

function getLanguageFilePath() {
    const sufix = process.env.LANGUAGE ? '-L' + process.env.LANGUAGE.toString().zlPad(3) : '';
    const fileName = '9999' + sufix + '.xml';
    return path.join(process.env.GAME_PATH, 't', fileName);
}

function getPageLength() {
    const languagePath = getLanguageFilePath();
    if (fs.existsSync(languagePath)) {
        const text = fs.readFileSync(languagePath, 'utf8');
        const pages = [...text.matchAll(/<page id="\d+"/)];
        return pages.length;
    }
    return 0;
}

function writeXML(state, max, entries = []) {
    let xml = '<?xml version="1.0" encoding="utf-8" ?>\n';    
    xml += `<language id="${process.env.LANGUAGE || 44}">\n`;
    xml += `<page id="1" title="DATA" descr="">\n`;
    xml += `<t id="1">${state}</t>\n`;
    if (process.env.GAME_TICK) {
        xml += `<t id="2">${process.env.GAME_TICK}</t>\n`;
    }
    if (process.env.GAME_DEBUG) {
        xml += `<t id="3">${process.env.GAME_DEBUG}</t>\n`;
    }
    xml += '</page>\n';
    for(let i=0; i<max; i++) {
        if (entries[i]) {
            xml += `<page id="${i+2}" title="${entries[i].title}" descr="${entries[i].description}">\n`;
            xml += `<t id="1">${entries[i].time}</t>\n`;
            xml += `<t id="2">9${entries[i].index.toString().zlPad(4)}</t>\n`;
            xml += `<t id="3">${entries[i].command}</t>\n`;
            for(let a in entries[i].args) {
                xml += `<t id="${a*1+4}">${entries[i].args[a]}</t>\n`;
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

function manageScripts() {
    const scriptPath = path.join(process.env.GAME_PATH, 'scripts');
    let scripts = fs.readdirSync(scriptPath);
    for(let script of scripts) {
        if (script.match(/^api\.albion/)) {
            fs.unlinkSync(path.join(scriptPath, script));
        }
    }
    scripts = fs.readdirSync('scripts');
    for(let script of scripts) {
        fs.copyFileSync(path.join('scripts', script), path.join(scriptPath, script));
    }
}

module.exports = {
    getPageLength,
    writeXML,
    manageScripts
};