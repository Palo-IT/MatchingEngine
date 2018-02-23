var express = require('express'),
	app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    ent = require('ent'), 
    fs = require('fs'),
    cron = require('node-cron'),
    bodyParser = require('body-parser'),
    ask = [],
    bid = [],
    txnHistory = [],
    mktPrice = 0;
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

//API call get order book
app.get('/api/order-book', function(req, res){
	res.status(200).send(JSON.stringify(ask.concat(bid)));
});

//API call get txn history
app.get('/api/order-book', function(req, res){
	res.status(200).send(JSON.stringify(txnHistory));
});

//When connecting to the socket
io.sockets.on('connection', function (socket) {
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
        pushTrade(price,volume,askbid);
        //Emitting 
        socket.broadcast.emit('orderBook',bid.concat(ask));
    }); 
});

cron.schedule('*/1 * * * * *', function(){
	makeMatchings();
	const used = process.memoryUsage();
	console.log('\n------------------------\n------------------------\n');
	for (let key in used) {
		console.log(`${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
	}
});

//This function pushes nicely a new trade to a javascript array
function pushTrade(price, volume, askbid){
	//We add a unique ID and timestamp 
	if(askbid === 'ask'){
		ask.push({'id':id,'price':price,'volume':volume,'askbid':askbid, 'time':(new Date()).getTime()});
	}
	if(askbid === 'bid'){
		bid.push({'id':id,'price':price,'volume':volume,'askbid':askbid, 'time':(new Date()).getTime()});
	}
	id++;
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
	ask.sort(compare);
	bid.sort(compare);
}


function makeMatchings(){
	var volume = 0;
	//Sorting the orders
	sortOrderBook();
	if (typeof ask[0] !== 'undefined' && ask[0] !== null && typeof bid[bid.length-1] !== 'undefined' && bid[bid.length-1] !== null){
		//While there are possible matchings
		while(ask[0].price <= bid[bid.length-1].price){
			//Setting the volume of the match to the minimum of the two matching engine
			volume = Math.min(ask[0].volume, bid[bid.length-1].volume);
			//Pushing the new trade
			txnHistory.push({
				'price':(ask[0].price + bid[bid.length-1].price)/2,
				'volume' : volume,
				'askID' : ask[0].id,
				'bidID' : bid[bid.length-1].id
			});
			//Decrementing the volume
			ask[0].volume = ask[0].volume - volume;
			bid[bid.length-1].volume = bid[bid.length-1].volume - volume;
			//Removing the trade if the volume is equal to 0
			if(ask[0].volume + bid[bid.length-1].volume == 0){
				remove(ask, ask[0]);
				remove(bid, bid[bid.length-1]);
				if(ask.length == 0){break;}
				if(bid.length == 0){break;}
			}
			if(ask[0].volume == 0){
				remove(ask, ask[0]);
				if(ask.length == 0){break;}
			}
			if(bid[bid.length-1].volume == 0){
				remove(bid, bid[bid.length-1]);
				if(bid.length == 0){break;}
			}
			//Setting market price
			mktPrice = (ask[0].price + bid[bid.length-1].price)/2;
		}
	}
}

//Function that removes nicely a cell from an array
function remove(array, element) {
    const index = array.indexOf(element);
    if (index !== -1) {
        array.splice(index, 1);
    }
}




server.listen(8080);
