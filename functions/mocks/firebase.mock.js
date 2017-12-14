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
	child: (id) => {
		this.id = id;
		return refStub;
	},
	once: (value, callback) => {
		callback(snapshot);
	},
	on: (value, callback) => {
		callback(snapshot);
	},
	orderByChild: () => {
		return refStub;
	},
	equalTo: () => {
		return refStub;
	},
	update: () => {
		return refStub;
	},
	push: () => {
		return refStub;
	},
	set: () => {
		return setObject();
	},
};

let databaseStub  = {
	path: "",
	child: refStub,
	ref: function(path) {
		this.child.path = path;
		this.path = path;
		return this.child;
	}
};

let setObject = () => {
	return new Promise((resolve, reject) => {
		resolve({
			id: 550,
			displayName: "Test User"
		})
	});
};

let snapshot = {
	numChildren: () => {
		return 1;
	},
	forEach: (callback) => {
		callback(item);
	},
	val: () => {
		return value;
	}
};

let item = {
	val: () => {
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