import { createRouter, createWebHistory } from 'vue-router';
import DashboardPage from '../pages/DashboardPage.vue';
import ReportPage from '../pages/ReportPage.vue';
import TransactionsPage from '../pages/TransactionsPage.vue';
import MyPage from '@/pages/MyPage.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: DashboardPage,
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardPage,
  },
  {
    path: '/report',
    name: 'report',
    component: ReportPage,
  },
  {
    path: '/transactions',
    name: 'transactions',
    component: TransactionsPage,
  },
  {
    path: '/mypage/:id',
    name: 'mypage',
    component: MyPage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
