<template>
  <table class="n-table-header">
    <colgroup>
      <col v-for="(col, i) in columns" :key="i" :width="col.width || ''" />
    </colgroup>
    <thead>
      <tr v-if="withColumnCaption.length" class="n-table-header-caption">
        <template v-for="col in withColumnCaption">
          <th
            :key="col.name"
            class="th-caption"
            :class="{ 'fixed-th': col.fixed }"
            :colspan="col.caption && col.caption.colspan"
          >
            <slot
              v-if="col.caption && col.caption.slot"
              name="colcaption"
              v-bind:namekey="col.key"
              v-bind:caption="col.caption"
            ></slot>
          </th>
        </template>
      </tr>
      <tr>
        <th v-for="col in columns" :key="col.key">
          <slot v-if="col.header" name="header" v-bind:column="col"></slot>
          <span v-else>{{ col.title }}</span>
        </th>
      </tr>
    </thead>
  </table>
</template>
<script>
export default {
  name: "n-table-header",
  props: {
    columns: {
      type: Array,
      default: function() {
        return [];
      },
    },
  },
  computed: {
    withColumnCaption: function() {
      let columns = [...this.columns];
      let hasCaption = columns.some((col) => col.caption);
      let result = [];

      this.columns.reduce((output, v, i) => {
        if (output >= i) {
          // columns.splice(i, 1);
          console.log(i);
        } else {
          if (v.caption && v.caption.colspan) {
            output = i + v.caption.colspan - 1;
            result.push(v);
          } else {
            if (output < i) {
              output = i;
              result.push(v);
            }
          }
        }
        return output;
      }, -1);
      return hasCaption ? result : [];
    },
  },
  mounted() {},
};
</script>

<style>
.z-table .n-table-header-caption th {
  background: transparent;
  border: none;
}
.z-table .n-table-header-caption th.th-caption {
  padding: 0;
}
</style>
