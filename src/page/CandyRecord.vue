<template>
  <div class="candy-record">
    <!-- 头部导航栏 -->
    <NavBar title="红包记录" backUrl="/home"></NavBar>
    <!-- 红包记录Tab -->
    <van-tabs v-model="active">
      <van-tab title="我抢的">
        <van-cell>
          <van-row>
            <van-col class="cell-title-start" span="8">获取时间</van-col>
            <van-col class="cell-title" span="8">转账hash</van-col>
            <van-col class="cell-title-end" span="8">红包金额</van-col>
          </van-row> </van-cell
        ><van-list
          :finished="getFinished"
          finished-text="暂只支持查看前20条数据"
          @load="getLoad"
        >
          <v-row
            v-for="item in getList"
            :key="item"
            :title="item"
            class="record-list"
            @click="goCandyDetail(item.id)"
          >
            <van-col span="8" class="cell-title-start">
              <div class="list-left">{{ formatAt(item.updatedAt) }}</div>
            </van-col>
            <van-col span="8">{{ formatHash(item.hash) }}</van-col>
            <van-col span="8" class="cell-title-end"
              ><div class="list-right">
                {{ item.amount }}&nbsp;&nbsp;{{ item.coin_type }}
              </div></van-col
            >
          </v-row>
        </van-list></van-tab
      >
      <van-tab title="我发的">
        <van-cell>
          <van-row>
            <van-col class="cell-title-start" span="8">创建时间</van-col>
            <van-col class="cell-title" span="8">转账hash</van-col>
            <van-col class="cell-title-end" span="8">红包金额</van-col>
          </van-row>
        </van-cell>
        <van-list
          :finished="sendFinished"
          finished-text="暂只支持查看前20条数据"
          @load="sendLoad"
        >
          <div
            v-for="item in sendList"
            :key="item"
            :title="item"
            class="record-list"
            @click="goCandyDetail(item.id)"
          >
            <van-col span="8" class="cell-title-start">
              <div class="list-left">{{ formatAt(item.createdAt) }}</div>
            </van-col>
            <van-col span="8">{{ formatHash(item.hash) }}</van-col>
            <van-col span="8" class="cell-title-end"
              ><div class="list-right">
                {{ item.amount }}&nbsp;&nbsp;{{ item.coin_type }}
              </div></van-col
            >
          </div>
        </van-list>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script>
import NavBar from "../components/NavBar";
import { Notify } from "vant";
import {
  getSendCandyList,
  getObtainCandyList,
  formatTime,
  formatTextOverflow,
} from "../js/utils";
export default {
  name: "candyRecord",
  components: {
    NavBar,
  },
  data: function () {
    return {
      test: [{ name: 1 }, { name: 2 }, { name: 3 }, { name: 4 }],
      active: 0,
      getList: [],
      getCount: 0,
      getLoading: true,
      getFinished: true,
      sendList: [],
      sendCount: 0,
      sendLoading: true,
      sendFinished: true,
    };
  },
  mounted() {
    this.getLoad();
    this.sendLoad();
  },
  methods: {
    // 获取我抢到的红包列表
    async getLoad() {
      let wallet = await tp.getCurrentWallet();
      let address = wallet.data.address;
      // let address = "jKBCwv4EcyvYtD4PafP17PLpnnZ16szQsC";
      let res = await getObtainCandyList(address);
      if (res.status == 0) {
        this.getList = res.data.list;
        this.getCount = res.data.total;
      } else {
        Notify({ type: "danger", message: "获取数据失败" });
      }
    },
    // 获取我发到的红包列表
    async sendLoad() {
      let wallet = await tp.getCurrentWallet();
      let address = wallet.data.address;
      // let address = "jKBCwv4EcyvYtD4PafP17PLpnnZ16szQsC";
      let res = await getSendCandyList(address);
      if (res.status == 0) {
        this.sendList = res.data.list;
        this.sendCount = res.data.total;
      } else {
        Notify({ type: "danger", message: "获取数据失败" });
      }
    },
    goCandyDetail(id) {
      this.$router.push({
        path: "candyDetail",
        query: {
          candyId: id,
        },
      });
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

<style>
</style>