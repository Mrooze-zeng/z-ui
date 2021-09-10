<template>
  <label>
    <input type="checkbox" @change="handleClick" />
    <span> {{ renderLabel() }} </span>
  </label>
</template>

<script>
export default {
  name: "checkbox-header",
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
  data() {
    return {};
  },
  methods: {
    handleClick: function(event) {
      this.action(this.column.header.action, (item) => {
        item.checked = event.target.checked;
        return item;
      });
    },
    renderLabel: function() {
      return this.column.title;
    },
  },
  mounted() {},
};
</script>
