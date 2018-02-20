#!/usr/bin/env node

/**
 * Module dependencies.
 */

const app = require('../backend/index');
const debug = require('debug')('pitron:server');
const http = require('http');

const port = normalizePort(process.env.PORT || '4000');
app.set('port', port);

// Start HTTP server
var server = http.createServer(app);
app.get('socketio').listen(server);
server.listen(port);
server.on('error', onServerError);
server.on('listening', function() {
	var addr = server.address();
	var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
	debug('Listening on ' + bind);
});

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
	var port = parseInt(val, 10);
	if (isNaN(port)) {
		// named pipe
		return val;
	}
	if (port >= 0) {
		// port number
		return port;
	}
	return false;
}
/**
 * Event listener for HTTP server "error" event.
 */
function onServerError(error) {
	if (error.syscall !== 'listen') {
		throw error;
	}
	var bind = typeof port === 'string' ? ('Pipe ' + port) : ('Port ' + port);
	// handle specific listen errors with friendly messages
	switch (error.code) {
		case 'EACCES':
			console.error(bind + ' requires elevated privileges');
			process.exit(1);
			break;
		case 'EADDRINUSE':
			console.error(bind + ' is already in use');
			process.exit(1);
			break;
		default:
			throw error;
	}
}
