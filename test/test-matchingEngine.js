const assert = require('chai').assert;
const matchingEngine = require('../matchingEngine');


var trade1 = new matchingEngine.Trade(1, 1, 0, 'ask');
var trade2 = new matchingEngine.Trade(2, 1, 1, 'bid');
var txn = new matchingEngine.Txn(1, 1, 0, 1);

describe('matchingEngine', function(){
	it('compare should return -1 or 1 or 0', function(){
		let result = matchingEngine.compare(trade2, trade1);
		assert.typeOf(result, 'number');
	});
	it('compare should return 1', function(){
		let result = matchingEngine.compare(trade2, trade1);
		assert.equal(result, 1);
	});

});