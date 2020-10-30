<template>
  <div class="send-candy">
    <!-- 头部导航栏 -->
    <NavBar title="发红包" backUrl="/home"></NavBar>
    <!-- 抢红包表单 -->
    <van-form @submit="sendCandy">
      <van-field name="checkboxGroup" label="红包类型">
        <template #input>
          <van-radio-group
            v-model="candyType"
            @change="changeCoinType"
            direction="horizontal"
          >
            <van-radio name="0" checked-color="#cf2546">普通红包</van-radio>
            <van-radio name="1" checked-color="#cf2546">运气红包</van-radio>
          </van-radio-group>
        </template>
      </van-field>
      <van-field
        readonly
        clickable
        name="picker"
        :value="coinType"
        label="币种"
        placeholder="点击选择币种"
        @click="showCoinTypePicker = true"
      />
      <van-popup v-model="showCoinTypePicker" position="bottom">
        <van-picker
          ref="picker"
          show-toolbar
          :columns="coinTypeNameList"
          @confirm="confirmCoinType"
          @cancel="showCoinTypePicker = false"
        />
      </van-popup>
      <van-field
        v-model="candyAmount"
        name="金额"
        :label="amountLabel"
        type="number"
        placeholder="请输入红包金额"
        @blur="computeAmount"
        :rules="[
          { required: true },
          {
            pattern: /(^[0-9]{1,9}$)|(^[0-9]{1,9}[.]{1}[0-9]{1,2}$)/,
            message: '红包金额暂只支持两位小数',
          },
        ]"
      />
      <van-field
        v-model="candyNum"
        name="红包个数"
        label="红包个数"
        @blur="computeAmount"
        type="digit"
        placeholder="请输入红包个数"
        :rules="[
          {
            required: true,
          },
          {
            pattern: /^([1-9]|[1-9]\\d|100)$/,
            message: '红包数量在1-100之间',
          },
        ]"
      />
      <van-field
        v-model="candyRemark"
        rows="2"
        autosize
        type="textarea"
        maxlength="50"
        placeholder="请输入红包备注"
        show-word-limit
      />
      <div style="margin: 16px">
        <van-button
          color="#cf2546"
          round
          block
          type="info"
          native-type="submit"
        >
          {{ submitAmount }}
        </van-button>
      </div>
    </van-form>
    <van-overlay :show="showOverlay">
      <div class="overlay-div">
        <van-loading type="spinner" size="80px" color="#fff" />
        <div class="overlay-text">红包创建中……</div>
      </div>
    </van-overlay>
  </div>
</template>

<script>
import NavBar from "../components/NavBar";
import { Dialog, Notify } from "vant";
const coin = require("../../static/coin.json");
const BigNumber = require("bignumber.js");
import { signTransaction, sendRawTransaction, createCandy } from "../js/utils";
export default {
  name: "sendCandy",
  components: {
    NavBar,
  },
  data: function () {
    return {
      coinTypeNameList: [],
      coinTypeIssuerList: [],
      showCoinTypePicker: false,
      coinType: "SWTC",
      coinIssuer: "",
      candyType: "0",
      amountLabel: "单个金额",
      candyAmount: "",
      totalAmount: "",
      candyNum: "",
      candyRemark: "",
      submitAmount: "塞钱",
      showOverlay: false,
    };
  },
  created() {
    coin.forEach((e) => {
      this.coinTypeNameList.push(e.name);
      this.coinTypeIssuerList.push(e.issuer);
    });
    this.coinType = this.coinTypeNameList[0];
  },
  methods: {
    async sendCandy() {
      let wallet = await tp.getCurrentWallet();
      let address = wallet.data.address;
      // 签名
      let res = await signTransaction(
        address,
        this.coinType,
        this.coinIssuer,
        this.totalAmount,
        this.candyRemark
      );
      if (res.result) {
        this.showOverlay = true;
        // 发送交易
        let sendRes = await sendRawTransaction(res.data);
        await new Promise((resolve) => setTimeout(resolve, 5000));
        if (sendRes.result) {
          let createRes = await createCandy(
            this.candyType,
            this.candyNum,
            sendRes.txHash
          );
          this.showOverlay = false;
          if (createRes.status == 0) {
            let candyId = createRes.data.id;
            Dialog.alert({
              title: "红包创建成功",
              message: "红包口令：" + candyId,
            }).then(() => {
              this.$copyText(candyId).then(
                () => {
                  Notify({ type: "success", message: "复制成功" });
                },
                () => {
                  Notify({ type: "danger", message: "复制失败" });
                }
              );
            });
          } else {
            Notify({ type: "danger", message: createRes.msg });
          }
        }
      }
    },
    confirmCoinType(value, index) {
      this.coinType = value;
      this.coinIssuer = this.coinTypeIssuerList[index];
      this.showCoinTypePicker = false;
    },
    computeAmount() {
      if (this.candyAmount != "" && this.candyNum != "") {
        if (this.candyType == 0) {
          this.totalAmount = new BigNumber(this.candyAmount).multipliedBy(
            new BigNumber(this.candyNum)
          );
        } else {
          this.totalAmount = this.candyAmount;
        }
        this.submitAmount =
          "塞钱" + "  " + this.totalAmount + " " + this.coinType;
      }
    },
    changeCoinType() {
      if (this.candyType == 0) {
        this.amountLabel = "单个金额";
      } else {
        this.amountLabel = "总金额";
      }
    },
  },
};
</script>