const https = require('https');
const NodeCache = require( "node-cache" );
const TMDB_API_KEY = "77cd5f9b3c4faca9c5113422ade651e4";
const TMDB_API_URL = "api.themoviedb.org";
const TMDB_API_VERSION = "/3/";
const CACHE_TTL = 7200;

const Cache = new NodeCache();

return module.exports = TMDBRequest = (path, params) => {
	return new Promise(function (resolve, reject) {
		let _path = '';
		let _params = '';

		if (Array.isArray(path)) {
			_path += path.join('/');
		} else {
			_path = path || '';
		}

		if (typeof params == 'object') {
			for (let key in params) {
				if (params.hasOwnProperty(key)) {
					let value = params[key];
					_params += key + '=' + value + '&';
				}
			}
		} else {
			_params = params || '';
		}

		let options = {
			host: TMDB_API_URL,
			path: TMDB_API_VERSION + _path + '?' + _params + 'api_key=' + TMDB_API_KEY,
			method: 'GET'
		};

		let cacheKey = _path + _params;
		Cache.get(cacheKey, (err, cache) => {
			if (!err) {
				if (cache == undefined) {
					https.request(options, (res) => {
						res.setEncoding('utf8');
						let data = '';
						res.on('data', (chunk) => {
							data += chunk;
						});
						res.on('end', () => {
							Cache.set(cacheKey, data, CACHE_TTL);
							resolve(data);
						}) ;
					}).end();
				} else {
					resolve(cache)
				}
			} else {
				reject();
			}
		});
	})
};