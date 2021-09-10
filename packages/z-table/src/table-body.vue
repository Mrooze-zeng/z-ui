<template>
  <div
    class="z-table-body"
    :data-sign="_uid"
    @scroll="handleBodyScrollTop"
    @mouseenter="setCurrentTarget"
    @mouseleave="setCurrentTarget"
    ref="zTableBody"
    :style="{ 'max-height': TableBodyheight + 'px' }"
  >
    <div
      class="z-table-body-phantom"
      ref="phantom"
      :style="{ 'min-height': phantomHeight + 'px' }"
    ></div>
    <table :style="{ transform: transform }" ref="tablebox">
      <colgroup>
        <col v-for="(col, i) in columns" :key="i" :width="col.width || ''" />
      </colgroup>
      <tbody>
        <tr v-for="(row, i) in visibleData" :key="i" :id="row.id">
          <td
            v-for="col in columns"
            :key="col.key"
            :class="{ uncertainRowHeight: !rowHeight }"
          >
            <div
              :class="{ 'td-container': rowHeight }"
              :style="rowHeight > 0 ? { height: rowHeight + 'px' } : {}"
            >
              <slot
                v-if="col.body"
                name="body"
                v-bind:data="row"
                v-bind:column="col"
              ></slot>
              <span v-else>
                {{ row[col.key] }}
              </span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import _ from "underscore";
export default {
  name: "z-table-body",
  props: {
    mod: {
      type: Number,
      default: 0,
    },
    height: {
      type: Number,
      default: 0,
    },
    columns: {
      type: Array,
      default: function() {
        return [];
      },
    },
    dataSource: {
      type: Array,
      default: function() {
        return [];
      },
    },
    onScroll: {
      type: Function,
      default: function() {},
    },
    target: {
      type: String,
      default: "",
    },
    rowHeight: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      start: 0,
      end: 2,
      itemHeight: 0,
      transform: "",
      visibleCount: 2,
      TableBodyheight: 0,
      scrollTopCache: [],
      scrollTop: 0,
      sign: "",
    };
  },
  computed: {
    visibleData: function() {
      return this.dataSource.slice(
        Math.max(this.start, 0),
        Math.min(this.end, this.dataSource.length),
      );
    },
    phantomHeight: function() {
      let size = Math.min(
        this.end * this.itemHeight,
        this.dataSource.length * this.itemHeight,
      );
      return Math.ceil(size) + 1;
    },
  },
  watch: {
    height: function(v) {
      this.setUpComp(v);
    },
  },
  methods: {
    handleBodyScrollTop: _.throttle(
      function(event) {
        const scrollTop = event.target.scrollTop;

        this.itemHeight = Math.min(
          this.itemHeight,
          this.getTrHeight(event.target),
        ); //修正高度

        if (!this.rowHeight) {
          switch (this.mod) {
            case 0:
              this.setPositionForUncertainRowHeightWithStack(
                scrollTop,
                event.target,
              );
              break;
            case 1:
              this.setPositionForUncertainRowHeightWithCache(
                scrollTop,
                event.target,
              );
              break;
          }
        } else {
          this.setUpPositionWithBuf(scrollTop, this.visibleCount);
        }

        this.syncScroll(scrollTop, event.target);
      },
      0,
      { leading: true },
    ),
    isMaxCount: function(end = this.end) {
      return end >= this.dataSource.length;
    },
    setCurrentTarget: function(event) {
      if (event.type === "mouseenter") {
        this.sign = event.target.dataset.sign;
      } else {
        this.sign = "";
      }
    },
    syncScroll: function(scrollTop = 0, el) {
      const target = this.$parent.$refs[this.target] || {};

      if (target.$el && this.sign) {
        target.$el.scrollTop = scrollTop;
        this.$emit(
          "onScroll",
          scrollTop,
          el,
          this.isMaxCount(),
          this.end - this.start,
        );
      }
    },
    setPositionForUncertainRowHeightWithStack: function(
      scrollTop = 0,
      container,
    ) {
      if (scrollTop <= 0) {
        this.clearCache();
      }
      this.setScrollTopCacheStack({
        scrollTop,
        container,
        isRollingDown: this.scrollTop <= scrollTop,
      });
      this.setTransform2();

      this.scrollTop = scrollTop;
    },
    setScrollTopCacheStack: function({
      scrollTop = 0,
      container,
      bufSize = this.height / 2,
      isRollingDown = true,
    }) {
      const {
        top: containerTop,
        bottom: containerBottom,
      } = container.getBoundingClientRect();
      let first = container.querySelector(`tr:first-child`);
      let last = container.querySelector(`tr:last-child`);
      const {
        height: firstHeight,
        top: firstTop,
      } = first.getBoundingClientRect();
      const { top: lastTop } = last.getBoundingClientRect();

      if (isRollingDown) {
        this.cachePush(firstTop, containerTop, bufSize, first, firstHeight);
      } else {
        this.cachePop(lastTop, containerBottom, bufSize, scrollTop);
      }
    },
    cachePush: function(firstTop, containerTop, bufSize, first, firstHeight) {
      let cache = this.scrollTopCache;
      let start = Math.max(0, this.start);
      if (firstTop + bufSize <= containerTop) {
        let isHas = cache.findIndex((i) => i.id === first.id);
        if (isHas < 0 && !this.isMaxCount(this.end - 1)) {
          this.scrollTopCache.push({
            id: first.id,
            start,
            height: firstHeight,
          });
        }
      }
    },
    cachePop: function(lastTop, containerBottom, bufSize, scrollTop) {
      if (containerBottom <= lastTop - bufSize) {
        this.scrollTopCache.pop();
      }
      const cache = this.scrollTopCache;
      let totalHeight = bufSize;
      for (let i = 0; i < cache.length; i++) {
        totalHeight += cache[i].height;
        if (scrollTop <= totalHeight) {
          this.scrollTopCache = cache.slice(0, i);
          break;
        }
      }
    },
    setTransform2: function() {
      let transform = 0;
      const cache = this.scrollTopCache;
      this.start = cache.length;
      cache.slice(0, this.start).forEach((i) => {
        transform += i.height;
      });
      this.transform = `translate3d(0,${transform}px,0)`;
      this.end = this.start + this.visibleCount * 2;
    },

    //
    setPositionForUncertainRowHeightWithCache: function(
      scrollTop = 0,
      container,
    ) {
      const first = container.querySelector("tr:first-child");
      const { top: containerTop } = container.getBoundingClientRect();
      const {
        height,
        bottom: firstBottom,
        top: firstTop,
      } = first.getBoundingClientRect();

      if (scrollTop <= 0) {
        this.clearCache();
      }

      if (this.scrollTop < scrollTop) {
        if (containerTop >= firstBottom) {
          this.addCache({
            scrollTop,
            id: first.id,
            start: this.start,
            height,
          });
        }
        this.setTransform({
          cache: this.scrollTopCache,
          scrollTop,
          multiple: Math.ceil((containerTop - firstTop) / this.height),
        });
      } else if (this.scrollTop > scrollTop) {
        // if (containerBottom <= lastTop) {
        this.setTransform({
          cache: this.scrollTopCache,
          scrollTop,
          extr: -1,
        });
        // }
      }
      this.scrollTop = scrollTop;
    },
    setTransform: function({
      cache = [],
      scrollTop = 0,
      extr = 1,
      multiple = 1,
    }) {
      //有问题
      const item = cache.find((i) => i.scrollTop >= scrollTop);
      if (item) {
        let transform = 0;
        let start = Math.max(item.start + extr, 0);
        cache.slice(0, start).forEach((c) => {
          transform += c.height;
        });
        this.transform = `translate3d(0,${transform}px,0)`;
        this.start = start;
        this.end = start + this.visibleCount * Math.max(multiple, 1);
      }
    },
    addCache: function(cache = {}) {
      if (this.scrollTopCache.findIndex((i) => i.id === cache.id) < 0) {
        this.scrollTopCache.push(cache);
      }
    },
    clearCache: function() {
      this.scrollTopCache = [];
      this.start = 0;
      this.end = this.start + this.visibleCount;
      this.transform = "";
    },
    setUpPositionWithBuf: function(scrollTop, bufSize) {
      let start = Math.floor(scrollTop / this.itemHeight);
      let extr = 0;
      if (start >= bufSize) {
        bufSize -= 1;
        extr += 1;
      }
      this.start = Math.max(start - bufSize, 0);
      this.end = this.start + this.visibleCount + bufSize + extr;
      this.transform = `translate3d(0,${this.itemHeight * this.start}px,0)`;
    },
    getTrHeight: function(target) {
      let heights = [60];
      const trs = target.querySelectorAll("tr:nth-child(-n+5)") || [];
      trs.forEach((tr) => {
        const { height } = tr.getBoundingClientRect();
        heights.push(height);
      });
      return Math.min(...heights);
    },
    setUpComp: function(v) {
      const dom = this.$refs["zTableBody"];
      this.itemHeight = this.getTrHeight(dom);
      this.visibleCount = Math.max(Math.ceil(v / this.itemHeight), 10);
      this.end = this.start + this.visibleCount;
      this.TableBodyheight = v;
      dom.scrollTop = 0;
    },
  },
  mounted() {},
};
</script>

<style>
.z-table .z-table-body {
  position: relative;
  height: calc(100% - 40px);
  width: fit-content;
  overflow: auto;
  -webkit-overflow-scrolling: none;
  z-index: 0;
}
.z-table .z-table-body table {
  will-change: transform;
  /* transition: all 0s linear; */
  /* pointer-events: none; */
  transform: translate3d(0, 0, 0);
}
.z-table .sticky-col {
  position: sticky;
  position: -webkit-sticky;
  left: 0;
}
.z-table .z-table-body-phantom {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  z-index: -1;
  width: 100%;
  height: calc(100% + 1px);
  visibility: hidden;
}
.z-table table td.uncertainRowHeight {
  padding: 8px 16px;
}
.z-table .td-container {
  box-sizing: border-box;
  padding: 8px 16px;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
