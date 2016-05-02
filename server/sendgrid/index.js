var path = require('path');
var SENDGRID_KEY = require(path.join(__dirname, '../env')).SENDGRID.emailKey;
var sendgrid = require('sendgrid')(SENDGRID_KEY);



module.exports = {
	mailTo: function(to) {

		var email = new sendgrid.Email({
			to: to,
			from: 'w00t@beer.io',
			subject: 'Thanks for buying from beer.io!',
			text: 'This is my first email through SendGrid'
		});

		sendgrid.send(email, function(err, json) {
			if (err) {
				return console.error(err);
			}
			console.log(json);
		});
	}
}