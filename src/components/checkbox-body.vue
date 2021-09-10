<template>
  <label>
    <input
      type="checkbox"
      @change.prevent="handleClick"
      :value="$attrs.data.checked"
      :checked="$attrs.data.checked"
    />
    <span> {{ renderLabel() }} </span>
  </label>
</template>

<script>
export default {
  name: "checkbox-body",
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
      this.action(this.column.body.action, {
        ...this.$attrs.data,
        ...{ checked: event.target.checked },
      });
    },
    renderLabel: function() {
      return this.$attrs.data.index;
    },
  },
  mounted() {
    // console.log(this.data);
  },
};
</script>
