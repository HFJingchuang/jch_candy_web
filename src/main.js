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

//使用钩子函数对路由进行权限跳转
// router.beforeRouteLeave(async (to, from, next) => {
//   document.title = `${to.meta.title} | 井创智能体育馆管理系统`;
//   console.log(to);
//   console.log(from)
//   // next('/login');
//   // next();

// });