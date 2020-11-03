<template>
  <van-icon name="orders-o" class="icon-document-copy" />
</template>
<script>
import { Notify } from "vant";
import Clipboard from "clipboard";
export default {
  name: "clipboard",
  data() {
    return { clipboard: null };
  },
  destroyed() {
    if (this.clipboard) {
      this.clipboard.destroy();
    }
  },
  methods: {
    copyToClipboard(copyText) {
      if (this.clipboard && JSON.stringify(this.clipboard.text()) !== "{}") {
        this.clipboard.destroy();
      }
      var _this = this;
      this.clipboard = new Clipboard(".icon-document-copy", {
        text: () => {
          return copyText;
        },
      });
      this.clipboard.on("success", function (e) {
        Notify({
          type: "success",
          message: "复制成功",
        });
        e.clearSelection();
      });
      this.clipboard.on("error", function (e) {
        Notify({ type: "danger", message: "复制失败" });
        e.clearSelection();
      });
    },
  },
};
</script>