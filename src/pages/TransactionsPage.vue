<template>
  <div class="transactions-page container py-4">
    <!-- 헤더 영역: 제목 + 자산 정보 + 검색/필터/추가 -->
    <h1 class="fw-bold fs-2 mt-4 mb-4">거래내역</h1>

    <!-- 테이블 -->
    <table class="table table-hover align-middle transactions-table">
      <thead>
        <tr>
          <th class="checkbox-header">
            <input
              type="checkbox"
              class="form-check-input"
              :checked="isAllChecked"
              @change="toggleAll"
            />
          </th>
          <th>분류</th>
          <th>날짜</th>
          <th>카테고리</th>
          <th>금액</th>
          <th>메모</th>
          <th class="btn-delete-header">
            <button
              class="btn btn-sm btn-outline-dark btn-delete"
              :disabled="state.selectedIds.length === 0"
            >
              선택삭제
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in state.transactions" :key="item.id">
          <td>
            <input
              type="checkbox"
              class="form-check-input"
              :checked="state.selectedIds.includes(item.id)"
              @change="toggleItem(item.id)"
            />
          </td>
          <td class="text-center">
            <span
              class="badge"
              :class="item.type === 'income' ? 'badge-income' : 'badge-expense'"
            >
              {{ item.type === 'income' ? '수입' : '지출' }}
            </span>
          </td>
          <td class="text-body-secondary">{{ formatDate(item.date) }}</td>
          <td>
            <img
              :src="getCategoryIcon(item.category)"
              :alt="item.category"
              class="category-icon me-1"
            />
            {{ item.category }}
          </td>
          <td
            class="fw-semibold"
            :class="item.type === 'income' ? 'text-income' : 'text-expense'"
          >
            {{ formatAmount(item) }}
          </td>
          <td class="text-muted">{{ item.memo }}</td>
          <td></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { onMounted, reactive, computed } from 'vue';
import axios from 'axios';

// 카테고리 아이콘 매핑 (assets 이미지)
import monthlyIncomeIcon from '@/assets/monthly_income.png';
import allowanceIcon from '@/assets/allowance.png';
import interestIcon from '@/assets/interest.png';
import otherIncomeIcon from '@/assets/other_income.png';
import foodIcon from '@/assets/food.png';
import publicTransportIcon from '@/assets/public_transport.png';
import costOfLivingIcon from '@/assets/cost_of_living.png';
import shoppingIcon from '@/assets/shopping.png';
import hospitalIcon from '@/assets/hospital.png';
import educationIcon from '@/assets/education.png';
import leisureIcon from '@/assets/leisure.png';
import insuranceIcon from '@/assets/insurance.png';
import otherExpenseIcon from '@/assets/other_expense.png';

const categoryIconMap = {
  월급: monthlyIncomeIcon,
  용돈: allowanceIcon,
  이자: interestIcon,
  기타수입: otherIncomeIcon,
  식비: foodIcon,
  교통비: publicTransportIcon,
  '주거/생활비': costOfLivingIcon,
  쇼핑: shoppingIcon,
  의료: hospitalIcon,
  교육: educationIcon,
  '여가/문화': leisureIcon,
  보험: insuranceIcon,
  기타지출: otherExpenseIcon,
};

function getCategoryIcon(category) {
  return categoryIconMap[category] || otherExpenseIcon;
}

const BASE_URL = 'http://localhost:3000';
const state = reactive({ transactions: [], selectedIds: [] });

async function fetchTransactions() {
  try {
    const { data } = await axios.get(`${BASE_URL}/transactions`);
    state.transactions = data;
  } catch (err) {
    console.log(err);
  }
}

onMounted(() => {
  fetchTransactions();
});

// 체크박스
const isAllChecked = computed(() => {
  if (state.transactions.length === 0) return false;
  return state.transactions.every((item) =>
    state.selectedIds.includes(item.id)
  );
});

function toggleAll() {
  if (isAllChecked.value) {
    const transactionIds = state.transactions.map((t) => t.id);
    state.selectedIds = state.selectedIds.filter(
      (id) => !transactionIds.includes(id)
    );
  } else {
    const transactionIds = state.transactions.map((t) => t.id);
    state.selectedIds = [...transactionIds];
  }
}

function toggleItem(id) {
  const idx = state.selectedIds.indexOf(id);
  if (idx != -1) {
    state.selectedIds.splice(idx, 1);
  } else {
    state.selectedIds.push(id);
  }
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-');
  return `${y}년 ${parseInt(m)}월 ${parseInt(d)}일`;
}

function formatAmount(item) {
  const sign = item.type === 'expense' ? '-' : '';
  return `${sign}₩${item.amount.toLocaleString()}`;
}
</script>

<style scoped>
/* 카테고리 아이콘 */
.category-icon {
  width: 14px;
  height: 14px;
  vertical-align: middle;
  object-fit: contain;
}

/* 분류 뱃지 */
.badge-expense {
  background-color: #ffe5e5;
  color: #e74c3c;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.35em 0.85em;
  border-radius: 4px;
}
.badge-income {
  background-color: #e5ffe5;
  color: #2ecc71;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.35em 0.85em;
  border-radius: 4px;
}

/* 색상 */
.text-expense {
  color: #e74c3c;
}
.text-income {
  color: #2ecc71;
}

/* 테이블 스타일 */
.transactions-table thead th {
  background-color: #fafafa;
  font-weight: 700;
  font-size: 1.025rem;
  color: #6d6d6d;
  padding: 0.75rem 0.5rem;
  text-align: center;
  border-top: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
}

.transactions-table thead th:first-child {
  border-left: 1px solid #ddd;
}

.transactions-table thead th:last-child {
  border-right: 1px solid #ddd;
}

.transactions-table tbody td {
  font-size: 0.875rem;
  padding: 0.75rem 0.5rem;
  vertical-align: middle;
  text-align: center;
}

.transactions-table tbody tr {
  border-bottom: 1px solid #f0f0f0;
}

.transactions-table tbody tr:hover {
  background-color: #fffdf5;
}

/* 체크박스 */
.checkbox-header {
  width: 40px;
}

/* 선택삭제 버튼 */
.btn-delete-header {
  width: 80px;
}
.btn-delete {
  font-size: 0.72rem;
  font-weight: 600;
  color: #6d6d6d;
  border-color: #aeaeae;
  transition: all 0.2s ease;
}
.btn-delete:not(:disabled) {
  background-color: #ffbc00;
  border-color: #ffbc00;
  color: #333;
}
.btn-delete:not(:disabled):hover {
  background-color: #ffd24d;
  border-color: #ffd24d;
}

/* 체크박스 KB 스타일 */
.form-check-input:checked {
  background-color: #ffbc00;
  border-color: #ffbc00;
}
.form-check-input:focus {
  box-shadow: none;
  border-color: inherit;
}
</style>
