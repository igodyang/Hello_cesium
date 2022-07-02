import Vue from 'vue'
import Router from 'vue-router'
import viewer from '@/view/viewer'
import login from '@/view/login'
import openlayer from '@/view/openlayer'
import initview from "@/view/initView"
import initcesium from "@/components/initcesium"
import loadtile from "@/components/load3dtiles"

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: login
    },
    {
      path: '/viewer',
      name: 'viewer',
      component: viewer
    },
    {
      path: '/openlayer',
      name: 'openlayer',
      component: openlayer
    },
    {
      path: '/initView',
      name: 'initview',
      component: initview
    },
    {
      path: '/initcesium',
      name: 'initcesium',
      component: initcesium
    },
    {
      path: '/loadtiles',
      name: 'loadtiles',
      component: loadtile
    }
  ]
})
