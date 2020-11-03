<!--
 * @Description: 
 * @Author: gwang
 * @Date: 2020-11-03 14:14:53
 * @LastEditors: gwang
 * @LastEditTime: 2020-11-03 16:02:50
-->
<template>
  <div class="home">
    <div class="home-top">
      <img class="home-top-bg" src="../assets/images/homeTop.png" />
      <div class="candy-code">
        <textarea
          placeholder="请输入红包口令领取红包"
          v-model="message"
        ></textarea>
      </div>
      <button class="distribution-candy-button" @click="getCandy">
        抢红包
      </button>
    </div>
    <div class="home-center">
      <div>
        <span style="display: inline-block; font-size: small; color: white"
          >成功发出红包总数：</span
        >
        <span style="font-weight: bold">{{ this.candyCount }} </span>
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-hongbao"></use>
        </svg>
      </div>
      <div class="send-candy" @click="goSendCandyPage">
        <span>发红包</span>
      </div>
    </div>
    <div class="home-bottom">
      <div class="jump-operation">
        <router-link to="/candyRecord">
          <span>红包记录</span>
        </router-link>
        <span class="space">|</span>
        <router-link to="/aboutUs">
          <span>联系-关于我们</span>
        </router-link>
      </div>
      <div class="provided-title">
        <span>Powered by 合肥井创数字科技有限公司</span>
      </div>
    </div>
  </div>
</template>

<script>
import { Notify } from "vant";
import { distributionCandy, getPacketCount } from "../js/utils";
export default {
  name: "home",
  data: function () {
    return {
      message: "",
      candyCount: "" || "0",
    };
  },
  mounted() {
    this.getCandyCount();
  },
  methods: {
    async getCandy() {
      if (this.message) {
        let wallet = await tp.getCurrentWallet();
        let address = wallet.data.address;
        // let address = "jKBCwv4EcyvYtD4PafP17PLpnnZ16szQsC";
        let res = await distributionCandy(address, this.message);
        if (res.status == 0) {
          Notify({
            type: "success",
            message:
              "抢红包成功，抢到了" + res.data.amount + " " + res.data.coinType,
          });
        } else {
          Notify({ type: "danger", message: res.msg });
        }
      } else {
        Notify({ type: "danger", message: "请输入红包口令" });
      }
    },
    async getCandyCount() {
      let res = await getPacketCount();
      if (res.status == 0) {
        this.candyCount = res.data;
      }
    },
    goSendCandyPage() {
      this.$router.push({
        path: "sendCandy",
      });
    },
  },
};
</script>