<!-- src/components/common/Header.vue -->
<template>
  <header class="border-bottom bg-white app-header">
    <div class="header-inner px-3">
      <!-- 로고 -->
      <div class="me-auto">
        <RouterLink to="/dashboard" @click="closeMenu">
          <img src="@/assets/logo.png" alt="로고" class="logo-image" />
        </RouterLink>
      </div>

      <!-- 데스크탑 네비게이션 -->
      <nav class="desktop-nav align-items-center gap-3">
        <RouterLink to="/dashboard" class="nav-link px-3">대시보드</RouterLink>
        <RouterLink to="/transactions" class="nav-link px-3">거래</RouterLink>
        <RouterLink to="/report" class="nav-link px-3">리포트</RouterLink>
        <RouterLink to="/mypage/:id" class="nav-link px-3"
          >마이페이지</RouterLink
        >
      </nav>

      <!-- 데스크탑 프로필 -->
      <div class="desktop-profile align-items-center gap-2 ms-3">
        <RouterLink to="/mypage/:id" class="text-decoration-none username">
          {{ username }}
        </RouterLink>

        <RouterLink to="/mypage/:id">
          <img
            src="@/assets/profile.png"
            alt="프로필"
            class="rounded-circle profile-image"
          />
        </RouterLink>
      </div>

      <!-- 모바일 햄버거 버튼 -->
      <button
        type="button"
        class="menu-toggle"
        :class="{ open: menuOpen }"
        @click="toggleMenu"
        :aria-label="menuOpen ? '메뉴 닫기' : '메뉴 열기'"
        :aria-expanded="menuOpen"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>

    <!-- 모바일 메뉴 오버레이 -->
    <transition name="mobile-menu">
      <div v-if="menuOpen" class="mobile-menu-layer">
        <button
          type="button"
          class="mobile-menu-backdrop"
          aria-label="메뉴 닫기"
          @click="closeMenu"
        ></button>

        <div class="mobile-menu border-top">
          <nav class="mobile-nav">
            <RouterLink
              to="/dashboard"
              class="mobile-nav-link"
              @click="closeMenu"
              >대시보드</RouterLink
            >
            <RouterLink
              to="/transactions"
              class="mobile-nav-link"
              @click="closeMenu"
              >거래</RouterLink
            >
            <RouterLink to="/report" class="mobile-nav-link" @click="closeMenu"
              >리포트</RouterLink
            >
            <RouterLink
              to="/mypage/:id"
              class="mobile-nav-link"
              @click="closeMenu"
              >마이페이지</RouterLink
            >
          </nav>
        </div>
      </div>
    </transition>
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { RouterLink } from 'vue-router';

const username = ref('');
const menuOpen = ref(false);

const closeMenu = () => {
  menuOpen.value = false;
};

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

const handleResize = () => {
  if (window.innerWidth >= 768) {
    closeMenu();
  }
};

const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    closeMenu();
  }
};

watch(menuOpen, (isOpen) => {
  if (window.innerWidth < 768) {
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }
});

onMounted(async () => {
  window.addEventListener('resize', handleResize);
  window.addEventListener('keydown', handleKeydown);

  try {
    const res = await fetch('http://localhost:3000/users/1');
    const user = await res.json();
    username.value = user.name;
  } catch (error) {
    username.value = '사용자';
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
});
</script>

<style scoped>
.app-header {
  position: relative;
  z-index: 100;
}

.header-inner {
  height: 60px;
  display: flex;
  align-items: center;
}

.logo-image {
  width: 44px;
  height: 44px;
  object-fit: contain;
}

.profile-image {
  width: 50px;
  height: 50px;
  object-fit: contain;
}

.desktop-nav,
.desktop-profile {
  display: flex;
}

.nav-link {
  font-size: 14px;
  color: #374151;
  border-radius: 6px;
  transition: all 0.2s ease;
}

nav .nav-link:hover,
.mobile-nav-link:hover {
  color: #ffbc39;
}

nav .nav-link.router-link-active,
.mobile-nav-link.router-link-active {
  color: #ffbc39;
  font-weight: 600;
}

.desktop-nav .nav-link.router-link-active {
  box-shadow: 0 3px 0 #ffbc39;
  border-radius: 0;
  padding-top: 10px;
  padding-bottom: 20px;
}

.username {
  font-size: 14px;
  color: #838c9a;
}

.menu-toggle {
  display: none;
  width: 40px;
  height: 40px;
  margin-left: 12px;
  padding: 0;
  border: none;
  background: transparent;
  position: relative;
  z-index: 120;
}

.menu-toggle span {
  position: absolute;
  left: 8px;
  width: 24px;
  height: 2px;
  background-color: #374151;
  border-radius: 999px;
  transition: all 0.25s ease;
}

.menu-toggle span:nth-child(1) {
  top: 11px;
}

.menu-toggle span:nth-child(2) {
  top: 19px;
}

.menu-toggle span:nth-child(3) {
  top: 27px;
}

.menu-toggle.open span:nth-child(1) {
  top: 19px;
  transform: rotate(45deg);
}

.menu-toggle.open span:nth-child(2) {
  opacity: 0;
}

.menu-toggle.open span:nth-child(3) {
  top: 19px;
  transform: rotate(-45deg);
}

.mobile-menu-layer {
  display: none;
}

.mobile-menu-backdrop {
  display: none;
}

.mobile-menu {
  display: none;
  background: #fff;
  padding: 8px 20px 20px;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.1);
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mobile-nav-link {
  color: #374151;
  text-decoration: none;
  font-size: 15px;
  padding: 14px 4px;
  border-bottom: 1px solid #f1f5f9;
  transition: color 0.2s ease;
}

.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 767.98px) {
  .header-inner {
    padding-top: 4px;
    padding-bottom: 4px;
  }

  .desktop-nav,
  .desktop-profile {
    display: none;
  }

  .menu-toggle {
    display: block;
  }

  .mobile-menu-layer {
    display: block;
  }

  .mobile-menu-backdrop {
    display: block;
    position: fixed;
    inset: 60px 0 0 0;
    width: 100%;
    border: none;
    background: rgba(15, 23, 42, 0.16);
    padding: 0;
    z-index: 105;
  }

  .mobile-menu {
    display: block;
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    z-index: 110;
  }
}
</style>
