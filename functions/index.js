const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const TMDBRequest = require('./tmdb/request');
const dto = require('./tmdb/dto');
const FB = require('fb');

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

//admin.initializeApp(functions.config().firebase);

let serviceAccount = require("./serviceAccount/mdb-lokaverkefni.json");
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://mbd-lokaverkefni.firebaseio.com"
});
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
app.post('/movies/:id/watchlist', (req, res) => {
	let db = admin.database();
	db.ref('/watchlist').child(req.params.id).child('/movies').push().set({"movieId": req.body.itemId});
	res.send("movie set to watchlist");
});

//Post tv show to watchlist
app.post('/tv/:id/watchlist', (req, res) => {
	let db = admin.database();
	db.ref('/watchlist').child(req.params.id).child('/tv').push().set({"tvId": req.body.itemId});
	res.send("tv show set to watchlist");
});

//Post movie to watched
app.post('/movies/:id/watched', (req, res) => {
	let db = admin.database();
	db.ref('/watched').child(req.params.id).push().set({"movieId": req.body.itemId});
	res.send("movie set to watched");
});

//Post tv show to watched
app.post('/tv/:id/watched', (req, res) => {
	let db = admin.database();
	db.ref('/watched').child(req.params.id).push().set({"tvId": req.body.itemId});
	res.send("tv show set to watched");
});

//Post review on movie
app.post('/movies/:id/review', (req, res) => {
	let db = admin.database();
	db.ref('/review').child(req.params.id).child('/movies').push().set({"movieId": req.body.itemId, rating: req.body.review});
	res.send("review set for movie");
});

//Post review on tv show
app.post('/tv/:id/review', (req, res) => {
	let db = admin.database();
	db.ref('/review').child(req.params.id).child('/tv').push().set({"tvId": req.body.itemId, rating: req.body.review});
	res.send("review set for tv show");
});

//Post rating on movie
app.post('/movies/:id/rating', (req, res) => {
	let db = admin.database();
	db.ref('/rating').child(req.params.id).child('/movies').push().set({"movieId": req.body.itemId, rating: req.body.rating});
	res.send("rating set for movie");
});

//Post rating on tv show
app.post('/tv/:id/rating', (req, res) => {
	let db = admin.database();
	db.ref('/rating').child(req.params.id).child('/tv').push().set({"tvId": req.body.itemId, rating: req.body.rating});
	res.send("rating set for tv show");
});

//Get all movies on the users watchlist
app.get('/watchlist/movies/:id', (req, res) => {
	let db = admin.database().ref('/watchlist').child(req.params.id).child('/movies');
	let list = [];
	db.on('value', function(snapshot){
		snapshot.forEach(function(childSnap) {
			list.push(childSnap.val());
		});
		res.send(list);
	});
});

//Get all TV shows on the users watchlist
app.get('/watchlist/tv/:id', (req, res) => {
	let db = admin.database().ref('/watchlist').child(req.params.id).child('/tv');
	let list = [];
	db.on('value', function(snapshot){
		snapshot.forEach(function(childSnap) {
			list.push(childSnap.val());
		});
		res.send(list);
	});
});

app.get('/fb/:id', (req, res) => {
	admin.auth().getUser(req.params.id).then((user)=> {
		for (let key in user.providerData) {
			if (user.providerData.hasOwnProperty(key)) {
				let provider = user.providerData[key];
				if(provider.providerId === "facebook.com") {
					let uid = provider.uid;
					console.log(uid);

					FB.options({version: 'v2.4'});
					FB.api('oauth/access_token', {
						client_id: '134401950604871',
						client_secret: '93cdac2bddcb7091d89d4cce8cc72545',
						grant_type: 'client_credentials'
					}, function (response) {
						if(!response || response.error) {
							return; // TODO: Error handling
						}
						let accessToken = response.access_token; // GET ACCESS TOKEN FOR THE APP

						let fb = FB.extend({appId: '134401950604871', appSecret: '93cdac2bddcb7091d89d4cce8cc72545'});
						fb.setAccessToken(accessToken);
						fb.api(`/${uid}/friends`, 'get', function (r) {
							if(!r || r.error) {
								console.log(!r ? 'error occurred' : r.error);
								res.send(r);
								return;
							}
							console.log('Post Id: ' + r.id);
							res.send(r);
						});
					});
				}
			}
		}
	}).catch(error => {
		res.send(error); // TODO: fix error handling
	});
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