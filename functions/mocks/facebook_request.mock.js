exports.getFacebookId = (firebaseUser) => {
	return "10101001001101";
};
exports.getFriends = (facebookUserId) => {
	return new Promise(function (resolve, reject) {
		if (facebookUserId) {
			resolve(
				[
					{
						displayName: "Test user",
						id: "01001010010100"
					}
				]
			);
		} else {
			reject('Unable to get Friends');
		}
	})
};
