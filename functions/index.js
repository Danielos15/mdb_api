const functions = require('firebase-functions');
const https = require('https');
const express = require('express');
const NodeCache = require( "node-cache" );
const Cache = new NodeCache();

let app = express();

const TMDB_API_KEY = "77cd5f9b3c4faca9c5113422ade651e4";
const TMDB_API_URL = "api.themoviedb.org";
const TMDB_API_VERSION = "/3/";
const TMDB_URL = "https://www.themoviedb.org/";
const TMDB_MOVIES = "movie/";
const TMDB_TV = "tv/";
const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p/";
const TMDB_POSTER_SIZE = {
	TINY: "w92",
	SMALL: "w185",
	MEDIUM: "w300",
	LARGE: "w500"
};
const IMDB_URL = "http://www.imdb.com/title/";
const CACHE_TTL = 60;

// build multiple CRUD interfaces:
app.get('/movies', (req, res) => {
	let params = {
		'page' : req.query.page || 1,
	};
	TMDB_request(["movie", "popular"], params).then((data) => {
		// TODO: Map Data to MovieLiteObject
		getMoviesFromJson(data).then((movies) => {
			res.send(movies);
		}).catch(() => {
			res.send(error())
		})
	});
});

app.get('/movies/:id', (req, res) =>  {
	TMDB_request(["movie", req.params.id]).then((data) => {
		// TODO: Map Data to MovieObject
		getSingleMovieFromJson(data).then((movie) => {
			res.send(movie);
		}).catch(() => {
			res.send(error())
		})
	})
});

// Expose Express API as a single Cloud Function:
exports.api = functions.https.onRequest(app);

let error = (message, code) => {
	code = code || '404';
	message = message || 'Not Found';

	let errorObj = {
		'statusCode': code,
		'errorMessage': message
	};

	return JSON.stringify(errorObj);
};

let TMDB_request = (path, params) => {
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
						res.on('data', function (chunk) {
							Cache.set(cacheKey, chunk, CACHE_TTL);
							resolve(chunk);
						});
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

let getMoviesFromJson = (jsonString) => {
	return new Promise((resolve, reject) => {
		try {
			let res = JSON.parse(jsonString);
			let results = res.results;
			let movies = [];
			for (let key in results) {
				if (results.hasOwnProperty(key)) {
					let obj = results[key];
					let movie = {
						id: obj.id,
						title: obj.title,
						poster: TMDB_IMAGE_URL + TMDB_POSTER_SIZE.MEDIUM + obj.poster_path,
						rating: obj.vote_average,
					};
					movies.push(movie);
				}
			}
			resolve(JSON.stringify(movies));
		}catch (err) {
			reject(err);
		}
	});
};

let getSingleMovieFromJson = (jsonString) => {
	return new Promise((resolve, reject) => {
		try {
			let obj = JSON.parse(jsonString);
			let movie = {
				id: obj.id,
				title: obj.title,
				overview: obj.overview,
				tagline: obj.tagline,
				poster: TMDB_IMAGE_URL + TMDB_POSTER_SIZE.MEDIUM + obj.poster_path,
				tmdbUrl: TMDB_URL + TMDB_MOVIES + obj.id,
				imdbUrl: IMDB_URL + obj.imdb_id,
				rating: obj.vote_average,
				releaseDate: obj.release_date,
				runtime: obj.runtime,
			};
			resolve(JSON.stringify(movie));
		}catch (err) {
			reject(err);
		}
	});
};