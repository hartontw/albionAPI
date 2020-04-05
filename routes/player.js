const sendRequest = require('../src/command').sendRequest;
const express = require('express');
const app = express();

const command = 'api.albion.get.player';

app.get("/player", (req, res) => {
    sendRequest(req, res, { command });
});

app.get("/player/fight", (req, res) => {
    sendRequest(req, res, { command, args: ['ship'] });
});

app.get("/player/ship", (req, res) => {
    sendRequest(req, res, { command, args: ['ship'] });
});

app.get("/player/mongo", (req, res) => {
    sendRequest(req, res, { command, args: ['mongo'] });
});

module.exports = app;