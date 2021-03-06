var config = require('../lib/config');
var collector = require('./collector');
var devices = require('../lib/devices');
var log = require('../lib/log');



exports.start = function(params) {
	
	var app = params.app;


	log.info('Starting Devices REST Endpoints');	

	collector.registerEndpoint(config.get('DEVICES_API_URL'));
	app.get(config.get('DEVICES_API_URL'), function(req, res) {
		log.info('GET ' + config.get('DEVICES_API_URL'));
		devices.get(function(e, data){
			if (e) {
				log.error(e);
				res.send({
					error: e
				})
			} else {
				res.send(data);
			}
		})
	});

	app.get(config.get('DEVICES_API_URL') + '/sync', function(req, res) {
		log.info('GET ' + config.get('DEVICES_API_URL') + '/sync');
		devices.sync(function(e){
			res.send();
		})
	});

	app.get(config.get('DEVICES_API_URL') + '/push', function(req, res) {
		log.info('GET ' + config.get('DEVICES_API_URL') + '/push');
		res.writeHead(200, {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			'Connection': 'keep-alive'
		});
		res.connection.setTimeout(0);
		var writeData = function(event){
			res.write("data: " + JSON.stringify(event.data) + "\n\n");
		};
		devices.events.on('change', writeData);
		req.on("close", function() {
			devices.events.removeListener('change', writeData);
		});
	});

	app.get(config.get('DEVICES_API_URL') + '/:id', function(req, res) {
		var id = req.params.id;
		log.info('GET ' + config.get('DEVICES_API_URL') + '/' + id);

		res.send({
			error: 'Getting devices by ID is not implemented'
		})

		// TODO
		// devices.get(function(e, devicesData){
		// 	res.send(devicesData);
		// })
	});

	app.patch(config.get('DEVICES_API_URL') + '/:id', function(req, res) {
		var id = req.params.id;
		var variableValue = req.body.value;
		log.info('PATCH ' + config.get('DEVICES_API_URL') + '/' + id);
		devices.set(id, req.body, function(err, deviceData){
			if (err) {res.send(err)} else {
				res.send(deviceData);
			}
		});
	});
	
};





	