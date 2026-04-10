<template>
  <div class="filter-overlay" @click.self="$emit('close')">
    <div class="filter-modal">
      <!-- 헤더 -->
      <div class="filter-header">
        <div class="d-flex justify-content-between">
          <h3 class="filter-title">필터</h3>
          <button
            type="button"
            class="btn-close"
            @click.self="$emit('close')"
          ></button>
        </div>
        <div class="filter-divider"></div>
      </div>

      <!-- 스크롤 영역 -->
      <div class="filter-body">
        <!-- 분류 -->
        <section class="filter-section">
          <h4 class="section-label">분류</h4>
          <div class="chip-row">
            <button
              v-for="opt in typeOptions"
              :key="opt.value"
              class="chip"
              :class="{ active: filter.type === opt.value }"
              @click="filter.type = opt.value"
            >
              {{ opt.label }}
            </button>
          </div>
        </section>

        <!-- 카테고리 -->
        <section class="filter-section">
          <h4 class="section-label">카테고리</h4>
          <div class="category-grid">
            <button
              v-for="cat in filteredCategories"
              :key="cat.name"
              class="category-item"
              :class="{ active: filter.categories.includes(cat.name) }"
              @click="toggleCategory(cat.name)"
            >
              <img
                :src="getCategoryIcon(cat.name)"
                :alt="cat.name"
                class="category-icon"
              />
              <span class="category-name">{{ cat.name }}</span>
            </button>
          </div>
        </section>

        <!-- 기간 -->
        <section class="filter-section">
          <h4 class="section-label">기간</h4>
          <div class="range-row">
            <input v-model="filter.dateFrom" type="date" class="range-input" />
            <span class="range-separator">~</span>
            <input v-model="filter.dateTo" type="date" class="range-input" />
          </div>
        </section>

        <!-- 금액 범위 -->
        <section class="filter-section">
          <h4 class="section-label">금액 범위</h4>
          <div class="range-row">
            <input
              v-model.number="filter.amountMin"
              type="number"
              class="range-input"
              placeholder="최소 금액"
              min="0"
            />
            <span class="range-separator">~</span>
            <input
              v-model.number="filter.amountMax"
              type="number"
              class="range-input"
              placeholder="최대 금액"
              min="0"
            />
          </div>
        </section>

        <!-- 정렬 -->
        <section class="filter-section">
          <h4 class="section-label">정렬</h4>
          <div class="chip-row">
            <button
              v-for="opt in sortOptions"
              :key="opt.value"
              class="chip"
              :class="{ active: filter.sort === opt.value }"
              @click="filter.sort = opt.value"
            >
              {{ opt.label }}
            </button>
          </div>
        </section>
      </div>

      <!-- 푸터 버튼 -->
      <div class="filter-footer">
        <button class="footer-link" @click="resetFilter">초기화</button>
        <div class="footer-actions">
          <button class="btn-modal btn-cancel" @click="$emit('close')">
            취소
          </button>
          <button class="btn-modal btn-apply" @click="applyFilter">적용</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue';

import foodIcon from '@/assets/food.png';
import publicTransportIcon from '@/assets/public_transport.png';
import costOfLivingIcon from '@/assets/cost_of_living.png';
import shoppingIcon from '@/assets/shopping.png';
import hospitalIcon from '@/assets/hospital.png';
import educationIcon from '@/assets/education.png';
import leisureIcon from '@/assets/leisure.png';
import insuranceIcon from '@/assets/insurance.png';
import otherExpenseIcon from '@/assets/other_expense.png';
import monthlyIncomeIcon from '@/assets/monthly_income.png';
import allowanceIcon from '@/assets/allowance.png';
import interestIcon from '@/assets/interest.png';
import otherIncomeIcon from '@/assets/other_income.png';

const categoryIconMap = {
  식비: foodIcon,
  교통비: publicTransportIcon,
  '주거/생활비': costOfLivingIcon,
  쇼핑: shoppingIcon,
  의료: hospitalIcon,
  교육: educationIcon,
  '여가/문화': leisureIcon,
  보험: insuranceIcon,
  기타지출: otherExpenseIcon,
  월급: monthlyIncomeIcon,
  용돈: allowanceIcon,
  이자: interestIcon,
  기타수입: otherIncomeIcon,
};

function getCategoryIcon(name) {
  return categoryIconMap[name] || otherExpenseIcon;
}

const props = defineProps({
  initialFilter: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['close', 'apply']);

const allCategories = [
  { name: '식비', type: 'expense' },
  { name: '교통비', type: 'expense' },
  { name: '주거/생활비', type: 'expense' },
  { name: '쇼핑', type: 'expense' },
  { name: '의료', type: 'expense' },
  { name: '교육', type: 'expense' },
  { name: '여가/문화', type: 'expense' },
  { name: '보험', type: 'expense' },
  { name: '기타지출', type: 'expense' },
  { name: '월급', type: 'income' },
  { name: '용돈', type: 'income' },
  { name: '이자', type: 'income' },
  { name: '기타수입', type: 'income' },
];

const typeOptions = [
  { label: '전체', value: 'all' },
  { label: '지출', value: 'expense' },
  { label: '수입', value: 'income' },
];

const sortOptions = [
  { label: '최신순', value: 'latest' },
  { label: '오래된순', value: 'oldest' },
  { label: '금액높은순', value: 'amount_desc' },
  { label: '금액낮은순', value: 'amount_asc' },
];

function getDefaultFilter() {
  return {
    type: 'all',
    categories: [],
    dateFrom: '',
    dateTo: '',
    amountMin: null,
    amountMax: null,
    sort: 'latest',
  };
}

const filter = reactive({ ...getDefaultFilter(), ...props.initialFilter });

// 분류에 따라 카테고리 필터링
const filteredCategories = computed(() => {
  if (filter.type === 'income')
    return allCategories.filter((c) => c.type === 'income');
  if (filter.type === 'expense')
    return allCategories.filter((c) => c.type === 'expense');
  return allCategories;
});

function toggleCategory(name) {
  const idx = filter.categories.indexOf(name);
  if (idx === -1) {
    filter.categories.push(name);
  } else {
    filter.categories.splice(idx, 1);
  }
}

function resetFilter() {
  Object.assign(filter, getDefaultFilter());
}

function applyFilter() {
  emit('apply', { ...filter });
}
</script>

<style scoped>
/* ===== 오버레이 ===== */
.filter-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

/* ===== 모달 박스 ===== */
.filter-modal {
  background: #fff;
  border-radius: 16px;
  padding: 0;
  width: 520px;
  max-width: 94vw;
  max-height: 85vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.18);
}

.filter-header {
  padding: 20px 24px 0;
  flex-shrink: 0;
}

.filter-body {
  flex: 1;
  overflow-y: auto;
  padding: 0 24px;
}

.filter-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #222;
  margin: 0 0 8px;
}

.filter-divider {
  height: 2px;
  background: linear-gradient(90deg, #ffbc00 0%, #ffe08a 100%);
  border-radius: 2px;
  margin-bottom: 14px;
}

/* ===== 섹션 ===== */
.filter-section {
  margin-bottom: 14px;
}

.section-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 6px;
}

/* ===== 칩 (분류 / 정렬) ===== */
.chip-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.chip {
  height: 30px;
  padding: 0 14px;
  border-radius: 16px;
  border: 1px solid #ddd;
  background: #fff;
  font-size: 0.78rem;
  font-weight: 600;
  color: #555;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chip:hover {
  border-color: #ccc;
  background: #fafafa;
}

.chip.active {
  background: #ffbc00;
  border-color: #ffbc00;
  color: #fff;
}

/* ===== 카테고리 그리드 ===== */
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(56px, 1fr));
  gap: 6px;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 2px;
  border-radius: 10px;
  border: 1.5px solid transparent;
  background: #f9f9f9;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-item:hover {
  background: #f2f2f2;
}

.category-item.active {
  border-color: #ffbc00;
  background: #fff8e1;
}

.category-icon {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.category-name {
  font-size: 0.62rem;
  font-weight: 600;
  color: #555;
  text-align: center;
  line-height: 1.2;
  word-break: keep-all;
}

/* ===== 범위 입력 (기간 / 금액) ===== */
.range-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.range-input {
  flex: 1;
  height: 34px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 0 10px;
  font-size: 0.8rem;
  color: #333;
  background: #f5f5f5;
  outline: none;
  transition: border-color 0.2s;
}

.range-input:focus {
  border-color: #ffbc00;
  background: #fff;
}

.range-input::placeholder {
  color: #aaa;
}

.range-separator {
  font-size: 0.85rem;
  color: #999;
  flex-shrink: 0;
}

/* ===== 푸터 ===== */
.filter-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0;
  padding: 12px 24px 18px;
  border-top: 1px solid #eee;
  flex-shrink: 0;
}

.footer-link {
  background: none;
  border: none;
  font-size: 0.78rem;
  font-weight: 600;
  color: #888;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.footer-link:hover {
  color: #555;
}

.footer-actions {
  display: flex;
  gap: 10px;
}

.btn-modal {
  height: 34px;
  padding: 0 22px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: #f0f0f0;
  color: #666;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-apply {
  background: #ffbc00;
  color: #fff;
}

.btn-apply:hover {
  background: #ffd24d;
}

/* ==== 모달 Close 버튼 ==== */
.btn-close:focus {
  box-shadow: 0 0 0 0.25rem rgba(255, 188, 0, 0.25);
}
</style>
