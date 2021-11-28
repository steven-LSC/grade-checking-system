import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    component: () => import('../views/Home.vue'),
  },
  {
    path: '/in-group',
    component: () => import('../views/InGroup/Index.vue'),
  },
  {
    path: '/between-groups',
    component: () => import('../views/BetweenGroups/Index.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
