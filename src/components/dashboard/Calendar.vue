<template>
  <div class="card p-4" style="border-radius: 20px; width: 48%">
    <!-- 헤더 -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div class="d-flex align-items-center gap-3">
        <button class="btn btn-sm btn-outline-secondary" @click="prevMonth">
          ◀
        </button>
        <h4 class="m-0">{{ month }}월</h4>
      </div>
      <div class="d-flex align-items-center gap-3">
        <h4 class="m-0">{{ year }}년</h4>
        <button class="btn btn-sm btn-outline-secondary" @click="nextMonth">
          ▶
        </button>
      </div>
    </div>

    <!-- 요일 헤더 -->
    <div class="calendar-grid">
      <div v-for="day in weekDays" :key="day" class="calendar-cell header">
        {{ day }}
      </div>

      <!-- 날짜 셀 -->
      <div
        v-for="(day, index) in calendarDays"
        :key="index"
        @click="handleDayClick(day)"
        class="calendar-cell"
        :class="{
          'text-danger': day && index % 7 === 0,
          'text-info': day && index % 7 === 6,
          today: day && isToday(day),
        }"
      >
        <div class="day-number">{{ day || '' }}</div>

        <!-- 수입 -->
        <div v-if="day && getDayData(day).income > 0" class="amount income">
          +{{ getDayData(day).income.toLocaleString() }}
        </div>

        <!-- 지출 -->
        <div v-if="day && getDayData(day).expense > 0" class="amount expense">
          -{{ getDayData(day).expense.toLocaleString() }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTransactionStore } from '@/stores/transactions.js';
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';

const store = useTransactionStore();
const { selectedDate } = storeToRefs(store);
const now = new Date();
const year = ref(now.getFullYear());
const month = ref(now.getMonth() + 1);

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// store의 getDayMap으로 dayMap 계산
const dayMap = computed(() => store.getDayMap(year.value, month.value));

// 달력 날짜 배열
const calendarDays = computed(() => {
  const firstDay = new Date(year.value, month.value - 1, 1);
  const lastDay = new Date(year.value, month.value, 0);
  const days = [];

  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push(null);
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(d);
  }

  return days;
});

function handleDayClick(day) {
  const key = `${year.value}-${String(month.value).padStart(2, '0')}-${String(
    day
  ).padStart(2, '0')}`;
  store.selectDate(key);
}

function getDayData(day) {
  const key = `${year.value}-${String(month.value).padStart(2, '0')}-${String(
    day
  ).padStart(2, '0')}`;
  return dayMap.value[key] || { income: 0, expense: 0 };
}

function isToday(day) {
  const t = new Date();
  return (
    day === t.getDate() &&
    month.value === t.getMonth() + 1 &&
    year.value === t.getFullYear()
  );
}

function prevMonth() {
  if (month.value === 1) {
    month.value = 12;
    year.value--;
  } else {
    month.value--;
  }
}

function nextMonth() {
  if (month.value === 12) {
    month.value = 1;
    year.value++;
  } else {
    month.value++;
  }
}
</script>

<style scoped>
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  gap: 4px;
}
.calendar-cell {
  padding: 6px 2px;
  min-height: 70px;
  font-size: 0.9rem;
  vertical-align: top;
}
.calendar-cell:hover {
  cursor: pointer;
  background-color: rgb(233, 237, 238);
}
.calendar-cell.header {
  font-weight: bold;
  background-color: #ffc107;
  color: white;
  border-radius: 4px;
  min-height: auto;
}
.today .day-number {
  background-color: #4a90e2;
  color: white;
  border-radius: 50%;
  width: 26px;
  height: 26px;
  line-height: 26px;
  margin: 0 auto;
}
.amount {
  font-size: 0.7rem;
  margin-top: 2px;
}
.income {
  color: #1976d2;
}
.expense {
  color: #e53935;
}
</style>
