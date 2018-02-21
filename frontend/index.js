//-- Root assets
import './assets/favicon.ico';
import './assets/robots.txt';
import './assets/sitemap.xml';
//-- Dependences
import vue from 'vue';
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
	faPlus,
	faMinus,
} from '@fortawesome/fontawesome-free-solid';
import bootstrapVue from 'bootstrap-vue';
import main from './components/main.vue';
import 'bootswatch/dist/cyborg/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import 'vuejs-noty/dist/vuejs-noty.css';

// Font Awesome 5 configurations
fontawesome.library.add(
	faDownload,
	faSyncAlt,
	faPlay,
	faStop,
	faPlus,
	faMinus
);

vue.component('font-awesome-icon', fontAwesomeIcon);
vue.use(bootstrapVue);
vue.use(vueSocketio, '/');
vue.use(vueAxios, axios);
vue.use(vueNoty, {
	killer: true,
	theme: 'metroui',
	timeout: 4000,
	progressBar: false,
	layout: 'topRight'
});

new (vue.extend(main))({}).$mount('#app');
