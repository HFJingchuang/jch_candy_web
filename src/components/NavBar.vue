<template>
  <div class="nav-bar">
    <div class="header-div">
      <router-link :to="backUrl">
        <van-icon class="back-icon" name="arrow-left" />
      </router-link>
      <div class="header-title">{{ title }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "navBar",
  data: function () {
    return {};
  },
  props: {
    title: {
      type: String,
      default: "",
    },
    backUrl: {
      type: String,
      default: "/home",
    },
  },
};
</script>