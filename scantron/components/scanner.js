const serialPort = require("serialport");
const eventEmitter = require('events');

class Scanner extends eventEmitter {
	constructor(path, debug = false) {
		super();
		this.debug = debug;
		this.fsmState = "";
		this.fsmSubState = 0;
		this.sheetCounter = 0;
		this.endChar = "!";
		this.path = path || '/dev/ttyUSB0';
		this.frmDataLength = 0;
		this.frm = {
			fs: {
				rows: 62,
				cols: 48
			},
			mc: [
				{
					highRow: 62,
					lowRow: 53,
					highCol: 20,
					lowCol: 17,
					type: 'C',
					sizeAlong: 4,
					sizeAcross: 10,
					range: '0123456789'
				},
				{
					highRow: 51,
					lowRow: 7,
					highCol: 31,
					lowCol: 27,
					type: 'L',
					sizeAlong: 45,
					sizeAcross: 5,
					range: '12345'
				}
			]
		};
		this.calibDataObj = {
			THR: 42,
			CAL: 3,
			NMK: 48,
			MMK: 48,
			ERR: 7,
			END: 33
		};		
		this.calibData = Object.keys(this.calibDataObj).map(e => `\x1B${e}=${this.calibDataObj[e]}\x0D`);
		this.port = new serialPort(
			this.path, {
				baudRate: 9600,
				stopBits: 2,
				dataBits: 8,
				parity: 'none',
				autoOpen: false,
			}
		);				
	}
	errorHandler(error) {
		if(this.port && this.port.isOpen) {
			this.port.close();
		}
		this.emit('error', error.message);
	}
	openHandler() {
		this.fsmState = "doReset";
		this.write("\x0D\x1BQREV\x0D");	
	}
	write(data) {
		if(this.debug) {
			console.error('W:', data.split("").map(i => i.charCodeAt(0)));
		}
		this.port.write(data, (err) => {
			if(err) {
				this.errorHandler(err);
				return;
			}
			this.port.drain(err => {
				if(err) {
					this.errorHandler(err);
					return;
				}				
			});
		});
	}
	static getRandomInt(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min)) + min;
	}
	dataHandler(data) {
		data = data.replace(/\r/g,'');
		if(this.debug) {
			console.log(`R:(${this.fsmState})`, data.split("").map(i => i.charCodeAt(0)));
		}
		if(data === String.fromCharCode(this.calibDataObj.ERR)) {
			//-- Error, likely paper jam or incorrect form
			this.errorHandler(new Error("Paper jam or incorrect form"));			
			return;
		}
		switch(this.fsmState) {
			case "doReset":				
				if(data === "") {
					// NOP
				}
				else if(data.indexOf("MODEL") > -1) {
					this.fsmState = "doDefineForm";
					this.fsmSubState = -1;
					this.write("\x1BSRST\x0D");
				}
				else {
					this.errorHandler(new Error(`Incorrect data in 'doReset' state, i.e. '${data}'`));
					return;
				}
				break;
			case "doDefineForm":
				if(data === "") {
					if(this.fsmSubState === -1) {
						this.fsmSubState++;
						this.write("\x1BFRM=FS " + this.frm.fs.rows + " 0 " + this.frm.fs.cols + " N N N\x0D");
					}
					else {
						if(this.fsmSubState < this.frm.mc.length) {
							let temp = this.frm.mc[this.fsmSubState++];
							this.frmDataLength += temp.sizeAlong;
							this.write(
								"\x1BFRM=MC N N 1 1 " +
								temp.highRow + " " +
								temp.highCol + " " +
								temp.lowRow + " " +
								temp.lowCol + " " +
								temp.type + " " +
								temp.sizeAlong + " " +
								temp.sizeAcross + " " +
								temp.range +
								"\x0D"
							);
						}
						else {
							this.write("\x1BFRM=LS\x0D");
							this.fsmState = "doCalibrate";
							this.fsmSubState = 0;
						}
					}
				}
				else {
					this.errorHandler(new Error(`Incorrect data in 'doDefineForm' state, i.e. ${data}`));
					return;
				}
				break;
				case "doCalibrate":
				if(data === "") {
					if(this.fsmSubState < this.calibData.length) {
						this.write(this.calibData[this.fsmSubState++]);
					}
					else {
						this.fsmState = "requestData";
						this.fsmSubState = 0;
						this.sheetCounter = 0;
						this.write("\x1BHOPR L\x0D");
					}
				}
				else {
					this.errorHandler(new Error(`Incorrect data in 'doCalibrate' state, i.e. ${data}`));
					return;
				}
				break;
			case "requestData":
				if(data === "") {
					this.fsmState = "readData";
					this.write("\x1BREAD\x0D");
				}
				else {
					this.errorHandler(new Error(`Incorrect data in 'requestData' state, i.e. ${data}`));
					return;
				}
				break;
				case "readData":
				if(data === "") {
					// NOP
				}
				else if(data === String.fromCharCode(this.calibDataObj.END)) {
					this.emit('done', this.sheetCounter);
					if(this.port.isOpen) {
						this.port.close();
					}
					return;
				}
				else if(data.length === this.frmDataLength) {
					this.emit('data', data);
					this.sheetCounter++;
					this.fsmState = "requestData";
					this.write("\x1BHOPR L\x0D");
				}
				else {
					this.errorHandler(new Error(`Incorrect data in 'readData' state, i.e. ${data}`));
				}
				break;
		}
	}
	action() {
		this.fsmState = "";
		this.fsmSubState = 0;
		this.sheetCounter = 0;
		this.frmDataLength = 0;
		this.port
		.on('error', this.errorHandler.bind(this))
		.on('open', this.openHandler.bind(this));
		//.on('data', this.dataHandler.bind(this)); 
		this.port.pipe(new serialPort.parsers.Delimiter(
			{
				delimiter: Buffer.from('\r', 'utf8'), 
				encoding: 'utf8',
				includeDelimiter: true
			}
		))
		.on('data', this.dataHandler.bind(this));
		
		this.port.open();
	}
}

module.exports = Scanner;
