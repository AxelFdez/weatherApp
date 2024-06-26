module.exports = (req, res, next) => {

	if (req.session.flash) {
		res.locals.flash = req.session.flash;
		req.session.flash = undefined;
	}

	req.flash = (type, message) => {
		if (req.session.flash == undefined) {
			req.session.flash = {};
		}
		req.session.flash[type] = message;

	}
	next();
};