const express = require('express');
const bodyParser = require('body-parser');

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

const ORDER = {
	asc: 'asc',
	desc : 'desc'
};
const SORT = {
	rating: 'vote_average',
	popular: 'popularity',
};

module.exports = (admin, dto, facebook, TMDBRequest) => {
	let app = express();

	app.use(bodyParser.json());
	// ** GET functions  **//

	// Get first movies
	// can use filter param to filter by MOVIE_FILTER_OPTIONS
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
				let db = admin.database();
				let rating = 0.0;
				let size = 0;
				db.ref('/rating').child('/movies').child(req.params.id).once("value", snapshot => {
					size = snapshot.numChildren();
					snapshot.forEach(item => {
						rating += parseFloat(item.val().rating);
					});
					let movieObj = JSON.parse(movie);
					movieObj.mdbRating = rating / size;
					res.send(JSON.stringify(movieObj));
				});
			}).catch(err => {
				res.status(400);
				res.send(error(400, "could not parse data"));
			})
		}).catch(err => {
			res.status(404);
			res.send(error())
		});
	});

	// Get Most Popular Tv Shows
	// can use filter param to filter by MOVIE_FILTER_OPTIONS
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
				let db = admin.database();
				let rating = 0.0;
				let size = 0;
				db.ref('/rating').child('/tv').child(req.params.id).once("value", snapshot => {
					size = snapshot.numChildren();
					snapshot.forEach(item => {
						rating += parseFloat(item.val().rating);
					});
					let tvShowObj = JSON.parse(tvShow);
					tvShowObj.mdbRating = rating / size;
					res.send(JSON.stringify(tvShowObj));
				});
			}).catch(err => {
				res.status(400);
				res.send(error(400, "could not parse data"));
			})
		}).catch(err => {
			res.status(404);
			res.send(error())
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

	// Search for Movie by string
	app.get('/search/movies/:search', (req, res) => {
		let params = {
			'page' : req.query.page || 1,
			'query' : encodeURI(req.params.search)
		};
		let path = ['search', 'movie'];
		TMDBRequest(path, params).then((data) => {
			data = JSON.parse(data);
			data.results.sort(dynamicSort(SORT.popular, ORDER.desc));
			dto.moviesFromJson(data).then((movies) => {
				res.send(movies);
			}).catch(() => {
				res.send(error())
			})
		});
	});

	// Search for Tv Show by string
	app.get('/search/tv/:search', (req, res) => {
		let params = {
			'page' : req.query.page || 1,
			'query' : encodeURI(req.params.search)
		};
		let path = ['search', 'tv'];
		TMDBRequest(path, params).then((data) => {
			data = JSON.parse(data);
			data.results.sort(dynamicSort(SORT.popular, ORDER.desc));
			dto.tvShowsFromJson(data).then((movies) => {
				res.send(movies);
			}).catch(() => {
				res.send(error())
			})
		});
	});

	// Get all tv shows the user has marked to be watched
	app.get('/watchlist/tv/:userId', (req, res) => {
		let db = admin.database().ref('/watchlist').child(req.params.userId).child('/tv');
		let ids = [];
		db.on('value', function(snapshot){
			snapshot.forEach(function(childSnap) {
				ids.push(childSnap.val().tvId);
			});
			getItemsByIds('tv', ids).then(items => {
				if (SORT.hasOwnProperty(req.query.sort)) {
					let sort = SORT[req.query.sort];
					if (ORDER.hasOwnProperty(req.query.ord)) {
						let ord = ORDER[req.query.ord];
						items.sort(dynamicSort(sort, ord));
					} else {
						items.sort(dynamicSort(sort, ORDER.desc));
					}
				}
				dto.tvShowsFromJson(items).then(items => {
					res.send(items);
				}).catch(errors => {
					res.send(error(errors, 400));
				});
			}).catch(errors => {
				res.send(error(errors, 400));
			});
		});
	});

	// Get all movies the user has marked to be watched
	app.get('/watchlist/movies/:userId', (req, res) => {
		let db = admin.database().ref('/watchlist').child(req.params.userId).child('/movies');
		let ids = [];
		db.on('value', function(snapshot){
			snapshot.forEach(function(childSnap) {
				ids.push(childSnap.val().movieId);
			});
			getItemsByIds('movie', ids).then(items => {
				if (SORT.hasOwnProperty(req.query.sort)) {
					let sort = SORT[req.query.sort];
					if (ORDER.hasOwnProperty(req.query.ord)) {
						let ord = ORDER[req.query.ord];
						items.sort(dynamicSort(sort, ord));
					} else {
						items.sort(dynamicSort(sort, ORDER.desc));
					}
				}
				dto.moviesFromJson(items).then(items => {
					res.send(items);
				}).catch(errors => {
					res.send(error(errors, 400));
				});
			}).catch(errors => {
				res.send(error(errors, 400));
			});
		});
	});

	// Get all tv shows the user has marked as watchedf
	app.get('/watched/tv/:userId', (req, res) => {
		let db = admin.database().ref('/watched').child(req.params.userId).child('/tv');
		let ids = [];
		db.on('value', function(snapshot){
			snapshot.forEach(function(childSnap) {
				ids.push(childSnap.val().tvId);
			});
			getItemsByIds('tv', ids).then(items => {
				if (SORT.hasOwnProperty(req.query.sort)) {
					let sort = SORT[req.query.sort];
					if (ORDER.hasOwnProperty(req.query.ord)) {
						let ord = ORDER[req.query.ord];
						items.sort(dynamicSort(sort, ord));
					} else {
						items.sort(dynamicSort(sort, ORDER.desc));
					}
				}
				dto.tvShowsFromJson(items).then(items => {
					res.send(items);
				}).catch(errors => {
					res.send(error(errors, 400));
				});
			}).catch(errors => {
				res.send(error(errors, 400));
			});
		});
	});

	// Get all movies the user has marked as watchedf
	app.get('/watched/movies/:userId', (req, res) => {
		let db = admin.database().ref('/watched').child(req.params.userId).child('/movies');
		let ids = [];
		db.on('value', function(snapshot){
			snapshot.forEach(function(childSnap) {
				ids.push(childSnap.val().movieId);
			});
			getItemsByIds('movie', ids).then(items => {
				if (SORT.hasOwnProperty(req.query.sort)) {
					let sort = SORT[req.query.sort];
					if (ORDER.hasOwnProperty(req.query.ord)) {
						let ord = ORDER[req.query.ord];
						items.sort(dynamicSort(sort, ord));
					} else {
						items.sort(dynamicSort(sort, ORDER.desc));
					}
				}
				dto.moviesFromJson(items).then(items => {
					res.send(items);
				}).catch(errors => {
					res.send(error(errors, 400));
				});
			}).catch(errors => {
				res.send(error(errors, 400));
			});
		});
	});

	// Get all frinds from facebook that have autorized the app
	app.get('/fb/:id', (req, res) => {
		admin.auth().getUser(req.params.id).then((user)=> {
			let facebookId = facebook.getFacebookId(user);
			facebook.getFriends(facebookId).then(friends => {
				let promises = [];
				friends.forEach((friend) => {
					let promise = new Promise((resolve, reject) => {
						admin.database().ref("/fb-users/").child(friend.id).on('value', (snap) =>{
							let data = snap.val();
							friend.fbId = friend.id;
							delete friend.id;
							if (data !== null) {
								friend.uid = data.uid;
							} else {
								friend.uid = null;
							}
							resolve(friend);
						});
					});
					promises.push(promise);
				});
				Promise.all(promises).then(values => {
					res.send(values);
				});
			}).catch(err => {
				res.status(400);
				res.send(error(err, 400));
			});
		}).catch(error => {
			res.status(400);
			res.send(error); // TODO: fix error handling
		});
	});

	// ** POST functions  **//

	//Post movie to watchlist
	app.post('/movies/:id/watchlist', (req, res) => {
		let db = admin.database();
		db.ref('/watchlist').child(req.params.id).child('/movies').orderByChild('movieId').equalTo(req.body.itemId).once("value", snapshot => {
			const data = snapshot.val();
			if(data){
				res.send("Already on watchlist");
			} else {
				db.ref('/watchlist').child(req.params.id).child('/movies').push().set({"movieId": req.body.itemId});
				res.send("Movie set to watchlist");
			}
		});
	});

	//Post tv show to watchlist
	app.post('/tv/:id/watchlist', (req, res) => {
		let db = admin.database();
		db.ref('/watchlist').child(req.params.id).child('/tv').orderByChild('tvId').equalTo(req.body.itemId).once("value", snapshot => {
			const data = snapshot.val();
			if(data){
				res.send("Already on watchlist");
			} else {
				db.ref('/watchlist').child(req.params.id).child('/tv').push().set({"tvId": req.body.itemId});
				res.send("Tv show set to watchlist");
			}
		});
	});

	//Post movie to watched
	app.post('/movies/:id/watched', (req, res) => {
		let db = admin.database();
		db.ref('/watched').child(req.params.id).child('/movies').orderByChild('movieId').equalTo(req.body.itemId).once("value", snapshot => {
			const data = snapshot.val();
			if(data){
				res.send("Already on watched");
			} else {
				db.ref('/watched').child(req.params.id).child('/movies').push().set({"movieId": req.body.itemId});
				res.send("Movie set to watched");
			}
		});
	});

	//Post tv show to watched
	app.post('/tv/:id/watched', (req, res) => {
		let db = admin.database();
		db.ref('/watched').child(req.params.id).child('/tv').orderByChild('tvId').equalTo(req.body.itemId).once("value", snapshot => {
			const data = snapshot.val();
			if(data){
				res.send("Already on watched");
			} else {
				db.ref('/watched').child(req.params.id).child('/tv').push().set({"tvId": req.body.itemId});
				res.send("Tv show set to watched");
			}
		});
	});

	//Post rating on movie
	app.post('/movies/:id/rating', (req, res) => {
		let db = admin.database();
		db.ref('/rating').child('/movies').child(req.body.itemId).orderByChild("userId").equalTo(req.params.id).once("value", snapshot => {
			const data = snapshot.val();
			if(data){
				snapshot.forEach(function(data) {
					db.ref('/rating').child('/movies').child(req.body.itemId).child(data.key).update({"userId": req.params.id, rating: req.body.bodyItem});
				});
				res.send("Already on watched");
			} else {
				db.ref('/rating').child('/movies').child(req.body.itemId).push().set({"userId": req.params.id, rating: req.body.bodyItem});
				res.send("Movie set to watched");
			}
		});
	});

	//Post rating on tv show
	app.post('/tv/:id/rating', (req, res) => {
		let db = admin.database();
		db.ref('/rating').child('/tv').child(req.body.itemId).orderByChild("userId").equalTo(req.params.id).once("value", snapshot => {
			const data = snapshot.val();
			if(data){
				snapshot.forEach(function(data) {
					db.ref('/rating').child('/tv').child(req.body.itemId).child(data.key).update({"userId": req.params.id, rating: req.body.bodyItem});
				});
				res.send("Already on watched");
			} else {
				db.ref('/rating').child('/tv').child(req.body.itemId).push().set({"userId": req.params.id, rating: req.body.bodyItem});
				res.send("Tv show set to watched");
			}
		});
	});

	// Post the device Token to the server to recive notifications
	app.post('/token', (req, res) => {
		let db = admin.database().ref('/token');
		let userId = req.body.userId;
		let token = req.body.token;

		db.child(userId).push().set({'token': token}).then(value => {
			res.send('added to db?');
		}).catch(err => {
			res.status(400);
			res.send('Error');
		});
	});

	/*//Post review on movie
	 app.post('/movies/:id/review', (req, res) => {
	 let db = admin.database();
	 db.ref('/review').child(req.params.id).child('/movies').push().set({"movieId": req.body.itemId, rating: req.body.bodyItem});
	 res.send("review set for movie");
	 });

	 //Post review on tv show
	 app.post('/tv/:id/review', (req, res) => {
	 let db = admin.database();
	 db.ref('/review').child(req.params.id).child('/tv').push().set({"tvId": req.body.itemId, rating: req.body.bodyItem});
	 res.send("review set for tv show");
	 });*/

	// Helper functions
	let getItemsByIds = (type, ids) => {
		return new Promise((resolve, reject) => {
			let _ids = [];

			if (!Array.isArray(ids)) {
				_ids.push(ids);
			} else {
				_ids = ids || [];
			}

			let promises = [];
			for (let key in _ids) {
				let id = _ids[key];
				let promise = TMDBRequest([type, id]);
				promises.push(promise);
			}

			Promise.all(promises).then(values => {
				let data = [];
				for(let key in values) {
					let value = JSON.parse(values[key]);
					if (!value.hasOwnProperty('status_code')) {
						data.push(value);
					}
				}
				resolve(data);
			}).catch(error => {
				reject(error);
			})
		});
	};

	let dynamicSort = (property, order) => {
		let sortOrder = (order =='asc') ? 1 : -1;
		return function (a,b) {
			let result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
			return result * sortOrder;
		}
	};

	let error = (message, code) => {
		code = code || '404';
		message = message || 'Not Found';

		let errorObj = {
			'statusCode': code,
			'errorMessage': message
		};

		return JSON.stringify(errorObj);
	};

	return app;
};

