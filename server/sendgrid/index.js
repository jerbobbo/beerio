var path = require('path');
var SENDGRID_KEY = require(path.join(__dirname, '../env')).SENDGRID.emailKey || process.env.SENDGRID_KEY;
var sendgrid = require('sendgrid')(SENDGRID_KEY);



module.exports = {
	mailTo: function(to) {

		var email = new sendgrid.Email({
			to: to,
			from: 'w00t@beer.io',
			subject: 'Thanks for buying from beer.io!',
			text: 'Your order is on its way. Get ready.'
		});

		sendgrid.send(email, function(err, json) {
			if (err) {
				return console.error(err);
			}
			console.log(json);
		});
	},
	mailToReset: function(to, token) {

		var email = new sendgrid.Email({
			to: to,
			from: 'w00t@beer.io',
			subject: 'Password reset for beer.io',
			text: 'Use this link for "http://localhost:1337/passreset/' + token + '" password reset.'
		});

		sendgrid.send(email, function(err, json) {
			if (err) {
				return console.error(err);
			}
			console.log(json);
		});
	}
}