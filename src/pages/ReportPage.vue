<template>
  <div class="container py-4">
    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card h-100 text-center shadow-sm">
          <div class="card-body">
            <h6 class="text-muted">총 수입</h6>
            <h3>{{ totalIncome.toLocaleString() }}원</h3>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card h-100 text-center shadow-sm">
          <div class="card-body">
            <h6 class="text-muted">총 지출</h6>
            <h3 class="text-danger">{{ totalExpense.toLocaleString() }}원</h3>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card h-100 text-center shadow-sm">
          <div class="card-body">
            <h6 class="text-muted">순수익</h6>
            <h3>{{ netIncome.toLocaleString() }}원</h3>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card h-100 text-center shadow-sm">
          <div class="card-body">
            <h6 class="text-muted">저축률</h6>
            <h3 class="text-success">{{ savingRate }}%</h3>
          </div>
        </div>
      </div>
    </div>

    <div class="card shadow-sm mb-4">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0">카테고리별 지출 내역</h5>
          <select class="form-select w-auto" v-model="selectedMonth">
            <option
              v-for="month in availableMonths"
              :key="month"
              :value="month"
            >
              {{ month }}
            </option>
          </select>
        </div>

        <div class="d-flex justify-content-center">
          <div style="max-width: 700px; width: 100%">
            <ReportCategoryChart
              :expenseByCategory="expenseByCategory"
              @select-category="handleSelectCategory"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="card shadow-sm">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0">거래내역</h5>

          <select class="form-select w-auto" v-model="selectedCategory">
            <option value="">전체</option>
            <option
              v-for="category in availableCategories"
              :key="category"
              :value="category"
            >
              {{ category }}
            </option>
          </select>
        </div>

        <ul class="list-group list-group-flush">
          <li
            v-for="item in displayedTransactions"
            :key="item.id"
            class="list-group-item d-flex justify-content-between align-items-center"
          >
            <div>
              <div class="fw-semibold">{{ item.memo }}</div>
              <div class="text-muted small">
                {{ item.date }} · {{ item.category }}
              </div>
            </div>
            <div
              :class="
                item.type === 'expense'
                  ? 'text-danger fw-bold'
                  : 'text-primary fw-bold'
              "
            >
              {{ item.type === 'expense' ? '-' : '+'
              }}{{ item.amount.toLocaleString() }}원
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import ReportCategoryChart from '@/components/report/ReportCategoryChart.vue';

const transactions = ref([]);
const selectedCategory = ref('');
const selectedMonth = ref('');

const fetchTransactions = async () => {
  try {
    const response = await axios.get(
      'http://localhost:3000/transactions?userId=1',
    );
    console.log('report fetch 결과:', response.data);
    transactions.value = response.data;

    if (availableMonths.value.length > 0) {
      selectedMonth.value = availableMonths.value[0];
    }
  } catch (error) {
    console.error('거래 데이터 불러오기 실패:', error);
  }
};

const getCurrentMonth = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
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

const availableCategories = computed(() => {
  const categories = filteredTransactions.value
    .filter((item) => item.type === 'expense')
    .map((item) => item.category);

  return [...new Set(categories)];
});

//하단 카테고리별 거래내역
const displayedTransactions = computed(() => {
  let result = filteredTransactions.value.filter(
    (item) => item.type === 'expense',
  );

  if (selectedCategory.value) {
    result = result.filter((item) => item.category === selectedCategory.value);
  }

  return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
});

//차트 조각 클릭 이벤트
const handleSelectCategory = (category) => {
  selectedCategory.value = category;
};

//월 목록 뽑기
const availableMonths = computed(() => {
  const months = transactions.value.map((item) => item.date.slice(0, 7));
  return [...new Set(months)].sort().reverse();
});

onMounted(() => {
  fetchTransactions();
});
</script>
