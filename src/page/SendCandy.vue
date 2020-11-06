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
      <div class="current-balance" v-if="currentBalance !== ''">
        可用：{{ currentBalance }} &nbsp;{{ coinType }}
      </div>
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
    <div class="send-tips">
      <p>
        <van-icon name="info-o" color="red" size="14" />
        48小时内未抢完的红包将会退还到发起账户。
      </p>
      <p>
        <van-icon name="info-o" color="red" size="14" />
        红包口令可在红包记录-我发的 页面，点击复制分享。
      </p>
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
            >红包创建中...</span
          ></van-loading
        >
      </div>
    </van-dialog>
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
  getAddressBalance,
} from "../js/utils";
export default {
  name: "sendCandy",
  components: {
    NavBar,
  },
  data: function () {
    return {
      currentBalance: "",
      addressBalances: {},
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
  mounted() {
    this.getBalace();
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
            this.showOverlay = false;
            Notify({ type: "danger", message: createRes.msg });
          }
        } else {
          this.showOverlay = false;
          Notify({
            type: "danger",
            message: "交易失败，请重试！",
          });
        }
      }
    },
    async getBalace() {
      let wallet = await tp.getCurrentWallet();
      let address = wallet.data.address;
      let res = await getAddressBalance(address);
      if (res.code == 0 && res.data) {
        this.addressBalances = res.data;
        this.currentBalance = this.formatBalance(
          new BigNumber(this.addressBalances["SWTC"].value)
            .minus(this.addressBalances["SWTC"].frozen)
            .toString()
        );
      } else {
        this.currentBalance = 0;
      }
    },
    confirmCoinType(value, index) {
      this.coinType = value;
      this.coinIssuer = this.coinTypeIssuerList[index];
      if (this.addressBalances != {}) {
        if (this.coinType == "SWT") {
          this.currentBalance = this.formatBalance(
            new BigNumber(this.addressBalances["SWTC"].value)
              .minus(this.addressBalances["SWTC"].frozen)
              .toString()
          );
        } else {
          let name = this.coinType + "_jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or";
          this.currentBalance = this.formatBalance(
            new BigNumber(this.addressBalances[name].value)
              .minus(this.addressBalances[name].frozen)
              .toString()
          );
        }
      }

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
      if (parseFloat(amount) > parseFloat(this.currentBalance)) {
        this.amountErrMsg = "红包金额不可大于可用余额";
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
    formatBalance(num) {
      let data = num.toString();
      let index = data.toString().indexOf(".");
      if (index > 0) {
        return data.slice(0, index + 3);
      }
      return data;
    },
  },
};
</script>