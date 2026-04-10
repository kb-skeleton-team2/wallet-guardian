<template>
  <div class="container py-3 py-md-4 report-page">
    <div class="row g-3 mb-4 summary-row">
      <div class="col-6 col-md-3">
        <div class="card h-100 text-center shadow-sm summary-card">
          <div class="card-body">
            <h6 class="text-muted summary-label">총 수입</h6>
            <h3 class="text-success summary-amount">
              {{ totalIncome.toLocaleString() }}원
            </h3>
          </div>
        </div>
      </div>

      <div class="col-6 col-md-3">
        <div class="card h-100 text-center shadow-sm summary-card">
          <div class="card-body">
            <h6 class="text-muted summary-label">총 지출</h6>
            <h3 class="text-danger summary-amount">
              {{ totalExpense.toLocaleString() }}원
            </h3>
          </div>
        </div>
      </div>

      <div class="col-6 col-md-3">
        <div class="card h-100 text-center shadow-sm summary-card">
          <div class="card-body">
            <h6 class="text-muted summary-label">순수익</h6>
            <h3 class="text-primary summary-amount">
              {{ netIncome.toLocaleString() }}원
            </h3>
          </div>
        </div>
      </div>

      <div class="col-6 col-md-3">
        <div class="card h-100 text-center shadow-sm summary-card">
          <div class="card-body">
            <h6 class="text-muted summary-label">저축률</h6>
            <h3 class="text-primary summary-amount">{{ savingRate }}%</h3>
          </div>
        </div>
      </div>
    </div>

    <div class="card shadow-sm mb-4 section-card">
      <div class="card-body">
        <div
          class="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-2 gap-md-3 mb-3"
        >
          <h5 class="mb-0 section-title">카테고리별 지출 내역</h5>
          <select class="form-select month-select" v-model="selectedMonth">
            <option
              v-for="month in availableMonths"
              :key="month"
              :value="month"
            >
              {{ month }}
            </option>
          </select>
        </div>

        <div class="d-flex justify-content-center chart-wrapper">
          <div class="chart-box">
            <ReportCategoryChart
              :expenseByCategory="expenseByCategory"
              @select-category="handleSelectCategory"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="card shadow-sm section-card">
      <div class="card-body">
        <div
          class="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-2 gap-md-3 mb-3"
        >
          <h5 class="mb-0 section-title">거래내역</h5>

          <select
            class="form-select category-select"
            v-model="selectedCategory"
          >
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
            class="list-group-item transaction-item"
          >
            <div class="transaction-info">
              <div class="fw-semibold transaction-memo">{{ item.memo }}</div>
              <div class="text-muted small transaction-meta">
                {{ item.date }} · {{ item.category }}
              </div>
            </div>
            <div
              :class="
                item.type === 'expense'
                  ? 'text-danger fw-bold  transaction-amount'
                  : 'text-primary fw-bold transaction-amount'
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
import { ref, computed, onMounted, watch } from 'vue';
import axios from 'axios';
import ReportCategoryChart from '@/components/report/ReportCategoryChart.vue';
import { useTransactionStore } from '@/stores/transactions';

const transactionStore = useTransactionStore();
const selectedCategory = ref('');
const selectedMonth = ref('');

const transactions = computed(() => transactionStore.transactions);

const getCurrentMonth = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

//선택된 달
const filteredTransactions = computed(() => {
  return transactions.value.filter((item) =>
    item.date.startsWith(selectedMonth.value)
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
    (item) => item.type === 'expense'
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

watch(selectedMonth, () => {
  selectedCategory.value = '';
});

onMounted(async () => {
  await transactionStore.fetchTransactions();

  if (availableMonths.value.length > 0 && !selectedMonth.value) {
    selectedMonth.value = availableMonths.value[0];
  }
});
</script>

<style scoped>
.report-page {
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

.summary-card,
.section-card {
  border-radius: 1rem;
}

.summary-label {
  font-size: 0.9rem;
}

.summary-amount {
  font-size: 1.2rem;
  margin-bottom: 0;
  word-break: keep-all;
}

.section-title {
  font-size: 1.05rem;
}

.month-select,
.category-select {
  width: 100%;
  min-width: 0;
}

.chart-wrapper {
  width: 100%;
}

.chart-box {
  width: 100%;
  max-width: 700px;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.transaction-info {
  min-width: 0;
  flex: 1;
}

.transaction-memo,
.transaction-meta,
.transaction-amount {
  word-break: break-word;
}

.transaction-amount {
  flex-shrink: 0;
  text-align: right;
}

@media (max-width: 767.98px) {
  .report-page {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }

  .summary-row {
    margin-bottom: 1rem;
  }

  .summary-card .card-body,
  .section-card .card-body {
    padding: 1rem;
  }

  .summary-label {
    font-size: 0.8rem;
  }

  .summary-amount {
    font-size: 1rem;
  }

  .section-title {
    font-size: 1rem;
  }

  .transaction-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .transaction-amount {
    width: 100%;
    text-align: left;
    font-size: 0.95rem;
  }
}

@media (min-width: 768px) {
  .month-select,
  .category-select {
    width: auto;
    min-width: 160px;
  }
}
</style>
