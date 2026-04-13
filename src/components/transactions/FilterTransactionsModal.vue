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
            <div class="date-picker-wrapper">
              <button class="date-display" @click="toggleDatePicker('from')">
                {{ fromDateLabel }}
              </button>
              <transition name="slide-fade">
                <div
                  v-if="activePicker === 'from'"
                  class="roller-picker-card"
                  @click.stop
                >
                  <div class="roller-container">
                    <div class="roller-highlight"></div>
                    <div
                      class="roller-column"
                      ref="fromYearRoller"
                      @scroll="handleFromYearScroll"
                    >
                      <div class="roller-space"></div>
                      <div
                        v-for="y in years"
                        :key="'fy' + y"
                        class="roller-item"
                        :class="{ selected: y === fromYear }"
                      >
                        {{ y }}
                      </div>
                      <div class="roller-space"></div>
                    </div>
                    <div
                      class="roller-column"
                      ref="fromMonthRoller"
                      @scroll="handleFromMonthScroll"
                    >
                      <div class="roller-space"></div>
                      <div
                        v-for="m in 12"
                        :key="'fm' + m"
                        class="roller-item"
                        :class="{ selected: m === fromMonth }"
                      >
                        {{ m }}
                      </div>
                      <div class="roller-space"></div>
                    </div>
                    <div
                      class="roller-column"
                      ref="fromDayRoller"
                      @scroll="handleFromDayScroll"
                    >
                      <div class="roller-space"></div>
                      <div
                        v-for="d in fromDaysInMonth"
                        :key="'fd' + d"
                        class="roller-item"
                        :class="{ selected: d === fromDay }"
                      >
                        {{ d }}
                      </div>
                      <div class="roller-space"></div>
                    </div>
                  </div>
                  <button class="picker-confirm-btn" @click="confirmFromDate">
                    확인
                  </button>
                </div>
              </transition>
            </div>
            <span class="range-separator">~</span>
            <div class="date-picker-wrapper">
              <button class="date-display" @click="toggleDatePicker('to')">
                {{ toDateLabel }}
              </button>
              <transition name="slide-fade">
                <div
                  v-if="activePicker === 'to'"
                  class="roller-picker-card"
                  @click.stop
                >
                  <div class="roller-container">
                    <div class="roller-highlight"></div>
                    <div
                      class="roller-column"
                      ref="toYearRoller"
                      @scroll="handleToYearScroll"
                    >
                      <div class="roller-space"></div>
                      <div
                        v-for="y in years"
                        :key="'ty' + y"
                        class="roller-item"
                        :class="{ selected: y === toYear }"
                      >
                        {{ y }}
                      </div>
                      <div class="roller-space"></div>
                    </div>
                    <div
                      class="roller-column"
                      ref="toMonthRoller"
                      @scroll="handleToMonthScroll"
                    >
                      <div class="roller-space"></div>
                      <div
                        v-for="m in 12"
                        :key="'tm' + m"
                        class="roller-item"
                        :class="{ selected: m === toMonth }"
                      >
                        {{ m }}
                      </div>
                      <div class="roller-space"></div>
                    </div>
                    <div
                      class="roller-column"
                      ref="toDayRoller"
                      @scroll="handleToDayScroll"
                    >
                      <div class="roller-space"></div>
                      <div
                        v-for="d in toDaysInMonth"
                        :key="'td' + d"
                        class="roller-item"
                        :class="{ selected: d === toDay }"
                      >
                        {{ d }}
                      </div>
                      <div class="roller-space"></div>
                    </div>
                  </div>
                  <button class="picker-confirm-btn" @click="confirmToDate">
                    확인
                  </button>
                </div>
              </transition>
            </div>
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
import { reactive, ref, computed, watch, nextTick } from 'vue';

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

const filter = reactive({
  ...getDefaultFilter(),
  ...JSON.parse(JSON.stringify(props.initialFilter)),
});

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
  fromYear.value = now.getFullYear();
  fromMonth.value = now.getMonth() + 1;
  fromDay.value = 1;
  toYear.value = now.getFullYear();
  toMonth.value = now.getMonth() + 1;
  toDay.value = now.getDate();
  activePicker.value = null;
}

function applyFilter() {
  emit('apply', { ...filter });
}

// ===== 롤러 날짜 피커 =====
const years = Array.from({ length: 11 }, (_, i) => 2021 + i);
const ITEM_HEIGHT = 36;
const activePicker = ref(null);

// From 날짜
const now = new Date();
const fromYear = ref(now.getFullYear());
const fromMonth = ref(now.getMonth() + 1);
const fromDay = ref(1);
const fromYearRoller = ref(null);
const fromMonthRoller = ref(null);
const fromDayRoller = ref(null);
const fromDaysInMonth = computed(() =>
  new Date(fromYear.value, fromMonth.value, 0).getDate()
);

// To 날짜
const toYear = ref(now.getFullYear());
const toMonth = ref(now.getMonth() + 1);
const toDay = ref(now.getDate());
const toYearRoller = ref(null);
const toMonthRoller = ref(null);
const toDayRoller = ref(null);
const toDaysInMonth = computed(() =>
  new Date(toYear.value, toMonth.value, 0).getDate()
);

// 초기값 파싱
function parseDateStr(str, fallbackY, fallbackM, fallbackD) {
  if (str && str.length >= 10) {
    const parts = str.split('-');
    return {
      y: parseInt(parts[0]),
      m: parseInt(parts[1]),
      d: parseInt(parts[2]),
    };
  }
  return { y: fallbackY, m: fallbackM, d: fallbackD };
}

// 초기 filter 값 반영
const initFrom = parseDateStr(
  filter.dateFrom,
  now.getFullYear(),
  now.getMonth() + 1,
  1
);
fromYear.value = initFrom.y;
fromMonth.value = initFrom.m;
fromDay.value = initFrom.d;

const initTo = parseDateStr(
  filter.dateTo,
  now.getFullYear(),
  now.getMonth() + 1,
  now.getDate()
);
toYear.value = initTo.y;
toMonth.value = initTo.m;
toDay.value = initTo.d;

// 라벨
const fromDateLabel = computed(() => {
  if (!filter.dateFrom) return '시작일';
  return `${fromYear.value}.${String(fromMonth.value).padStart(
    2,
    '0'
  )}.${String(fromDay.value).padStart(2, '0')}`;
});
const toDateLabel = computed(() => {
  if (!filter.dateTo) return '종료일';
  return `${toYear.value}.${String(toMonth.value).padStart(2, '0')}.${String(
    toDay.value
  ).padStart(2, '0')}`;
});

// 스크롤 핸들러
const handleFromYearScroll = (e) => {
  const idx = Math.round(e.target.scrollTop / ITEM_HEIGHT);
  if (years[idx]) fromYear.value = years[idx];
};
const handleFromMonthScroll = (e) => {
  const idx = Math.round(e.target.scrollTop / ITEM_HEIGHT);
  if (idx >= 0 && idx < 12) fromMonth.value = idx + 1;
};
const handleFromDayScroll = (e) => {
  const idx = Math.round(e.target.scrollTop / ITEM_HEIGHT);
  if (idx >= 0 && idx < fromDaysInMonth.value) fromDay.value = idx + 1;
};
const handleToYearScroll = (e) => {
  const idx = Math.round(e.target.scrollTop / ITEM_HEIGHT);
  if (years[idx]) toYear.value = years[idx];
};
const handleToMonthScroll = (e) => {
  const idx = Math.round(e.target.scrollTop / ITEM_HEIGHT);
  if (idx >= 0 && idx < 12) toMonth.value = idx + 1;
};
const handleToDayScroll = (e) => {
  const idx = Math.round(e.target.scrollTop / ITEM_HEIGHT);
  if (idx >= 0 && idx < toDaysInMonth.value) toDay.value = idx + 1;
};

// 일수 초과 보정
watch(fromDaysInMonth, (max) => {
  if (fromDay.value > max) fromDay.value = max;
});
watch(toDaysInMonth, (max) => {
  if (toDay.value > max) toDay.value = max;
});

// 롤러 동기화
async function syncFromRollers() {
  await nextTick();
  if (fromYearRoller.value)
    fromYearRoller.value.scrollTop =
      years.indexOf(fromYear.value) * ITEM_HEIGHT;
  if (fromMonthRoller.value)
    fromMonthRoller.value.scrollTop = (fromMonth.value - 1) * ITEM_HEIGHT;
  if (fromDayRoller.value)
    fromDayRoller.value.scrollTop = (fromDay.value - 1) * ITEM_HEIGHT;
}
async function syncToRollers() {
  await nextTick();
  if (toYearRoller.value)
    toYearRoller.value.scrollTop = years.indexOf(toYear.value) * ITEM_HEIGHT;
  if (toMonthRoller.value)
    toMonthRoller.value.scrollTop = (toMonth.value - 1) * ITEM_HEIGHT;
  if (toDayRoller.value)
    toDayRoller.value.scrollTop = (toDay.value - 1) * ITEM_HEIGHT;
}

function toggleDatePicker(type) {
  if (activePicker.value === type) {
    activePicker.value = null;
  } else {
    activePicker.value = type;
    if (type === 'from') syncFromRollers();
    else syncToRollers();
  }
}

function confirmFromDate() {
  filter.dateFrom = `${fromYear.value}-${String(fromMonth.value).padStart(
    2,
    '0'
  )}-${String(fromDay.value).padStart(2, '0')}`;
  activePicker.value = null;
}
function confirmToDate() {
  filter.dateTo = `${toYear.value}-${String(toMonth.value).padStart(
    2,
    '0'
  )}-${String(toDay.value).padStart(2, '0')}`;
  activePicker.value = null;
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
  background: linear-gradient(90deg, var(--color-primary) 0%, #ffe08a 100%);
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
  background: var(--color-primary);
  border-color: var(--color-primary);
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
  border-color: var(--color-primary);
  background: var(--color-primary-light);
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
  border-color: var(--color-primary);
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
  background: var(--color-primary);
  color: #fff;
}

.btn-apply:hover {
  background: var(--color-primary-hover);
}

/* ==== 모달 Close 버튼 ==== */
.btn-close:focus {
  box-shadow: 0 0 0 0.25rem rgba(255, 188, 0, 0.25);
}

/* ===== 롤러 날짜 피커 ===== */
.date-picker-wrapper {
  flex: 1;
  position: relative;
}

.date-display {
  width: 100%;
  height: 34px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 0 10px;
  font-size: 0.8rem;
  color: #333;
  background: #f5f5f5;
  cursor: pointer;
  text-align: center;
  transition: border-color 0.2s;
}

.date-display:hover {
  border-color: var(--color-primary);
  background: #fff;
}

.roller-picker-card {
  position: absolute;
  bottom: 110%;
  left: 50%;
  transform: translateX(-50%);
  background: #fff;
  border-radius: 16px;
  padding: 14px;
  width: 220px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

.roller-container {
  display: flex;
  height: 120px;
  position: relative;
  overflow: hidden;
  margin-bottom: 10px;
}

.roller-highlight {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 36px;
  transform: translateY(-50%);
  background: var(--color-primary-light);
  border-top: 1px solid var(--color-primary);
  border-bottom: 1px solid var(--color-primary);
}

.roller-column {
  flex: 1;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  height: 100%;
  z-index: 1;
  scrollbar-width: none;
}

.roller-column::-webkit-scrollbar {
  display: none;
}

.roller-item {
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: #ccc;
  scroll-snap-align: center;
}

.roller-item.selected {
  color: #222;
  font-weight: 700;
  font-size: 14px;
}

.roller-space {
  height: 42px;
}

.picker-confirm-btn {
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 10px;
  background: var(--color-primary);
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  color: #fff;
}

.picker-confirm-btn:hover {
  background: var(--color-primary-hover);
}

/* 트랜지션 */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translate(-50%, 8px);
}
.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px);
}
</style>
