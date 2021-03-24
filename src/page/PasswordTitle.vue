<template>
  <div class="passwordTitle">
    <!-- 头部导航栏 -->
    <NavBar title="口令标题" backUrl="/sendCandy"></NavBar>
    <van-cell-group>
      <van-cell
        title="当前可用余额"
        :value="currentBalance + '  SWTC'"
        class="passwordTitle-cell"
      />
      <van-cell
        title="当前口令标题"
        :value="currentPasswordTitle"
        class="passwordTitle-cell"
      />
    </van-cell-group>
    <van-field
      v-model="passwordTitle"
      class="remark-textarea"
      rows="2"
      autosize
      type="textarea"
      maxlength="36"
      placeholder="请输入新的口令标题"
      show-word-limit
    />
    <div style="margin: 16px">
      <van-button
        color="#cf2546"
        round
        block
        type="info"
        @click="setPasswordTitle"
        :disabled="clickOnce"
      >
        支付{{ this.totalAmount }}SWTC
      </van-button>
    </div>
    <div>
      <div class="send-tips">
        <div class="tips-center">
          <van-icon name="info-o" color="red" size="14" />
          <span style="font-size: 12px; margin-left: 3px"
            >红包口令标题修改详情(如下图)</span
          >
        </div>
        <van-image
          :src="require('../assets/images/title.png')"
          height="70%"
          width="70%"
          radius="12px"
          @click="getImage"
          style="margin-top: 10px"
        />
      </div>
    </div>
    <van-dialog
      v-model="showOverlay"
      :width="200"
      :show-confirm-button="false"
      class="loading-dialog"
      :overlay="false"
    >
      <div class="overlay-div">
        <van-loading type="spinner" size="60px" color="white" vertical="true"
          ><span style="color: #fff !important"
            >口令标题设置中...</span
          ></van-loading
        >
      </div>
    </van-dialog>
  </div>
</template>

<script>
import NavBar from "../components/NavBar";
import { Dialog, Notify } from "vant";
const BigNumber = require("bignumber.js");
import { ImagePreview } from "vant";
import {
  setPasswordTitle,
  getAddressBalance,
  getPasswordTitle,
  signTransaction,
  formatBalance,
  getNonce,
} from "../js/utils";
export default {
  name: "home",
  components: {
    NavBar,
  },
  data: function () {
    return {
      passwordTitle: "",
      currentPasswordTitle: "",
      currentBalance: "",
      addressBalances: "",
      coinType: "SWTC",
      coinIssuer: "",
      totalAmount: "500",
      clickOnce: false,
      showOverlay: false,
    };
  },
  watch: {
    async passwordTitle(newVal) {
      if (!newVal) {
        Notify({ type: "danger", message: "口令标题不能为空" });
      } else if (newVal.length > 24) {
        Notify({ type: "danger", message: "口令标题超出长度限制" });
      }
    },
  },
  async created() {
    this.getPasswordTitle();
    this.getBalace();
  },

  methods: {
    getImage() {
      ImagePreview({
        images: [require("../assets/images/title.png")],
        showIndex: false,
      });
    },
    // 获取账户可用余额
    async getBalace() {
      let wallet = await tp.getCurrentWallet();
      let address = wallet.data.address;
      let res = await getAddressBalance(address);
      if (res.code == 0 && res.data) {
        this.addressBalances = res.data;
        this.currentBalance = formatBalance(
          new BigNumber(this.addressBalances["SWTC"].value)
            .minus(this.addressBalances["SWTC"].frozen)
            .toString()
        );
      } else {
        this.currentBalance = 0;
      }
    },
    // 获取当前红包口令标题
    async getPasswordTitle() {
      let wallet = await tp.getCurrentWallet();
      let address = wallet.data.address;
      let res = await getPasswordTitle(address);
      if (res && res.status == 0) {
        this.currentPasswordTitle = res.data.title;
      } else {
        this.currentPasswordTitle = "井创SWTC红包DAPP";
      }
    },
    // 验证余额是否足够
    async validateityAmount() {
      if (parseFloat(this.totalAmount) > parseFloat(this.currentBalance)) {
        return false;
      }
      return true;
    },
    // 设置口令标题
    async setPasswordTitle() {
      // 获取当前用户钱包地址
      let wallet = await tp.getCurrentWallet();
      let address = wallet.data.address;
      // 验证余额是否足够
      let isEnough = await this.validateityAmount();
      if (this.passwordTitle && isEnough) {
        this.clickOnce = true;
        this.showOverlay = true;
        // 获取nonce
        let nonce = await getNonce(address);
        if(nonce.status !== 0 ){
          this.clickOnce = false;
          this.showOverlay = false;
          Notify({ type: "danger", message: nonce.msg }); 
          return;
        }
        let signRes = await signTransaction(
          address,
          this.coinType,
          this.coinIssuer,
          this.totalAmount,
          nonce.data,
          this.passwordTitle
        );
        if (signRes.result && signRes.data) {
          // 后端发起交易并且将口令写入数据库
          let titleRes = await setPasswordTitle(
            address,
            signRes.data,
            this.passwordTitle
          );
          if (titleRes.status == 0) {
            console.log(titleRes);
            this.showOverlay = false;
            this.clickOnce = false;
            Dialog.alert({
              title: "成功",
              message:
                "口令标题:【" +
                this.passwordTitle +
                "】设置成功,赶快去发红包吧!",
            }).then(() => {
              // 跳转到发红包页
              this.$router.push({
                path: "sendCandy",
              });
            });
            // 跳转到发红包页
          } else {
            this.clickOnce = false;
            this.showOverlay = false;
            Notify({ type: "danger", message: titleRes.msg });
          }
        }
      } else {
        if (!this.passwordTitle) {
          Notify({ type: "danger", message: "口令标题不能为空" });
        } else {
          Notify({ type: "danger", message: "钱包余额不足!" });
        }
      }
    },
  },
};
</script>
<style>
.passwordTitle-cell {
  text-align: left;
}
</style>