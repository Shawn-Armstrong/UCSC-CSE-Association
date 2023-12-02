import { createRouter, createWebHistory } from 'vue-router';

function isLoggedIn() {
  return localStorage.getItem('token') !== null;
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
          enterClass: 'animate__animated animate__fadeIn',
          leaveClass: 'animate__animated animate__fadeOut',
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

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isLoggedIn()) {
      // Redirect to the login page if the user is not logged in
      next({ name: 'Login' });
    } else {
      next(); // Proceed if the user is logged in
    }
  } else {
    next(); // Proceed for routes that don't require authentication
  }
});

export default router;
