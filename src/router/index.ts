import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import store from '../store';

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'Explore', component: () => import('../views/Explore.vue') },
  { 
    path: '/dashboard', 
    name: 'Dashboard', 
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  { 
    path: '/profile', 
    name: 'Profile', 
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  { 
    path: '/watch/:id', 
    name: 'Watch', 
    component: () => import('../views/WatchVideo.vue')
  },
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue') },
  { path: '/register', name: 'Register', component: () => import('../views/Register.vue') }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  if (to.meta.requiresAuth && !token) {
    next('/login');
  } else {
    next();
  }
});

export default router;