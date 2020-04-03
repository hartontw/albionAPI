const command = require('../src/command');
const express = require('express');
const app = express();

app.get("/player", (req, res, next) => {
    command.sendRequest(req, res, {
        command:'api.albion.get.player',
        args: [
            'ship'
        ]
    });
});

module.exports = app;