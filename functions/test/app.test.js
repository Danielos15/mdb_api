const app = require('../app');
const request = require('supertest');
const expect = require('chai').expect;

const dto = require('../mocks/dto.mock');
const facebook = require('../mocks/facebook_request.mock');
const TMDBRequest = require('../mocks/tmdb_request.mock');

let admin = require('../mocks/firebase.mock');

let server = app(admin, dto, facebook, TMDBRequest);

describe('API Tests', () => {
	describe('Request at /movies', () => {
		it('Return a list of Movies', () => {
			return request(server)
				.get('/movies')
				.expect(200)
				.then(res => {
					expect(res.text).to.be.an('string');
				});
		});
	});

	describe('Request at /movies/550', () => {
		it('Return a single Movie', () => {
			return request(server)
				.get('/movies/550')
				.expect(200)
				.then(res => {
					expect(res.text).to.be.an('string');
				});
		});
	});

	describe('Request at /movies/500', () => {
		it('Return 404 error if movie does not exist', () => {
			return request(server)
				.get('/movies/500')
				.expect(404)
				.catch(err => {
					expect(err.text).to.be.an('string');
				});
		});
	});

	describe('Request at /movies/525', () => {
		it('Return 400 error if json can not be parsed', () => {
			return request(server)
				.get('/movies/525')
				.expect(400)
				.catch(err => {
					expect(err).to.be.an('string');
				});
		});
	});

	describe('Request at /tv', () => {
		it('Return a list of Tv Shows', () => {
			return request(server)
				.get('/tv')
				.expect(200)
				.then(res => {
					expect(res.text).to.be.an('string');
				});
		});
	});

	describe('Request at /tv/1418', () => {
		it('Return a single Tv Show', () => {
			return request(server)
				.get('/tv/1418')
				.expect(200)
				.then(res => {
					expect(res.text).to.be.an('string');
				});
		});
	});

	describe('Request at /tv/500', () => {
		it('Return 404 error if movie does not exist', () => {
			return request(server)
				.get('/tv/500')
				.expect(404)
				.catch(err => {
					expect(err.text).to.be.an('string');
				});
		});
	});

	describe('Request at /tv/525', () => {
		it('Return 400 error if json can not be parsed', () => {
			return request(server)
				.get('/tv/525')
				.expect(400)
				.catch(err => {
					expect(err).to.be.an('string');
				});
		});
	});

	describe('Request at /tv/1418/8', () => {
		it('Return a list of seasons for Tv Show', () => {
			return request(server)
				.get('/tv/1418/8')
				.expect(200)
				.then(res => {
					expect(res.text).to.be.an('string');
				});
		});
	});

	describe('Request at /search/movies/matrix', () => {
		it('Return a list of Movies after search', () => {
			return request(server)
				.get('/search/movies/matrix')
				.expect(200)
				.then(res => {
					expect(res.text).to.be.an('string');
				});
		});
	});

	describe('Request at /search/tv/bang', () => {
		it('Return a list of Tv Shows after search', () => {
			return request(server)
				.get('/search/movies/bang')
				.expect(200)
				.then(res => {
					expect(res.text).to.be.an('string');
				});
		});
	});

	describe('Request at /watchlist/movies/danni', () => {
		it('Return a list of Movies on the watchlist for a given user', () => {
			return request(server)
				.get('/watchlist/movies/danni')
				.expect(200)
				.then(res => {
					expect(res.text).to.be.an('string');
				});
		});
	});

	describe('Request at /watchlist/movies/error', () => {
		it('Return 404 error when user does not exist', () => {
			return request(server)
				.get('/watchlist/movies/error')
				.expect(200)
				.then(res => {
					expect(res.text).to.be.an('string');
				});
		});
	})

	describe('Request at /watchlist/tv/danni', () => {
		it('Return a list of Tv Shows on the watchlist for a given user', () => {
			return request(server)
				.get('/watchlist/tv/danni')
				.expect(200)
				.then(res => {
					expect(res.text).to.be.an('string');
				});
		});
	});

	describe('Request at /watched/movies/danni', () => {
		it('Return a list of Movies that the given user has watched', () => {
			return request(server)
				.get('/watched/movies/danni')
				.expect(200)
				.then(res => {
					expect(res.text).to.be.an('string');
				});
		});
	});

	describe('Request at /watched/tv/danni', () => {
		it('Return a list of Tv Shows that the given user has watched', () => {
			return request(server)
				.get('/watched/tv/danni')
				.expect(200)
				.then(res => {
					expect(res.text).to.be.an('string');
				});
		});
	});

	describe('Request at /fb/userId', () => {
		it('Return a list of Tv Shows that the given user has watched', () => {
			return request(server)
				.get('/fb/userId')
				.expect(200)
				.then(res => {
					expect(res.text).to.be.an('string');
				});
		});
	});

	describe('POST at /movies/550/watchlist', () => {
		it('Return success if does not exist', () => {
			return request(server)
				.post('/movies/550/watchlist')
				.send({itemId: 500})
				.expect(200)
				.then(res => {
					expect(res.text).to.be.an('string');
				});
		});
	});

	describe('POST at /tv/550/watchlist', () => {
		it('Return success if does not exist', () => {
			return request(server)
				.post('/tv/550/watchlist')
				.send({itemId: 500})
				.expect(200)
				.then(res => {
					expect(res.text).to.be.an('string');
				});
		});
	});

	describe('POST at /movies/550/watched', () => {
		it('Return success if does not exist', () => {
			return request(server)
				.post('/movies/550/watched')
				.send({itemId: 500})
				.expect(200)
				.then(res => {
					expect(res.text).to.be.an('string');
				});
		});
	});

	describe('POST at /tv/550/watched', () => {
		it('Return success if does not exist', () => {
			return request(server)
				.post('/tv/550/watched')
				.send({itemId: 500})
				.expect(200)
				.then(res => {
					expect(res.text).to.be.an('string');
				});
		});
	});

	describe('POST at /movies/550/rating', () => {
		it('Return success if does not exist', () => {
			return request(server)
				.post('/movies/550/rating')
				.send({itemId: 500, bodyItem: 4})
				.expect(200)
				.then(res => {
					expect(res.text).to.be.an('string');
				});
		});
	});

	describe('POST at /tv/550/rating', () => {
		it('Return success if does not exist', () => {
			return request(server)
				.post('/tv/550/rating')
				.send({itemId: 500, bodyItem: 4})
				.expect(200)
				.then(res => {
					expect(res.text).to.be.an('string');
				});
		});
	});

	describe('POST at /token', () => {
		it('Return success if does not exist', () => {
			return request(server)
				.post('/token')
				.send({userId: 500, token: "MyTokenIsAWesome"})
				.expect(200)
				.then(res => {
					expect(res.text).to.be.an('string');
				});
		});
	});
});