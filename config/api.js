let fetch = require('node-fetch');
let dayjs = require('dayjs');
const connectBdd = require('./mongoDB');
const city = require('../models/cityMongodbSchema');

dayjs.extend(require('dayjs/plugin/utc'));
dayjs.extend(require('dayjs/plugin/timezone'));
dayjs.extend(require('dayjs/plugin/isSameOrBefore'));

dayjs.tz.setDefault("Europe/Paris");

class Api
{
	static cachedTime = 5;
	static url = 'https://api.met.no/weatherapi/locationforecast/2.0/compact';
	static option = { method: 'GET', headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36' } };

	static async getData(longitude, latitude) {
		try {
			const res = await fetch(this.url + "?lat=" + latitude + "&lon=" + longitude, this.option);
			if (res.status !== 200) {
				throw new Error(res.statusText);
			}
			const data = await res.json();
			return data;
		} catch (e) {
			return undefined;
		}
	}

	static getDaysData(data) {

		const daysName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
		let now = dayjs.tz();
		let today = null;
		let i = 0;
		while (!today) {
			if (now.isSameOrBefore(dayjs.tz(data.properties.timeseries[i].time))) {
				today = dayjs.tz(data.properties.timeseries[i].time).date();
				break;
			}
			i++;
		}
		i--;
		let dayWeatherData = [];
		dayWeatherData.push({"day": daysName[dayjs.tz(data.properties.timeseries[0].time).day()] ,"data" : data.properties.timeseries[0].data}); // current day

		let hourReference = 12;
		while (dayWeatherData.length < 6 &&	i < data.properties.timeseries.length)
		{
			if (dayjs.tz(data.properties.timeseries[i].time).date() > today && dayjs.tz(data.properties.timeseries[i].time).hour() === hourReference)
			{
				dayWeatherData.push({"day": daysName[dayjs.tz(data.properties.timeseries[i].time).day()] ,"data" : data.properties.timeseries[i].data});
				today = dayjs.tz(data.properties.timeseries[i].time).date();
			}
			i++;
		}
		return dayWeatherData;
	}

	static getHoursData(data) {
		let now = dayjs.tz();
		let today = null;
		let i = 0;
		while (!today) {
			if (now.isSameOrBefore(dayjs.tz(data.properties.timeseries[i].time))) {
				today = dayjs.tz(data.properties.timeseries[i].time).date();
				break;
			}
			i++;
		}
		i--;

		let hourPerHourOfCurrentDay = [];
		for (i; i < 24; i++) {
				hourPerHourOfCurrentDay.push({"hour" : dayjs.tz(data.properties.timeseries[i].time).hour(), "data" : data.properties.timeseries[i].data});
		}

		return hourPerHourOfCurrentDay;
	}


	static async cacheData(cityName, HoursData, Daysdata, time) {
		await connectBdd();
		const updatedCity = await city.findOneAndUpdate(
			{ name: cityName },
			{ $set: { 'forecastData': { hoursData: HoursData, daysData: Daysdata, lastApiCall: time } } },
			{ new: true }
		  );
		  if (!updatedCity) {
			throw new Error(`City '${cityName}' not found in the database`);
		  }
		await manageYesterdayData(updatedCity);
	}

	static async getCachedData(cityName) {
		await connectBdd();
		const findCity = await city.findOne({ name: cityName });
		// console.log(findCity);
		if (!findCity || !findCity.forecastData) {
			return undefined;
		}
		if (dayjs(findCity.forecastData.lastApiCall).minute() - dayjs().minute() > this.cachedTime)
		{
			return undefined;
		}
		return findCity.forecastData;
	}

	static async getYesterdayData(cityName) {
		await connectBdd();
		const findCity = await city.findOne({ name: cityName });
		if (!findCity) {
			return undefined;
		}
		return findCity.SavedDataDaysBefore.yesterday;
	}
}

async function manageYesterdayData(cityFound) {
	let now = dayjs(cityFound.forecastData.lastApiCall);
	let yesterday = dayjs(cityFound.SavedDataDaysBefore.yesterday);
	let nextYesterday = dayjs(cityFound.SavedDataDaysBefore.nextYesterday);
	if (nextYesterday.time && nextYesterday.time.day() === now.day() + 1)
	{
		yesterday.time = nextYesterday.time;
		yesterday.daysData = nextYesterday.daysData;
		nextYesterday.time = now;
		nextYesterday.daysData = cityFound.forecastData.daysData[0];
	}
	else if (yesterday.time && now.day() !== yesterday.time.day() + 1 ) {
		yesterday.time = null;
		yesterday.daysData = null;
		nextYesterday.time = now.toDate()
		nextYesterday.daysData = cityFound.forecastData.daysData[0];
	}
	else if (!nextYesterday.time) {
		nextYesterday.time = now.toDate();
		nextYesterday.daysData = cityFound.forecastData.daysData[0];
	}
		await city.updateOne({ _id: cityFound._id }, {$set: { 'SavedDataDaysBefore.nextYesterday.time': nextYesterday.time, 'SavedDataDaysBefore.nextYesterday.daysData': nextYesterday.daysData}});
}


module.exports = Api;