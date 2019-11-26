import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Contract from '../views/Contract.vue'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'home',
        component: Home
    }, {
        path: '/contract/:id',
        name: 'contract',
        component: Contract,
        props: true
    }
]

const router = new VueRouter({
    routes
})

export default router
