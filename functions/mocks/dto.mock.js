let mockFunction = (jsonString) => {
	return new Promise((resolve, reject) => {
		if (jsonString) {
			resolve(jsonString);
		} else {
			reject('fail')
		}
	});
};
exports.moviesFromJson = mockFunction;
exports.tvShowsFromJson = mockFunction;
exports.movieFromJson = mockFunction;
exports.tvShowFromJson = mockFunction;
exports.seasonFromJson = mockFunction;