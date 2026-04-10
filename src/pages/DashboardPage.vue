<template>
  <RecentTransactions></RecentTransactions>

  <div class="container" style="max-width: 1000px">
    <div class="row g-3">
      <div class="col-12 col-lg-6">
        <Calendar></Calendar>
      </div>
      <div class="col-12 col-lg-6">
        <RecentSpendingHistory></RecentSpendingHistory>
      </div>
    </div>
  </div>

  <img
    class="floating-btn"
    :src="plusModal"
    alt=""
    style="
      width: 50px;
      height: 50px;
      position: fixed;
      bottom: 35px;
      right: 59px;
      border-radius: 50%;
      overflow: hidden;
      transition: all 0.15s ease;
    "
    @click="isModalOpen = true"
  />
  <AddTransactionModal
    :isOpen="isModalOpen"
    @close="isModalOpen = false"
    @saved="() => {}"
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
import AddTransactionModal from '@/components/common/AddTransactionModal.vue';
import { onMounted, ref } from 'vue';
import { useTransactionStore } from '@/stores/transactions.js';
import plusModal from '@/assets/addModal.png';
import RecentTransactions from '@/components/dashboard/RecentTransactions.vue';
import Calendar from '@/components/dashboard/Calendar.vue';
import RecentSpendingHistory from '@/components/dashboard/RecentSpendingHistory.vue';
const isModalOpen = ref(false);

const store = useTransactionStore();
onMounted(() => {
  store.fetchTransactions();
});
</script>
