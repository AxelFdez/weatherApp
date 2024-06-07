let express = require('express');
let app = express();
let session = require('express-session');
let errorHandler = require('./utils/errorsHandler');
let { capitalizeFirstLetter } = require('./utils/utils');
const connectBdd = require('./config/mongoDB');

//template engine
app.set('view engine', 'twig');

//static files
app.use('/assets', express.static('public'));
app.use('/js', express.static('views/pages/js'));

// //middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(session({
  secret: 'axelfernandez',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))
app.use(require('./middlewares/flash'));
app.use(require('./middlewares/fieldPersist'));

//routes
app.get('/', (req, res) => {
	let city = require('./models/city');
	city.MongodbGetAllCityNames().then(data => {
		req.session.city = data;
		res.render('pages/index', { cities: data });
	}).catch(e => {
		req.flash('error', e.message);
		res.render('pages/index', { cities: undefined });
	});
})

app.get('/favicon.ico', (req, res) => {
	res.sendFile("./public/weatherIcons/weather/png/clearsky_day.png", { root: __dirname });
})

app.post('/', (req, res) => {
	req.session.city = capitalizeFirstLetter(req.body.city.toLowerCase());
	req.session.longitude = req.body.longitude;
	req.session.latitude = req.body.latitude;
	if (errorHandler.inputError(req, res)) {
		res.redirect('/');
		return;
	}
	let city = require('./models/city');
	city.MongodbGetCityFromDB(req.session.city).then(data => {
		city.MongodbCityUpdate(req.session.city, req.session.longitude, req.session.latitude);
		req.flash('success', req.session.city + ' has been updated');
		req.session.city = "";
		req.session.longitude = "";
		req.session.latitude = "";
		res.redirect('/');
		return;})
	.catch(e => {
		try {
			city.MongodbCityCreate(req.session.city, req.session.longitude, req.session.latitude);
			req.flash('success', req.session.city + ' has been saved');
			req.session.city = "";
			req.session.longitude = "";
			req.session.latitude = "";
		}
		catch {
			req.flash('error', "database error : city not saved");
		}
		res.redirect('/');
	});
});

app.get('/:city', (req, res) => {
	let city = require('./models/city');
	if (!req.session.city) {
		city.MongodbGetAllCityNames().then(data => {
			req.session.city = data;
		}).catch(e => {});
	}
	city.MongodbGetCityFromDB(req.params.city).then(data => {
		let api = require('./config/api');
		// console.log(data);
		api.getCachedData(data.name).then(cachedData => {
		// console.log(cachedData);
		// if (cachedData && cachedData.hoursData) {
		// 	res.render('pages/city', { cities: req.session.city, city: data, cityData: cachedData });
		// 	return;
		// }
		// console.log("Data from API");
		api.getData(data.longitude, data.latitude).then(dataFromApi => {
			if (dataFromApi == undefined){
				req.flash('error', "Api error : not available");
				res.redirect('/');
				return;
			}
			let daysData = api.getDaysData(dataFromApi);
			let hoursData = api.getHoursData(dataFromApi);
			api.cacheData(data.name, hoursData, daysData, new Date());
			res.render('pages/city', { cities: req.session.city, city : data ,cityData: {hoursData : hoursData, daysData : daysData} });
		});
	});
		}).catch(e => {
			req.flash('error', e.message);
			res.redirect('/');
		});
});

app.get('/yesterday/:city', (req, res) => {
	try {
	let city = require('./models/city');
	if (!req.session.city) {
		city.MongodbGetAllCityNames().then(data => {
			req.session.city = data;
		}).catch(e => {});
	}
	// console.log(req.params.city);
	city.MongodbGetCityFromDB(req.params.city).then(data => {
		let api = require('./config/api');
		// console.log(data);
		api.getYesterdayData(data.name).then(yesterdayData => {
			// console.log(yesterdayData);
			if (!yesterdayData) {
				req.flash('error', "No data available for yesterday");
				res.redirect('/');
				return;
			}
			// console.log(yesterdayData);
			// res.sendStatus(200);
			res.render('pages/yesterday', { cities: req.session.city, city : data ,yesterdayData: yesterdayData });
		});
	});
	} catch (e) {
		console.log(e);
	}
});


//start server
app.listen(8080, () => {
	  console.log('Server is running on port 8080');
});