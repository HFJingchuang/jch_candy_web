/*
 * @Description: 
 * @Author: zcZhang
 * @Date: 2020-10-28 09:53:49
 * @LastEditors: zcZhang
 * @LastEditTime: 2020-10-29 18:33:23
 */
import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        redirect: '/home'
    }, {
        path: '/home',
        name: 'Home',
        component: () => import('../page/Home'),
        meta: { title: '首页' }
    }, {
        path: '/sendCandy',
        name: 'SendCandy',
        component: () => import('../page/SendCandy'),
        meta: { title: '发红包' }
    }, {
        path: '/candyRecord',
        name: 'CandyRecord',
        component: () => import('../page/CandyRecord'),
        meta: { title: '红包记录' }
    }, {
        path: '/aboutUs',
        name: 'AboutUs',
        component: () => import('../page/AboutUs'),
        meta: { title: '关于我们' }
    }, {
        path: '/candyDetail',
        name: 'CandyDetail',
        component: () => import('../page/CandyDetail'),
        meta: { title: '红包详情' }
    }
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})

export default router
