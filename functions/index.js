const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const TMDBRequest = require('./tmdb/request');
const dto = require('./tmdb/dto');
const facebook = require('./facebook/request');

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

const TYPE = {
	'tv': 'tv show',
	'movies': 'movie'
};

let serviceAccount = require("./serviceAccount/mdb-lokaverkefni.json");
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: functions.config().firebase.databaseURL
});
let app = express();

// Search for Movie by string
app.get('/search/movies/:search', (req, res) => {
	let params = {
		'page' : req.query.page || 1,
		'query' : req.params.search
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

app.get('/fb/:id', (req, res) => {
	admin.auth().getUser(req.params.id).then((user)=> {
		let facebookId = facebook.getFacebookId(user);
		facebook.getFriends(facebookId).then(friends => {
			// let promises = [];
			// friends.forEach((friend) => {
			// 	console.log(getUidFromFacebookId(friend.id));
			// 	let promise = new Promise((resolve, reject) => {
			// 		admin.database().ref("/fb-users/").child(friend.id).on('value', (snap) =>{
			// 			// let data = snap.val();
			// 			// friend.fbId = friend.id;
			// 			// delete friend.id;
			// 			// if (data !== null) {
			// 			// 	friend.uid = data.uid;
			// 			// } else {
			// 			// 	friend.uid = null;
			// 			// }
			// 			resolve(friend);
			// 		});
			// 	});
			// 	promises.push(promise);
			// });
			// Promise.all(promises).then(values => {
			// 	res.send(values);
			// })
			res.send(friends);
		}).catch(err => {
			res.status(400);
			res.send(error(err, 400));
		});
	}).catch(error => {
		res.status(400);
		res.send(error); // TODO: fix error handling
	});
});

app.get('/msg/:token', (req, res) => {
	let token = req.params.token;
	let payload = {
		data: {
			id: "1418",
			type: "movies",
			title: "Svanur Just rated a Movie",
			text: "My review of this movie in some ammount of words..."
		}
	};

// Send a message to the device corresponding to the provided
// registration token.
	admin.messaging().sendToDevice(token, payload)
		.then(function(response) {
			res.send("Successfully sent message:");

		})
		.catch(function(error) {
			res.send("Error sending message:");
		});
});

app.get('/test', (req, res) => {
	const data = req.query;
	const params = req.query;
	const promises = [];

	admin.auth().getUser(data.userId).then((user)=> {
		let payload = {
			data: {
				id: params.itemId,
				type: params.type,
				title: "New rating added",
				text: user.displayName + " just rated a " + TYPE[params.type],
			}
		};
		let facebookId = facebook.getFacebookId(user);
		facebook.getFriends(facebookId).then(friends => {
			friends.forEach((friend) => {
				admin.database().ref("/fb-users/").child(friend.id).on('value', (snap) =>{
					let data = snap.val();
					if (data) {
						let uid = snap.val().uid;
						admin.database().ref('/token').child(uid).on('value', tokens => {
							tokens = tokens.val();
							if (tokens) {
								for (let key in tokens){
									if (tokens.hasOwnProperty(key)) {
										let token = tokens[key];
										if (token.hasOwnProperty("token")) {
											promises.push(admin.messaging().sendToDevice(token["token"], payload));
										}
									}
								}

							}
						});
					}
				});
			});
		});
	});
	Promise.all(promises).then(values => {
		res.send(values);
	})
});
// Expose Express API as a single Cloud Function:
exports.api = functions.https.onRequest(app);

exports.userAdded = functions.auth.user().onCreate(function(event) {
	let uid = event.data.uid;
	let facebookId = facebook.getFacebookId(event.data);
	return admin.database().ref('/fb-users').child(facebookId).set({"uid": uid});
});

exports.userRemoved = functions.auth.user().onDelete(function(event) {
	let facebookId = facebook.getFacebookId(event.data);
	let p1 = admin.database.ref("/token").child(event.data.uid).remove();
	let p2 = admin.database().ref("/fb-users/").child(facebookId).remove();
	return Promise.all(p1, p2);
});

exports.sendRatingMsg = functions.database.ref('/rating/{type}/{itemId}/{junk}').onWrite(event => {
	const data = event.data.val();
	const params = event.params;
	const promises = [];

	admin.auth().getUser(data.userId).then((user)=> {
		let payload = {
			data: {
				id: params.itemId,
				type: params.type,
				title: "New rating added",
				text: user.displayName + " just rated a " + TYPE[params.type],
			}
		};
		let facebookId = facebook.getFacebookId(user);
		facebook.getFriends(facebookId).then(friends => {
			friends.forEach((friend) => {
				admin.database().ref("/fb-users/").child(friend.id).on('value', (snap) =>{
					let snap = snap.val();
					if (snap) {
						admin.database().ref('/token').child(snap.uid).on('value', usersTokens => {
							usersTokens = usersTokens.val();
							if (usersTokens) {
								for (let key in usersTokens){
									if (usersTokens.hasOwnProperty(key)) {
										let tokens = usersTokens[key];
										if (tokens.hasOwnProperty("token")) {
											let token = tokens["token"];
											promises.push(admin.messaging().sendToDevice(token, payload));
										}
									}
								}
							}
						});
					}
				});
			});
		});
	});
	return Promise.all(promises);
});

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
			if (_ids.hasOwnProperty(key)) {
				let id = _ids[key];
				let promise = TMDBRequest([type, id]);
				promises.push(promise);
			}
		}

		Promise.all(promises).then(values => {
			let data = [];
			for(let key in values) {
				if (values.hasOwnProperty(key)) {
					let value = JSON.parse(values[key]);
					if (!value.hasOwnProperty('status_code')) {
						data.push(value);
					}
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

let getUidFromFacebookId = (facebookId) => {

};

return module.exports;