const assert = require('chai').assert;
const orderBookController = require('../orderBookController');

var req;
req.body.price = 12;
req.body.volume = 1;
var id = 0;

describe('orderBookController', function(){
	it('', function(){
		let result = orderBookController.postTrade(req, res);
		//assert.typeOf(result, 'number');
	});
});