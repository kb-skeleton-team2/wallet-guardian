<template>
  <div
    v-if="isOpen"
    class="modal-backdrop"
    @click.self="$emit('close')"
  >
    <div class="modal-sheet">
      <!-- 탭 -->
      <div class="tab-group">
        <button
          class="tab"
          :class="{ active: type === '지출' }"
          @click="type = '지출'"
        >
          지출
        </button>
        <button
          class="tab"
          :class="{ active: type === '수입' }"
          @click="type = '수입'"
        >
          수입
        </button>
      </div>

      <!-- 날짜 -->
      <p class="date-label">{{ formattedDate }}</p>

      <!-- 금액 -->
      <div class="amount-wrap">
        <input
          class="amount-input"
          type="text"
          :value="displayAmount"
          placeholder="0원"
          @input="onAmountInput"
        />
      </div>

      <div class="divider" />

      <!-- 카테고리 -->
      <p class="section-label">거래내역</p>
      <div class="category-grid">
        <button
          v-for="cat in categories"
          :key="cat.name"
          class="cat-btn"
          :class="{ selected: selectedCategory === cat.name }"
          @click="selectedCategory = cat.name"
        >
          <span class="cat-icon">
            <img
              :src="cat.icon"
              :alt="cat.name"
            />
          </span>
          <span class="cat-label">{{ cat.name }}</span>
        </button>
      </div>

      <div class="divider" />

      <!-- 메모 -->
      <div class="memo-wrap">
        <input
          v-model="memo"
          class="memo-input"
          type="text"
          placeholder="메모를 입력하세요"
        />
      </div>

      <!-- 버튼 -->
      <div class="btn-row">
        <button
          class="btn-save"
          @click="handleSave"
        >
          저장
        </button>
        <button
          class="btn-cancel"
          @click="$emit('close')"
        >
          취소
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({ isOpen: Boolean });
defineEmits(['close']);

const type = ref('지출');
const memo = ref('');
const selectedCategory = ref('');

const categories = [
  { name: '식비', icon: '/src/assets/food.png' },
  { name: '교통', icon: '/src/assets/public_transport.png' },
  { name: '교육', icon: '/src/assets/education.png' },
  { name: '쇼핑', icon: '/src/assets/shopping.png' },
  { name: '의료', icon: '/src/assets/hospital.png' },
  { name: '여가', icon: '/src/assets/leisure.png' },
  { name: '보험', icon: '/src/assets/insurance.png' },
  { name: '용돈', icon: '/src/assets/allowance.png' },
  { name: '이자', icon: '/src/assets/interest.png' },
  { name: '월급', icon: '/src/assets/monthly_income.png' },
  { name: '기타지출', icon: '/src/assets/other_expense.png' },
  { name: '기타수입', icon: '/src/assets/other_income.png' },
  { name: '생활비', icon: '/src/assets/cost_of_living.png' },
];
const formattedDate = '2026.04.07 화요일';
const displayAmount = '';

function onAmountInput() {}
function handleSave() {}
</script>
<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;
}
.modal-sheet {
  background: #fff;
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-width: 480px;
  padding: 20px;
}
.tab-group {
  display: flex;
  background: #f5f5f5;
  border-radius: 10px;
  padding: 3px;
  gap: 3px;
  margin-bottom: 12px;
}
.tab {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 8px;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: #888;
  cursor: pointer;
}
.tab.active {
  background: #ffc107;
  color: #5a3e00;
}
.date-label {
  text-align: center;
  font-size: 13px;
  color: #888;
  margin-bottom: 8px;
}
.amount-wrap {
  text-align: center;
  margin-bottom: 16px;
}
.amount-input {
  font-size: 28px;
  font-weight: 500;
  text-align: center;
  border: none;
  outline: none;
  width: 100%;
  color: #222;
}
.divider {
  height: 1px;
  background: #f0f0f0;
  margin: 0 -20px;
}
.section-label {
  font-size: 12px;
  font-weight: 500;
  color: #888;
  margin: 12px 0 8px;
}
.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  margin-bottom: 12px;
}
.cat-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 4px;
  border: none;
  background: transparent;
  border-radius: 10px;
  cursor: pointer;
}
.cat-btn.selected {
  background: #fff8e1;
}
.cat-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}
.cat-icon img {
  width: 36px;
  height: 36px;
  object-fit: contain;
}
.cat-label {
  font-size: 10px;
  color: #888;
}
.cat-btn.selected .cat-label {
  color: #b8860b;
  font-weight: 500;
}
.memo-wrap {
  padding: 12px 0 16px;
}
.memo-input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 14px;
  color: #888;
}
.memo-input::placeholder {
  color: #ccc;
}
.btn-row {
  display: flex;
  gap: 8px;
}
.btn-save {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 12px;
  background: #ffc107;
  color: #5a3e00;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}
.btn-cancel {
  flex: 1;
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 12px;
  background: #f5f5f5;
  color: #888;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}
</style>
