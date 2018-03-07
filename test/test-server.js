const assert = require('chai').assert;
var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();
chai.use(chaiHttp);
var request = require("request");
var expect  = require("chai").expect;

describe('orderBookController', function(){
	//Test the GET on /
	it('should return index page on / GET', function(done) {
		var url = 'http://localhost:3000/';
		request.get(url, function(err, res, body){
	    if (err) {
	      done(err);
	      return;
	    }
	    assert.equal(200, res.statusCode);
	    done();
	  });
	});

	//Test the POST trade on /api/order-book
	it('should add a trade to the order book on /api/order-book POST', function(done){
		var postData = {
		  headers: { 
		  	'Postman-Token': 'd7e31d85-fb68-1b7e-e7a4-d27e8f99a9ba',
	     	'Cache-Control': 'no-cache',
	     	'Content-Type': 'application/json' 
	     },
		 url : 'http://localhost:3000/api/order-book',
		 body: { 
		 	price: 10, 
		  	volume: 1, 
		  	askbid: 'bid' 
		  },
		  json: true 
		};

		request.post(postData, function(err, res, body){
			if(err){
				done(err);
				return;
			}
			assert.equal(202, res.statusCode);
		  	assert.equal('Trade created', body);
	    	done();
		});
	});

	//Test GET on /api/order-book
	it('Should return the orderbook in JSON format on /api/order-book GET ', function(done){
		var url = 'http://localhost:3000/api/order-book';
		request.get(url, function(err, res, body){
	    	if (err) {
	      		done(err);
	      		return;
	    	}
	    	assert.equal(200, res.statusCode);
	    	expect(res).to.be.json;
	    	done();
	  	});
	});

	//Test GET on /api/transaction-history
	it('Should return the transaction history in JSON format on /api/transaction-history GET ', function(done){
		var url = 'http://localhost:3000/api/transaction-history';
		request.get(url, function(err, res, body){
	    	if (err) {
	      		done(err);
	      		return;
	    	}
	    	assert.equal(200, res.statusCode);
	    	expect(res).to.be.json;
	    	done();
	  	});
	});
});