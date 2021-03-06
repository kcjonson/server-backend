var config = require('../lib/config');
var mongoose = require('mongoose');

var deviceUpdateSchema = new mongoose.Schema({
	deviceId: mongoose.Schema.Types.ObjectId,
	property: String,
	value: String,
	time : { 
		type : Date, 
		default: Date.now 
	}
});

module.exports =  mongoose.model(config.get('DEVICES_UPDATES_COLLECTION'), deviceUpdateSchema);