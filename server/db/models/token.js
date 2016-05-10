'use strict';
var mongoose = require( 'mongoose' );
var Schema = mongoose.Schema;


var tokenSchema = new Schema({
    token: {type: String},
    createDate: {type: Date, default: Date.now}
});

tokenSchema.methods.hasExpired= function(){
    var now = new Date();
    return (now - createDate) > 60000; // token is 30 minutes old
};

mongoose.model('Token', tokenSchema);