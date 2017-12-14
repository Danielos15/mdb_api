const expect = require('chai').expect;
const dto = require("../tmdb/dto");

describe('Dto tests', () => {
	describe('moviesFromJson function', () => {
		it('With Object', () => {
			// Arrange
			let loppCount = 20;
			obj = {
				id: 20,
				title: "Testing Movie",
				poster_path: "testing.jpg",
				vote_average: 5.5,
				release_date: "2001-12-08"
			};
			let arr = [];
			for (let i = 0; i < loppCount; i++) {
				arr.push(obj);
			}
			// Act

			// Assert
			return dto.moviesFromJson(arr).then(data => {
				expect(data).not.to.be.null;
				let arr = JSON.parse(data);
				let object = arr[0];
				expect(object.id).to.equal(20);
				expect(object.title).to.equal("Testing Movie");
				expect(object.rating).to.equal(5.5);
				expect(object.releaseDate).to.equal("2001-12-08");
			})
		});
		it('With JSON String', () => {
			// Arrange
			let loppCount = 20;
			let obj = {
				id: 20,
				title: "Testing Movie",
				poster_path: "testing.jpg",
				vote_average: 5.5,
				release_date: "2001-12-08"
			};
			let arr = [];
			for (let i = 0; i < loppCount; i++) {
				arr.push(obj);
			}

			let input = JSON.stringify(arr);

			// Act

			// Assert
			return dto.moviesFromJson(input).then(data => {
				expect(data).not.to.be.null;
				let arr = JSON.parse(data);
				let object = arr[0];
				expect(object.id).to.equal(20);
				expect(object.title).to.equal("Testing Movie");
				expect(object.rating).to.equal(5.5);
				expect(object.releaseDate).to.equal("2001-12-08");
			})
		});
		it('Not with Json String', () => {
			// Arrange
			let NotJsonString = "Something that is not in Json format [{asd:asd}]";
			// Act

			// Assert
			return dto.moviesFromJson(NotJsonString).catch(err => {
				expect(err).to.equal("Unable to parse Json");
			});
		});
	});
	describe('tvShowsFromJson function', () => {
		it('With Object', () => {
			// Arrange
			let loppCount = 20;
			let obj = {
				id: 50,
				name: "Testing Tv Show",
				poster_path: "testing.jpg",
				vote_average: 7.5,
				first_air_date: "2012-12-08"
			};
			let arr = [];
			for (let i = 0; i < loppCount; i++) {
				arr.push(obj);
			}
			// Act

			// Assert
			return dto.tvShowsFromJson(arr).then(data => {
				expect(data).not.to.be.null;
				let arr = JSON.parse(data);
				let object = arr[0];
				expect(object.id).to.equal(50);
				expect(object.title).to.equal("Testing Tv Show");
				expect(object.rating).to.equal(7.5);
				expect(object.firstAired).to.equal("2012-12-08");
			})
		});
		it('With JSON String', () => {
			// Arrange
			let loppCount = 20;
			let obj = {
				id: 50,
				name: "Testing Tv Show",
				poster_path: "testing.jpg",
				vote_average: 7.5,
				first_air_date: "2012-12-08"
			};
			let arr = [];
			for (let i = 0; i < loppCount; i++) {
				arr.push(obj);
			}
			let input = JSON.stringify(arr);
			// Act

			// Assert
			return dto.tvShowsFromJson(input).then(data => {
				expect(data).not.to.be.null;
				let arr = JSON.parse(data);
				let object = arr[0];
				expect(object.id).to.equal(50);
				expect(object.title).to.equal("Testing Tv Show");
				expect(object.rating).to.equal(7.5);
				expect(object.firstAired).to.equal("2012-12-08");
			})
		});
		it('Not with Json String', () => {
			// Arrange
			let NotJsonString = "Something that is not in Json format [{asd:asd}]";
			// Act

			// Assert
			return dto.tvShowsFromJson(NotJsonString).catch(err => {
				expect(err).to.equal("Unable to parse Json");
			});
		});
	});
	describe('movieFromJson function', () => {
		it('With Object', () => {
			// Arrange
			let obj = {
				id: 50,
				title: "Testing Movie",
				poster_path: "testing.jpg",
				vote_average: 7.5,
				release_date: "2012-12-08",
				overview: "Something...",
				tagline: "tagline",
				imdb_id: "tt998",
				runtime: "30m",
				genres: [{id: 1, name: "Horror"}]
			};
			// Act

			// Assert
			return dto.movieFromJson(obj).then(data => {
				expect(data).not.to.be.null;
				let object = JSON.parse(data);
				expect(object.id).to.equal(50);
				expect(object.title).to.equal("Testing Movie");
				expect(object.rating).to.equal(7.5);
				expect(object.releaseDate).to.equal("2012-12-08");
				expect(object.runtime).to.equal("30m");
			})
		});
		it('With JSON String', () => {
			// Arrange
			let obj = {
				id: 50,
				title: "Testing Movie",
				poster_path: "testing.jpg",
				vote_average: 7.5,
				release_date: "2012-12-08",
				overview: "Something...",
				tagline: "tagline",
				imdb_id: "tt998",
				runtime: "30m",
				genres: [{id: 1, name: "Horror"}]
			};
			let input = JSON.stringify(obj);
			// Act

			// Assert
			return dto.movieFromJson(input).then(data => {
				expect(data).not.to.be.null;
				let object = JSON.parse(data);
				expect(object.id).to.equal(50);
				expect(object.title).to.equal("Testing Movie");
				expect(object.rating).to.equal(7.5);
				expect(object.releaseDate).to.equal("2012-12-08");
				expect(object.runtime).to.equal("30m");
			})
		});
		it('Not with Json String', () => {
			// Arrange
			let NotJsonString = "Something that is not in Json format [{asd:asd}]";
			// Act

			// Assert
			return dto.movieFromJson(NotJsonString).catch(err => {
				expect(err).to.equal("Unable to parse Json");
			});
		});
	});
	describe('tvShowFromJson function', () => {
		it('With Object', () => {
			// Arrange
			let obj = {
				id: 50,
				name: "Testing Movie",
				poster_path: "testing.jpg",
				vote_average: 7.5,
				release_date: "2012-12-08",
				overview: "Something...",
				tagline: "tagline",
				runtime: "30m",
				genres: [{id: 1, name: "Horror"}],
				number_of_episodes: 50,
				seasons: [
					{
						id: 100,
						air_date: "2015-05-05",
						season_number: 5,
						post_path: "poster.jpg"
					}
				],
				external_ids: {imdb_id: "tt998"}
			};
			// Act

			// Assert
			return dto.tvShowFromJson(obj).then(data => {
				expect(data).not.to.be.null;
				let object = JSON.parse(data);
				expect(object.id).to.equal(50);
				expect(object.title).to.equal("Testing Movie");
				expect(object.rating).to.equal(7.5);
				expect(object.releaseDate).to.equal("2012-12-08");
				expect(object.runtime).to.equal("30m");
			})
		});
		it('With JSON String', () => {
			// Arrange
			let obj = {
				id: 50,
				name: "Testing Movie",
				poster_path: "testing.jpg",
				vote_average: 7.5,
				release_date: "2012-12-08",
				overview: "Something...",
				tagline: "tagline",
				runtime: "30m",
				genres: [{id: 1, name: "Horror"}],
				number_of_episodes: 50,
				seasons: [
					{
						id: 100,
						air_date: "2015-05-05",
						season_number: 5,
						post_path: "poster.jpg"
					}
				],
				external_ids: {imdb_id: "tt998"}
			};
			let input = JSON.stringify(obj);
			// Act

			// Assert
			return dto.tvShowFromJson(input).then(data => {
				expect(data).not.to.be.null;
				let object = JSON.parse(data);
				expect(object.id).to.equal(50);
				expect(object.title).to.equal("Testing Movie");
				expect(object.rating).to.equal(7.5);
				expect(object.releaseDate).to.equal("2012-12-08");
				expect(object.runtime).to.equal("30m");
			})
		});
		it('Not with Json String', () => {
			// Arrange
			let NotJsonString = "Something that is not in Json format [{asd:asd}]";
			// Act

			// Assert
			return dto.tvShowFromJson(NotJsonString).catch(err => {
				expect(err).to.equal("Unable to parse Json");
			});
		});
	});
	describe('seasonFromJson function', () => {
		it('With JSON String', () => {
			// Arrange
			let obj = {
				id: 50,
				name: "Testing Season",
				poster_path: "testing.jpg",
				overview: "Something...",
				air_date: "2016-08-01",
			};
			let input = JSON.stringify(obj);
			// Act

			// Assert
			return dto.seasonFromJson(input).then(data => {
				expect(data).not.to.be.null;
				let object = JSON.parse(data);
				expect(object.id).to.equal(50);
				expect(object.title).to.equal("Testing Season");
				expect(object.airDate).to.equal("2016-08-01");
				expect(object.overview).to.equal("Something...");
			})
		});
		it('Not with Json String', () => {
			// Arrange
			let NotJsonString = "Something that is not in Json format [{asd:asd}]";
			// Act

			// Assert
			return dto.seasonFromJson(NotJsonString).catch(err => {
				expect(err).to.equal("Unable to parse Json");
			});
		});
	});
	describe('seasonConverts function', () => {
		it('With Object', () => {
			// Arrange
			let seasons = [
				{
					id: 100,
					air_date: "2015-05-05",
					season_number: 5,
					poster_path: "poster.jpg"
				},
				{
					id: 101,
					air_date: "2015-06-05",
					season_number: 6,
					poster_path: "poster.jpg"
				}
			];
			// Act

			// Assert
			let data = dto.seasonsCoverter(seasons);

			expect(data).not.to.be.null;
			let object = data[0];
			expect(object.id).to.equal(100);
			expect(object.airDate).to.equal("2015-05-05");
			expect(object.number).to.equal(5);
		});
	});
	describe('episodesConverter function', () => {
		it('With Object', () => {
			// Arrange
			let episodes = [
				{
					id: 100,
					air_date: "2015-05-05",
					episode_number: 5,
					still_path: "poster.jpg",
					overview: "Something...",
					vote_average: 8.9
				},
				{
					id: 101,
					air_date: "2015-06-05",
					episode_number: 6,
					still_path: "poster.jpg",
					overview: "Something...",
					vote_average: 8.9
				}
			];
			// Act

			// Assert
			let data = dto.episodeCoverter(episodes);

			expect(data).not.to.be.null;
			let object = data[0];
			expect(object.id).to.equal(100);
			expect(object.airDate).to.equal("2015-05-05");
			expect(object.number).to.equal(5);
			expect(object.rating).to.equal(8.9);
		});
	});
	describe('getTmdbUrl function', () => {
		it('has id and prefix', () => {
			// Arrange
			let prefix = "movie";
			let tmdbId = 550;

			// Act
			let data = dto.getTmdbUrl(tmdbId, prefix);

			// Assert
			expect(data).to.contain(prefix);
			expect(data).to.contain(tmdbId);

		});
		it('has id but no prefix', () => {
			// Arrange
			let tmdbId = 550;

			// Act
			let data = dto.getTmdbUrl(tmdbId);

			// Assert
			expect(data).to.contain(tmdbId);
		});
		it('no Id', () => {
			// Arrange

			// Act
			let data = dto.getTmdbUrl();

			// Assert
			expect(data).to.be.null;
		});
	});
	describe('getImdbUrl function', () => {
		it('has id', () => {
			// Arrange
			let imdbId = 550;

			// Act
			let data = dto.getImdbUrl(imdbId);

			// Assert
			expect(data).to.contain(imdbId);

		});
		it('no Id', () => {
			// Arrange

			// Act
			let data = dto.getImdbUrl();

			// Assert
			expect(data).to.be.null;
		});
	});
	describe('getStill function', () => {
		it('has image url', () => {
			// Arrange
			let imagePath = "poster.jpg";

			// Act
			let data = dto.getStill(imagePath);

			// Assert
			expect(data).to.contain("poster.jpg");
		});
		it('No image file', () => {
			// Arrange

			// Act
			let data = dto.getStill();

			// Assert
			expect(data).to.be.null;
		});
	});
});