const { isAlpha } = require('validator');

function serverError(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
}

function notFound(req, res, next) {
  res.status(404).send('Sorry cant find that!');
}

function inputError(req, res, next) {
	latConverted = parseFloat(req.body.latitude);
	lonConverted = parseFloat(req.body.longitude);
	if (req.body.city === 'undefined' || req.body.city === '' || !isAlpha(req.body.city)) {
		req.session.city = '';
		req.flash('error', 'Please enter a city name');
		return 1;
	}
	else if (req.body.city.length < 3 || req.body.city.length > 18) {
		req.session.city = '';
		req.flash('error', 'City name must be between 3 and 18 characters');
		return 1;
	}
	else if (req.body.latitude === 'undefined' || req.body.latitude === '') {
		req.flash('error', 'Please enter a latitude');
		return 1;
	}
	else if (req.body.longitude === 'undefined' || req.body.longitude === '') {
		req.flash('error', 'Please enter a longitude');
		return 1;
	}
	else if (!latConverted || !lonConverted || lonConverted < -180 || lonConverted > 180
		|| req.body.latitude < -90 || req.body.latitude > 90
		|| isNaN(req.body.longitude) || isNaN(req.body.latitude)
		|| req.body.longitude.length > 10 || req.body.latitude.length > 10) {
		req.session.latitude = '';
		req.session.longitude = '';
		req.flash('error', 'Please enter valid coordinates');
		return 1;
	}
  return 0;
}

module.exports = { serverError, notFound, inputError };