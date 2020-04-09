const express = require('express');
const app = express();

function getArgs(url) {
    const query = url.split('/');
    query.shift();

    const args = [];
    for(let part of query) {
        part = part.replace('%20', ' ').toLowerCase();
        args.push(...part.split(';'));
    }
    
    return args;
}

app.use((req, res, next) => {
    req.body = {
        title: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        description: req.headers['user-agent'],        
        args: getArgs(req.url)
    };
    next();
});
app.use(require('./get'));

module.exports = app;