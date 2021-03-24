<template>
  <div class="candy-detail">
    <!-- 头部导航栏 -->
    <NavBar title="红包详情" backUrl="/candyRecord"></NavBar>
    <!-- 红包信息 -->
    <div class="detail-div">
      <v-row>
        <van-col span="12" class="detail-col-start">
          {{ getAmount ? formatAmount(this.getAmount) : this.detail.amount }}
        </van-col>
        <van-col span="12" class="detail-col-end">
          {{ detail.coinType }}
        </van-col>
      </v-row>
      <v-row class="candy-status-text">
        <van-col span="24" v-if="detail.refundHash"
          >{{ formatHash(detail.refundHash) }}
          <Clipboard
            ref="refundHash"
            @click.native="copyRefundHash(detail.refundHash)"
          ></Clipboard
        ></van-col>
      </v-row>
      <!-- <van-cell
        class="detail-text"
        v-if="detail.remark !== '00' && detail.remark"
      >
        <v-row>
          <van-col style="color: white"> 备注：</van-col>
          <van-col> {{ decodMemo(detail.remark) }} </van-col>
        </v-row>
      </van-cell> -->
      <div class="detail-remark" v-if="detail.remark !== '00' && detail.remark">
        <span> {{ decodMemo(detail.remark) }}</span>
      </div>
      <div class="details-num">
        <span
          >已领取{{ getNum }}/{{ detail.num }}份, 共{{
            this.detail.amount
          }}&nbsp;{{ detail.coinType }}</span
        >
        <van-tag style="margin-left: 4px" color="darkorange">{{
          statusMsg
        }}</van-tag>
      </div>
    </div>
    <!-- 列表详情 -->
    <div class="list-div">
      <van-cell>
        <van-row>
          <van-col class="cell-title-start" span="6">时间</van-col>
          <van-col class="cell-title" span="6">地址</van-col>
          <van-col class="cell-title" span="6">哈希</van-col>
          <van-col class="cell-title-end" span="6">金额</van-col>
        </van-row>
      </van-cell>
      <van-cell v-show="list.length == 0">
        <van-col class="cell-title" span="24">暂无数据</van-col>
      </van-cell>
      <van-list
        v-model="detailLoading"
        :finished="detailFinished"
        finished-text="没有更多了"
        @load="detailOnLoad"
      >
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
            <van-col span="6">
              {{ formatHash(item.beneficiary) }}
              <Clipboard
                ref="clipboard"
                @click.native="copyTextToClipboard(item.beneficiary)"
              ></Clipboard>
            </van-col>
            <van-col span="6">
              {{ formatHash(item.hash) }}
              <Clipboard
                ref="clipboard"
                @click.native="copyTextToClipboard(item.hash)"
              ></Clipboard>
            </van-col>
            <van-col span="6"
              ><div class="cell-title-end list-right">
                {{ formatAmount(item.amount) }}&nbsp;&nbsp;{{ detail.coinType }}
              </div>
              <div v-if="index == 0 && detail.type == 1" class="best-luck">
                <van-icon name="award" color="#darkorange" />
                手气最佳
              </div></van-col
            >
          </van-row>
          <van-divider class="detail-divider" />
        </div>
      </van-list>
    </div>
  </div>
</template>

<script>
import NavBar from "../components/NavBar";
import Clipboard from "../components/CopyToClipboard";
import { Notify } from "vant";
import {
  getCandyDetail,
  formatTime,
  formatTextOverflow,
  formatBalance,
} from "../js/utils";
var sortBy = require("lodash.sortby");
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
      statusMsg: "",
      detailLoading: false,
      detailFinished: false,
      detailPageSize: 0,
    };
  },
  mounted() {
    this.id = this.$route.query.candyId;
  },
  methods: {
    detailOnLoad() {
      this.detailPageSize += 1;
      this.getCandyDetailById();
    },
    async getCandyDetailById() {
      let wallet = await tp.getCurrentWallet();
      let address = wallet.data.address;
      let res = await getCandyDetail(this.id, this.detailPageSize);
      if (res.status == 0) {
        this.detail = res.data.packet;
        if (this.detail.amount) {
          this.detail.amount = this.formatAmount(this.detail.amount);
        }
        this.list.push(...res.data.list);
        if (res.data.list.length === 0) {
          this.detailFinished = true;
        }
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
      this.detailLoading = false;
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
      if (memo) {
        return Buffer.from(memo, "hex").toString();
      }
    },
    formatAmount(num) {
      return formatBalance(num);
    },
  },
};
</script>
<style>
.details-num {
  font-size: 13px;
  display: flex;
  align-items: center;
  padding: 5px 8px;
  text-align: start;
}
.detail-remark {
  font-size: 8px;
  align-items: center;
  padding: 45px 5px 8px 8px;
  text-align: center;
}
</style>