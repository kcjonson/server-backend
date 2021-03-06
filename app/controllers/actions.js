var config = require('../lib/config');
var devices = require('../lib/devices');
var log = require('../lib/log');
var Actions = require('../lib/actions');
var collector = require('./collector');


exports.start = function(params) {
	log.info('Starting Actions REST Endpoints');	
	var app = params.app;

	collector.registerEndpoint(config.get('ACTIONS_API_URL'));
	app.get(config.get('ACTIONS_API_URL'), function(req, res) {
		log.info('GET ' + config.get('ACTIONS_API_URL'));
		Actions.get(function(err, actionsData){
			if (err) {res.send({error: err})}
			res.send(actionsData);
		});
	});
	app.get(config.get('ACTIONS_API_URL') + '/push', _handlePush);

	app.post(config.get('ACTIONS_API_URL') + '/execute/:id', function(req, res) {
		var id = req.params.id;
		log.info('POST ' + config.get('ACTIONS_API_URL') + '/execute/' + id);
		Actions.execute(id, function(err) {
			if (err) {res.send({error: err})}
			res.send();
		});
	});

	app.patch(config.get('ACTIONS_API_URL') + '/:id', function(req, res) {
		var id = req.params.id;
		log.info('PATCH ' + config.get('ACTIONS_API_URL') + '/' + id);

		Actions.set(id, req.body, function(err, data) {
			if (err) {res.send({error: err})}
			res.send(data);
		});
	});

};

function _handlePush(req, res) {
	log.info('GET ' + config.get('ACTIONS_API_URL') + '/push');
	res.writeHead(200, {
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
		'Connection': 'keep-alive'
	});
	res.connection.setTimeout(0);
	// var writeData = function(devicesData){
	// 	res.write("data: " + JSON.stringify(devicesData) + "\n\n");
	// };
	// devices.events.on('change', writeData);
	// req.on("close", function() {
	// 	devices.events.removeListener('change', writeData);
	// });
}
