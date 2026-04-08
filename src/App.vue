<template>
  <div>
    <nav
      style="
        display: flex;
        gap: 20px;
        padding: 20px;
        border-bottom: 1px solid #ccc;
      "
    >
      <router-link to="/dashboard">대시보드</router-link>
      <router-link to="/transactions">거래</router-link>
      <router-link to="/report">리포트</router-link>
      <router-link to="/report">마이페이지</router-link>
    </nav>

    <router-view />
  </div>
</template>

<script setup></script>
