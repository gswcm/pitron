const socketio = require('socket.io-client');
const Scanner = require('./components/scanner');

module.exports = io => {
	io.on('connect', localSocket => {
		console.log(`Connection to Scantron module with ${localSocket.id}`);
		localSocket
		.on('scannerStart', (path, receiver) => {
			let remoteSocket = socketio(receiver);
			remoteSocket.on('connect', () => {
				console.log(`Connection to remote receiver with ${remoteSocket.id}`);
				new Scanner(path)
				.on('error', error => {
					localSocket.emit('scannerError', error.message);
					remoteSocket.disconnect();
				})
				.on('data', data => {
					localSocket.emit('scannerData', data);
					remoteSocket.emit('scanData', data);
				})
				.on('done', sheetCounter => {
					localSocket.emit('scannerDone', sheetCounter);
					remoteSocket.disconnect();
				})
				.start();
			});
		});
	});
};

