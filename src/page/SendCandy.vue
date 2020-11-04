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
        name="validatorAmount"
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
          { validator: validatorAmount, message: amountErrMsg },
        ]"
      />
      <van-field
        v-model="candyNum"
        name="validatorNum"
        label="红包个数"
        @blur="computeAmount"
        type="digit"
        placeholder="请输入红包个数"
        :rules="[
          {
            required: true,
          },
          { validator: validatorNum, message: numErrMsg },
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
      <!-- <div
        class="display: flex; display: -webkit-flex; -webkit-align-items: center; -webkit-justify-content: center; height: 100%;"
      > -->
      <div class="overlay-div">
        <div
          style="
            width: 120px;
            height: 120px;
            background-color: #fff;
            box-shadow: 0px 1px 1px grey;
            border-radius: 10px;
          "
        >
          <van-loading type="spinner" size="60px" color="grey" vertical="true"
            >红包创建中...</van-loading
          >
        </div>
      </div>
      <!-- </div> -->
    </van-overlay>
  </div>
</template>

<script>
import NavBar from "../components/NavBar";
import { Dialog, Notify } from "vant";
const coin = require("../../static/coin.json");
const BigNumber = require("bignumber.js");
import {
  signTransaction,
  sendRawTransaction,
  createCandy,
  encodePwd,
} from "../js/utils";
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
      amountErrMsg: "",
      numErrMsg: "",
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
      // let address = "jKBCwv4EcyvYtD4PafP17PLpnnZ16szQsC";
      // 签名
      let res = await signTransaction(
        address,
        this.coinType,
        this.coinIssuer,
        this.totalAmount,
        this.candyRemark
      );
      if (res.result && res.data) {
        this.showOverlay = true;
        // 发送交易
        let sendRes = await sendRawTransaction(res.data);
        if (sendRes.result) {
          let createRes = await createCandy(
            this.candyType,
            this.candyNum,
            sendRes.txHash
          );
          this.showOverlay = false;
          if (createRes.status == 0) {
            let candyId = encodePwd(createRes.data.id);
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
        } else {
          Notify({
            type: "danger",
            message: "交易失败，请重试！",
          });
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
    // 验证金额
    validatorAmount(amount) {
      if (parseFloat(amount) <= 0) {
        this.amountErrMsg = "红包金额不可为0";
        return false;
      }
      if (this.candyType == 1 && this.candyNum != "") {
        var tmp = new BigNumber(amount).dividedBy(this.candyNum).toString();
        if (parseFloat(tmp) < 0.01) {
          this.amountErrMsg = "单个红包金额最小为0.01";
          return false;
        }
        return true;
      }
    },
    validatorNum(num) {
      if (this.candyType == 0) {
        if (parseInt(num) < 1 || parseInt(num) > 100) {
          this.numErrMsg = "普通红包份额在1-100之间";
          return false;
        }
        return true;
      } else {
        if (parseInt(num) < 2 || parseInt(num) > 100) {
          this.numErrMsg = "运气红包份额在2-100之间";
          return false;
        }
        return true;
      }
    },
    changeCoinType() {
      this.amountErrMsg = "";
      this.numErrMsg = "";
      if (this.candyType == 0) {
        this.amountLabel = "单个金额";
      } else {
        this.amountLabel = "总金额";
      }
      this.computeAmount();
    },
  },
};
</script>