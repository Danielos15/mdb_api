const IMDB_URL = "http://www.imdb.com/title/";
const TMDB_URL = "https://www.themoviedb.org/";
const TMDB_MOVIES = "movie/";
const TMDB_TV = "tv/";
const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p/";
const TMDB_POSTER_SIZE = {
	TINY: "w92",
	SMALL: "w185",
	MEDIUM: "w300",
	LARGE: "w500"
};

// TMDB multiple Movies respons to Ours
exports.moviesFromJson = (jsonString) => {
	return new Promise((resolve, reject) => {
		try {
			let res = JSON.parse(jsonString);
			let results = res.results;
			let movies = [];
			for (let key in results) {
				if (results.hasOwnProperty(key)) {
					let obj = results[key];
					let movie = {
						id: obj.id,
						title: obj.title,
						poster: getPoster(obj.poster_path),
						rating: obj.vote_average,
						releaseDate: obj.release_date,
					};
					movies.push(movie);
				}
			}
			resolve(JSON.stringify(movies));
		}catch (err) {
			reject(err);
		}
	});
};

// TMDB multiple Tv Shows respons to Ours
exports.tvShowsFromJson = (jsonString) => {
	return new Promise((resolve, reject) => {
		try {
			let res = JSON.parse(jsonString);
			let results = res.results;
			let tvShows = [];
			for (let key in results) {
				if (results.hasOwnProperty(key)) {
					let obj = results[key];
					let tvShow = {
						id: obj.id,
						title: obj.name,
						poster: getPoster(obj.poster_path),
						rating: obj.vote_average,
						firstAired: obj.first_air_date,
					};
					tvShows.push(tvShow);
				}
			}
			resolve(JSON.stringify(tvShows));
		}catch (err) {
			reject(err);
		}
	});
};

// TMDB single Movies respons to Ours
exports.movieFromJson = (jsonString) => {
	return new Promise((resolve, reject) => {
		try {
			let obj = JSON.parse(jsonString);
			let movie = {
				id: obj.id,
				title: obj.title,
				overview: obj.overview,
				tagline: obj.tagline,
				poster: getPoster(obj.poster_path),
				tmdbUrl: getTmdbUrl(obj.id),
				imdbUrl: getImdbUrl(obj.imdb_id),
				rating: obj.vote_average,
				releaseDate: obj.release_date,
				runtime: obj.runtime,
				genres: obj.genres,
			};
			resolve(JSON.stringify(movie));
		}catch (err) {
			reject(err);
		}
	});
};

// TMDB single Movies respons to Ours
exports.tvShowFromJson = (jsonString) => {
	return new Promise((resolve, reject) => {
		try {
			let obj = JSON.parse(jsonString);
			let tvShow = {
				id: obj.id,
				title: obj.name,
				overview: obj.overview,
				tagline: obj.tagline,
				poster: getPoster(obj.poster_path),
				tmdbUrl: getTmdbUrl(obj.id),
				imdbUrl: getImdbUrl(obj.external_ids.imdb_id),
				rating: obj.vote_average,
				releaseDate: obj.release_date,
				runtime: obj.runtime,
				genres: obj.genres,
				totalEpisodes: obj.number_of_episodes,
				seasons: seasonsCoverter(obj.seasons),
				status: obj.status,
			};
			resolve(JSON.stringify(tvShow));
		}catch (err) {
			reject(err);
		}
	});
};

// Helper Functions
let seasonsCoverter = (seasons) => {
	let ret = [];
	for (let key in seasons) {
		let s = seasons[key];
		let season = {
			id: s.id,
			airDate: s.air_date,
			number: s.season_number,
			poster: getPoster(s.poster_path)
		};
		ret.push(season);
	}
	return ret;
};

let getPoster = (posterPath) => {
	return (posterPath) ? TMDB_IMAGE_URL + TMDB_POSTER_SIZE.MEDIUM + posterPath : null;
};

let getImdbUrl = (imdb_id) => {
	return (imdb_id) ? IMDB_URL + imdb_id : null;
};

let getTmdbUrl = (tmdb_id) => {
	return (tmdb_id) ? TMDB_URL + TMDB_MOVIES + tmdb_id : null;
};

return module.exports;