<template>
  <div>
    <h1>거래 상세 페이지</h1>
    <p>거래 ID: {{ id }}</p>
  </div>
</template>

<script setup>
defineProps({
  id: String,
});
</script>
