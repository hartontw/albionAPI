const fs = require('fs');
const path = require('path');

// METHODS //

function getEntries(filePath) {
    const text = fs.readFileSync(filePath, 'utf8');
    const lines = text.split('\n');
    const entries = [];
    for(let line of lines) {
        line = line.replace(/\s{2}/g, '\t');
        line = line.replace(/\t+/g, '\t');            
        line = line.replace(/ ?\t ?/g, '\t'); 
        const groups = line.match(/(\d+)\t(\d+)\t([^\t]+)\t(.+)/);    
        if (groups) {
            entries.push({
                main: groups[1],
                sub: groups[2],
                subName: `{${groups[4]}}`,
                class: `[${groups[3].trim()}]`,
                name: `'${groups[4].trim().toLowerCase()}'`
            });
        }
    }
    return entries;
}

function write(filePath, filter) {
    const entries = getEntries(filePath);
    console.log(entries);

    const sp = filter.split('-');

    const date = new Date();
    const month = date.toLocaleString(process.env.LANGUAGE || 'en', { month: 'long' });
    
    let file = '';
    file += '*************************************************\n';
    file += `* SCRIPT NAME: ${path.basename(filePath)}: ${sp[0]}-${sp[1]}\n`;
    file += '* DESCRIPTION: \n';
    file += '* \n';
    file += '* Auto generated with albionAPI\n';
    file += '* \n';
    file += `* AUTHOR: ${process.env.AUTHOR || ''}          DATE: ${date.getUTCDate()} ${month} ${date.getUTCFullYear()}\n`;
    file += '*************************************************\n\n';
    file += 'if not $filter\n'
    file += '$array = array alloc: size=0\n';


    for(let entry of entries) {       
        file += `append ${entry[sp[0]]} to array $array\n`;
    }
    file += 'return $array\n';
    for(let entry of entries) {        
        file += `else if $filter == ${entry[sp[0]]}\n`
        file += `return ${entry[sp[1]]}\n`
    }
    file += 'end\n';
    file += 'return null';
 
    const fileFolder = path.dirname(filePath);
    const fileName = path.basename(filePath, '.txt') + '_build.txt';    
    fs.writeFileSync(path.join(fileFolder, fileName), file);

}

// MAIN //

let filePath, filter;
for(let arg of process.argv) {
    if (path.extname(arg) === '.txt') {
        filePath = arg;
    }
    else if (arg.match(/[nbse]-[mscn]/)) {
        filter = arg;
    }
}
if (!filePath) {
    console.log('TXT file is needed as param');
    return;
}
if (!filter) {
    console.log('Filter is required, combinations of main, sub, class, name. Ex: name-sub');
    return;
}

write(filePath, filter);
//https://forum.egosoft.com/viewtopic.php?t=292613