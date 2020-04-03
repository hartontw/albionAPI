const express = require('express');
const app = express();

app.use(require('./player'));
app.use(require('./race'));
app.use(require('./ship'));
app.use(require('./station'));
app.use(require('./ware'));

app.get('/*', (req, res) => {
    res.json({code: 404});
});

module.exports = app;