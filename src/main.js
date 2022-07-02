// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
// import store from './store'
import * as Cesium from '../node_modules/cesium/Build/cesium/Cesium.js'
import * as widgets from '../node_modules/cesium/Source/Widgets/widgets.css'
import CesiumNavigation from 'cesium-navigation-es6/dist/CesiumNavigation'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// 导入图标包
import '@/icons'
import VueAxios from 'vue-axios'

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./assets/css/overMap.css"

Vue.prototype.L = L
Vue.use(ElementUI) //使用elementUI

Vue.prototype.widgets = widgets
Vue.config.productionTip = false
Vue.prototype.Cesium = Cesium
Vue.prototype.CesiumNavigation = CesiumNavigation

//
new Vue({
  el: '#app',
  router,
  //store,
  components: { App },
  render: h => h(App),
  template: '<App/>'
})
