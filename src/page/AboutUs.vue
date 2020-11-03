<!--
 * @Description: 
 * @Author: gwang
 * @Date: 2020-11-03 14:14:53
 * @LastEditors: gwang
 * @LastEditTime: 2020-11-03 14:40:15
-->
<template>
  <div class="about-us">
    <!-- 头部导航栏 -->
    <NavBar title="关于我们" backUrl="/home"></NavBar>
    <!-- 关于我们 -->
    <div class="about-us-content">
      <p>{{ content }}</p>
      <br>
      <p>官网：{{ this.url }}</p>
      <p>QQ群： {{ this.qqGroup }}</p>
      <!-- <p>QQ：{{ this.qq }}</p>  -->
    </div>
  </div>
</template>

<script>
import NavBar from "../components/NavBar";
const config = require("../../static/config");
export default {
  name: "aboutUs",
  components: {
    NavBar,
  },
  data: function () {
    return { content: "", qq: "", wechat: "", url: "", qqGroup: "472131306" };
  },
  created() {
    this.content = config.content;
    this.qq = config.QQ;
    this.wechat = config.Wechat;
    this.url = config.Url;
    this.qqGroup = config.QQGroup;
  },
  methods: {
    getLinkToQQ() {
      var agent = navigator.userAgent.toLowerCase();
      if (agent.indexOf("micromessenger") !== -1) {
        return `http://wpa.qq.com/msgrd?v=3&uin=${this.qq}&site=qq&menu=yes`;
      } else {
        return `mqqwpa://im/chat?chat_type=wpa&uin=${this.qq}&version=1&src_type=web&web_src=oicqzone.com`;
      }
    },
    LinkToQQGroup() {
      let address = this.qqGroup;
      return address;
    },
  },
};
</script>

<style>
</style>