const Simulator = require("./components/simulator");

new Simulator(process.argv[2] || '/dev/tty.usbserial')
.on('error', console.error)
.on('data', console.log)
.on('done', console.log)
.action();	


