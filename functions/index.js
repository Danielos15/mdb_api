const functions = require('firebase-functions');
const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');

let app = express();

const TMDB_API_KEY = "77cd5f9b3c4faca9c5113422ade651e4";
const TMDB_API_URL = "api.themoviedb.org";
const TMDB_API_VERSION = "/3/";

// build multiple CRUD interfaces:
app.get('/getMovies', (req, res) => {
	let params = {
		'sort_by' : 'vote_average.desc',
	};
	TMDB_request(["discover", "movie"], params).then((data) => {
		// TODO: Map Data to MovieLiteObject
		res.send(data);
	}, () => {
		res.send(error())
	})
});

app.get('/getMovieById/:id', (req, res) =>  {
	TMDB_request(["movie", req.params.id]).then((data) => {
		// TODO: Map Data to MovieObject
		res.send(data);
	}, () => {
		res.send(error());
	})
});

// Expose Express API as a single Cloud Function:
exports.api = functions.https.onRequest(app);

function error(message, code) {
	code = code || '404';
	message = message || 'Not Found';

	let errorObj = {
		'statusCode': code,
		'errorMessage': message
	};

	return JSON.stringify(errorObj);
}

function TMDB_request(path, params) {
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

		https.request(options, (res) => {
			res.setEncoding('utf8');
			res.on('data', function (chunk) {
				resolve(chunk);
			});
		}).end();
	})
}