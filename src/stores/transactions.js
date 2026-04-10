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

const BASE_URL = 'http://localhost:3000';

export const useTransactionStore = defineStore('transactions', () => {
  // 서버에서 받아온 전체 거래내역
  const transactions = ref([]);

  // 달력에서 클릭한 날짜 (예: "2026-04-10")
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
    // 이미 데이터가 있으면 다시 불러오지 않음
    if (transactions.value.length > 0) return;

    const res = await axios.get(`${BASE_URL}/transactions`);

    // amount가 숫자인 데이터만 저장 (이상한 데이터 방어)
    transactions.value = res.data.filter(
      (item) => item.amount !== undefined && !isNaN(item.amount)
    );
  }

  async function addTransaction(newItem) {
    // 1. 서버에 저장
    const res = await axios.post(`${BASE_URL}/transactions`, newItem);

    // 2. pinia에도 직접 추가 (서버 재요청 없이)
    transactions.value.push(res.data);
  }

  // ───────────────────────────────
  // 계산된 값 (Computed)
  // ───────────────────────────────

  // 이번달 수입 합계
  const monthlyIncome = computed(() => {
    const now = new Date();

    return transactions.value
      .filter((item) => {
        const d = new Date(item.date);
        const isSameYear = d.getFullYear() === now.getFullYear();
        const isSameMonth = d.getMonth() === now.getMonth();
        return item.type === 'income' && isSameYear && isSameMonth;
      })
      .reduce((sum, item) => sum + item.amount, 0);
  });

  // 이번달 지출 합계
  const monthlyExpense = computed(() => {
    const now = new Date();

    return transactions.value
      .filter((item) => {
        const d = new Date(item.date);
        const isSameYear = d.getFullYear() === now.getFullYear();
        const isSameMonth = d.getMonth() === now.getMonth();
        return item.type === 'expense' && isSameYear && isSameMonth;
      })
      .reduce((sum, item) => sum + item.amount, 0);
  });

  // 잔액 = 이번달 수입 - 이번달 지출
  const balance = computed(() => monthlyIncome.value - monthlyExpense.value);

  // 오늘 지출 합계
  const todayExpense = computed(() => {
    const today = new Date().toISOString().slice(0, 10); // "2026-04-10" 형식

    return transactions.value
      .filter((item) => item.date === today && item.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0);
  });

  // 최근 거래내역 (id 높은 순 = 최신순)
  const recentTransactions = computed(() =>
    [...transactions.value].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )
  );

  // 달력에서 선택한 날짜의 거래내역
  const selectedDateTransactions = computed(() => {
    if (!selectedDate.value) return [];

    return transactions.value.filter(
      (item) => item.date === selectedDate.value
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

  // 달력에서 날짜 클릭 시 호출
  function selectDate(dateStr) {
    selectedDate.value = dateStr;
  }

  // ───────────────────────────────
  // 거래내역 페이지용 상태
  // ───────────────────────────────

  // 필터
  const filter = ref({
    type: 'all',
    categories: [],
    dateFrom: '',
    dateTo: '',
    amountMin: null,
    amountMax: null,
    sort: 'latest',
  });

  // 검색
  const searchQuery = ref('');

  // ───────────────────────────────
  // 거래내역 페이지용 계산된 값
  // ───────────────────────────────

  // 자산 합계
  const totalAsset = computed(() => {
    return transactions.value.reduce((sum, t) => {
      return t.type === 'income' ? sum + t.amount : sum - t.amount;
    }, 0);
  });

  const filteredTransactions = computed(() => {
    let list = [...transactions.value];

    // 검색어 필터
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.category.toLowerCase().includes(q) ||
          (t.memo && t.memo.toLowerCase().includes(q))
      );
    }

    // 분류 필터
    if (filter.value.type !== 'all') {
      list = list.filter((t) => t.type === filter.value.type);
    }

    // 카테고리 필터
    if (filter.value.categories.length > 0) {
      list = list.filter((t) => filter.value.categories.includes(t.category));
    }

    // 기간 필터
    if (filter.value.dateFrom) {
      list = list.filter((t) => t.date >= filter.value.dateFrom);
    }
    if (filter.value.dateTo) {
      list = list.filter((t) => t.date <= filter.value.dateTo);
    }

    // 금액 범위 필터
    if (filter.value.amountMin != null && filter.value.amountMin !== '') {
      list = list.filter((t) => t.amount >= filter.value.amountMin);
    }
    if (filter.value.amountMax != null && filter.value.amountMax !== '') {
      list = list.filter((t) => t.amount <= filter.value.amountMax);
    }

    // 정렬
    switch (filter.value.sort) {
      case 'oldest':
        list.sort((a, b) => a.date.localeCompare(b.date));
        break;
      case 'amount_desc':
        list.sort((a, b) => b.amount - a.amount);
        break;
      case 'amount_asc':
        list.sort((a, b) => a.amount - b.amount);
        break;
      case 'latest':
      default:
        list.sort((a, b) => b.date.localeCompare(a.date));
        break;
    }

    return list;
  });

  // ───────────────────────────────
  // 거래내역 페이지용 함수
  // ───────────────────────────────

  // 거래내역 삭제
  async function deleteTransactions(ids) {
    // json-server는 개별 DELETE만 지원하므로 Promise.all로 처리
    await Promise.all(
      ids.map((id) => axios.delete(`${BASE_URL}/transactions/${id}`))
    );
    transactions.value = transactions.value.filter((t) => !ids.includes(t.id));
  }

  // 필터 적용
  function applyFilter(filterData) {
    Object.assign(filter.value, filterData);
  }

  // 필터 초기화
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
    // 상태
    transactions,
    selectedDate,
    filter,
    searchQuery,

    // 함수
    fetchTransactions,
    addTransaction,
    deleteTransactions,
    getDayMap,
    selectDate,
    getCategoryIcon,
    applyFilter,
    resetFilter,

    // 계산된 값
    totalAsset,
    filteredTransactions,
    monthlyIncome,
    monthlyExpense,
    balance,
    todayExpense,
    recentTransactions,
    selectedDateTransactions,
  };
});
