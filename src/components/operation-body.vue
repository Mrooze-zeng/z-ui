<template>
  <div class="operation">
    <button @click="handleUpdate">修改</button>
    <button @click="handleDelete">删除</button>
  </div>
</template>
<script>
export default {
  name: "operation-body",
  props: {
    column: {
      type: Object,
      default: function() {
        return {};
      },
    },
    action: {
      type: Function,
      default: function() {},
    },
  },
  methods: {
    handleUpdate: function() {
      this.action(this.column.body.actions.update, this.$attrs.data);
    },
    handleDelete: function() {
      this.action(this.column.body.actions.delete, this.$attrs.data);
    },
  },
};
</script>
<style scoped>
.operation {
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
}
button {
  cursor: pointer;
}
</style>
