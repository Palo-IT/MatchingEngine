const assert = require('chai').assert;
var chai = require('chai');
var chaiHttp = require('chai-http');
const server = require('../server');
var should = chai.should();
chai.use(chaiHttp);

describe('orderBookController', function(){
	it('should return index page on / GET', function(){
		chai.request(server)
	    .get('/')
	    .end(function(err, res){
	      res.should.have.status(200);
	      done();
	  });

	});
	it('should add a trade do the order book on /api POST', function(){

	});
	it('Should return the orderbook in JSON format on /api/order-book GET ', function(){

	});
	it('Should return the transaction history in JSON format on /api/transaction-history GET ', function(){

	});

});