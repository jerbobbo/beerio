var CronJob = require('cron').CronJob;
var date = new Date(Date.now() + 60000);
var job = new CronJob(date, sendMail, finish, true, 'America/Los_Angeles');

function sendMail() {
    console.log(Date.now())
}
function finish() {
    console.log('stopping job')
    job.stop()
}