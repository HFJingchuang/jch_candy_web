<!--
 * @Description: 
 * @Author: gwang
 * @Date: 2020-11-03 14:14:53
 * @LastEditors: zcZhang
 * @LastEditTime: 2020-11-04 11:14:31
-->
<template>
  <div class="home">
    <div class="home-top">
      <img class="home-top-bg" src="../assets/images/homeTop.png" />
      <div class="candy-code">
        <textarea
          placeholder="输入红包口令 即刻领取红包"
          v-model="message"
        ></textarea>
        <div>
          <span style="display: inline-block; font-size: small; color: black"
            >成功发出红包总数：</span
          >
          <span style="color: black">{{ this.candyCount }} </span>
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-hongbao"></use>
          </svg>
        </div>
      </div>

      <!-- <button class="distribution-candy-button">
        <van-loading v-if="loading" type="spinner" size="12px"
          >抢红包中</van-loading
        >
        <span v-show="!loading">抢红包</span>
      </button> -->
    </div>
    <div class="home-center">
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
import { decodePwd, distributionCandy, getPacketCount } from "../js/utils";
export default {
  name: "home",
  data: function () {
    return {
      message: "",
      candyCount: "" || "0",
      loading: false,
      password: "",
    };
  },
  watch: {
    async message(newVal) {
      if (newVal.length >= 36) {
        this.password = decodePwd(newVal);
        if (this.password.length == 36) {
          await this.getCandy();
        } else {
          Notify({ type: "danger", message: "无效的红包口令" });
        }
      }
    },
  },
  mounted() {
    this.getCandyCount();
  },
  methods: {
    async getCandy() {
      this.loading = true;
      let wallet = await tp.getCurrentWallet();
      let address = wallet.data.address;
      let res = await distributionCandy(address, this.password);
      if (res.status == 0) {
        Notify({
          type: "success",
          message:
            "抢红包成功，抢到了" + res.data.amount + " " + res.data.coinType,
        });
        // 跳转详情
        this.$router.push({
          path: "candyDetail",
          query: {
            candyId: res.data.candyId,
          },
        });
      } else {
        Notify({ type: "danger", message: res.msg });
      }
      this.loading = false;
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