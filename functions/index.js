const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('./app');
const TmdbRequest = require('./tmdb/request');
const dto = require('./tmdb/dto');
const facebook = require('./facebook/request');
const https = require('https');
const NodeCache = require('node-cache');
const Cache = new NodeCache();

const TMDBRequest = TmdbRequest(https, Cache);

const TYPE = {
	'tv': 'tv show',
	'movies': 'movie'
};

let serviceAccount = require("./serviceAccount/mdb-lokaverkefni.json");
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: functions.config().firebase.databaseURL
});

let server = app(admin, dto, facebook, TMDBRequest);

// Expose Express API as a single Cloud Function:
exports.api = functions.https.onRequest(server);

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
					snap = snap.val();
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


return module.exports;