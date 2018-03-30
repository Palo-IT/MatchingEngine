var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
var cron = require('node-cron');
var txnHistory = [];
var ask = [];
var	bid = [];
var mktPrice = 0;
var id = 0;

var matchingEngine = require('./matchingEngine');
//Returns the index page
function index(req, res) {
  res.status(200).sendFile(__dirname + '/index.html');
};

//Validate trade
function validateTrade(price, side){
  if(price>=0 && (side === 'ask'|| side === 'bid'))
    return 1;
  else 
    return 0;
}


/*

//Following function might be more efficient that the native javascript sort function

here is a other implementation guide 

http://blog.benoitvallon.com/sorting-algorithms-in-javascript/the-quicksort-algorithm/

https://github.com/benoitvallon/computer-science-in-javascript/tree/master/sorting-algorithms-in-javascript

function insert(element, array) {
  array.splice(locationOf(element, array), 0, element);
  return array;
}

function locationOf(element, array, start, end) {
  start = start || 0;
  end = end || array.length;
  //var pivot = parseInt(start + (end - start) / 2, 10);
  var pivot = Math.floor(start + (end - start)/2);
  console.log('pivot : ', pivot);
  if (end-start <= 1 || array[pivot].price === element.price) 
    return pivot;
  if (array[pivot].price < element.price) {
    return locationOf(element, array, pivot, end);
  } else {
    return locationOf(element, array, start, pivot);
  }
}
*/





//Posting a trade
function postTrade(req, res){
  var price = parseFloat(req.body.price);
	if(req.body.askbid === 'ask' && validateTrade(req.body.price, req.body.askbid))
  {
    ask.push(new matchingEngine.Trade(price, req.body.volume, id, 'ask'));
    ask.sort(matchingEngine.compare);
  }
  if(req.body.askbid === 'bid' && validateTrade(req.body.price, req.body.askbid))
  {
    bid.push(new matchingEngine.Trade(price, req.body.volume, id, 'bid'));
    bid.sort(matchingEngine.compare);
  }
  id++;
  return res.status(202).send("Trade created");
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
  connection:connection,
  getTxnHistory:getTxnHistory,
  getOrderBook:getOrderBook,
  postTrade:postTrade,
  index:index
}