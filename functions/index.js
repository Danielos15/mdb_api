const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const TMDBRequest = require('./tmdb/request');
const dto = require('./tmdb/dto');

const MOVIE_FILTER_OPTIONS = {
	popular: 'popular',
	rated: 'top_rated',
	upcoming: 'upcoming',
};
MOVIE_FILTER_OPTIONS.DEFAULT = MOVIE_FILTER_OPTIONS.popular;

const TV_FILTER_OPTIONS = {
	popular: 'popular',
	rated: 'top_rated',
	today: 'airing_today'
};
TV_FILTER_OPTIONS.DEFAULT = TV_FILTER_OPTIONS.popular;

admin.initializeApp(functions.config().firebase);
let app = express();

// Get Most Popular Movies
app.get('/movies', (req, res) => {
	let params = {
		'page' : req.query.page || 1,
	};
	let path = ["movie"];
	// Check for availible Filters and set it else, set the default filter
	if (MOVIE_FILTER_OPTIONS.hasOwnProperty(req.query.filter)) {
		path.push(MOVIE_FILTER_OPTIONS[req.query.filter]);
	} else {
		path.push(MOVIE_FILTER_OPTIONS.DEFAULT);
	}

	TMDBRequest(path, params).then((data) => {
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

	let path = ["tv"];
	// Check for availible Filters and set it else, set the default filter
	if (TV_FILTER_OPTIONS.hasOwnProperty(req.query.filter)) {
		path.push(TV_FILTER_OPTIONS[req.query.filter]);
	} else {
		path.push(TV_FILTER_OPTIONS.DEFAULT);
	}
	TMDBRequest(path, params).then((data) => {
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
		dto.tvShowFromJson(data).then((tvShow) => {
			res.send(tvShow);
		}).catch(() => {
			res.send(error())
		})
	})
});

// Get a single season from a Tv Show by ID and season number
app.get('/tv/:id/:season', (req, res) =>  {
	TMDBRequest(['tv', req.params.id, 'season', req.params.season]).then((data) => {
		dto.seasonFromJson(data).then((season) => {
			res.send(season);
		}).catch(() => {
			res.send(error())
		})
	})
});

// // Get a single season from a Tv Show by ID and season number
// app.get('/tv/:id/:season/:episode', (req, res) =>  {
// 	TMDBRequest(['tv', req.params.id, 'season', req.params.season, 'episode', req.params.episode]).then((data) => {
// 		res.send(data);
// 		// dto.tvShowFromJson(data).then((movie) => {
// 		// 	res.send(movie);
// 		// }).catch(() => {
// 		// 	res.send(error())
// 		// })
// 	})
// });
//Post movie to watchlist
app.get('/movies/:id/:movieId', (req, res) => {
	let db = admin.database();
	db.ref('/watchlist').child(req.params.id).push().set(req.params.movieId);
	res.send("movie set to watchlist");
});

//Post tv show to watchlist
app.get('/tv/:id/:tvId', (req, res) => {
	let db = admin.database();
	db.ref('/watchlist').child(req.params.id).push().set(req.params.movieId);
	res.send("tv show set to watchlist");
});

//Post review on movie
app.get('/movies/:id/:movieId', (req, res) => {
	let db = admin.database();
	db.ref('/watchlist').child(req.params.id).push().set(req.params.movieId);
	res.send("review set for movie");
});

//Post review on tv show
app.get('/tv/:id/:tvId', (req, res) => {
	let db = admin.database();
	db.ref('/watchlist').child(req.params.id).push().set(req.params.movieId);
	res.send("review set for tv show");
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