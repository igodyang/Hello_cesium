//引入Vue核心库
import Vue from 'vue'
//引入Vuex
import Vuex from 'vuex'
//使用vuex
Vue.use(Vuex)

const actions = {
    //响应式组件中加的动作
    add(context, value) {
        context.commit('ADD', value)
    }
}

const mutations = {
    //执行加法
    ADD(state, value) {
        state.sum += value
    }
}

//初始化数据
const state = {
    sum: 0
}

//创建并暴露store
export default new Vuex.Store({
    actions,
    mutations,
    state
})
