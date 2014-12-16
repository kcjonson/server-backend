var indigo = require('../lib/indigo');
var config = require('../../config/indigo.json');







exports.start = function(params){
	var app = params.app;
	console.log('Starting Indigo REST Endpoints');


// Connect Server

	indigo.connectServer();



// Listen for Events from Indigo

	app.post(config.API_URL + '/push', function(req,res){
		var data = req.body;
		console.log('POST: ' + config.API_URL + '/push', data);
		res.send();
	});
	

// All

	app.get(config.API_URL, function(req, res) {
		console.log('GET ' + config.API_URL);
		var indigoData = {};
		indigo.getVariables(function(variablesError, variablesData){
			log('getVariables:finish')
			if (variablesError) {res.send(variablesError)} else {
				log('getVariables:success')
				indigoData.variables = variablesData;
				indigo.getActions(function(actionsError, actionsData){
					log('getActions:finish')
					if (actionsError) {res.send(actionsError)} else {
						log('getActions:success')
						indigoData.actions = actionsData;
						indigo.getDevices(function(devicesError, devicesData){
							log('getDevices:finish')
							if (devicesError) {res.send(devicesError)} else {
								log('getDevices:success')
								indigoData.devices = devicesData;
								res.send(indigoData);
							}
						});
					}
				});
			}
		});
	});


// Actions

	app.get(config.API_URL + '/actions/', function(req, res){
		console.log('GET ' + config.API_URL + 'actions/');
		indigo.getActions(function(error, actionsData){
			if (error) {res.send(error)} else {
				//console.log(actionsData);
			}
		});
	});

	app.get(config.API_URL + '/actions/:name', function(req, res) {
		var action = req.params.name;
		console.log('GET ' + config.API_URL + 'actions/');
		if (action) {
			indigo.executeAction(req.params.name, function(error){
				res.send();
			});
		}
	});


// Variables

	app.get(config.API_URL + '/variables/', function(req, res) {
		console.log('GET ' + config.API_URL + 'variables/');
		indigo.getVariables(function(error, variablesData){
			if (error) {res.send(error)} else {
				res.send(variablesData);
			}
		});
	});

	app.get(config.API_URL + '/variables/:name', function(req, res) {
		console.log('GET ' + config.API_URL);
		var variableName = req.params.name;
		indigo.getVariable(variableName, function(error, variableData){
			if (error) {res.send(error)} else {
				res.send(variableData);
			}
		});

	});
	
	app.post(config.API_URL + '/variables/:name', function(req, res) {
		var variableName = req.params.name;
		console.log('POST ' + config.API_URL + 'variables/', variableName);
	});

	app.patch(config.API_URL + '/variables/:name', function(req, res) {
		var variableName = req.params.name;
		var variableValue = req.body.value;
		console.log('PATCH ' + config.API_URL + 'variables/', variableName, req.body);
		indigo.setVariable(variableName, variableValue, function(error, variableData){
			if (error) {res.send(error)} else {
				res.send();
			}
		});
	});

	app.put(config.API_URL + '/variables/:name', function(req, res) {
		var variableName = req.params.name;
		var variableValue = req.body.value;
		console.log('PUT ' + config.API_URL + 'variables/', variableName, variableValue);
		indigo.setVariable(variableName, variableValue, function(error, variableData){
			if (error) {res.send(error)} else {
				res.send();
			}
		});
	});


// Devices

	app.get(config.API_URL + '/devices/', function(req, res){
		console.log('GET ' + config.API_URL + '/devices/');
	});

	app.patch(config.API_URL + '/devices/:name', function(req, res) {
		var deviceName = req.params.name;
		console.log('PATCH ' + config.API_URL + 'variables/', deviceName, req.body);
		indigo.setDeviceProperties(deviceName, req.body, function(error, deviceData){
			res.send(deviceData);
		});
	});



};

function log(message) {
	//console.log(message);
}




