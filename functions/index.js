const functions = require('firebase-functions');
//import bodyParser from 'body-parser';

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
});


exports.getMovies = functions.https.onRequest((request, response) => {
	let json = {
		id: 1,
		name: "Test",
		desc: "Something long and boring",
	};

	response.send(JSON.stringify(json));
});
