const Simulator = require('./components/simulator');

module.exports = io => {
	io.on('connect', socket => {
		console.log(`Connection to Simulator module with ${socket.id}`);
		//-- Simulator and its events
		const simPath = process.env.SIMPATH || process.argv[2] || '/dev/ttyS0';
		let simulator = new Simulator(simPath)
		.on('error', error => {
			socket.emit('simulatorError', error.message);
		})
		.on('started', () => {
			socket.emit('simulatorStarted');
		})
		.on('stopped', () => {
			socket.emit('simulatorStopped');
		});
		//-- Socket events
		socket
		.on('simulatorStart', simNumSheets => {
			if(simNumSheets) {
				simulator.setNumSheets(simNumSheets);
			}
			simulator.controller('start');
		})
		.on('simulatorStop', () => {
			simulator.controller('stop');
		});
	});
};