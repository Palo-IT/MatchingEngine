var express = require('express'),
	app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    ent = require('ent'), 
    fs = require('fs'),
    cron = require('node-cron'),
    bodyParser = require('body-parser'),
    orderBook = [],
    ask = [],
    bid = [],
    txnHist = [],
    id = 0;

//Setting up json parson
app.use(bodyParser.json());

// Loading of index.html
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

//API post trade
app.post('/api/order-book', function (req, res) {
  pushTrade(req.body.price,req.body.volume,req.body.askbid);
  res.status(200).send("Trade saved");
});

app.get('/api/order-book', function(req, res){
	res.status(200).send(JSON.stringify(orderBook));
});


//When connecting to the socket
io.sockets.on('connection', function (socket) {
	// We update the order book every second
	cron.schedule('1-59 * * * * *', function(){
	  socket.broadcast.emit('orderBook',orderBook);
	});

	// When we receive a trade from one of the client, it is added to the order book
    socket.on('trade', function (price, volume, askbid) {
    	//Preventing XSS
        trade = ent.encode(price, volume, askbid);
       	//Pushing to the order book list
        pushTrade(price,volume,askbid);
    }); 
});

//This function pushes nicely a new trade to a javascript array
function pushTrade(price, volume, askbid){
	//We add a unique ID and timestamp 
	orderBook.push({'id':id,'price':price,'volume':volume,'askbid':askbid, 'time':(new Date()).getTime()});
	id++;
}

//Split order book into two arrays ask and bid
function splitOrderBook(){
	orderBook.forEach(function(element) {
	  if(element['askbid']=='ask'){
	  	ask.push(element);
	  }else{
	  	bid.push(element);
	  }
	});
}

//This functions compares two objects values
function compare(a,b) {
	if (a.price < b.price)
		return -1;
	if (a.price > b.price)
		return 1;
	if (a.price == b.price){
		if(a.time<b.time){
			return -1;
		}
		else{
			return 1;
		}
	}
return 0;
}

//Sort arrays in ascending prices
function sortOrderBook(){
	splitOrderBook();
	ask.sort(compare);
	bid.sort(compare);
	ask.forEach(function(element){
		console.log('\nID : ' + element.id +'\nPrice : '+element.price+'\nTime : '+element.time )
	});
}


function makeMatchings(){
	sortOrderBook();
}






server.listen(8080);
