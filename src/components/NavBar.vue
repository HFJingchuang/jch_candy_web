<template>
  <div class="nav-bar">
    <div class="header-div">
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
    }
  },
};
</script>