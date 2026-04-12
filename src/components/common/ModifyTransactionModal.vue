<template>
  <div v-if="isOpen" class="modal-backdrop" @click.self="handleClose">
    <div class="modal-sheet">
      <div class="tab-group">
        <button
          class="tab-btn"
          :class="{ active: type === '지출' }"
          @click="type = '지출'"
        >
          지출
        </button>
        <button
          class="tab-btn"
          :class="{ active: type === '수입' }"
          @click="type = '수입'"
        >
          수입
        </button>
      </div>

      <div class="date-section">
        <div
          class="date-label-wrapper"
          @click="showDatePicker = !showDatePicker"
        >
          <span class="date-text">
            {{ selectedYear }}.{{ String(selectedMonth).padStart(2, '0') }}.{{
              String(selectedDay).padStart(2, '0')
            }}
            {{ formattedDow }}
          </span>
        </div>
        <transition name="slide-fade">
          <div v-if="showDatePicker" class="roller-picker-card" @click.stop>
            <div class="roller-container">
              <div class="roller-highlight"></div>
              <div
                class="roller-column"
                ref="yearRoller"
                @scroll="handleYearScroll"
              >
                <div class="roller-space"></div>
                <div
                  v-for="y in years"
                  :key="y"
                  class="roller-item"
                  :class="{ selected: y === selectedYear }"
                >
                  {{ y }}
                </div>
                <div class="roller-space"></div>
              </div>
              <div
                class="roller-column"
                ref="monthRoller"
                @scroll="handleMonthScroll"
              >
                <div class="roller-space"></div>
                <div
                  v-for="m in 12"
                  :key="m"
                  class="roller-item"
                  :class="{ selected: m === selectedMonth }"
                >
                  {{ m }}
                </div>
                <div class="roller-space"></div>
              </div>
              <div
                class="roller-column"
                ref="dayRoller"
                @scroll="handleDayScroll"
              >
                <div class="roller-space"></div>
                <div
                  v-for="d in daysInMonth"
                  :key="d"
                  class="roller-item"
                  :class="{ selected: d === selectedDay }"
                >
                  {{ d }}
                </div>
                <div class="roller-space"></div>
              </div>
            </div>
            <button class="picker-confirm-btn" @click="showDatePicker = false">
              확인
            </button>
          </div>
        </transition>
      </div>

      <div class="amount-section">
        <div class="amount-container">
          <input
            class="amount-input"
            type="text"
            inputmode="numeric"
            :value="displayAmount"
            placeholder="0"
            @input="onAmountInput"
            @keydown="onAmountKeydown"
          />
          <span class="amount-unit">원</span>
        </div>
      </div>

      <div class="section-container">
        <p class="section-label">카테고리</p>
        <div class="category-grid">
          <button
            v-for="cat in filteredCategories"
            :key="cat.name"
            class="cat-item"
            :class="{ selected: selectedCategory === cat.name }"
            @click="selectedCategory = cat.name"
          >
            <div class="cat-icon-box">
              <img :src="cat.icon" :alt="cat.name" />
            </div>
            <span class="cat-name">{{ cat.name }}</span>
          </button>
        </div>
      </div>

      <div class="section-container">
        <p class="section-label">메모</p>
        <input
          v-model="memo"
          class="memo-input"
          type="text"
          placeholder="메모를 입력하세요."
        />
      </div>

      <div class="action-buttons">
        <button class="btn-save" @click="handleSave" :disabled="isSaving">
          수정
        </button>
        <button class="btn-cancel" @click="handleClose">취소</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import axios from 'axios';
import { useTransactionStore } from '@/stores/transactions.js';
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

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const store = useTransactionStore();
// ── Props / Emits ──
const props = defineProps({
  isOpen: Boolean,
  transaction: Object,
});
const emit = defineEmits(['close', 'saved']);

// ── 상태 ──
const type = ref('지출');
const memo = ref('');
const selectedCategory = ref('');
const displayAmount = ref('');
const rawAmount = ref(0);
const isSaving = ref(false);
const showDatePicker = ref(false);

const years = Array.from({ length: 11 }, (_, i) => 2021 + i);
const selectedYear = ref(new Date().getFullYear());
const selectedMonth = ref(new Date().getMonth() + 1);
const selectedDay = ref(new Date().getDate());

const yearRoller = ref(null);
const monthRoller = ref(null);
const dayRoller = ref(null);

// ── Computed ──
const daysInMonth = computed(() =>
  new Date(selectedYear.value, selectedMonth.value, 0).getDate()
);

const formattedDow = computed(() => {
  const d = new Date(
    selectedYear.value,
    selectedMonth.value - 1,
    selectedDay.value
  );
  return ['일', '월', '화', '수', '목', '금', '토'][d.getDay()] + '요일';
});

const allCategories = [
  { name: '식비', icon: foodIcon, group: '지출' },
  { name: '교통비', icon: publicTransportIcon, group: '지출' },
  { name: '주거/생활비', icon: costOfLivingIcon, group: '지출' },
  { name: '쇼핑', icon: shoppingIcon, group: '지출' },
  { name: '의료', icon: hospitalIcon, group: '지출' },
  { name: '교육', icon: educationIcon, group: '지출' },
  { name: '여가/문화', icon: leisureIcon, group: '지출' },
  { name: '보험', icon: insuranceIcon, group: '지출' },
  { name: '기타지출', icon: otherExpenseIcon, group: '지출' },
  { name: '월급', icon: monthlyIncomeIcon, group: '수입' },
  { name: '용돈', icon: allowanceIcon, group: '수입' },
  { name: '이자', icon: interestIcon, group: '수입' },
  { name: '기타수입', icon: otherIncomeIcon, group: '수입' },
];

const filteredCategories = computed(() =>
  allCategories.filter((c) => c.group === type.value)
);

// ── 롤러 ──
const ITEM_HEIGHT = 40;

const handleYearScroll = (e) => {
  const idx = Math.round(e.target.scrollTop / ITEM_HEIGHT);
  if (years[idx]) selectedYear.value = years[idx];
};
const handleMonthScroll = (e) => {
  const idx = Math.round(e.target.scrollTop / ITEM_HEIGHT);
  if (idx >= 0 && idx < 12) selectedMonth.value = idx + 1;
};
const handleDayScroll = (e) => {
  const idx = Math.round(e.target.scrollTop / ITEM_HEIGHT);
  if (idx >= 0 && idx < daysInMonth.value) selectedDay.value = idx + 1;
};

const syncRollers = async () => {
  await nextTick();
  if (yearRoller.value)
    yearRoller.value.scrollTop =
      years.indexOf(selectedYear.value) * ITEM_HEIGHT;
  if (monthRoller.value)
    monthRoller.value.scrollTop = (selectedMonth.value - 1) * ITEM_HEIGHT;
  if (dayRoller.value)
    dayRoller.value.scrollTop = (selectedDay.value - 1) * ITEM_HEIGHT;
};

watch(showDatePicker, (val) => {
  if (val) syncRollers();
});
watch(type, () => {
  selectedCategory.value = '';
});
watch(daysInMonth, (newMax) => {
  if (selectedDay.value > newMax) selectedDay.value = newMax;
});

// ── 금액 입력 ──
const onAmountInput = (e) => {
  const digits = e.target.value.replace(/[^0-9]/g, '');
  rawAmount.value = parseInt(digits || '0', 10);
  displayAmount.value = rawAmount.value ? rawAmount.value.toLocaleString() : '';
};
const onAmountKeydown = (e) => {
  if (e.key === 'Backspace') {
    e.preventDefault();
    const newDigits = String(rawAmount.value).slice(0, -1);
    rawAmount.value = parseInt(newDigits || '0', 10);
    displayAmount.value = rawAmount.value
      ? rawAmount.value.toLocaleString()
      : '';
  }
};

// ── 저장 (PUT) ──
const handleSave = async () => {
  if (!rawAmount.value || !selectedCategory.value) return;
  isSaving.value = true;
  try {
    const dateStr = `${selectedYear.value}-${String(
      selectedMonth.value
    ).padStart(2, '0')}-${String(selectedDay.value).padStart(2, '0')}`;
    const res = await axios.put(
      `${BASE_URL}/transactions/${props.transaction.id}`,
      {
        type: type.value === '지출' ? 'expense' : 'income',
        date: dateStr,
        category: selectedCategory.value,
        amount: rawAmount.value,
        memo: memo.value,
      }
    );
    store.modifyTransaction(res);
    emit('saved');
    handleClose();
  } catch (err) {
    console.error(err);
  } finally {
    isSaving.value = false;
  }
};

const handleClose = () => emit('close');

// ── isOpen 감지 → 기존 데이터로 초기화 ──
watch(
  () => props.isOpen,
  (val) => {
    if (val && props.transaction) {
      const t = props.transaction;
      type.value = t.type === 'expense' ? '지출' : '수입';
      const [y, m, d] = t.date.split('-');
      selectedYear.value = Number(y);
      selectedMonth.value = Number(m);
      selectedDay.value = Number(d);
      rawAmount.value = t.amount;
      displayAmount.value = t.amount.toLocaleString();
      selectedCategory.value = t.category;
      memo.value = t.memo || '';
      showDatePicker.value = false;
    }
  }
);
</script>

<!-- style은 AddTransactionModal.vue와 동일하게 복붙 -->
<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.modal-sheet {
  background: #fff;
  border-radius: 32px;
  width: 90%;
  max-width: 380px;
  padding: 30px 24px;
  max-height: 95vh;
  overflow-y: auto;
}
.tab-group {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 25px;
}
.tab-btn {
  width: 110px;
  padding: 12px 0;
  border-radius: 30px;
  border: 1px solid #eee;
  background: #fff;
  font-weight: 600;
  cursor: pointer;
  color: #444;
}
.tab-btn.active {
  background: #ffbc39;
  border-color: #ffbc39;
  color: #000;
}
.date-section {
  position: relative;
  text-align: center;
  margin-bottom: 30px;
}
.date-label-wrapper {
  cursor: pointer;
  color: #666;
  font-size: 14px;
  font-weight: 500;
}
.roller-picker-card {
  position: absolute;
  top: 110%;
  left: 50%;
  transform: translateX(-50%);
  background: #fff;
  border-radius: 24px;
  padding: 20px;
  width: 280px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  z-index: 2100;
}
.roller-container {
  display: flex;
  height: 160px;
  position: relative;
  overflow: hidden;
  margin-bottom: 15px;
}
.roller-highlight {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 40px;
  transform: translateY(-50%);
  background: #fff9eb;
  border-top: 1px solid #ffbc39;
  border-bottom: 1px solid #ffbc39;
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
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #ccc;
  scroll-snap-align: center;
}
.roller-item.selected {
  color: #222;
  font-weight: 700;
  font-size: 18px;
}
.roller-space {
  height: 60px;
}
.picker-confirm-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 15px;
  background: #ffbc39;
  font-weight: 600;
  cursor: pointer;
}
.amount-section {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}
.amount-container {
  border-bottom: 2px solid #ccc;
  padding-bottom: 5px;
  min-width: 200px;
  display: flex;
  justify-content: center;
}
.amount-input {
  border: none;
  outline: none;
  font-size: 32px;
  font-weight: 700;
  width: 150px;
  text-align: center;
  background: transparent;
}
.amount-unit {
  font-size: 26px;
  font-weight: 700;
  margin-left: 5px;
}
.section-container {
  margin-bottom: 25px;
}
.section-label {
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 15px;
  color: #333;
}
.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px 10px;
}
.cat-item {
  border: none;
  background: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.1s;
}
.cat-item:active {
  transform: scale(0.95);
}
.cat-icon-box {
  width: 40px;
  height: 40px;
  margin-bottom: 6px;
}
.cat-icon-box img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.cat-name {
  font-size: 10px;
  color: #999;
  text-align: center;
  line-height: 1.2;
}
.cat-item.selected .cat-name {
  color: #ffbc39;
  font-weight: 700;
}
.memo-input {
  width: 100%;
  border: none;
  border-bottom: 1px solid #eee;
  padding: 10px 0;
  outline: none;
  margin-bottom: 20px;
  font-size: 14px;
}
.action-buttons {
  display: flex;
  gap: 10px;
}
.btn-save {
  flex: 1;
  padding: 16px;
  border-radius: 40px;
  border: none;
  background: #ffbc39;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
}
.btn-cancel {
  flex: 1;
  padding: 16px;
  border-radius: 40px;
  border: 1px solid #eee;
  background: #fff;
  color: #999;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
}
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translate(-50%, -20px);
}
</style>
