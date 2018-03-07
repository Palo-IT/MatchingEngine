const assert = require('chai').assert;
var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();
chai.use(chaiHttp);
var request = require("request");
var expect  = require("chai").expect;

describe('orderBookController', function(){
	it('should return index page on / GET', function(done) {
	  request.get('http://localhost:3000/', function(err, res, body){
	    if (err) {
	      done(err);
	      return;
	    }
	    assert.equal(201, res.statusCode);
	    done();
	  });
	});

	it('should add a trade to the order book on /api POST', function(){

	});
	it('Should return the orderbook in JSON format on /api/order-book GET ', function(){

	});
	it('Should return the transaction history in JSON format on /api/transaction-history GET ', function(){

	});

});