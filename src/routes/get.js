const processRequest = require('../requests').processRequest;
const app = require('express')();

const script = 'api.albion.get';

app.get('/player*', (req, res, next) => {    
    req.body.script = script;
    processRequest(req, res);
});

app.get('/object*', (req, res, next) => {    
    req.body.script = script;
    processRequest(req, res);
});

app.get('/ship*', (req, res, next) => {    
    req.body.script = script;
    processRequest(req, res);
});

app.get('/station*', (req, res, next) => {    
    req.body.script = script;
    processRequest(req, res);
});

app.get('/*', (req, res) => {
    res.json({code: 404, message:'Not found'});
});

module.exports = app;