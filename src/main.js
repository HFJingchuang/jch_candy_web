/*
 * @Description: 
 * @Author: gwang
 * @Date: 2020-11-03 14:14:53
 * @LastEditors: zcZhang
 * @LastEditTime: 2020-11-09 09:58:04
 */
import Vue from 'vue'
import App from './App.vue'
import router from './router';
import Vant from 'vant';
// import vConsole from 'vconsole';
import 'vant/lib/index.css';
import VueClipboard from 'vue-clipboard2'

Vue.config.productionTip = false
// Vue.prototype.$vConsole = new vConsole()

Vue.use(Vant);
Vue.use(VueClipboard)

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
