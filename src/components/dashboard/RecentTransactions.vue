<template>
  <div style="height: 23vh; width: 99vw">
    <div class="d-flex justify-content-center gap-5">
      <!-- 이번달 수입 -->
      <div
        class="card"
        style="width: 18rem; height: 10rem; border-radius: 20px"
      >
        <div class="card-body text-center">
          <h5 class="card-title">이번달 수입</h5>
          <h3 class="card-subtitle text-primary mt-3">
            {{ monthlyIncome.toLocaleString() }}원
          </h3>
        </div>
      </div>

      <!-- 이번달 지출 -->
      <div class="card" style="width: 18rem; border-radius: 20px">
        <div class="card-body text-center">
          <h5 class="card-title">이번달 지출</h5>
          <h3 class="card-subtitle mt-3 text-danger">
            {{ monthlyExpense.toLocaleString() }}원
          </h3>
        </div>
      </div>

      <!-- 잔액 -->
      <div class="card" style="width: 18rem; border-radius: 20px">
        <div class="card-body text-center">
          <h5 class="card-title">잔액</h5>
          <h3 class="card-subtitle mt-3 text-body-secondary">
            {{ balance.toLocaleString() }}원
          </h3>
        </div>
      </div>

      <!-- 오늘 지출 -->
      <div class="card" style="width: 18rem; border-radius: 20px">
        <div class="card-body text-center">
          <h5 class="card-title">금일 지출</h5>
          <h3 class="card-subtitle mt-3 text-body-secondary">
            {{ todayExpense.toLocaleString() }}원
          </h3>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCounterStore } from '@/stores/transactions.js';
import { storeToRefs } from 'pinia';

const store = useCounterStore();
const { monthlyIncome, monthlyExpense, balance, todayExpense } =
  storeToRefs(store);
</script>
