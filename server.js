var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var orderBookController = require('./orderBookController');
io.on('connection', orderBookController.respond);

//Get index
app.get('/', orderBookController.index);

//API post trade
//app.post('/api/order-book', orderBookController.postTrade);

app.post('/api/order-book', function(req, res){
	orderBookController.postTrade(req,res);
});


//API call get order book
app.get('/api/order-book', orderBookController.getOrderBook);

//API call get txn history
app.get('/api/order-book', orderBookController.getTxnHistory);


server.listen(3000);