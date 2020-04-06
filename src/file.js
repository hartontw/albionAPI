const fs = require('fs');
const path = require('path');

function getLanguageFilePath() {
    const sufix = process.env.GAME_LANG ? '-L' + process.env.GAME_LANG.toString().zlPad(3) : '';
    const fileName = `${process.env.ID}${sufix}.xml`;
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
    xml += `<language id="${process.env.GAME_LANG || 44}">\n`;
    xml += `<page id="1" title="DATA" descr="">\n`;
    xml += `<t id="1">${state}</t>\n`;
    if (process.env.GAME_TICK) {
        xml += `<t id="2">${process.env.GAME_TICK}</t>\n`;
    }
    if (process.env.GAME_DEBUG) {
        xml += `<t id="3">${process.env.GAME_DEBUG}</t>\n`;
    }
    xml += `<t id="4">[author][yellow]albionAPI ${process.env.npm_package_version}[/yellow][/author]</t>\n`;
    xml += '<t id="5">ID         \\t%s[br/]State      \\t%s%s[br/]Tick       \\t%s[br/]Debug      \\t%s</t>\n';
    xml += '<t id="6">Called     \\t[green]%s[/green][br/]Failed     \\t[red]%s[/red][br/]Total      \\t%s[br/]Max Traffic\\t%s</t>\n';
    xml += '<t id="7">\\033YalbionAPI\\033X</t>\n';
    xml += '<t id="8">\\nState %s\\nCalled \\033G%s\\033X\\nFailed \\033R%s\\033X</t>\n';
    xml += '<t id="9">: %s C:\\033G%s\\033XF:\\033R%s\\033X</t>\n';
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
    const version = process.env.npm_package_version.match(/^\d+/g)[0];
    scripts = fs.readdirSync('scripts');
    for(let script of scripts) {
        let file = fs.readFileSync(path.join('scripts', script), 'utf8');
        file = file.replace(/<version>\d+<\/version>/, `<version>${version}</version>`)
        fs.writeFileSync(path.join(scriptPath, script), file);        
        //fs.copyFileSync(path.join('scripts', script), path.join(scriptPath, script));
    }
}

module.exports = {
    getPageLength,
    writeXML,
    manageScripts
};