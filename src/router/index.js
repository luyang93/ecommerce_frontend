import {createRouter, createWebHistory} from 'vue-router'
import Home from '../views/Home.vue'

import Product from "../views/Product";
import Category from "../views/Category";
import Search from "../views/Search";
import Cart from "../views/Cart";
import SignUp from "../views/SignUp";
import LogIn from "../views/LogIn";

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/about',
        name: 'About',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
    },
    {
        path: '/sign-up',
        name: 'SignUp',
        component: SignUp
    },
    {
        path: '/log-in',
        name: 'LogIn',
        component: LogIn
    },
    {
        path: '/search',
        name: 'Search',
        component: Search
    },
    {
        path: '/cart',
        name: 'Cart',
        component: Cart
    },
    {
        path: '/:category_slug/:product_slug/',
        name: 'Product',
        component: Product
    },
    {
        path: '/:category_slug/',
        name: 'Category',
        component: Category
    }
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

export default router
