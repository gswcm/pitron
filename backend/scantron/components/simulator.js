const serialPort = require("serialport");
const eventEmitter = require('events');

class Simulator extends eventEmitter {
	constructor(path) {
		super();
		this.numSheets = 3;
		this.verbosity = 1;
		this.fsmState = "";
		this.fsmSubState = 0;
		this.sheetCounter = 0;
		this.mc = [];
		this.endChar = "!";
		//-- Simulator events
		this.on('error', error => {
			console.error(`Simulator event: ${error.message}`);
		});
		this.path = path || '/dev/ttyS0';
		//-- Serialport instance and events
		this.port = new serialPort(
			this.path, {
				baudRate: 9600,
				stopBits: 2,
				dataBits: 8,
				parity: 'none',
				autoOpen: false
			}
		)
		.on('error', this.errorHandler.bind(this))
		.on('open', this.openHandler.bind(this))
		.on('close', this.closeHandler.bind(this));
		//-- Data stream handler
		this.port.pipe(new serialPort.parsers.Delimiter({
			delimiter: Buffer.from('\r', 'utf8'), 
			encoding: 'utf8',
			includeDelimiter: true
		}))
		.on('data', this.dataHandler.bind(this));
	}
	controller(action) {
		if(['stop', 'start'].indexOf(action) !== -1) {
			if(this.port && this.port.isOpen) {
				this.port.close();
			}
		}
		if(action === 'start') {
			this.port.open();
		}
	}
	isRunning() {
		return this.port.isOpen;
	}
	setNumSheets(numSheets) {
		this.numSheets = numSheets;
		return this;
	}
	setVerbosity(verbosity) {
		this.verbosity = verbosity;
		return this;
	}
	errorHandler(error) {
		this.emit('error', error);
		if(this.port && this.port.isOpen) {
			this.port.close();
		}
	}
	closeHandler() {
		this.emit('stopped');
	}
	openHandler() {
		this.fsmState = "sendName";
		this.fsmSubState = 0;
		this.sheetCounter = 0;
		this.mc = [];
		this.endChar = "!";
		this.emit('started');
	}
	write(data) {
		this.port.write(data, (err) => {
			if(err) {
				this.errorHandler(err);
				return;
			}
			this.port.drain();
		});
	}
	static getRandomInt(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min)) + min;
	}
	dataHandler(data) {
		data = data.replace("\x1B", "").replace(/\r/g,'');
		switch (this.fsmState) {
			case "sendName":
				if (data.length === 0) {
					// NOP
				}
				else if (data.indexOf("QREV") > -1) {
					this.write(`\x0DMODEL Simulator on ${this.path}\x0D`);
				}
				else if (data.indexOf("SRST") > -1) {
					this.fsmState = "getFormData";
					this.write("\x0D");
				}
				else {
					this.errorHandler(new Error(`Incorrect data in 'sendName' state, i.e. ${data}`));						
					return;
				}
				break;
			case "getFormData":
				if (data.indexOf("FRM=FS") > -1) {
					this.write("\x0D");
				}
				else if (data.indexOf("FRM=MC") > -1) {
					this.mc.push(data.split(/\s+/));
					this.write("\x0D");
				}
				else if (data.indexOf("FRM=LS") > -1) {
					this.fsmState = "doCalibration";
					this.write("\x0D");
				}
				else {
					this.errorHandler(new Error(`Incorrect data in 'getFormData' state, i.e. ${data}`));						
					return;
				}
				break;
			case "doCalibration":
				if (data.indexOf("THR") > -1 || data.indexOf("CAL") > -1 || data.indexOf("NMK") > -1 || data.indexOf("MMK") > -1) {
					this.write("\x0D");
				}
				else if(data.indexOf("ERR") > -1){
					this.write("\x0D");
				}
				else if (data.indexOf("END") > -1) {
					this.endChar = String.fromCharCode(data.split(/[^0-9]+/)[1]);
					this.fsmState = "doScan";
					this.fsmSubState = 0;
					this.sheetCounter = 0;
					this.write("\x0D");
				}
				else {
					this.errorHandler(new Error(`Incorrect data in 'doCalibration' state, i.e. ${data}`));						
					return;
				}
				break;
			case "doScan":
				if (this.fsmSubState === 0 && data.indexOf("HOPR") > -1) {
					this.fsmSubState = 1;
					this.write("\x0D");
				}
				else if (this.fsmSubState === 1 && data.indexOf("READ") > -1) {
					if (this.sheetCounter >= this.numSheets) {
						this.port.write(this.endChar + "\x0D", () => {
							//-- Done with with one simulation batch, start the other
							console.log(`${this.path}: simulated ${this.sheetCounter} sheets`);
							this.fsmState = "sendName";
							this.fsmSubState = 0;
							this.sheetCounter = 0;
							this.mc = [];
							this.endChar = "!";
						});
						return;
					}
					let tempString = "";
					for(let mc of this.mc) {	
						let chars = mc[12].split("");
						for (let i = 0; i < parseInt(mc[10]); i++) {
							tempString += chars[Simulator.getRandomInt(0, parseInt(mc[11]))];
						}
					}
					this.fsmSubState = 0;
					this.sheetCounter++;
					setTimeout(() => {
						this.write("\x0D" + tempString + "\x0D");
						this.emit('data', tempString);
					}, Simulator.getRandomInt(200, 300));
				}
				else {
					this.errorHandler(new Error(`Incorrect data in 'doScan' state, i.e. ${data}`));
					return;
				}
				break;
		}
	}
}

module.exports = Simulator;
