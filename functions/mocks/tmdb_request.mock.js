module.exports = TMDBRequest = (path, params)=> {
	return new Promise(function (resolve, reject) {
		path = '/' + path.join('/');
		let ret;
		if 		  (path == "/tv/popular") {
			ret = [{
					title: "title",
					overview: "overview"
				}];
		} else if (path == "/tv/1418") {
			ret = {
					id: 1418,
					title: "title",
					overview: "overview"
				};
		} else if (path == "/tv/1418/season/8") {
			ret = [{
					number: 8,
					title: "title",
					overview: "overview"
				}];
		} else if (path == "/movie/popular") {
			ret = [{
					title: "title",
					overview: "overview"
				}];
		} else if (path == "/movie/550") {
			ret = {
					id: 550,
					title: "title",
					overview: "overview"
				};
		} else if (path == "/movie/525") {
			resolve("a16as8d1asd");
		} else if (path == "/tv/525") {
			resolve("a16as8d1asd");
		} else if (path == "/search/movie") {
			ret = {
					results: [{
						title: "title",
						overview: "overview"
					}]
				};
		} else if (path == "/search/tv/bang") {
			ret = {
					results: [{
						title: "title",
						overview: "overview"
					}]
				}
		}

		if (ret) {
			resolve(JSON.stringify(ret));
		} else {
			// resolve('What');
			reject('fail');
		}
	});
};