<template>
	<div class="container py-3">
		<!-- Header -->
		<div class="p-3 d-flex justify-content-center align-items-center border-bottom border-light">
			<h4>PiTron &mdash; Scantron driven by RasPi</h4>
		</div>
		<b-row class="mt-3">
			<!-- Settings -->
			<b-col cols="12" sm="6" class="pl-0">
				<div class="d-flex justify-content-center">
					<h5 class="text-primary">Settings</h5>
				</div>
				<!-- Select Scantron device -->
				<b-row align-v="end" class="mt-4">
					<b-col cols="12">
						<label><strong>Select Scantron</strong></label>
					</b-col>
					<b-col cols="">
						<b-select v-model="device" size="sm">
							<option v-if="!devices.length" :value="null">--</option>
							<option v-for="device in devices" :value="device" :key="device.path">{{device.model.trim()}}</option>
						</b-select>
					</b-col>
					<b-col cols="auto" class="pl-0">
						<b-btn variant="outline-light" @click="getDevices" size="sm">
							<font-awesome-icon :icon="['fas', 'sync-alt']"/>
						</b-btn>					
					</b-col>
				</b-row>
				<!-- Simulator -->
				<b-row align-v="end" class="mt-4" v-if="simulatorPresent">
					<b-col cols="12">
						<label><strong>Simulator service</strong></label>
					</b-col>
					<b-col cols="">
						<b-input-group>
							<b-input-group-prepend>
								<b-btn :disabled="simIsRunning" size="sm" class="border-0" variant="light">
									<font-awesome-icon :icon="['fas', 'minus']" @click="decSimNumSheets"/>
								</b-btn>
							</b-input-group-prepend>	
							<b-form-input class="text-center border-0" size="sm" min="0" type="number" v-model="simNumSheets" :disabled="simIsRunning"/>
							<b-input-group-append>
								<b-btn :disabled="simIsRunning" size="sm" variant="light">
									<font-awesome-icon :icon="['fas', 'plus']" @click="simNumSheets++"/>
								</b-btn>
							</b-input-group-append>
						</b-input-group>
					</b-col>
					<b-col cols="auto" class="pl-0">
						<b-btn :disabled="simIsRunning" variant="outline-light" @click="$socket.emit('simulatorStart', simNumSheets)" size="sm">
							<font-awesome-icon :icon="['fas', 'play']"/>
						</b-btn>					
					</b-col>
					<b-col cols="auto" class="pl-0">
						<b-btn :disabled="!simIsRunning" variant="outline-light" @click="$socket.emit('simulatorStop')" size="sm">
							<font-awesome-icon :icon="['fas', 'stop']"/>
						</b-btn>					
					</b-col>
					<b-col cols="">
						Status:&nbsp;
						<span :class="simIsRunning ? 'text-success' : 'text-danger'">{{simIsRunning ? 'running' : 'stopped'}}</span>
					</b-col>
				</b-row>
				<!-- Scan data receiver -->
				<b-row align-v="end" class="mt-4">
					<b-col cols="12">
						<label><strong>Scan data receiver</strong></label>
					</b-col>
					<b-col cols="12">
						<b-form-input size="sm" type="text" v-model="receiver" placeholder="socket.io receiver" :disabled="scanRunning"/>
					</b-col>
				</b-row>
				<div class="py-3"></div>
			</b-col>
			<!-- Vertical line -->
			<b-col cols="auto" class="pl-3 d-none d-sm-block border-left border-light"/>
			<!-- Action -->
			<b-col cols="12" sm="">
				<div class="d-block">
					<div class="d-flex justify-content-center">
						<div class="panel text-primary" @click="$refs.scanDataDisplay.show()">
							{{scanData.length}}
						</div>
					</div>
				</div>
				<b-modal title="Scan data" ref="scanDataDisplay" ok-only>
					<b-textarea :value="a2s(scanData)" :rows="10" :max-rows="10" wrap="off" class="bg-light" :no-resize="true"></b-textarea>
				</b-modal>
				<div class="d-flex justify-content-center mt-5">
					<b-btn variant="outline-warning" :disabled="scanRunning" @click="scanData = []">
						Reset
					</b-btn>
					<b-btn class="ml-5" variant="outline-success" :disabled="!device || scanRunning" @click="$socket.emit('scannerStart', device.path, receiver);">
						Start
					</b-btn>
				</div>
			</b-col>
		</b-row>
	</div>
</template>

<script>
export default {
	data: () => ({
		devices: [],
		device: null,
		simIsRunning: false,
		scanRunning: false,
		simulatorPresenceTested: false,
		simulatorPresent: false,
		simNumSheets: 10,
		scanData: [],
		receiver: 'https://hmt.gswcm.net/scantron'
	}),
	sockets: {
		connect(s) {
		},
		simulatorError(msg) {
			this.$noty.error(`Simulator error: ${msg}`);
			this.simIsRunning = false;
			this.getDevices();
		},
		simulatorStarted() {
			this.simIsRunning = true;
			this.getDevices()
			.then(() => {
				if(!this.simulatorPresenceTested) {
					this.simulatorPresent = this.devices.filter(e => /simulator/ig.test(e.model)).length > 0;
					if(this.simulatorPresent) {
						this.$noty.info(`Simulator connected`);			
					}
					this.simulatorPresenceTested = true;
					this.$socket.emit('simulatorStop');
				}
			})
		},
		simulatorStopped() {
			this.simIsRunning = false;
			this.getDevices();
		},
		scannerError(msg) {
			this.$noty.error(`Scantron error: ${msg}`);
		},
		scannerData(data) {
			console.log(data);
			this.scanData.push(data);
		},
		scannerDone(sheetCounter) {
			console.log(sheetCounter);
			this.scanRunning = false;
		},
		scannerStarted() {
			this.scanRunning = true;
		},
		scannerStopped() {
			this.scanRunning = false;
		}
	},	
	created() {
		this.$socket.emit('simulatorStart');
	},
	methods: {
		a2s(a) {
			return a.map(i => {
				let result = "";
				if(i.length > 4) {
					result += `${i.substr(0,4)} `;
					if(i.length > 44) {
						result += `${i.substr(4,40)} ${i.substr(44)}`;
					}
					else {
						result += `${i.substr(4)}`;
					}
				}
				else {
					result = i;
				}
				return result;
			}).join('\n');
		}, 
		decSimNumSheets() {
			if(this.simNumSheets > 0) {
				this.simNumSheets--;
			}
		},
		getDevices() {
			return this.axios
			.post("/api/list", {})
			.then(response => {
				if (response.data.status) {
					//-- server error
					let error = response.data.error || new Error("not sure");
					throw error;
				} 
				else {
					if(response.data.devices && Array.isArray(response.data.devices)) {
						this.devices = response.data.devices;
						if(this.devices.length) {
							if(this.devices.indexOf(this.device) === -1) {
								this.device = this.devices[0];
							}
						}
						else {
							this.device = null;
						}
					}
					return Promise.resolve();
				}
			})
			.catch(error => {
				this.$noty.error(
					`Something went wrong... more specifically: ${error.message}`
				);
				console.error(error.stack);
			});
		}
	}
}
</script>


<style>
	h3, h4, .panel {
		font-family: 'Mukta Mahee', sans-serif;
	}
	.panel {
		font-size: 15em;
		line-height: 1;
		cursor: pointer;
	}
	textarea {
		font-family: 'Roboto Mono', monospace;
	}
	.form-control:focus,
	.form-control.is-invalid,
	.btn:focus {
		outline: 0;
		box-shadow: none;
	}
</style>
