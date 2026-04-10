<template>
  <div class="spending-card shadow-sm">
    <h2 class="title">
      {{ selectedDate ? `${selectedDate} 내역` : '최근 내역' }}
    </h2>

    <button
      v-if="selectedDate"
      class="btn btn-sm btn-outline-secondary mb-3"
      @click="store.selectDate(null)"
    >
      최근 내역 보기
    </button>

    <ul class="spending-list">
      <li
        v-for="item in displayTransactions"
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

        <!-- 작은 화면에서는 memo 숨김 -->
        <div class="memo-wrap d-none d-md-flex">
          <span class="memo">{{ item.memo }}</span>
        </div>

        <div class="amount" :class="item.type === 'expense' ? 'minus' : 'plus'">
          {{ formatAmount(item.amount, item.type) }}
        </div>
      </li>

      <li v-if="displayTransactions.length === 0" class="no-data">
        내역이 없습니다.
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useCounterStore } from '@/stores/transactions.js';
import { storeToRefs } from 'pinia';

const store = useCounterStore();
const { recentTransactions, selectedDate, selectedDateTransactions } =
  storeToRefs(store);
const getCategoryIcon = store.getCategoryIcon;

const displayTransactions = computed(() =>
  selectedDate.value
    ? selectedDateTransactions.value
    : recentTransactions.value,
);

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function formatAmount(amount, type) {
  if (amount === undefined || amount === null) return '0원';
  const abs = Math.abs(amount).toLocaleString('ko-KR');
  return type === 'expense' ? `-${abs}원` : `${abs}원`;
}
</script>

<style scoped>
.spending-card::-webkit-scrollbar {
  display: none; /* 크롬, 사파리, 엣지 */
}
.no-data {
  text-align: center;
  color: #aaa;
  padding: 20px 0;
  font-size: 14px;
}
.category-icon {
  width: 28px;
  height: 28px;
  object-fit: contain;
}
.spending-card {
  overflow: auto;
  scrollbar-width: none; /* 파이어폭스 */
  background: #fff;
  border-radius: 16px;
  border: 1px solid #c6c6c6;
  padding: 24px;
  width: 100%;
  max-height: 468px;
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
  flex: 1; /* 남은 공간 차지 */
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0; /* 텍스트 넘침 방지 */
}
.row-top {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap; /* 작은 화면에서 줄바꿈 */
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.row-bottom {
  display: flex;
  gap: 6px;
}
.category-label {
  font-size: 12px;
  color: #aaa;
}
.memo-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 180px;
  flex-shrink: 0;
}
.memo {
  font-size: 13px;
  color: #555;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.amount {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}
.amount.minus {
  color: #e05555;
}
.amount.plus {
  color: #3b82f6;
}

/* 작은 화면에서 폰트 축소 */
@media (max-width: 576px) {
  .spending-card {
    padding: 16px;
  }
  .date {
    font-size: 11px;
  }
  .name {
    font-size: 12px;
  }
  .amount {
    font-size: 12px;
  }
  .icon-wrap {
    width: 36px;
    height: 36px;
  }
  .category-icon {
    width: 22px;
    height: 22px;
  }
}
</style>
