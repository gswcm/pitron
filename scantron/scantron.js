const Scanner = require("./components/scanner");
const socketio = require("socket.io-client");

let socket = socketio('https://hmt.gswcm.net/scantron');

socket.on('connect', () => {
	console.log('Connected to ', socket.id);
	new Scanner(process.argv[2] || '/dev/tty.usbserial')
	.on('error', error => {
		console.error(error);
		socket.disconnect();
	})
	.on('data', data => {
		console.log(data);
		socket.emit('scanData', data);
	})
	.on('done', (count) => {
		console.log(count);
		socket.disconnect();
	})
	.action();	
});



