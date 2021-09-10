import Vue from "vue";
import App from "./App.vue";
/* use-package-loader-inject */

Vue.config.productionTip = false;
new Vue({
  render: function render(h) {
    return h(App);
  },
}).$mount("#app");
