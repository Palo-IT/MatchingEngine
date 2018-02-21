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
	res.status(200).send(JSON.stringify(ask.concat(bid)));
});


//When connecting to the socket
io.sockets.on('connection', function (socket) {
	// We update the order book every second
	cron.schedule('1-59 * * * * *', function(){
	  socket.broadcast.emit('orderBook',ask.concat(bid));
	  socket.broadcast.emit('txnHistory',txnHistory);
	});

	// When we receive a trade from one of the client, it is added to the order book
    socket.on('trade', function (price, volume, askbid) {
    	//Preventing XSS
        trade = ent.encode(price, volume, askbid);
       	//Pushing to the order book list
        pushTrade(price,volume,askbid);
        //Emitting 
        socket.broadcast.emit('orderBook',ask.concat(bid));
    }); 
});

cron.schedule('*/10 * * * * *', function(){
	makeMatchings();
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
	sortOrderBook();
	if (typeof ask[0] !== 'undefined' && ask[0] !== null && typeof bid[bid.length-1] !== 'undefined' && bid[bid.length-1] !== null){
		try{
			while(ask[0].price <= bid[bid.length-1].price){
				txnHistory.push({
					'price':(ask[0].price + bid[bid.length-1].price)/2,
					'volume' : Math.min(ask[0].volume, bid[bid.length-1].volume),
					'askID' : ask[0].id,
					'bidID' : bid[bid.length-1].id
				});
				ask[0].volume = ask[0].volume - Math.min(ask[0].volume, bid[bid.length-1].volume);
				bid[bid.length-1].volume = bid[bid.length-1].volume - Math.min(ask[0].volume, bid[bid.length-1].volume);
				if(ask[0].volume == 0){
					remove(ask, ask[0]);
					//ask.splice(0,1);
				}
				if(bid[bid.length-1] == 0){
					remove(bid, bid[bid.length-1]);
					//bid.splice(bid.length-1,1);
				}
			}
		}catch(error){
			
		}
		
	}
}

function remove(array, element) {
    const index = array.indexOf(element);
    if (index !== -1) {
        array.splice(index, 1);
    }
}




server.listen(8080);
