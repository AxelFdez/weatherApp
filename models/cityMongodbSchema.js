const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const citySchema = new Schema({
	name: String,
	longitude: Number,
	latitude: Number,
	forecastData: { type : Object, default : {forecastData : {data : {hoursData : null, daysData : null}}, lastApiCall : null} },
	SavedDataDaysBefore: { type : Object, default :  { yesterday : { daysData : null , time : null }, nextYesterday : { daysData : null, time : null}} }
});


const city = mongoose.model('City', citySchema);

module.exports = city;