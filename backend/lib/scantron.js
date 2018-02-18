module.exports = (io) => {
	io.on('connect', socket => {
		socket.on('scanData', data => {			
			socket.broadcast.emit('addScanData', data);
		});
	});
};