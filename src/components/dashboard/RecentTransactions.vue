<template>
  <div
    class="d-flex align-items-center justify-content-center gap-3 px-4 py-3 w-100"
  >
    <span class="text-secondary">전월 대비</span>
    <span :class="incomeGap >= 0 ? 'text-primary' : 'text-danger'">
      {{ incomeGap >= 0 ? '▲' : '▼' }} 수입 {{ incomeGap >= 0 ? '+' : ''
      }}{{ incomeGap.toLocaleString() }}원
    </span>
    <span :class="expenseGap >= 0 ? 'text-danger' : 'text-success'">
      {{ expenseGap >= 0 ? '▲' : '▼' }} 지출 {{ expenseGap >= 0 ? '+' : ''
      }}{{ expenseGap.toLocaleString() }}원
    </span>
    <span :class="incomeGap - expenseGap >= 0 ? 'text-success' : 'text-danger'">
      {{ incomeGap - expenseGap >= 0 ? '▼' : '▲' }} 절약
      {{ (incomeGap - expenseGap).toLocaleString() }}원
    </span>
  </div>

  <div class="container-fluid py-3">
    <div class="row g-3 justify-content-center">
      <div class="col-6 col-lg-2">
        <div class="card text-center shadow-sm" style="border-radius: 20px">
          <div class="card-body py-4">
            <h6 class="card-title">이번달 수입</h6>
            <h5 class="text-primary mt-2">
              {{ monthlyIncome.toLocaleString() }}원
            </h5>
          </div>
        </div>
      </div>

      <div class="col-6 col-lg-2">
        <div class="card text-center shadow-sm" style="border-radius: 20px">
          <div class="card-body py-4">
            <h6 class="card-title">이번달 지출</h6>
            <h5 class="text-danger mt-2">
              {{ monthlyExpense.toLocaleString() }}원
            </h5>
          </div>
        </div>
      </div>

      <div class="col-6 col-lg-2">
        <div class="card text-center shadow-sm" style="border-radius: 20px">
          <div class="card-body py-4">
            <h6 class="card-title">잔액</h6>
            <h5 class="text-body-secondary mt-2">
              {{ balance.toLocaleString() }}원
            </h5>
          </div>
        </div>
      </div>

      <div class="col-6 col-lg-2">
        <div class="card text-center shadow-sm" style="border-radius: 20px">
          <div class="card-body py-4">
            <h6 class="card-title">금일 지출</h6>
            <h5 class="text-body-secondary mt-2">
              {{ todayExpense.toLocaleString() }}원
            </h5>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCounterStore } from '@/stores/transactions.js';
import { storeToRefs } from 'pinia';

const store = useCounterStore();
const {
  monthlyIncome,
  monthlyExpense,
  balance,
  todayExpense,
  incomeGap,
  expenseGap,
} = storeToRefs(store);
</script>
