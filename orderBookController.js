var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
var cron = require('node-cron');
var txnHistory = [],
	ask = [],
	bid = [],
    mktPrice = 0;
	id = 0;

var matchingEngine = require('./matchingEngine');


//Returns the index page
module.exports.index = function (req, res) {
  res.sendFile(__dirname + '/index.html');
};

//Posting a trade
module.exports.postTrade = function (req, res) {
	if(req.body.askbid==='ask')
  		ask.push(new matchingEngine.Trade(req.body.price, req.body.volume, id));
  	if(req.body.askbid==='bid')
  		bid.push(new matchingEngine.Trade(req.body.price, req.body.volume, id));
  	id++;
  	res.status(202).send("Trade created");
};

//Returns the order book in JSON format
module.exports.getOrderBook = function(req, res){
	res.status(200).send(JSON.stringify(ask.concat(bid)));
};

//Returns the transaction history in JSON format
module.exports.getTxnHistory =  function(req, res){
	res.status(200).send(JSON.stringify(txnHistory));
};


/*

module.exports.respond = function(io){
    // this function expects a socket_io connection as argument
    // now we can do whatever we want:
    io.on('connection', function (socket) {
		// We update the order book every second
		cron.schedule('1-59 * * * * *', function(){
		  socket.broadcast.emit('orderBook',bid.concat(ask));
		  socket.broadcast.emit('txnHistory',txnHistory);
		  socket.broadcast.emit('mktPrice', mktPrice);
		});

		// When we receive a trade from one of the client, it is added to the order book
	    socket.on('trade', function (price, volume, askbid) {
	    	//Preventing XSS
	        trade = ent.encode(price, volume, askbid);
	       	//Pushing to the order book list
	        if(askbid === 'ask'){
	        	ask.push(new matchingEngine.Trade(price, volume, id));
	        }
	        if(askbid === 'bid'){
	        	bid.push(new matchingEngine.Trade(price, volume, id));
	        }
	        //Emitting 
        	socket.broadcast.emit('orderBook',bid.concat(ask));
    	}); 
	});
}
*/


module.exports.connection = function(io){
    // this function expects a socket_io connection as argument
    // now we can do whatever we want:
		// We update the order book every second
		cron.schedule('1-59 * * * * *', function(){
		  io.broadcast.emit('orderBook',bid.concat(ask));
		  io.broadcast.emit('txnHistory',txnHistory);
		  io.broadcast.emit('mktPrice', mktPrice);
		});

		// When we receive a trade from one of the client, it is added to the order book
	    io.on('trade', function (price, volume, askbid) {
	    	//Preventing XSS
	        trade = ent.encode(price, volume, askbid);
	       	//Pushing to the order book list
	        if(askbid === 'ask'){
	        	ask.push(new matchingEngine.Trade(price, volume, id));
	        }
	        if(askbid === 'bid'){
	        	bid.push(new matchingEngine.Trade(price, volume, id));
	        }
	        //Emitting 
        	io.broadcast.emit('orderBook',bid.concat(ask));
    	}); 
}

//When connecting to the socket



cron.schedule('*/1 * * * * *', function(){
	matchingEngine.makeMatchings(ask, bid, txnHistory, mktPrice);
	const used = process.memoryUsage();
	//console.log('\n------------------------\n------------------------\n');
	for (let key in used) {
		//console.log(`${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
	}
});


module.exports.router = router;

