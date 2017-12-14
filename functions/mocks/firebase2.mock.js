let admin = {
	database: () => {
		return databaseStub;
	},
	auth: () => {
		return user;
	}
};
let user = {
	getUser: () => {
		return new Promise((resolve, reject) => {
			resolve({
				id: 550,
				displayName: "Test User"
			})
		})
	}
};

let refStub = {
	id: "",
	child: function(id) {
		this.path += id;
		return refStub;
		console.log(this.path);
	},
	once: function(value, callback) {
		callback(snapshot);
	},
	on: function(value, callback) {
		callback(snapshot);
	},
	orderByChild: function() {
		return this;
	},
	equalTo: function() {
		return this;
	},
	update: function() {
		return this;
	},
	push: function() {
		return this;
	},
	set: function() {
		return setObject();
	},
};

let databaseStub  = {
	path: "",
	values: {},

	ref: function(path) {
		this.path = path;
		return this;
	},

	child: function(id) {
		this.path += id;
		return this;
	},
	once: function(value, callback) {
		callback(snapshot);
	},
	on: function(value, callback) {
		callback(snapshot);
	},
	orderByChild: function() {
		return this;
	},
	equalTo: function() {
		return this;
	},
	update: function(object) {
		return this.set(object);
	},
	push: function() {
		return this;
	},
	set: function(object) {
		return new Promise((resolve, reject) => {
			this.value[this.path] = object;
			resolve(
				this.value[this.path]
			)
		});
	}
};

let snapshot = {
	numChildren: function() {
		return 1;
	},
	forEach: function(callback) {
		callback(item);
	},
	val: function() {
		return value;
	}
};

let item = {
	val: function() {
		return value;
	}
};
let value = {
	rating: 1.2,
	movieId: 550,
	tvId: 1418,
	uid: 1000291
};
module.exports = admin;