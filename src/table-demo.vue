<template>
  <div ref="table">
    <slot></slot>
    <z-table
      ref="zTable"
      :mod="mod"
      :height="500"
      :width="800"
      :rowHeight="rowHeight"
      :dataSource="dataSource"
      :columns="columns"
      @boundaryTop="handleBoundaryTop"
      @boundaryBottom="handleBoundaryBottom"
    >
      <template v-slot:colcaption="slotProps">
        <component
          :is="slotProps.caption.slot"
          v-bind="slotProps"
          :action="handleAction"
        ></component>
      </template>
      <template v-slot:header="slotProps">
        <component
          :is="slotProps.column.header.slot"
          v-bind="slotProps"
          :action="handleAction"
        ></component>
      </template>
      <template v-slot:body="slotProps">
        <component
          :is="slotProps.column.body.slot"
          :action="handleAction"
          v-bind="slotProps"
        ></component>
      </template>
      <template v-slot:loading v-if="isLoading">
        <div class="lds-ellipsis">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </template>
      <template v-slot:empty>
        <div>
          data empty
        </div>
      </template>
    </z-table>
    <br />
    <div class="dispaly-box">
      <button @click="fetchData">fetch data</button>
      <button @click="toggelFullscreen">fullscreen</button>
      <span>total:{{ dataSource.length }}</span>
    </div>
  </div>
</template>

<script>
import screenfull from "screenfull";
import faker from "faker";

import CheckboxHeader from "./components/checkbox-header.vue";
import CheckboxBody from "./components/checkbox-body.vue";
import TextCaption from "./components/text-caption.vue";
import SearchCaption from "./components/search-caption.vue";
import FilterHeader from "./components/filter-header.vue";
import OperationBody from "./components/operation-body.vue";

const defaultDataSource = [
  {
    id: 0,
    province: "C",
    city: "S",
    name: "O",
    zip: "6",
    age: 6,
    address: "4",
  },
  {
    id: 1,
    province: "Ohio",
    city:
      "Lake Sydnee Lake Sydnee Lake Sydnee Lake Sydnee Lake Sydnee Lake Sydnee Lake Sydnee Lake Sydnee Lake Sydnee Lake Sydnee ",
    name: "Kieran Thompson",
    zip: "03930",
    age: 234,
    address: "674 Stanton Locks",
  },
];

export default {
  name: "v-table",
  components: {
    CheckboxHeader,
    CheckboxBody,
    TextCaption,
    SearchCaption,
    FilterHeader,
    OperationBody,
  },
  props: {
    rowHeight: {
      type: Number,
      default: 0,
    },
    mod: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      dataSource: [],
      columns: [],
      isLoading: false,
    };
  },
  methods: {
    updateCol: function(col = {}) {
      this.dataSource = this.dataSource.map((item) => {
        if (item.id === col.id) {
          return col;
        }
        return item;
      });
    },

    updateRow: function(dataSource = []) {
      this.dataSource = dataSource;
    },
    handleAction: function(action = function() {}, ...v) {
      return action.apply(this, v);
    },
    handleBoundaryTop: function(count = 0) {
      console.log("reach top", count);
    },
    handleBoundaryBottom: function(count = 0) {
      console.log("reach bottom", count);
      this.fetchData({ count });
    },
    createDataSource: function({ size = 2, isUseDefaultDataSource = false }) {
      let dataSource = [];
      let step = Math.ceil(this.dataSource.length / size);
      for (let i = 0; i < size; i++) {
        if (isUseDefaultDataSource) {
          dataSource.push({
            ...defaultDataSource[
              Math.ceil(Math.random() * defaultDataSource.length - 1)
            ],
            index: `${step}-${i}`,
            id: faker.datatype.uuid(),
          });
        } else {
          dataSource.push({
            index: `${step}-${i}`,
            id: faker.datatype.uuid(),
            province: faker.address.state(),
            city: faker.address.city(),
            name: faker.name.findName(),
            zip: faker.address.zipCode(),
            age: faker.datatype.number(100),
            description: faker.lorem.sentence(),
            address: faker.address.streetAddress(),
          });
        }
      }
      return dataSource;
    },
    fetchData: function({ count }) {
      const dataSource = this.dataSource;
      const self = this;
      setTimeout(function() {
        self.dataSource = [
          ...dataSource,
          ...self.createDataSource({
            size: count,
            isUseDefaultDataSource: false,
          }),
        ];
        self.isLoading = false;
      }, 1000);
      this.isLoading = true;
    },
    toggelFullscreen: function toggleFullScreen() {
      const zTable = this.$refs["zTable"].$el;
      if (screenfull.isEnabled) {
        screenfull.toggle(zTable);
      }
    },
    createColumns: function() {
      this.columns = [
        {
          title: "No.",
          key: "index",
          width: 100,
          fixed: "left",
          header: {
            slot: "CheckboxHeader",
            action: function(done = function() {}) {
              const data = this.dataSource;
              this.updateRow(data.map(done));
            },
          },
          body: {
            slot: "CheckboxBody",
            action: function(v) {
              this.updateCol(v);
            },
          },
        },
        {
          title: "姓名",
          key: "name",
          fixed: "left",
          width: 150,
          caption: {
            slot: "SearchCaption",
            action: function(done = function() {}) {
              const dataSource = this.createDataSource();
              this.dataSource = dataSource.filter(done);
            },
          },
        },
        {
          title: "年龄",
          key: "age",
          width: 100,
          header: {
            slot: "FilterHeader",
            actions: {
              up: function(done = function() {}) {
                const data = this.dataSource;
                this.updateRow(data.sort(done));
              },
              down: function(done = function() {}) {
                const data = this.dataSource;
                this.updateRow(data.sort(done));
              },
            },
          },
          caption: {
            slot: "TextCaption",
            text: "Bonus 1",
            colspan: 2,
          },
        },
        {
          title: "省份",
          key: "province",
          width: 100,
        },
        {
          title: "市区",
          key: "city",
          width: 200,
          caption: {
            slot: "TextCaption",
            text: "Bonus 3",
            colspan: 2,
            style: "background-color:#8e929c;",
          },
        },
        {
          title: "地址",
          key: "address",
          width: 200,
        },
        {
          title: "邮编",
          key: "zip",
          width: 100,
        },
        {
          title: "说明",
          key: "description",
          width: 200,
        },
        {
          title: "操作",
          key: "action",
          width: 150,
          body: {
            slot: "OperationBody",
            actions: {
              update: function(v = {}) {
                console.log("update", v);
              },
              delete: function(v = {}) {
                const data = this.dataSource;
                const i = data.findIndex((i) => i.id === v.id);
                data.splice(i, 1);
              },
            },
          },
        },
      ];
    },
  },
  mounted() {
    this.createColumns();
    // this.fetchData();
  },
  created() {},
};
</script>

<style>
.dispaly-box {
  width: 500px;
  display: flex;
  justify-content: space-between;
}
.lds-ellipsis {
  display: inline-block;
  position: absolute;
  width: 100px;
  height: 25px;
  left: 50%;
  top: 50%;
  margin-top: calc(25px / -2);
  margin-left: -50px;
}
.lds-ellipsis div {
  position: absolute;
  top: 10px;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: rgb(32, 76, 117);
  animation-timing-function: cubic-bezier(0, 1, 1, 0);
}
.lds-ellipsis div:nth-child(1) {
  left: 8px;
  animation: lds-ellipsis1 0.6s infinite;
}
.lds-ellipsis div:nth-child(2) {
  left: 8px;
  animation: lds-ellipsis2 0.6s infinite;
}
.lds-ellipsis div:nth-child(3) {
  left: 32px;
  animation: lds-ellipsis2 0.6s infinite;
}
.lds-ellipsis div:nth-child(4) {
  left: 56px;
  animation: lds-ellipsis3 0.6s infinite;
}
@keyframes lds-ellipsis1 {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}
@keyframes lds-ellipsis3 {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(0);
  }
}
@keyframes lds-ellipsis2 {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(24px, 0);
  }
}
</style>
