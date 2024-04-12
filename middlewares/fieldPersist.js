module.exports = (req, res, next) => {

	res.locals.city = req.session.city || '';
	res.locals.longitude = req.session.longitude || '';
	res.locals.latitude = req.session.latitude || '';

	req.session.city = undefined;
	req.session.longitude = undefined;
	req.session.latitude = undefined;
	next();
}