import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [{
    path: '/',
    name: 'home',
    component: () => import('../views/HomePage.vue')
},
]
const router = createRouter({
    history: createWebHashHistory(),
    routes: routes
})

export { router, routes }