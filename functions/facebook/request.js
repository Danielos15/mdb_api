const FB = require('fb');
const APP_ID = '134401950604871';
const APP_SECRET = '93cdac2bddcb7091d89d4cce8cc72545';

exports.getFacebookId = (fireBaseUser) => {
	for (let key in fireBaseUser.providerData) {
		if (fireBaseUser.providerData.hasOwnProperty(key)) {
			let provider = fireBaseUser.providerData[key];
			if(provider.providerId === "facebook.com") {
				return provider.uid;
			}
		}
	}
	return null;
};
exports.getFriends = (facebookUserId) => {
	return new Promise(function (resolve, reject) {
		FB.api('oauth/access_token', {
			client_id: APP_ID,
			client_secret: APP_SECRET,
			grant_type: 'client_credentials'
		},  (response) => {
			if(!response || response.error) {
				reject('Unable to get App Credentials');
			}
			let accessToken = response.access_token;

			let fb = FB.extend({appId: APP_ID, appSecret: APP_SECRET});
			fb.setAccessToken(accessToken);
			fb.api(`/${facebookUserId}/friends`, 'get', (r) => {
				if (r.hasOwnProperty('data')) {
					resolve(r.data);
				}
				reject('Unable to get Users friends');
			});
		});
	})
};