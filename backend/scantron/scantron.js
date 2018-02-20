const Scanner = require('./components/scanner');

module.exports = io => {
	io.on('connect', socket => {
		console.log(`Connection to Scantron module with ${socket.id}`);
		socket
		.on('start', path => {
			new Scanner(path)
			.on('error', error => {
				socket.emit('scannerError', error);
			})
			.on('data', data => {
				socket.emit('scannerData', data);
			})
			.on('done', sheetCounter => {
				socket.emit('scannerDone', sheetCounter);
			})
			.start();
		});
	});
};

