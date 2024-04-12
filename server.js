let express = require('express');
let app = express();
let session = require('express-session');
let errorHandler = require('./utils/errorsHandler');
let capitalizeFirstLetter = require('./utils/utils');

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
	city.getAllCityNames().then(data => {
		req.session.cities = data;
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
	city.getCityFromDB(req.session.city).then(data => {
		city.update(req.session.city, req.session.longitude, req.session.latitude);
		req.flash('success', req.session.city + ' has been updated');
		res.redirect('/');
		return;})
	.catch(e => {
		try {
			city.create(req.session.city, req.session.longitude, req.session.latitude);
			req.flash('success', req.session.city + ' has been saved');
		}
		catch {
			req.flash('error', "database error : city not saved");
		}
		res.redirect('/');
	});
})

app.get('/:city', (req, res) => {
	let city = require('./models/city');
	if (!req.session.cities) {
		city.getAllCityNames().then(data => {
			req.session.cities = data;
		}).catch(e => {});
	}
	city.getCityFromDB(req.params.city.toLowerCase()).then(data => {
		let api = require('./config/api');
		let cachedData = api.getCachedData(data.name);
		if (cachedData != undefined) {
			// console.log("Data from cache");
			res.render('pages/city', { cities: req.session.cities, city: data, cityData: cachedData });
			return;
		}
		api.getData(data.longitude, data.latitude).then(dataFromApi => {
			if (dataFromApi == undefined){
				req.flash('error', "Api error : not available");
				res.redirect('/');
				return;
			}
			// console.log("Data from API");
			let daysData = api.getDaysData(dataFromApi);
			let hoursData = api.getHoursData(dataFromApi);
			api.cacheData(data.name, hoursData, daysData, new Date());
			res.render('pages/city', { cities: req.session.cities, city : data ,cityData: {hoursData : hoursData, daysData : daysData} });
			});
		}).catch(e => {
			req.flash('error', e.message);
			res.redirect('/');
		});
})

//start server
app.listen(8080, () => {
	  console.log('Server is running on port 8080');
});