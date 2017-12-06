const functions = require('firebase-functions');
const express = require('express');
const TMDBRequest = require('./tmdb/request');
const dto = require('./tmdb/dto');

let app = express();

// Get Most Popular Movies
app.get('/movies', (req, res) => {
	let params = {
		'page' : req.query.page || 1,
	};
	TMDBRequest(["movie", "popular"], params).then((data) => {
		dto.moviesFromJson(data).then((movies) => {
			res.send(movies);
		}).catch(() => {
			res.send(error())
		})
	});
});

// Get a single Movie by ID
app.get('/movies/:id', (req, res) =>  {
	TMDBRequest(["movie", req.params.id]).then((data) => {
		dto.movieFromJson(data).then((movie) => {
			res.send(movie);
		}).catch(() => {
			res.send(error())
		})
	})
});

// Get Most Popular Tv Shows
app.get('/tv', (req, res) => {
	let params = {
		'page' : req.query.page || 1,
	};
	TMDBRequest(["tv", "popular"], params).then((data) => {
		dto.tvShowsFromJson(data).then((movies) => {
			res.send(movies);
		}).catch(() => {
			res.send(error())
		})
	});
});

// Get a single Tv Show by ID
app.get('/tv/:id', (req, res) =>  {
	TMDBRequest(['tv', req.params.id], {
		'append_to_response': 'external_ids'
	}).then((data) => {
		dto.tvShowFromJson(data).then((movie) => {
			res.send(movie);
		}).catch(() => {
			res.send(error())
		})
	})
});

// Get a single season from a Tv Show by ID and season number
app.get('/tv/:id/:season', (req, res) =>  {
	TMDBRequest(['tv', req.params.id, 'season', req.params.season]).then((data) => {
		// TODO: Map Data to SeasonObject
		res.send(data);
		// dto.tvShowFromJson(data).then((movie) => {
		// 	res.send(movie);
		// }).catch(() => {
		// 	res.send(error())
		// })
	})
});

// Get a single season from a Tv Show by ID and season number
app.get('/tv/:id/:season/:episode', (req, res) =>  {
	TMDBRequest(['tv', req.params.id, 'season', req.params.season, 'episode', req.params.episode]).then((data) => {
		// TODO: Map Data to episodeObject
		res.send(data);
		// dto.tvShowFromJson(data).then((movie) => {
		// 	res.send(movie);
		// }).catch(() => {
		// 	res.send(error())
		// })
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