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

//Trade object constructor
function Trade(price, volume, id, side){
    this.price = price;
    this.volume = volume;
    this.time = (new Date()).getTime();
    this.id = id;
    this.side = side;
}

//Transaction object constructor
function Txn(price,volume, askID,bidID){
	this.askID = askID;
	this.bidID = bidID;
	this.price = price;
	this.volume = volume;
	this.time = (new Date()).getTime();
}

//Main matching algorithm
function makeMatchings(ask,bid, txnHistory, mktPrice){
	//console.time('Make Matchings');
	var volume = 0;
	if ((typeof(ask[0]) != 'undefined') && (ask[0] != null) && (typeof(bid[bid.length-1]) != 'undefined') && (bid[bid.length-1] != null)){
		//While there are possible matchings
		while(ask[0].price <= bid[bid.length-1].price){
			//Setting the volume of the match to the minimum of the two matching engine
			volume = Math.min(ask[0].volume, bid[bid.length-1].volume);
			//Pushing the new trade
			txnHistory.push(new Txn((ask[0].price + bid[bid.length-1].price)/2, volume,ask[0].id, bid[bid.length-1].id));
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
	//console.timeEnd("Make Matchings");
}

//Function that removes nicely a cell from an array
function remove(array, element) {
    const index = array.indexOf(element);
    if (index !== -1) {
        array.splice(index, 1);
    }
}

module.exports = {
  makeMatchings: makeMatchings,
  Trade:Trade,
  Txn:Txn,
  compare:compare,
  remove:remove
}