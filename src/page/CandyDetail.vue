<template>
  <div class="candy-detail">
    <!-- 头部导航栏 -->
    <NavBar title="红包详情" backUrl="/candyRecord"></NavBar>
    <!-- 红包信息 -->
    <div class="detail-div">
      <v-row v-if="getAmount">
        <van-col span="12" class="detail-col-start">
          {{ getAmount }}
        </van-col>
        <van-col span="12" class="detail-col-end">
          {{ detail.coinType }}
        </van-col>
      </v-row>
      <v-row class="candy-status-text">
        <van-col span="24">{{ statusMsg }}</van-col>
        <van-col span="24" v-if="detail.refundHash"
          >{{ formatHash(detail.refundHash) }}
          <Clipboard
            ref="refundHash"
            @click.native="copyRefundHash(detail.refundHash)"
          ></Clipboard
        ></van-col>
      </v-row>
      <van-cell
        class="detail-text"
        v-if="detail.remark !== '00' && detail.remark"
      >
        <v-row>
          <van-col style="color: white"> 备注：</van-col>
          <van-col> {{ decodMemo(detail.remark) }} </van-col>
        </v-row>
      </van-cell>
      <van-cell class="detail-text">
        <v-row>
          <van-col>
            已领取{{ getNum }}/{{ detail.num }}份, 共{{ detail.amount }}&nbsp;{{
              detail.coinType
            }}
          </van-col>
        </v-row>
      </van-cell>
    </div>
    <!-- 列表详情 -->
    <div class="list-div">
      <van-cell v-show="list.length != 0">
        <van-row>
          <van-col class="cell-title-start" span="6">时间</van-col>
          <van-col class="cell-title" span="5">地址</van-col>
          <van-col class="cell-title" span="5">哈希</van-col>
          <van-col class="cell-title-end" span="8">金额</van-col>
        </van-row>
      </van-cell>
      <van-cell v-show="list.length == 0">
        <van-col class="cell-title" span="24">暂无数据</van-col>
      </van-cell>
      <div
        v-for="(item, index) in list"
        :key="item"
        :title="item"
        class="list-item"
      >
        <van-row>
          <van-col span="6">
            <div class="cell-title-start list-left">
              {{ formatAt(item.updatedAt) }}
            </div>
          </van-col>
          <van-col span="5">
            {{ formatHash(item.beneficiary) }}
            <Clipboard
              ref="clipboard"
              @click.native="copyTextToClipboard(item.beneficiary)"
            ></Clipboard>
          </van-col>
          <van-col span="5">
            {{ formatHash(item.hash) }}
            <Clipboard
              ref="clipboard"
              @click.native="copyTextToClipboard(item.hash)"
            ></Clipboard>
          </van-col>
          <van-col span="8"
            ><div class="cell-title-end list-right">
              {{ item.amount }}&nbsp;&nbsp;{{ detail.coinType }}
            </div>
            <div v-if="index == 0 && detail.type == 1" class="best-luck">
              <van-icon name="award" color="#darkorange" />
              手气最佳
            </div></van-col
          >
        </van-row>
        <van-divider class="detail-divider" />
      </div>
    </div>
  </div>
</template>

<script>
import NavBar from "../components/NavBar";
import Clipboard from "../components/CopyToClipboard";
import { Notify } from "vant";
import { getCandyDetail, formatTime, formatTextOverflow } from "../js/utils";
var sortBy = require("lodash.sortby");
const BigNumber = require("bignumber.js");
export default {
  name: "candyDetail",
  components: {
    NavBar,
    Clipboard
  },
  data: function () {
    return {
      id: "",
      detail: {},
      list: [],
      getNum: 0,
      getAmount: 0,
      statusMsg: ""
    };
  },
  mounted() {
    this.id = this.$route.query.candyId;
    this.getCandyDetailById();
  },
  methods: {
    async getCandyDetailById() {
      let wallet = await tp.getCurrentWallet();
      let address = wallet.data.address;
      let res = await getCandyDetail(this.id);
      if (res.status == 0) {
        this.detail = res.data.packet;
        this.list = res.data.list;
        if (this.detail) {
          this.getNum = new BigNumber(this.detail.num).minus(
            this.detail.remainder
          );
          if (this.detail.isRefund == 1) {
            // 退款
            this.statusMsg =
              "已退款，退款金额：" +
              this.detail.refund +
              " " +
              this.detail.coinType;
          } else {
            if (this.detail.remainder == 0) {
              this.statusMsg = "已抢完";
            } else {
              this.statusMsg = "进行中";
            }
          }
        }
        if (this.detail.type == 1) {
          this.list = sortBy(this.list, function (o) {
            return parseFloat("-" + o.amount);
          });
        }
        this.list.forEach((e) => {
          if (e.beneficiary == address) {
            this.getAmount = e.amount;
          }
        });
      } else {
        Notify({ type: "danger", message: "获取数据失败" });
      }
    },
    copyTextToClipboard(text) {
      this.$refs.clipboard[0].copyToClipboard(text);
    },
    copyRefundHash(hash) {
      this.$refs.refundHash.copyToClipboard(hash);
    },
    formatAt(time) {
      return formatTime(time);
    },
    formatHash(hash) {
      return formatTextOverflow(hash);
    },
    decodMemo(memo) {
      return Buffer.from(memo, "hex").toString();
    }
  }
};
</script>