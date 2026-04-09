<template>
  <div style="height: 91vh; width: 99vw">
    <div class="d-flex justify-content-center gap-5">
      <!-- 이번달 수입 -->
      <div
        class="card"
        style="width: 18rem; height: 10rem; border-radius: 20px"
      >
        <div class="card-body text-center">
          <h5 class="card-title">이번달 수입</h5>
          <h3 class="card-subtitle text-primary mt-3">
            {{ income.toLocaleString() }}원
          </h3>
        </div>
      </div>

      <!-- 이번달 지출 -->
      <div class="card" style="width: 18rem; border-radius: 20px">
        <div class="card-body text-center">
          <h5 class="card-title">이번달 지출</h5>
          <h3 class="card-subtitle mt-3 text-danger">
            {{ expense.toLocaleString() }}원
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
import axios from 'axios';
import { ref, onMounted } from 'vue';

const income = ref(0);
const expense = ref(0);
const todayExpense = ref(0);
const balance = ref(0);

onMounted(() => {
  axios.get('http://localhost:3000/transactions').then((res) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const today = now.toISOString().slice(0, 10);
    const data = res.data;

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const d = new Date(item.date);

      // 이번달
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        if (item.type === 'income') {
          income.value += item.amount;
        } else if (item.type === 'expense') {
          expense.value += item.amount;
        }
      }

      // 오늘 지출
      if (item.date === today && item.type === 'expense') {
        todayExpense.value += item.amount;
      }
    }

    // 잔액
    balance.value = income.value - expense.value;
  });
});
</script>
