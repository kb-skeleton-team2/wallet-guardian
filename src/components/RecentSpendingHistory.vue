<template>
  <div class="spending-card">
    <h2 class="title">최근 내역</h2>

    <ul class="spending-list">
      <li
        v-for="item in sortedTransactions"
        :key="item.id"
        class="spending-item"
      >
        <div class="icon-wrap">
          <img
            :src="getCategoryIcon(item.category)"
            class="category-icon"
            alt=""
          />
        </div>

        <div class="info">
          <div class="row-top">
            <span class="date">{{ formatDate(item.date) }}</span>
            <span class="name">{{ item.name }}</span>
          </div>
          <div class="row-bottom">
            <span class="category-label">{{ item.category }}</span>
          </div>
        </div>

        <div class="amount" :class="item.type === 'expense' ? 'minus' : 'plus'">
          {{ formatAmount(item.amount, item.type) }}
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
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
const transactions = ref([]);

onMounted(() => {
  axios.get('http://localhost:3000/transactions').then((res) => {
    transactions.value = [...res.data].sort((a, b) => b.id - a.id);
  });
});

const sortedTransactions = computed(() => transactions.value);

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function formatAmount(amount, type) {
  const abs = Math.abs(amount).toLocaleString('ko-KR');

  return type === 'expense' ? `-${abs}원` : `${abs}원`;
}

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
</script>

<style scoped>
.category-icon {
  width: 28px;
  height: 28px;
  object-fit: contain;
}
.spending-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #c6c6c6;
  padding: 24px;
  max-width: 504px;
  width: 100%;
  max-height: 491px;
  overflow: auto;
}

.title {
  font-size: 17px;
  font-weight: 700;
  color: #111;
  margin-bottom: 20px;
}

.spending-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.spending-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid #f0f0f0;
}

.spending-item:last-child {
  border-bottom: none;
}

.icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #f4f4f4;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 20px;
  color: #333;
}

.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.row-top {
  display: flex;
  align-items: center;
  gap: 6px;
}

.date {
  font-size: 13px;
  color: #888;
  white-space: nowrap;
}

.name {
  font-size: 14px;
  font-weight: 500;
  color: #111;
}

.row-bottom {
  display: flex;
  gap: 6px;
}

.category-label {
  font-size: 12px;
  color: #aaa;
}

.amount {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.amount.minus {
  color: #e05555;
}

.amount.plus {
  color: #3b82f6;
}
</style>
