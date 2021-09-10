<template>
  <div id="app">
    <table-demo :rowHeight="46">
      <h1 class="title">with row height set</h1>
    </table-demo>
    <table-demo>
      <h1 class="title">with row height unset</h1>
    </table-demo>
  </div>
</template>
<script>
import TableDemo from "./table-demo.vue";
export default {
  name: "App",
  components: {
    TableDemo,
  },
};
</script>

<style scoped>
#app {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
}
.title {
  text-align: center;
}
</style>
