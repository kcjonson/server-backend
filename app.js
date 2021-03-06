process.stdout.write('event: SERVER_STARTING');

// Node Modules
var express = require('express');
var https = require('https');
var http = require('http');
var fs = require('fs');
var mongoose = require('mongoose');
var path = require('path');

// Express Middleware
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var auth = require('./app/middleware/auth');
var request = require('./app/middleware/request');

// Lib
var config = require('./app/lib/config');
var log = require('./app/lib/log');
var database = require('./app/lib/database');
var services = require('./app/services');




var app;  // Ref to express application instance


connectDatabase()
	.then(configureExpress)
	.then(startEvents)
	.then(attachServices)
	.then(createServer)
	.then(function(){
		// Its a bit brute force, but we're going to capture this
		// in the startup sequence to measure time and to enable keepalive.
		// NOTE: This should be the absolutely last thing in the startup sequence.
		process.stdout.write('event: SERVER_STARTED');
	})
	.catch(function(e) {
		log.error(e);
		process.exit();
	});



function connectDatabase() {
	log.debug('')
	return new Promise(function(resolve, reject){
		database.getConnection(function(err, connection){
			if (err) {
				log.error('Startup failed: Unable to connect to database.');
				process.exit();
			}
			resolve();
		})
	})
}


function startEvents() {
	// TODO: These should be a promise chain, not all startup is sync! (there are timeout hacks scattered around)
	require('./app/lib/devices').start();
	require('./app/lib/triggers').start();
	require('./app/lib/users').start();
}


function configureExpress() {
	log.debug('')

	// Engine and views setup
	app = express();

	// Cookie and Session Setup
	app.use(cookieParser(config.get('AUTH_COOKIE_SECRET')));
	app.use(session({
		secret: config.get('AUTH_SESSION_SECRET'),
		resave: false,
	    saveUninitialized: true,
	    rolling: true,
	    store: new MongoStore({ mongooseConnection: mongoose.connection }),
		cookie: {
			httpOnly: false,
			expires: new Date(new Date().getTime()+30*24*60*60*1000)
		}
	}));

	// Auth and Static Setup
	app.use(auth);
	app.use(request);
	//app.use(express.logger('dev'));

	if (config.get('DASHBOARD_ENABLED')) {
		var publicDirectory = path.resolve(__dirname, config.get('SERVER_PUBLIC_DIRECTORY'));
		log.info('Mapping public directory: ', publicDirectory);
		app.use(express.static(publicDirectory));
	}

	// bodyParser must go ofter proxy settings because it interrupts the 
	// post stream.
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({
	  extended: true
	}));

};


function attachServices() {
	services.attach({app: app});

}


function createServer() {

	if (config.get('SERVER_SSL_ENABLED')) {
		// Secure Server
		https.createServer({
			key: fs.readFileSync(config.get('SERVER_SSL_PRIVATE_KEY'), 'utf8'),
			cert: fs.readFileSync(config.get('SERVER_SSL_CERT'), 'utf8'),
		    requestCert: false,
		    rejectUnauthorized: false
		}, app).listen(config.get('SERVER_SECURE_PORT'))
		log.info('Secure Server started on port ' + config.get('SERVER_SECURE_PORT'));
	}

	// Unsecure Server
	http.createServer(app).listen(config.get('SERVER_PORT'));
	log.info('Server started on port ' + config.get('SERVER_PORT'));

	app.get('/api/test', function (req, res) {
		res.writeHead(200);
		res.end("server is running");
	});
	
}
















