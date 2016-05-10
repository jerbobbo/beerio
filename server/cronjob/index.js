var CronJob = require('cron').CronJob;
var sendgrid = require('../sendgrid');

function finish() {
    console.log('stopping job')
    job.stop()
}

module.exports = {
    cronMail: function(email) {
        var body = 'Your order has shipped. Enjoy your sips';
        var subj = 'Beer.io - It\'s on the way!';
        console.log('Starting cron...');
        var date = new Date(Date.now() + 60000);
        var job = new CronJob(new Date(Date.now() + 60000), sendgrid.mailTo(email, subj, body), finish, true);
    }
}