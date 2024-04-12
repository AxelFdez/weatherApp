class City {
	constructor(name, longitude, latitude) {
		this.name = name;
		this.longitude = longitude;
		this.latitude = latitude;
	}

	getName() {
		return this.name;
	}

	getLongitude() {
		return this.longitude;
	}

	getLatitude() {
		return this.latitude;
	}

	formatCityData() {
		return {
			name: this.name,
			longitude: this.longitude,
			latitude: this.latitude
		};
	}

	static async create(name, longitude, latitude) {
		let db = require("../config/sqlite");
		if (!db) {
			reject(new Error("Database not here"));
			return;
		}
		db.serialize(() => {
			const stmt = db.prepare("INSERT INTO city VALUES (?,?,?)");
			stmt.run(name, longitude, latitude);
			stmt.finalize();
		});
	}

	static async update(name, longitude, latitude) {
		let db = require("../config/sqlite");
		if (!db) {
			reject(new Error("Database not here"));
			return;
		}
		db.serialize(() => {
			const stmt = db.prepare("UPDATE city SET lon = ?, lat = ? WHERE name = ?");
			stmt.run(longitude, latitude, name);
			stmt.finalize();
		});
	}

	static async getCityFromDB(cityName) {
		return new Promise((resolve, reject) => {
			let db = require("../config/sqlite");
			if (!db) {
				reject(new Error("Database not here"));
				return;
			}
			db.get("SELECT * FROM city WHERE LOWER(name) = LOWER(?)", cityName, (err, row) => {
				if (err) {
					reject(err);
					return;
				}
				if (!row) {
					reject(new Error(`City '${cityName}' not found in the database`));
					return;
				}
				resolve(new City(row.name, row.lon, row.lat));
			});
		});
	}

	static async getAllCityNames() {
		return new Promise((resolve, reject) => {
			let db = require("../config/sqlite");
			if (!db) {
				reject(new Error("Database not here"));
				return;
			}
			let cities = [];
			db.all("SELECT name FROM city", (err, rows) => {
				if (err) {
					reject(err);
					return;
				}
				for (let i = 0; i < rows.length; i++) {
					cities.push(rows[i].name);
				}
				resolve(cities);
			});
		});
	}
}

module.exports = City;