import Vue from 'vue'
import App from './App.vue'
import router from './router';
import Vant from 'vant';
import vConsole from 'vconsole';
import 'vant/lib/index.css';
import VueClipboard from 'vue-clipboard2'

Vue.config.productionTip = false
Vue.prototype.$vConsole = new vConsole()

Vue.use(Vant);
Vue.use(VueClipboard)

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
