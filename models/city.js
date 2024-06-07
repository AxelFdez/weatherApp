const mongoose = require('mongoose');
const connectBdd = require('../config/mongoDB');
const city = require('../models/cityMongodbSchema');

class City {
	constructor(name, longitude, latitude, forecastData = {}) {
		this.name = name;
		this.longitude = longitude;
		this.latitude = latitude;
	}

	// citySchema = new Schema({
	// 	name: String,
	// 	longitude: Number,
	// 	latitude: Number
	// });

	// cityMongodb = mongoose.model('City', this.citySchema);

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
			latitude: this.latitude,
		};
	}

	static async SqliteCreate(name, longitude, latitude) {
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

	static async SqliteUpdate(name, longitude, latitude) {
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

	static async SqlitegetCityFromDB(cityName) {
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

	static async SqlitegetAllCityNames() {
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

	static async MongodbCityCreate(name, longitude, latitude) {
		// let city = new City(name, longitude, latitude);
		await connectBdd();
		const newCity = new city({
			name: name,
			longitude: longitude,
			latitude: latitude,
			forecastData: { forecastData: { hoursData: null, daysData: null }, lastApiCall: null },
			SavedDataDaysBefore: { yesterday : { daysData : null , time : null }, nextYesterday : { daysData : null, time : null}}
		});
		await newCity.save();
	}

	static async MongodbCityUpdate(name, longitude, latitude) {
		await connectBdd();
		await city.updateOne({ name: name }, { longitude: longitude, latitude: latitude });
	}

	static async MongodbGetCityFromDB(cityName) {
		await connectBdd();
		// console.log("cityName", cityName);
		const findCity = await city.findOne({ name: cityName });
		if (!findCity) {
			throw new Error(`City '${cityName}' not found in the database`);
		}
		return findCity;
	}

	static async MongodbGetAllCityNames() {
		await connectBdd();
		let cities = [];
		let allCities = await city.find();
		for (let i = 0; i < allCities.length; i++) {
			cities.push(allCities[i].name);
		}
		// console.log("allCities", cities);
		return cities;
	}
}

module.exports = City;