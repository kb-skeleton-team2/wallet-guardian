<template>
  <RecentTransactions></RecentTransactions>
  <div
    style="
      display: flex;
      justify-content: space-around;
      width: 86vw;
      margin: 0 auto;
    "
  >
    <Calendar></Calendar>
    <RecentSpendingHistory></RecentSpendingHistory>
  </div>
  <img
    class="floating-btn"
    :src="plusModal"
    alt=""
    style="
      width: 50px;
      height: 50px;
      position: absolute;
      bottom: 35px;
      right: 59px;
      border-radius: 50%;
      overflow: hidden;
      transition: all 0.15s ease;
    "
  />
</template>
<style>
.floating-btn:hover {
  cursor: pointer;
  transform: scale(1.1);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.1);
}
.floating-btn:active {
  transform: scale(0.9);
  transition: transform 0.03s;
}
</style>
<script setup>
import { onMounted } from 'vue';
import { useCounterStore } from '@/stores/transactions.js';
import plusModal from '@/assets/addModal.png';
import RecentTransactions from '@/components/dashboard/RecentTransactions.vue';
import Calendar from '@/components/dashboard/Calendar.vue';
import RecentSpendingHistory from '@/components/dashboard/RecentSpendingHistory.vue';

const store = useCounterStore();
onMounted(() => {
  store.fetchTransactions();
});
</script>
