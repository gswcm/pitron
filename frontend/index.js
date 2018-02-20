//-- Root assets
import './assets/favicon.ico';
import './assets/robots.txt';
import './assets/sitemap.xml';
//-- Dependences
import vue from 'vue';
import vueRouter from 'vue-router';
import vueNoty from 'vuejs-noty';
import vueSocketio from 'vue-socket.io';
import axios from 'axios';
import vueAxios from 'vue-axios';
import fontawesome from '@fortawesome/fontawesome';
import fontAwesomeIcon from '@fortawesome/vue-fontawesome';
import { 
	faDownload, 
	faSyncAlt,
	faPlay,
	faStop,
} from '@fortawesome/fontawesome-free-solid';
import bootstrapVue from 'bootstrap-vue';
import root from './components/root.vue';
// import 'bootstrap/dist/css/bootstrap.css';
import 'bootswatch/dist/cyborg/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import 'vuejs-noty/dist/vuejs-noty.css';

// Font Awesome 5 configurations
fontawesome.library.add(
	faDownload,
	faSyncAlt,
	faPlay,
	faStop
);

const router = new vueRouter({
	routes: [
		{
			path: '/',
			component: () =>
				import(/* webpackChunkName: 'main' */ './components/main.vue')
		},
	],
	mode: 'history'
});
vue.component('font-awesome-icon', fontAwesomeIcon);
vue.use(bootstrapVue);
vue.use(vueRouter);
vue.use(vueSocketio, '/');
vue.use(vueAxios, axios);
vue.use(vueNoty, {
	killer: true,
	theme: 'metroui',
	timeout: 4000,
	progressBar: false,
	layout: 'topRight'
});

new (vue.extend(root))({ router }).$mount('#app');
