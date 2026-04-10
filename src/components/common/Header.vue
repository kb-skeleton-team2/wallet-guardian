vue<!-- src/components/common/Header.vue -->
<template>
  <header class="border-bottom bg-white">
    <div
      class="d-flex align-items-center px-3"
      style="height: 60px"
    >
      <!-- 로고 -->
      <div class="me-auto">
        <RouterLink to="/dashboard">
          <img
            src="@/assets/logo.png"
            alt="로고"
            style="width: 44px; height: 44px; object-fit: contain"
          />
        </RouterLink>
      </div>

      <!-- 네비게이션 -->
      <nav class="d-flex align-items-center gap-3">
        <RouterLink
          to="/dashboard"
          class="nav-link px-3"
          >대시보드</RouterLink
        >
        <RouterLink
          to="/transactions"
          class="nav-link px-3"
          >거래</RouterLink
        >
        <RouterLink
          to="/report"
          class="nav-link px-3"
          >리포트</RouterLink
        >
        <RouterLink
          to="/mypage/:id"
          class="nav-link px-3"
          >마이페이지</RouterLink
        >
      </nav>

      <!-- 프로필 -->
      <div class="d-flex align-items-center gap-2 ms-3">
        <RouterLink
          to="/mypage/:id"
          class="text-decoration-none username"
        >
          {{ userStore.user.name }}
        </RouterLink>
        <RouterLink to="/mypage/:id">
          <img
            :src="userStore.user.avatarUrl"
            alt="프로필"
            class="rounded-circle"
            style="width: 50px; height: 50px; object-fit: cover"
          />
        </RouterLink>
      </div>
    </div>
  </header>
</template>

<script setup>
import { RouterLink } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { onMounted } from 'vue';

const userStore = useUserStore();

onMounted(() => {
  userStore.fetchUser();
});
</script>
<style scoped>
.nav-link {
  font-size: 14px;
  color: #374151;
  border-radius: 6px;
  transition: all 0.2s ease;
}

nav .nav-link:hover {
  color: #ffbc39;
}
nav .nav-link.router-link-active {
  color: #ffbc39;
  font-weight: 600;
  box-shadow: 0 3px 0 #ffbc39;
  border-radius: 0;

  padding-top: 10px;
  padding-bottom: 20px;
}
.username {
  font-size: 14px;
  color: #838c9a;
}
</style>
