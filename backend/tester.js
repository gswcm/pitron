const eventEmitter = require('events');

class Tester extends eventEmitter {
	constructor() {
		super();
		this.on('boo', console.log);
	}
	emitter(msg) {
		this.emit('zoo', msg);
	}
}

let a = new Tester();//.on('zoo', console.log);
a.on('zoo', console.error);
a.on('boo', msg => {
	console.log('---------', msg);
});

a.emitter('Hello world');
a.emit('boo', 'HaHaHa');
