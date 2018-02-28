var app = require('express')();
var orderBookController = require('./orderBookController');
app.use('/', orderBookController.router);
module.exports = app;
