import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/all-users',
      name: 'all-users',
      component: () => import('../views/AllUsers.vue'),
    },
    {
      path: '/create-user',
      name: 'UserCreate',
      component: () => import('../views/UserCreateView.vue'),
    },
  ],
})

export default router
