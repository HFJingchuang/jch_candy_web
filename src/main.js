/*
 * @Description: 
 * @Author: gwang
 * @Date: 2020-11-03 14:14:53
 * @LastEditors: zcZhang
 * @LastEditTime: 2020-11-09 10:20:57
 */
import Vue from 'vue'
import App from './App.vue'
import router from './router';
import Vant from 'vant';
import { Notify } from 'vant';
// import vConsole from 'vconsole';
import 'vant/lib/index.css';
import VueClipboard from 'vue-clipboard2'
const tp = require('tp-js-sdk')

Vue.config.productionTip = false
// Vue.prototype.$vConsole = new vConsole()

Vue.use(Vant);
Vue.use(VueClipboard)

//使用钩子函数
router.beforeEach(async (to, from, next) => {
  let wallet = await tp.getCurrentWallet();
  let chain = wallet.data.blockchain;
  if (chain == "jingtum") {
    next();
  } else {
    Notify({ type: "danger", message: "请切换到井通钱包" });
    await new Promise(resolve => setTimeout(resolve, 3000))
    tp.close()
  }
});

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
