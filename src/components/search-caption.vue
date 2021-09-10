<template>
  <input type="text" @input="handleSearch" />
</template>

<script>
export default {
  name: "search-caption",
  props: {
    caption: {
      type: Object,
      default: function() {},
    },
    namekey: {
      type: String,
      default: "",
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
    handleSearch: function(e) {
      this.action(this.caption.action, (i) => {
        return i[this.namekey]
          .toUpperCase()
          .includes(e.target.value.trim().toUpperCase());
      });
    },
  },
};
</script>

<style scoped>
th {
  padding: 0;
}
input {
  width: calc(100% - 15px);
}
</style>
