//var app = require('express')();
var app = require('./app');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var orderBookController = require('./orderBookController');

//On connection
io.on('connection', orderBookController.connection);

//On trade POST on /
app.post('/', orderBookController.postTrade);

//Get index
app.get('/', orderBookController.index);

//API post trade
app.post('/api/order-book', orderBookController.postTrade);

//API call get order book
app.get('/api/order-book', orderBookController.getOrderBook);

//API call custom order book for Charts
app.get('/api/custom-order-book', orderBookController.getCustomOrderBook);

//API call get txn history
app.get('/api/transaction-history', orderBookController.getTxnHistory);


server.listen(3000);

module.exports = server;