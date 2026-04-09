<template>
  <div>
    <h1>리포트 페이지</h1>

    <p>선택한 월: {{ selectedMonth }}</p>
    <p>해당 월 거래 개수: {{ filteredTransactions.length }}</p>

    <hr />

    <p>총수입: {{ totalIncome.toLocaleString() }}원</p>
    <p>총지출: {{ totalExpense.toLocaleString() }}원</p>
    <p>순수익: {{ netIncome.toLocaleString() }}원</p>
    <p>저축률: {{ savingRate }}%</p>

    <hr />

    <h2>카테고리별 지출 차트</h2>
    <ReportCategoryChart :expenseByCategory="expenseByCategory" />

    <hr />

    <ul>
      <li v-for="item in filteredTransactions" :key="item.id">
        {{ item.date }} / {{ item.type }} / {{ item.category }} /
        {{ item.amount.toLocaleString() }}원
      </li>
    </ul>

    <hr />

    <h2>카테고리별 지출 합계</h2>
    <ul>
      <li v-for="item in expenseByCategory" :key="item.category">
        {{ item.category }} : {{ item.amount.toLocaleString() }}원
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import ReportCategoryChart from '@/components/report/ReportCategoryChart.vue';

const transactions = ref([]);
const selectedMonth = ref('2026-04');

const fetchTransactions = async () => {
  try {
    const response = await axios.get(
      'http://localhost:3000/transactions?userId=1',
    );
    transactions.value = response.data;
    console.log('거래 데이터:', response.data);
  } catch (error) {
    console.error('거래 데이터 불러오기 실패:', error);
  }
};

//선택된 달
const filteredTransactions = computed(() => {
  return transactions.value.filter((item) =>
    item.date.startsWith(selectedMonth.value),
  );
});

//총수입
const totalIncome = computed(() => {
  return filteredTransactions.value
    .filter((item) => item.type === 'income')
    .reduce((sum, item) => sum + item.amount, 0);
});

//총 지출
const totalExpense = computed(() => {
  return filteredTransactions.value
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0);
});

//순수익
const netIncome = computed(() => {
  return totalIncome.value - totalExpense.value;
});

//저축률
const savingRate = computed(() => {
  if (totalIncome.value === 0) return 0;
  return Math.round((netIncome.value / totalIncome.value) * 100);
});

//카테고리별 지출
const expenseByCategory = computed(() => {
  const result = {};

  filteredTransactions.value
    .filter((item) => item.type === 'expense')
    .forEach((item) => {
      if (!result[item.category]) {
        result[item.category] = 0;
      }
      result[item.category] += item.amount;
    });

  return Object.entries(result).map(([category, amount]) => ({
    category,
    amount,
  }));
});

onMounted(() => {
  fetchTransactions();
});
</script>
