<template>
	<div>
		<!-- Header -->
		<div class="d-flex justify-content-center align-items-center border-bottom border-light">
			<h4>PiTron &mdash; Scantron driven by RasPi</h4>
		</div>
		<b-row class="mt-3">
			<!-- Settings -->
			<b-col cols="12" sm="auto">
				<!-- Select Scantron device -->
				<b-row align-v="end">
					<b-col cols="12">
						<label><strong>Select Scantron</strong></label>
					</b-col>
					<b-col cols="">
						<b-select v-model="device" size="sm">
							<option v-if="!devices.length" :value="null">--</option>
							<option v-for="device in devices" :value="device" :key="device.port">{{device.model.trim()}}</option>
						</b-select>
					</b-col>
					<b-col cols="auto" class="pl-0">
						<b-btn variant="outline-light" @click="getDevices" size="sm">
							<font-awesome-icon :icon="['fas', 'sync-alt']"/>
						</b-btn>					
					</b-col>
				</b-row>
				<!-- Start simulator -->
				<b-row align-v="end" class="mt-3">
					<b-col cols="12">
						<label><strong>Simulator</strong></label>
					</b-col>
					<b-col cols="">
						<b-form-input  size="sm" v-model="simulatorPort" placeholder="simulator port"/>
					</b-col>
					<b-col cols="auto" class="pl-0">
						<b-btn :disabled="simulatorServiceStarted" variant="outline-light" @click="startSimulator" size="sm">
							<font-awesome-icon :icon="['fas', 'play']"/>
						</b-btn>					
					</b-col>
					<b-col cols="auto" class="pl-0">
						<b-btn :disabled="!simulatorServiceStarted" variant="outline-light" @click="stopSimulator" size="sm">
							<font-awesome-icon :icon="['fas', 'stop']"/>
						</b-btn>					
					</b-col>
				</b-row>
				<div class="py-5 mt-5"></div>
			</b-col>
			<!-- Vertical line -->
			<b-col cols="auto" class="pl-0 d-none d-sm-block border-left border-light"/>
			<!-- Action -->
			<b-col cols="12" sm="">
				
			</b-col>
		</b-row>
	</div>
</template>

<script>
export default {
	data: () => ({
		devices: [],
		device: null,
		simulatorPort: '/dev/ttyS0',
		simulatorServiceStarted: false
	}),
	computed: {
	},
	created() {
		this.getDevices();
	},
	methods: {
		stopSimulator() {

		},
		startSimulator() {
			this.axios
			.post("/api/simulator", {
				port: this.simulatorPort
			})
			.then(response => {
				if (response.data.status) {
					//-- server error
					let error = response.data.error || new Error("not sure");
					throw error;
				} 
				else {
					this.$noty.success(
						`Scantron simulator service started successfully`
					);			
					this.simulatorServiceStarted = true;
				}
			})
			.catch(error => {
				this.$noty.error(
					`Something went wrong... more specifically: ${error.message}`
				);
				console.error(error.stack);
			});
		},
		getDevices() {
			this.axios
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
						if(this.devices.length && this.devices.indexOf(this.device) === -1) {
							this.device = this.devices[0];
						}
					}
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
	h3, h4 {
		font-family: 'Mukta Mahee', sans-serif;
	}
</style>
