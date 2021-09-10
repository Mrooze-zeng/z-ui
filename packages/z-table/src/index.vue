<template>
  <div
    class="z-table"
    data-a="addd"
    :style="{ width: width + 'px', height: height + 'px' }"
    ref="zTable"
  >
    <div
      class="z-table-fixed-header"
      ref="headerStaticTable"
      @scroll.prevent="handleBodyScrollLeft"
    >
      <z-table-header :columns="sortFixedColumns" ref="zTableHeader">
        <template v-slot:colcaption="slotProps">
          <slot name="colcaption" v-bind="slotProps"> </slot>
        </template>
        <template v-slot:header="slotProps">
          <slot name="header" v-bind="slotProps"> </slot>
        </template>
      </z-table-header>
      <z-table-body
        v-if="dataSource.length"
        :mod="mod"
        :height="tableBodyHeight"
        :rowHeight="rowHeight"
        :columns="sortFixedColumns"
        :dataSource="dataSource"
        @onScroll="handleTableScroll"
        @hook:mounted="calculateTableBodyHeight"
        target="fixedBody"
        ref="zTableBody"
      >
        <template v-slot:body="slotProps">
          <slot name="body" v-bind="slotProps"> </slot>
        </template>
      </z-table-body>
    </div>
    <div class="table-fixed-left" ref="leftStaticTable">
      <z-table-header :columns="sortFixedColumns">
        <template v-slot:colcaption="slotProps">
          <slot name="colcaption" v-bind="slotProps"> </slot>
        </template>
        <template v-slot:header="slotProps">
          <slot name="header" v-bind="slotProps"> </slot>
        </template>
      </z-table-header>
      <z-table-body
        v-if="dataSource.length"
        :mod="mod"
        :height="tableBodyHeight"
        :rowHeight="rowHeight"
        :columns="sortFixedColumns"
        :dataSource="dataSource"
        @onScroll="handleTableScroll"
        target="zTableBody"
        ref="fixedBody"
      >
        <template v-slot:body="slotProps">
          <slot name="body" v-bind="slotProps"> </slot>
        </template>
      </z-table-body>
    </div>
    <slot name="loading"></slot>
    <div v-if="!dataSource.length" class="z-table-data-empty">
      <slot name="empty"></slot>
    </div>
  </div>
</template>

<script>
import zTableHeader from "./table-header.vue";
import zTableBody from "./table-body.vue";
import _ from "underscore";

export default {
  name: "z-table",
  components: {
    zTableHeader,
    zTableBody,
  },
  props: {
    mod: {
      type: Number,
      default: 0,
    },
    dataSource: {
      type: Array,
      default: function() {
        return [];
      },
    },
    columns: {
      type: Array,
      default: function() {
        return [];
      },
    },
    width: {
      type: Number,
      default: 500,
    },
    height: {
      type: Number,
      default: 300,
    },
    rowHeight: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      tableBodyHeight: 0,
    };
  },
  computed: {
    sortFixedColumns: function() {
      let columns = this.columns;
      return columns
        .filter((col) => col.fixed)
        .concat(columns.filter((col) => !col.fixed));
    },
  },
  methods: {
    handleTableScroll: _.debounce(function(
      scrollTop = 0,
      container,
      isMaxCount = false,
      count = 0,
    ) {
      const { bottom } = container.getBoundingClientRect();
      const table = container.querySelector("table");
      const { bottom: tableBottom } = table.getBoundingClientRect();
      if (scrollTop === 0) {
        this.$emit("boundaryTop", count);
      }
      if (tableBottom <= bottom && isMaxCount) {
        this.$emit("boundaryBottom", count);
        this.calculateTableBodyHeight();
      }
    },
    50),
    handleBodyScrollLeft: _.throttle(
      function() {
        this.setStaticWidth(this.$refs["leftStaticTable"]);
      },
      10,
      { leading: true },
    ),
    setStaticWidth: function(
      dom,
      done = function(dom, total = 0, scrollLeft = 0) {
        if (scrollLeft) {
          dom.classList.add("table-fixed-left-scroll");
          dom.style.width = Math.floor(total) + "px";
        } else {
          dom.classList.remove("table-fixed-left-scroll");
          dom.style.width = 0 + "px";
        }
      },
    ) {
      const headerStaticTable = this.$refs["headerStaticTable"];
      let total = 0;
      dom.querySelectorAll(".fixed-th").forEach((th) => {
        const { width } = th.getBoundingClientRect();
        total += width;
      });
      done(dom, total, headerStaticTable.scrollLeft);
    },
    calculateTableBodyHeight: function() {
      const { height } = this.$el.getBoundingClientRect();
      const header = this.$refs["zTableHeader"].$el;
      let { height: headerHeight, top } = header.getBoundingClientRect();
      if (document.fullscreenElement) {
        headerHeight += top * 2;
      }
      let tableBodyHeight = height - headerHeight;
      if (this.dataSource.length) {
        this.tableBodyHeight = tableBodyHeight;
      }
    },
  },
  mounted() {
    document.addEventListener("fullscreenchange", () => {
      setTimeout(() => {
        const dom = this.$refs["leftStaticTable"];
        this.setStaticWidth(dom);
        this.calculateTableBodyHeight();
      }, 500);
    });
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.z-table table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  empty-cells: show;
  table-layout: fixed;
  /* border: 1px solid #e9e9e9; */
}
.z-table table th {
  background: #f7f7f7;
  color: #5c6b77;
  font-weight: 600;
  white-space: nowrap;
}
.z-table table td {
  background: #fff;
}
.z-table table td,
.z-table table th {
  border: 1px solid #e9e9e9;
}
.z-table table th {
  padding: 8px 16px;
}

.z-table {
  /* border: 1px solid #ccc; */
  position: relative;
  background: #fff;
}
.z-table .z-table-fixed-header {
  height: 100%;
  position: relative;
  overflow-y: hidden;
  border: 1px solid #e9e9e9;
}

.z-table .z-table-data-empty {
  width: 100%;
  text-align: center;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

.z-table :not(:root):fullscreen.z-table {
  padding: 25px;
}
.z-table :not(:root):fullscreen .table-fixed-left {
  height: calc(100vh - 50px);
  overflow: hidden;
  left: 25px;
  top: 25px;
}
.z-table :not(:root):fullscreen .table-fixed-left table {
  /* display: none; */
  width: calc(100vw - 50px);
}
.z-table .table-fixed-left {
  box-shadow: none;
  transition: box-shadow 0.3s ease;
  width: 0;
  /* height: 100%; */
  position: absolute;
  top: 0;
  left: 0;
  overflow-x: hidden;
  background: #fff;
  border: 1px solid #e9e9e9;
  border-right: 0;
}
.z-table .table-fixed-left.table-fixed-left-scroll {
  box-shadow: 6px 0 6px -4px rgba(0, 0, 0, 0.2);
}
</style>
