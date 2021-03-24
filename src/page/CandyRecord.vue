<template >
  <div class="candy-record">
    <!-- 头部导航栏 -->
    <!-- <NavBar title="红包记录" backUrl="/home"></NavBar> -->
    <div class="nav-bar">
      <div class="header-div">
        <div class="header-title">
          <span style="margin-left: 64px">红包记录</span>
        </div>
        <van-dropdown-menu>
          <van-dropdown-item
            v-model="value"
            :options="dateYear"
            @change="changeSelect"
          >
          </van-dropdown-item>
        </van-dropdown-menu>
      </div>
    </div>
    <!-- 红包记录Tab -->
    <van-tabs v-model="active" @click="onClickTabs">
      <div class="amount">
        <van-grid :border="false" :column-num="3">
          <van-grid-item class="van-hairline--right">
            <p class="record-number">{{ formatAmount(this.SWTAmount) }}</p>
            <span class="record-title">SWT</span>
          </van-grid-item>
          <van-grid-item class="van-hairline--right">
            <p class="record-number">{{ formatAmount(this.JJCCAmount) }}</p>
            <span class="record-title">JJCC</span>
          </van-grid-item>
          <van-grid-item>
            <p class="record-number">{{ formatAmount(this.JMOACAmount) }}</p>
            <span class="record-title">JMOAC</span>
          </van-grid-item>
        </van-grid>
      </div>
      <van-tab name="get" title="我抢的">
        <van-cell v-show="getList.length != 0">
          <van-row>
            <van-col class="cell-title-start" span="7">获取时间</van-col>
            <van-col class="cell-title" span="6">哈希</van-col>
            <van-col class="cell-title" span="7">金额</van-col>
          </van-row>
        </van-cell>
        <van-cell v-show="getList.length == 0">
          <van-col class="cell-title" span="24">暂无数据</van-col>
        </van-cell>
        <van-list
          v-model="getLoading"
          :finished="getFinished"
          finished-text="没有更多了"
          @load="getOnLoad"
        >
          <div
            v-for="item in getList"
            :key="item"
            :title="item"
            class="record-list"
          >
            <van-row>
              <van-col span="7" @click="goCandyDetail(item['packet.id'])">
                <div class="cell-title-start list-left">
                  {{ formatAt(item.updatedAt) }}
                </div>
              </van-col>
              <van-col span="6"
                >{{ formatHash(item.hash) }}
                <Clipboard
                  ref="clipboard"
                  @click.native="copyTextToClipboard(item.hash)"
                ></Clipboard>
              </van-col>
              <van-col span="7" @click="goCandyDetail(item['packet.id'])"
                ><div>
                  {{ formatAmount(item.amount) }}&nbsp;&nbsp;{{
                    item.coin_type
                  }}
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
        </van-list>
      </van-tab>
      <van-tab name="send" title="我发的">
        <van-cell v-show="sendList.length != 0">
          <van-row>
            <van-col class="cell-title-start" span="6">创建时间</van-col>
            <van-col class="cell-title" span="6">口令</van-col>
            <van-col class="cell-title" span="6">哈希</van-col>
            <van-col class="cell-title-end" span="6">金额</van-col>
          </van-row>
        </van-cell>
        <van-cell v-show="sendList.length == 0">
          <van-col class="cell-title" span="24">暂无数据</van-col>
        </van-cell>
        <van-list
          v-model="sendLoading"
          :finished="sendFinished"
          finished-text="没有更多了"
          @load="sendOnLoad"
        >
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
              <van-col span="6">
                {{ formatHash(item.id) }}
                <Clipboard
                  ref="id"
                  @click.native="copyIdToClipboard(item.id, item.title)"
                ></Clipboard>
              </van-col>
              <van-col span="6"
                >{{ formatHash(item.hash) }}
                <Clipboard
                  ref="clipboard"
                  @click.native="copyTextToClipboard(item.hash)"
                ></Clipboard>
              </van-col>
              <van-col span="6" @click="goCandyDetail(item.id)"
                ><div class="cell-title-end list-right">
                  {{ formatAmount(item.amount) }}&nbsp;&nbsp;{{
                    item.coin_type
                  }}
                </div></van-col
              >
            </van-row>
            <van-divider class="record-divider" />
          </div>
        </van-list>
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
  encodePwdTitle,
  sendPacketAmount,
  getPacketAmount,
  formatBalance,
} from "../js/utils";
import BigNumber from "bignumber.js";
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
      SWTAmount: 0,
      JJCCAmount: 0,
      JMOACAmount: 0,
      value: new Date().getFullYear(),
      dateYear: [],
      tagsName: "",
      sendLoading: false,
      sendFinished: false,
      sendPageNum: 0,
      getLoading: false,
      getFinished: false,
      getPageNum: 0,
    };
  },
  mounted() {
    this.initDateYear();
    this.getPacketAmount();
  },
  methods: {
    // 上拉刷新
    sendOnLoad() {
      this.sendPageNum += 1;
      this.sendLoad();
    },
    getOnLoad() {
      this.getPageNum += 1;
      this.getLoad();
    },
    // 总额reset0
    resetAmount() {
      this.SWTAmount = 0;
      this.JJCCAmount = 0;
      this.JMOACAmount = 0;
    },
    // 当时间发生变化刷新页面
    changeSelect() {
      let name = this.tagsName ? this.tagsName : "get";
      this.getList=[];
      this.sendList=[];
      this.getFinished = false;
      this.sendFinished = false;
      this.sendPageNum = 1;
      this.getPageNum = 1;
      this.onClickTabs(name);
    },
    // 初始化日期选择
    initDateYear() {
      // let startDate = new Date("2015").getFullYear();
      let value = new Date().getFullYear();
      for (let i = 0; i < 5; i++) {
        this.dateYear.push({ text: value - i + "年", value: value - i });
      }
    },
    // 根据地址获取发送数量
    async sendPacketAmount() {
      let wallet = await tp.getCurrentWallet();
      let address = wallet.data.address;
      let res = await sendPacketAmount(address, this.value);
      this.resetAmount();
      if (res.status == 0) {
        if (res.data.length > 0) {
          res.data.forEach((ele) => {
            if (ele.coin_type == "SWT") {
              this.SWTAmount = ele.amountNum;
            } else if (ele.coin_type == "JJCC") {
              this.JJCCAmount = ele.amountNum;
            } else if (ele.coin_type == "JMOAC") {
              this.JMOACAmount = ele.amountNum;
            }
          });
        } else {
          this.resetAmount();
        }
      } else {
        Notify({ type: "danger", message: "获取数据失败" });
      }
    },
    // 根据地址获取领取数量
    async getPacketAmount() {
      let wallet = await tp.getCurrentWallet();
      let address = wallet.data.address;
      let res = await getPacketAmount(address, this.value);
      this.resetAmount();
      if (res.status == 0) {
        if (res.data.length > 0) {
          res.data.forEach((ele) => {
            if (ele["packet.coin_type"] == "SWT") {
              this.SWTAmount = ele.amountNum;
            } else if (ele["packet.coin_type"] == "JJCC") {
              this.JJCCAmount = ele.amountNum;
            } else if (ele["packet.coin_type"] == "JMOAC") {
              this.JMOACAmount = ele.amountNum;
            }
          });
        } else {
          this.resetAmount();
        }
      } else {
        Notify({ type: "danger", message: "获取数据失败" });
      }
    },
    // 获取我抢到的红包列表
    async getLoad() {
      let wallet = await tp.getCurrentWallet();
      let address = wallet.data.address;
      let res = await getObtainCandyList(address, this.value, this.getPageNum);
      if (res.status == 0) {
        this.getList.push(...res.data.list);
        this.getCount = res.data.total;
        if (res.data.list.length === 0) {
          this.getFinished = true;
        }
        await this.getCandyStatus();
      } else {
        Notify({ type: "danger", message: "获取数据失败" });
      }
      this.getLoading = false;
    },
    // 获取我发到的红包列表
    async sendLoad() {
      let wallet = await tp.getCurrentWallet();
      let address = wallet.data.address;
      let res = await getSendCandyList(address, this.value, this.sendPageNum);
      if (res.status == 0) {
        this.sendList.push(...res.data.list);
        this.sendCount = res.data.total;
        // 判定红包是否转账成功
        if (res.data.list.length === 0) {
          this.sendFinished = true;
        }
      } else {
        Notify({ type: "danger", message: "获取数据失败" });
      }
      this.sendLoading = false;
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
    async onClickTabs(name, title) {
      this.tagsName = name;
      if (name == "get") {
        await this.getPacketAmount();
        await this.getLoad();
      } else {
        await this.sendPacketAmount();
        await this.sendLoad();
      }
    },
    copyTextToClipboard(text) {
      this.$refs.clipboard[0].copyToClipboard(text);
    },
    copyIdToClipboard(password, title) {
      this.$refs.id[0].copyToClipboard(encodePwdTitle(password, title));
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
    formatAmount(num) {
      return formatBalance(num);
    },
  },
};
</script>

<style>
.record-number {
  font-size: 17px;
  color: papayawhip;
  font-weight: 600;
}
.record-title {
  font-size: 11px;
  color: papayawhip;
  line-height: 18px;
}
.monitor-detail {
  height: 60px;
  width: 95px;
  display: flex;
  align-items: center; /*定义body的元素垂直居中*/
  margin-left: 15px;
  box-shadow: 0 2px 12px rgb(100 101 102 / 20%);
  border-radius: 10px;
}
.amount {
  background-color: #ce2344;
  border-color: 1px solid #ce2344;
}
.candy-amount {
  padding: 0;
  margin: 0;
}
.van-dropdown-menu__bar {
  box-shadow: 0px 0px 0px;
  height: 40px;
}
.van-dropdown-menu__item {
  justify-content: flex-end;
  background-color: #ce2344;
}
.van-dropdown-menu__title {
  color: white;
}
.van-grid-item__content {
  height: 100%;
  background-color: #ce2344;
  padding: 0px 8px;
}
.van-tabs__nav {
  background-color: #ce2344;
}
.van-tab {
  color: white;
}
.van-tab--active {
  color: papayawhip;
  font-weight: 500;
}
.van-tabs__line {
  background-color: papayawhip;
}
.van-hairline--right {
  margin: 12px 0px;
}
</style>