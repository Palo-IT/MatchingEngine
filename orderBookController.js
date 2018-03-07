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
function index(req, res) {
  res.status(200).sendFile(__dirname + '/index.html');
};

//Posting a trade
function postTrade(req, res) {
	if(req.body.askbid==='ask')
  		ask.push(new matchingEngine.Trade(req.body.price, req.body.volume, id, 'ask'));
  	if(req.body.askbid==='bid')
  		bid.push(new matchingEngine.Trade(req.body.price, req.body.volume, id, 'bid'));
  	id++;
  	res.status(202).send("Trade created");
};


//Returns the order book in JSON format
function getOrderBook(req, res){
	res.set('Content-Type', 'application/json');
	res.status(200).send(JSON.stringify(ask.concat(bid)));
};

//Returns the transaction history in JSON format
function getTxnHistory(req, res){
	res.set('Content-Type', 'application/json');
	res.status(200).send(JSON.stringify(txnHistory));
};

/*Cron job that emits the order book, the transaction history and the market price
to all clients trough a socket every second */
function connection(io){
	// We update the order book every second
	cron.schedule('1-59 * * * * *', function(){
	  io.broadcast.emit('orderBook',bid.concat(ask));
	  io.broadcast.emit('txnHistory',txnHistory);
	  io.broadcast.emit('mktPrice', mktPrice);
	});
}

//Pushes the trade in the order book when a trade event is triggered
function trade(io, price, volume, askbid){
   	//Pushing to the order book list
    if(askbid === 'ask'){
    	ask.push(new matchingEngine.Trade(price, volume, id,'ask'));
    }
    if(askbid === 'bid'){
    	bid.push(new matchingEngine.Trade(price, volume, id, 'bid'));
    }
    //Emitting 
	io.broadcast.emit('orderBook',bid.concat(ask));
}

//Main cron job that calls the matching engine 
cron.schedule('*/1 * * * * *', function(){
	matchingEngine.makeMatchings(ask, bid, txnHistory, mktPrice);
	const used = process.memoryUsage();
	//console.log('\n------------------------\n------------------------\n');
	for (let key in used) {
		//console.log(`${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
	}
});


module.exports.router = router;

module.exports = {
  router:router,
  trade:trade,
  connection:connection,
  getTxnHistory:getTxnHistory,
  getOrderBook:getOrderBook,
  postTrade:postTrade,
  index:index
}