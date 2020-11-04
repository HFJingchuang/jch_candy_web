<template>
  <div class="candy-record">
    <!-- 头部导航栏 -->
    <NavBar title="红包记录" backUrl="/home"></NavBar>
    <!-- 红包记录Tab -->
    <van-tabs v-model="active">
      <van-tab title="我抢的">
        <van-cell v-show="getList.length != 0">
          <van-row>
            <van-col class="cell-title-start" span="6">获取时间</van-col>
            <van-col class="cell-title" span="8">转账hash</van-col>
            <van-col class="cell-title" span="6">红包金额</van-col>
          </van-row>
        </van-cell>
        <van-cell v-show="getList.length == 0">
          <van-col class="cell-title" span="24">暂无数据</van-col>
        </van-cell>
        <div
          v-for="item in getList"
          :key="item"
          :title="item"
          class="record-list"
        >
          <van-row>
            <van-col span="6" @click="goCandyDetail(item['packet.id'])">
              <div class="cell-title-start list-left">
                {{ formatAt(item.updatedAt) }}
              </div>
            </van-col>
            <van-col span="8"
              >{{ formatHash(item.hash) }}
              <Clipboard
                ref="clipboard"
                @click.native="copyTextToClipboard(item.hash)"
              ></Clipboard>
            </van-col>
            <van-col span="6" @click="goCandyDetail(item['packet.id'])"
              ><div>
                {{ item.amount }}&nbsp;&nbsp;{{ item.coin_type }}
              </div></van-col
            >
            <van-col span="4" class="cell-title-end"
              ><div class="list-right">
                <div
                  class="appeal-button"
                  v-show="item.isFail"
                  @click="makeUp(item.id, item.hash)"
                >
                  补偿
                </div>
              </div></van-col
            >
          </van-row>
          <van-divider class="record-divider" />
        </div>
      </van-tab>
      <van-tab title="我发的">
        <van-cell v-show="sendList.length != 0">
          <van-row>
            <van-col class="cell-title-start" span="6">创建时间</van-col>
            <van-col class="cell-title" span="7">口令</van-col>
            <van-col class="cell-title" span="7">哈希</van-col>
            <van-col class="cell-title-end" span="4">金额</van-col>
          </van-row>
        </van-cell>
        <van-cell v-show="sendList.length == 0">
          <van-col class="cell-title" span="24">暂无数据</van-col>
        </van-cell>
        <div
          v-for="item in sendList"
          :key="item"
          :title="item"
          class="record-list"
        >
          <van-row>
            <van-col span="6" @click="goCandyDetail(item.id)">
              <div class="cell-title-start list-left">
                {{ formatAt(item.createdAt) }}
              </div>
            </van-col>
            <van-col span="7">
              <div class="cell-title-start list-left">
                {{ formatHash(item.id) }}
                <Clipboard
                  ref="id"
                  @click.native="copyIdToClipboard(item.id)"
                ></Clipboard>
              </div>
            </van-col>
            <van-col span="7"
              >{{ formatHash(item.hash) }}
              <Clipboard
                ref="clipboard"
                @click.native="copyTextToClipboard(item.hash)"
              ></Clipboard>
            </van-col>
            <van-col span="4" @click="goCandyDetail(item.id)"
              ><div class="cell-title-end list-right">
                {{ item.amount }}&nbsp;&nbsp;{{ item.coin_type }}
              </div></van-col
            >
          </van-row>
          <van-divider class="record-divider" />
        </div>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script>
import NavBar from "../components/NavBar";
import Clipboard from "../components/CopyToClipboard";
import { Notify } from "vant";
import {
  getSendCandyList,
  getObtainCandyList,
  formatTime,
  formatTextOverflow,
  isTransferError,
  makeUpCandy,
  encodePwd,
} from "../js/utils";
export default {
  name: "candyRecord",
  components: {
    NavBar,
    Clipboard,
  },
  data: function () {
    return {
      active: 0,
      getList: [],
      getCount: 0,
      sendList: [],
      sendCount: 0,
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
      let res = await getObtainCandyList(address);
      if (res.status == 0) {
        this.getList = res.data.list;
        this.getCount = res.data.total;
        await this.getCandyStatus();
      } else {
        Notify({ type: "danger", message: "获取数据失败" });
      }
    },
    // 获取我发到的红包列表
    async sendLoad() {
      let wallet = await tp.getCurrentWallet();
      let address = wallet.data.address;
      let res = await getSendCandyList(address);
      if (res.status == 0) {
        this.sendList = res.data.list;
        this.sendCount = res.data.total;
        // 判定红包是否转账成功
      } else {
        Notify({ type: "danger", message: "获取数据失败" });
      }
    },
    // 红包补偿
    async makeUp(id, hash) {
      let res = await makeUpCandy(id);
      if (res.status == 0) {
        await this.getLoad();
        Notify({ type: "success", message: "红包已重新发送。" });
      } else {
        Notify({ type: "danger", message: "红包补偿失败！" });
      }
    },
    // 判断红包是否转账成功
    async getCandyStatus() {
      for (let i = 0, len = this.getList.length; i < len; i++) {
        let status = await isTransferError(this.getList[i].hash);
        if (status) {
          this.getList[i].isFail = true;
        } else {
          this.getList[i].isFail = false;
        }
      }
    },
    copyTextToClipboard(text) {
      this.$refs.clipboard[0].copyToClipboard(text);
    },
    copyIdToClipboard(text) {
      this.$refs.id[0].copyToClipboard(encodePwd(text));
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