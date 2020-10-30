<template>
  <div class="candy-detail">
    <!-- 头部导航栏 -->
    <NavBar title="红包详情" backUrl="/candyRecord"></NavBar>
    <!-- 红包信息 -->
    <div class="detail-div">
      <v-row>
        <van-col span="12" class="detail-col-start">
          {{ amount }}
        </van-col>
        <van-col span="12" class="detail-col-end">
          {{ coinType }}
        </van-col>
      </v-row>
    </div>
    <!-- 列表详情 -->
    <div class="list-div">
      <van-cell>
        <v-row>
          <van-col>
            已领取{{ getNum }}/{{ num }}份, 共{{ getAmount }}/{{
              amount
            }}&nbsp;{{ coinType }}
          </van-col>
        </v-row>
      </van-cell>

      <div v-for="item in list" :key="item" :title="item" class="list-item">
        <van-col span="8">
          <div>{{ formatAt(item.updatedAt) }}</div>
        </van-col>
        <van-col span="8">
          {{ formatHash(item.beneficiary) }}
          <Clipboard
            ref="clipboard"
            @click.native="copyTextToClipboard(item.beneficiary)"
          ></Clipboard>
        </van-col>
        <van-col span="8"
          ><div>{{ item.amount }}&nbsp;&nbsp;{{ item.coinType }}</div></van-col
        >
      </div>
    </div>
  </div>
</template>

<script>
import NavBar from "../components/NavBar";
import Clipboard from "../components/CopyToClipboard";
import { Notify } from "vant";
import { getCandyDetail, formatTime, formatTextOverflow } from "../js/utils";
const BigNumber = require("bignumber.js");
export default {
  name: "candyDetail",
  components: {
    NavBar,
    Clipboard,
  },
  data: function () {
    return {
      id: "",
      detail: {},
      list: [],
      getNum: 0,
      getAmount: 0,
      num: 0,
      amount: 0,
      coinType: "SWTC",
    };
  },
  mounted() {
    this.id = this.$route.query.candyId;
    this.getCandyDetailById();
  },
  methods: {
    async getCandyDetailById() {
      let res = await getCandyDetail(this.id);
      if (res.status == 0) {
        this.list = res.data.list;
        if (this.list.length > 0) {
          var tmp = this.list[0];
          this.num = tmp.num;
          this.getNum = new BigNumber(this.num).minus(tmp.remainder);
          this.amount = tmp["packet.amount"];
          this.getAmount = new BigNumber(this.amount).minus(tmp.balance);
        }
      } else {
        Notify({ type: "danger", message: "获取数据失败" });
      }
    },
    copyTextToClipboard(text) {
      this.$refs.clipboard[0].copyToClipboard(text);
    },
    formatAt(time) {
      return formatTime(time);
    },
    formatHash(hash) {
      return formatTextOverflow(hash);
    },
  },
};
</script>