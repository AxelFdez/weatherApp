let fetch = require('node-fetch');
let dayjs = require('dayjs');

dayjs.extend(require('dayjs/plugin/utc'));
dayjs.extend(require('dayjs/plugin/timezone'));
dayjs.extend(require('dayjs/plugin/isSameOrBefore'));

dayjs.tz.setDefault("Europe/Paris");

class Api
{
	static cachedData = {};
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
			if (dayjs.tz(data.properties.timeseries[i].time).date() === today) {
				hourPerHourOfCurrentDay.push({"hour" : dayjs.tz(data.properties.timeseries[i].time).hour(), "data" : data.properties.timeseries[i].data});
			}
		}

		return hourPerHourOfCurrentDay;
	}

	static cacheData(city, HoursData, Daysdata, time) {
		this.cachedData[city] = { data: {hoursData : HoursData, daysData : Daysdata} , lastApiCall: time };
	}

	static getCachedData(city) {
		if (this.cachedData[city] == undefined) {
			return undefined;
		}
		if (new Date() - this.cachedData[city].lastApiCall > this.cachedTime * 60 * 1000) {
			return undefined;
		}
		return this.cachedData[city].data;
	}
}

module.exports = Api;