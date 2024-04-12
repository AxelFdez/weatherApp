let sqlite3 = require('sqlite3').verbose();


let db = new sqlite3.Database('./DB/cities.db', (err) => {
	if (err) {
		console.log("database not here");
		module.exports = null;
	}
	db.serialize(() => {
		db.run(`CREATE TABLE IF NOT EXISTS city (
			name TEXT,
			lon REAL,
			lat REAL
		)`, (err) => {
			if (err) {
				throw new Error("Database error",);
			}
		});
	});
});

module.exports = db;