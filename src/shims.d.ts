import Vue from 'vue' // 需要在 declare 外引入
declare module 'vue/types/vue' {
    interface Vue {
        $axios: any
    }
}
