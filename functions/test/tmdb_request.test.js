const tmdb_request = require("../tmdb/request");
const expect = require('chai').expect;
const https = require('https');
const nock = require('nock');
const NodeCache = require('node-cache');
// jest.mock("node-cache");
//const Cache = new NodeCache();

const Cache = {
	get: (cacheKey, callback) => {
		let isError = false;
		let cache = undefined;
		if  (cacheKey == "/movie/550/hasError") {
			isError = true;
		}
		if (cacheKey == "/movie/550/hasCache") {
			cache = "cache"
		}
		callback(isError, cache);
	},
	set: (cacheKey, data, TTL) => {

	}
};
const TMDBRequest = tmdb_request(https, Cache);

// Helper Function to test different Urls
let catchRequest = (path, params, code, response, isError) => {
	isError = isError || false;

	let query = Object.assign({}, params);
	query.api_key = '77cd5f9b3c4faca9c5113422ade651e4';
	let n = nock("https://api.themoviedb.org")
				.get("/3/"+path)
				.query(query);
	if (isError) {
		n.replyWithError(response);
	}else {
		n.reply(code, response);
	}

};


describe('TMDB Requests', () => {
	it('With path as String and params as object', () => {
		// Arrange
		let path = "movie/999";
		let params = {
			param1: "value1",
			param2: "value2"
		};

		let obj = {
			id: 550,
			title: "Fight Club"
		};

		// Act
		catchRequest(path, params, 200, obj);
		let res = JSON.stringify(obj);

		// Assert
		return TMDBRequest(path, params).then(value => {
			expect(value).to.equal(res);
		});
	});
	it('With path as array and params as string', () => {
		// Arrange
		let path = "tv/999";
		let params = {
			filter: "popular",
		};

		let urlPath = ["tv", "999"];
		let urlParams = "filter=popular";

		let obj = {
			id: 1418,
			title: "The big bang Theory"
		};

		// Act
		catchRequest(path, params, 200, obj);
		let res = JSON.stringify(obj);

		// Assert
		return TMDBRequest(urlPath, urlParams).then(value => {
			expect(value).to.equal(res);
		});

	});
	it('Unable to connect to Tmdb service', () => {
		// Arrange
		let path = "tv/999";
		let params = {
			filter: "popular",
		};

		let urlPath = ["tv", "999"];
		let urlParams = "filter=popular";

		let obj = {
			id: 1418,
			title: "The big bang Theory"
		};

		// Act
		catchRequest(path, params, 400, obj, true);
		let res = JSON.stringify(obj);

		// Assert
		return TMDBRequest(urlPath, urlParams).catch(error => {
			expect(error).to.equal('Unable to connect to Tmdb server');
		});

	});
	it('if cache is availible', () => {
		// Arrange
		let path = "/movie/550/hasCache";


		let obj = {
			id: 1418,
			title: "The big bang Theory"
		};

		// Act
		catchRequest(path, {}, 200, obj);
		let res = JSON.stringify(obj);

		// Assert
		return TMDBRequest(path, {}).then(value => {
			expect(value).to.equal('cache');
		});
	});
	it('error in cache handling', () => {
		// Arrange
		let path = "/movie/550/hasError";


		let obj = {
			id: 1418,
			title: "The big bang Theory"
		};

		// Act
		catchRequest(path, {}, 200, obj);
		let res = JSON.stringify(obj);

		// Assert
		return TMDBRequest(path, {}).catch(error => {
			expect(error).to.equal('Error in Cache handling');
		});
	});
	it('When path is empty', () => {
		// Arrange
		let path = false;

		let obj = {
			id: 550,
			title: "Fight Club"
		};

		// Act
		catchRequest("", {}, 200, obj);
		let res = JSON.stringify(obj);

		// Assert
		return TMDBRequest(path, {}).then(value => {
			expect(value).to.equal(res);
		});
	});
	it('When params is false', () => {
		// Arrange
		let path = "movie/999";

		let obj = {
			id: 550,
			title: "Fight Club"
		};

		// Act
		catchRequest(path, {}, 200, obj);
		let res = JSON.stringify(obj);

		// Assert
		return TMDBRequest(path, undefined).then(value => {
			expect(value).to.equal(res);
		});
	});
	it('When params does not have OwnProperty', () => {
		// Arrange
		let path = "movie/999";

		let obj = {
			id: 550,
			title: "Fight Club"
		};

		// Act
		catchRequest(path, {}, 200, obj);
		let res = JSON.stringify(obj);

		let params = {
			hasOwnProperty: (key) => {
				return false;
			}
		};
		// Assert
		return TMDBRequest(path, params).then(value => {
			expect(value).to.equal(res);
		});
	});
});