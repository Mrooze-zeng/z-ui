// @ts-ignore
// prettier-ignore
const tpls = {".gitignore":"template/.gitignore","vue.config.js":"template/vue.config.js","build/create-packages-exports-plugin.js":"template/build/create-packages-exports-plugin.js","build/disable-eslint-check-plugin.js":"template/build/disable-eslint-check-plugin.js","build/prettier-default-options.json":"template/build/prettier-default-options.json","build/vue-use-packages-loader.js":"template/build/vue-use-packages-loader.js","build/vue-use-packages-plugin.js":"template/build/vue-use-packages-plugin.js","build/webpack.config.build.js":"template/build/webpack.config.build.js","packages/index.js":"template/packages/index.js","vue-service/createPackage.js":"template/vue-service/createPackage.js","vue-service/index.js":"template/vue-service/index.js","vue-service/updateTemplate.js":"template/vue-service/updateTemplate.js",".github/workflows/deploy.yml":"template/.github/workflows/deploy.yml"};
const projectName ="z-ui";

const presetDir = "vue-cli-presets/vue2-component-repo-preset.git/generator";

const path = require("path");
const os = require("os");
const fs = require("fs");
const ejs = require("ejs");
const { warn } = require("@vue/cli-shared-utils/lib/logger");

const tplDir = path.resolve(os.tmpdir(), presetDir);

const remotePreset =
  "direct:https://github.com/Mrooze-zeng/vue2-component-repo-preset.git";

const loadRemotePreset = require("@vue/cli/lib/util/loadRemotePreset");

const replaceFile = function (tpls = {},  target = "") {
  for (const file in tpls) {
    if(file.startsWith(".")){
      continue
    }
    const buf = fs.readFileSync(path.resolve(target, tpls[file]));
    fs.writeFileSync(
      path.resolve(__dirname, "../", file),
      ejs.render(buf.toString(), { tpls ,projectName}),
    );

    warn(`替换 ${file}`);
  }
};

module.exports = {
  name: "updateTpl",
  options: {
    description: "更新当前模版",
    usage: "vue-cli-service updateTpl",
  },
  action: async function () {
    if (fs.lstatSync(tplDir)) {
      replaceFile(tpls, tplDir);
    } else {
      let presetDir;
      const { plugins } = await loadRemotePreset(remotePreset);
      for (const plugin in plugins) {
        if (
          plugin.includes("vue-cli-presets/vue2-component-repo-preset.git") &&
          plugins[plugin]._isPreset
        ) {
          presetDir = path.resolve(plugin, "generator");
        }
      }
      replaceFile(tpls, presetDir);
    }
  },
};
