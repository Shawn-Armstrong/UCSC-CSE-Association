import { createRouter, createWebHistory } from 'vue-router';

import axios from 'axios';
axios.defaults.withCredentials = true;

// Function to check if the user is logged in
async function isLoggedIn() {
    try {
        const response = await axios.get('http://localhost:5000/validate-session');
        return response.data.isAuthenticated;
    } catch (error) {
        return false;
    }
}

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        meta: {
          enterClass: 'animate__animated animate__fadeIn',
          leaveClass: 'animate__animated animate__fadeOut',
        },
        component: () => import('@/views/Home.vue'),
      },
      {
        path: 'profile',
        name: 'Profile',
        meta: {
          requiresAuth: true,
          enterClass: 'animate__animated animate__fadeIn',
          leaveClass: 'animate__animated animate__fadeOut',
        },
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
        meta: {
          enterClass: 'animate__animated animate__fadeInLeft',
          leaveClass: 'animate__animated animate__fadeOut',
        },
        component: () => import('@/views/Login.vue'),
      },
      {
        path: '/register',
        name: 'Register',
        meta: {
          enterClass: 'animate__animated animate__fadeInRight',
          leaveClass: 'animate__animated animate__fadeOut',
        },
        component: () => import('@/views/Register.vue'),
      },
      {
        path: '/password-reset',
        name: 'PasswordReset',
        meta: {
          enterClass: 'animate__animated animate__fadeInDownBig',
          leaveClass: 'animate__animated animate__fadeOutDownBig',
        },
        component: () => import('@/views/PasswordReset.vue'),
      },
      {
        path: '/password-reset-form',
        name: 'PasswordResetForm',
        meta: {
          enterClass: 'animate__animated animate__fadeIn',
          leaveClass: 'animate__animated animate__fadeOut',
        },
        component: () => import('@/views/PasswordResetForm.vue'),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  if (requiresAuth && !(await isLoggedIn())) {
      next({ name: 'Login' });
  } else {
      next();
  }
});

export default router;
