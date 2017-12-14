const IMDB_URL = "http://www.imdb.com/title/";
const TMDB_URL = "https://www.themoviedb.org/";
const TMDB_MOVIES = "movie/";
const TMDB_TV = "tv/";
const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p/";
const PLACEHOLDER_IMAGE_URL = 'http://oi67.tinypic.com/2qkndow.jpg';
const TMDB_POSTER_SIZE = {
	TINY: "w92",
	SMALL: "w185",
	MEDIUM: "w300",
	LARGE: "w500"
};

const TMDB_STILL_SIZE = {
	SMALL: "w92",
	MEDIUM: "w185",
	LARGE: "w300",
};

// TMDB multiple Movies respons to Ours
exports.moviesFromJson = (jsonString) => {
	return new Promise((resolve, reject) => {
		try {
			let res = jsonString;
			if (typeof res === 'string') {
				res = JSON.parse(res);
			}
			let results = res.results || res;
			let movies = [];
			for (let key in results) {
				let obj = results[key];
				let movie = {
					id: obj.id,
					title: obj.title,
					poster: this.getPoster(obj.poster_path),
					rating: obj.vote_average,
					releaseDate: obj.release_date,
				};
				movies.push(movie);
			}
			resolve(JSON.stringify(movies));
		}catch (err) {
			reject("Unable to parse Json");
		}
	});
};

// TMDB multiple Tv Shows respons to Ours
exports.tvShowsFromJson = (jsonString) => {
	return new Promise((resolve, reject) => {
		try {
			let res = jsonString;
			if (typeof res === 'string') {
				res = JSON.parse(res);
			}
			let results = res.results || res;
			let tvShows = [];
			for (let key in results) {
				let obj = results[key];
				let tvShow = {
					id: obj.id,
					title: obj.name,
					poster: this.getPoster(obj.poster_path),
					rating: obj.vote_average,
					firstAired: obj.first_air_date,
				};
				tvShows.push(tvShow);
			}
			resolve(JSON.stringify(tvShows));
		}catch (err) {
			reject("Unable to parse Json");
		}
	});
};

// TMDB single Movies respons to Ours
exports.movieFromJson = (jsonString) => {
	return new Promise((resolve, reject) => {
		try {
			let obj = jsonString;
			if (typeof obj === 'string') {
				obj = JSON.parse(obj);
			}
			let movie = {
				id: obj.id,
				title: obj.title,
				overview: obj.overview,
				tagline: obj.tagline,
				poster: this.getPoster(obj.poster_path),
				tmdbUrl: this.getTmdbUrl(obj.id, TMDB_MOVIES),
				imdbUrl: this.getImdbUrl(obj.imdb_id),
				rating: obj.vote_average,
				releaseDate: obj.release_date,
				runtime: obj.runtime,
				genres: obj.genres,
			};
			resolve(JSON.stringify(movie));
		}catch (err) {
			reject("Unable to parse Json");
		}
	});
};

// TMDB single Tv Show respons to Ours
exports.tvShowFromJson = (jsonString) => {
	return new Promise((resolve, reject) => {
		try {
			let obj = jsonString;
			if (typeof obj === 'string') {
				obj = JSON.parse(obj);
			}
			let tvShow = {
				id: obj.id,
				title: obj.name,
				overview: obj.overview,
				tagline: obj.tagline,
				poster: this.getPoster(obj.poster_path),
				tmdbUrl: this.getTmdbUrl(obj.id, TMDB_TV),
				imdbUrl: this.getImdbUrl(obj.external_ids.imdb_id),
				rating: obj.vote_average,
				releaseDate: obj.release_date,
				runtime: obj.runtime,
				genres: obj.genres,
				totalEpisodes: obj.number_of_episodes,
				seasons: this.seasonsCoverter(obj.seasons),
				status: obj.status,
			};
			resolve(JSON.stringify(tvShow));
		}catch (err) {
			reject("Unable to parse Json");
		}
	});
};

// TMDB Seasons to Ours
exports.seasonFromJson = (jsonString) => {
	return new Promise((resolve, reject) => {
		try {
			let obj = JSON.parse(jsonString);
			let season = {
				id: obj.id,
				title: obj.name,
				poster: this.getStill(obj.poster_path),
				overview: obj.overview,
				airDate: obj.air_date,
				episodes: this.episodeCoverter(obj.episodes)
			};
			resolve(JSON.stringify(season));
		}catch (err) {
			reject("Unable to parse Json");
		}
	});
};

// * Helper Functions * //
exports.seasonsCoverter = (seasons) => {
	let ret = [];
	for (let key in seasons) {
		let s = seasons[key];
		let season = {
			id: s.id,
			airDate: s.air_date,
			number: s.season_number,
			poster: this.getPoster(s.poster_path)
		};
		ret.push(season);
	}
	return ret;
};

exports.episodeCoverter = (episodes) => {
	let ret = [];
	for (let key in episodes) {
		let e = episodes[key];
		let episode = {
			id: e.id,
			airDate: e.air_date,
			number: e.episode_number,
			name: e.name,
			overview: e.overview,
			image: this.getStill(e.still_path),
			rating: e.vote_average
		};
		ret.push(episode);
	}
	return ret;
};

exports.getStill = (stillPath) => {
	return (stillPath) ? TMDB_IMAGE_URL + TMDB_STILL_SIZE.LARGE + stillPath : null;
};

exports.getPoster = (posterPath) => {
	return (posterPath) ? TMDB_IMAGE_URL + TMDB_POSTER_SIZE.MEDIUM + posterPath : PLACEHOLDER_IMAGE_URL;
};

exports.getImdbUrl = (imdb_id) => {
	return (imdb_id) ? IMDB_URL + imdb_id : null;
};

exports.getTmdbUrl = (tmdb_id, prefix) => {
	prefix = prefix || TMDB_MOVIES;
	return (tmdb_id) ? TMDB_URL + prefix + tmdb_id : null;
};