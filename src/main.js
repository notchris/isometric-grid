import Vue from 'vue';
import * as VueWindow from '@hscmap/vue-window';
import App from './App.vue';
import './assets/css/style.css';

Vue.use(VueWindow);
Vue.config.productionTip = false;
new Vue({
  render: h => h(App),
}).$mount('#app');
