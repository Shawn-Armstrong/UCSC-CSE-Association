// Composables
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
      },
      // Add the profile route as a child route
      {
        path: 'profile',
        name: 'Profile',
        // Make sure to create a Profile.vue file in the '@/views' directory
        component: () => import('@/views/Profile.vue'),
      },
      {
        path: '/verify-email',
        name: 'EmailVerification',
        component: () => import('@/views/EmailVerification.vue'),
      },
      {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/Login.vue'),
      },
      {
        path: '/register',
        name: 'Register',
        component: () => import('@/views/Register.vue'),
      },
      // ... you can add more child routes here
    ],
  },
  // ... potentially other routes outside of the default layout
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
