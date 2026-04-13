import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import allowance from '@/assets/allowance.png';
import cost_of_living from '@/assets/cost_of_living.png';
import education from '@/assets/education.png';
import food from '@/assets/food.png';
import hospital from '@/assets/hospital.png';
import insurance from '@/assets/insurance.png';
import interest from '@/assets/interest.png';
import leisure from '@/assets/leisure.png';
import monthly_income from '@/assets/monthly_income.png';
import other_expense from '@/assets/other_expense.png';
import other_income from '@/assets/other_income.png';
import public_transport from '@/assets/public_transport.png';
import shopping from '@/assets/shopping.png';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useTransactionStore = defineStore('transactions', () => {
  const transactions = ref([]);
  const selectedDate = ref(null);

  const categoryImages = {
    용돈: allowance,
    월급: monthly_income,
    이자: interest,
    기타수입: other_income,
    식비: food,
    교통비: public_transport,
    '여가/문화': leisure,
    '주거/생활비': cost_of_living,
    쇼핑: shopping,
    의료: hospital,
    교육: education,
    보험: insurance,
    기타지출: other_expense,
  };

  function getCategoryIcon(category) {
    return categoryImages[category] || other_expense;
  }

  // ───────────────────────────────
  // 서버에서 데이터 불러오기
  // ───────────────────────────────

  async function fetchTransactions() {
    if (transactions.value.length > 0) return;
    const res = await axios.get(`${BASE_URL}/transactions`);
    transactions.value = res.data.filter(
      (item) => item.amount !== undefined && !isNaN(item.amount),
    );
  }

  async function addTransaction(newItem) {
    const res = await axios.post(`${BASE_URL}/transactions`, newItem);
    transactions.value.push(res.data);
  }

  async function modifyTransaction(updatedItem) {
    const index = transactions.value.findIndex(
      (item) => item.id === updatedItem.id
    );
    if (index !== -1) {
      transactions.value.splice(index, 1, updatedItem);
    }
  }

  // ───────────────────────────────
  // 계산된 값 (Computed)
  // ───────────────────────────────

  const monthlyIncome = computed(() => {
    const now = new Date();
    return transactions.value
      .filter((item) => {
        const d = new Date(item.date);
        return (
          item.type === 'income' &&
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth()
        );
      })
      .reduce((sum, item) => sum + item.amount, 0);
  });

  const monthlyExpense = computed(() => {
    const now = new Date();
    return transactions.value
      .filter((item) => {
        const d = new Date(item.date);
        return (
          item.type === 'expense' &&
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth()
        );
      })
      .reduce((sum, item) => sum + item.amount, 0);
  });

  const balance = computed(() => monthlyIncome.value - monthlyExpense.value);

  const todayExpense = computed(() => {
    const today = new Date().toISOString().slice(0, 10); // "2026-04-10" 형식
    return transactions.value
      .filter((item) => item.date === today && item.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0);
  });

  const lastMonthYear = computed(() => {
    const now = new Date();
    return now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  });

  const lastMonthMonth = computed(() => {
    const now = new Date();
    return now.getMonth() === 0 ? 12 : now.getMonth(); // getMonth()는 0부터 시작이라 그대로 쓰면 전달
  });

  const lastMonthIncome = computed(() => {
    return transactions.value
      .filter((item) => {
        const d = new Date(item.date);
        return (
          item.type === 'income' &&
          d.getFullYear() === lastMonthYear.value &&
          d.getMonth() + 1 === lastMonthMonth.value
        );
      })
      .reduce((sum, item) => sum + item.amount, 0);
  });

  const lastMonthExpense = computed(() => {
    return transactions.value
      .filter((item) => {
        const d = new Date(item.date);
        return (
          item.type === 'expense' &&
          d.getFullYear() === lastMonthYear.value &&
          d.getMonth() + 1 === lastMonthMonth.value
        );
      })
      .reduce((sum, item) => sum + item.amount, 0);
  });

  const incomeGap = computed(() => monthlyIncome.value - lastMonthIncome.value);
  const expenseGap = computed(
    () => monthlyExpense.value - lastMonthExpense.value
  );

  const recentTransactions = computed(() =>
    [...transactions.value].sort((a, b) => {
      const dateDiff = new Date(b.date) - new Date(a.date);
      if (dateDiff !== 0) return dateDiff;
      return new Date(b.createdAt) - new Date(a.createdAt);
    }),
  );

  const selectedDateTransactions = computed(() => {
    if (!selectedDate.value) return [];
    return transactions.value.filter(
      (item) => item.date === selectedDate.value,
    );
  });

  // ───────────────────────────────
  // 달력용 함수
  // ───────────────────────────────

  function getDayMap(year, month) {
    const map = {};
    for (const item of transactions.value) {
      const [y, m] = item.date.split('-').map(Number);
      if (y !== year || m !== month) continue;
      if (!map[item.date]) {
        map[item.date] = { income: 0, expense: 0 };
      }
      if (item.type === 'income') {
        map[item.date].income += item.amount;
      } else if (item.type === 'expense') {
        map[item.date].expense += item.amount;
      }
    }
    return map;
  }

  function selectDate(dateStr) {
    selectedDate.value = dateStr;
  }

  // ───────────────────────────────
  // 거래내역 페이지용 상태
  // ───────────────────────────────

  const filter = ref({
    type: 'all',
    categories: [],
    dateFrom: '',
    dateTo: '',
    amountMin: null,
    amountMax: null,
    sort: 'latest',
  });

  const searchQuery = ref('');

  // ───────────────────────────────
  // 거래내역 페이지용 계산된 값
  // ───────────────────────────────

  const filteredTransactions = computed(() => {
    let list = [...transactions.value];

    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.category.toLowerCase().includes(q) ||
          (t.memo && t.memo.toLowerCase().includes(q)),
      );
    }

    if (filter.value.type !== 'all') {
      list = list.filter((t) => t.type === filter.value.type);
    }

    if (filter.value.categories.length > 0) {
      list = list.filter((t) => filter.value.categories.includes(t.category));
    }

    if (filter.value.dateFrom) {
      list = list.filter((t) => t.date >= filter.value.dateFrom);
    }
    if (filter.value.dateTo) {
      list = list.filter((t) => t.date <= filter.value.dateTo);
    }

    if (filter.value.amountMin != null && filter.value.amountMin !== '') {
      list = list.filter((t) => t.amount >= filter.value.amountMin);
    }
    if (filter.value.amountMax != null && filter.value.amountMax !== '') {
      list = list.filter((t) => t.amount <= filter.value.amountMax);
    }

    // 정렬
    switch (filter.value.sort) {
      case 'oldest':
        list.sort((a, b) => {
          const dateDiff = new Date(a.date) - new Date(b.date);
          if (dateDiff !== 0) return dateDiff;
          return new Date(a.createdAt) - new Date(b.createdAt);
        });
        break;
      case 'amount_desc':
        list.sort((a, b) => b.amount - a.amount);
        break;
      case 'amount_asc':
        list.sort((a, b) => a.amount - b.amount);
        break;
      case 'latest':
      default:
        list.sort((a, b) => {
          const dateDiff = new Date(b.date) - new Date(a.date);
          if (dateDiff !== 0) return dateDiff;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        break;
    }

    return list;
  });

  // ───────────────────────────────
  // 거래내역 페이지용 함수
  // ───────────────────────────────

  async function deleteTransactions(ids) {
    await Promise.all(
      ids.map((id) => axios.delete(`${BASE_URL}/transactions/${id}`)),
    );
    transactions.value = transactions.value.filter((t) => !ids.includes(t.id));
  }

  function applyFilter(filterData) {
    Object.assign(filter.value, filterData);
  }

  function resetFilter() {
    filter.value = {
      type: 'all',
      categories: [],
      dateFrom: '',
      dateTo: '',
      amountMin: null,
      amountMax: null,
      sort: 'latest',
    };
    searchQuery.value = '';
  }

  return {
    transactions,
    selectedDate,
    filter,
    searchQuery,
    fetchTransactions,
    addTransaction,
    deleteTransactions,
    getDayMap,
    selectDate,
    getCategoryIcon,
    modifyTransaction,
    applyFilter,
    resetFilter,
    filteredTransactions,
    monthlyIncome,
    monthlyExpense,
    balance,
    todayExpense,
    recentTransactions,
    selectedDateTransactions,
    incomeGap,
    expenseGap,
  };
});
