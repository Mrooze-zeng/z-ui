# table-demo

[预览地址](https://mrooze-zeng.github.io/virtual-table-list-demo/)

## 说明

目前本 demo 采用的是多 table 叠加的方式达到显示效果，未采用`position:sticky`的方式,采用`position:sticky`的方式应该会减少大量的 dom 生成

## columns 配置说明

```js
{
  title: "No.",               //显示的表头文本
  key: "index",               //dataSource的键名
  width: 100,                 //单个单元格宽度
  fixed: "left",              //列的固定方向，目前只支持左固定
  header: {                   //表头设置
    slot: "CheckboxHeader",   //表头显示需要用到的内容组件
    action: function() {},// 表头单元格调用的事件处理,由内容组件决定方法的参数
  },
  body: {                     // 表体单元格设置
    slot: "CheckboxBody",     // 表体单元格需要用到的内容组件
    action: function(v) {},   // 表体单元格调用的事件处理,由内容组件决定方法的参数
  },
  caption: {                  // 表列最顶部的内容显示设置
    slot: "TextCaption",      // 需要用到的内容组件
    text: "Bonus 3",          // 显示的内容文本
    colspan: 2,               // 需要合并的单元格个数
    style:"background-color:#8e929c;", // 对独立组件设置样式
  },
},
```

## 各内容组件固定可获取的值

```js
//caption
  props: {
    caption: {
      type: Object,
      default: function() {},
    },
    namekey: { //对应columes的key
      type: String,
      default: "",
    },
    action: {
      type: Function,
      default: function() {},
    },
  },
//header
  props: {
    column: {
      type: Object,
      default: function() {
        return {};
      },
    },
    namekey: { //对应columes的key
      type: String,
      default: "",
    },
    action: {
      type: Function,
      default: function() {},
    },
  },
// body
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
  $attrs:{
    data:{} //dataSource 对应的单条数据
  }

```

## 数据示例

```js
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
    city: "Lake Sydnee Lake Sydnee",
    name: "Kieran Thompson",
    zip: "03930",
    age: 234,
    address: "674 Stanton Locks",
  },
];
```

## 组件的使用

通过 slot 和 component 的方式添加组件和传参
提供五个 slot:`colcaption`,`header`,`body`,`loading`,`empty`

```html
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
    <div class="loading">loading...</div>
  </template>
  <template v-slot:empty>
    <div>data empty</div>
  </template>
</z-table>
```

`handleAction`需要绑定作用域，以便`columns`的`actions`处于与当前组件相同的作用域,方便数据处理

```js
handleAction: function(action = function() {}, ...v) {
  return action.apply(this, v);
},
```
