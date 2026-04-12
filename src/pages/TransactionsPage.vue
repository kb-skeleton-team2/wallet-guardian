<template>
  <div class="container py-2 transactions-page">
    <!-- 헤더 영역: 제목 + 자산 정보 + 검색/필터/추가 -->
    <div class="header-row">
      <h1 class="fw-bold fs-2">거래내역</h1>
      <div class="header-actions">
        <span class="asset-info"
          >자산 · ₩{{ store.balance.toLocaleString() }} · 1개월 변동</span
        >
        <input
          v-model="store.searchQuery"
          type="text"
          class="search-input"
          placeholder="검색"
          @keyup.enter="applySearch"
        />
        <button class="btn-action btn-search" @click="applySearch">검색</button>
        <button class="btn-action btn-filter" @click="toggleFilter">
          필터
        </button>
        <button class="btn-action btn-add" @click="openAddModal">+ 추가</button>
      </div>
    </div>

    <!-- 필터 모달 -->
    <FilterTransactionsModal
      v-if="showFilterModal"
      :initial-filter="{ ...store.filter }"
      @close="showFilterModal = false"
      @apply="handleFilterApply"
    />

    <!-- 모바일 액션 바 -->
    <div
      class="mobile-action-bar d-md-none"
      :class="{ 'is-active': selectedIds.length > 0 }"
    >
      <label class="select-all-label">
        <input
          type="checkbox"
          class="form-check-input"
          :checked="isAllChecked"
          @change="toggleAll"
        />
        <span class="selected-count">
          {{
            selectedIds.length > 0
              ? `${selectedIds.length}건 선택됨`
              : '전체 선택'
          }}
        </span>
      </label>
      <div class="mobile-action-buttons">
        <button
          class="btn btn-sm btn-edit"
          :disabled="selectedIds.length !== 1"
          @click="editTransactionHandler"
        >
          수정
        </button>
        <button
          class="btn btn-sm btn-delete"
          :disabled="selectedIds.length === 0"
          @click="deleteTransactionHandler"
        >
          삭제
        </button>
      </div>
    </div>

    <!-- 모바일 카드 리스트 -->
    <div class="card-list d-md-none">
      <div
        v-for="item in paginatedTransactions"
        :key="item.id"
        class="transaction-card"
        :class="{ selected: selectedIds.includes(item.id) }"
        @click="onCardClick(item.id, $event)"
      >
        <input
          type="checkbox"
          class="form-check-input card-checkbox"
          :checked="selectedIds.includes(item.id)"
          @click.stop
          @change="toggleItem(item.id)"
        />
        <img
          :src="store.getCategoryIcon(item.category)"
          :alt="item.category"
          class="card-icon"
        />
        <div class="card-body-info">
          <div class="card-top">
            <span class="card-category">{{ item.category }}</span>
            <span
              class="badge"
              :class="item.type === 'income' ? 'badge-income' : 'badge-expense'"
            >
              {{ item.type === 'income' ? '수입' : '지출' }}
            </span>
          </div>
          <div class="card-date">{{ formatDate(item.date) }}</div>
          <div v-if="item.memo" class="card-memo">{{ item.memo }}</div>
        </div>
        <div
          class="card-amount"
          :class="item.type === 'income' ? 'text-income' : 'text-expense'"
        >
          {{ formatAmount(item) }}
        </div>
      </div>
      <div v-if="paginatedTransactions.length === 0" class="card-empty">
        거래 내역이 없습니다.
      </div>
    </div>

    <!-- 데스크톱 테이블 -->
    <div class="table-area d-none d-md-block">
      <table class="table table-hover align-middle transactions-table">
        <colgroup>
          <col style="width: 48px" />
          <col style="width: 12%" />
          <col style="width: 22%" />
          <col style="width: 20%" />
          <col style="width: 20%" />
          <col style="width: 26%" />
          <col style="width: 110px" />
        </colgroup>
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
            <th class="btn-actions-header">
              <button
                class="btn btn-sm btn-outline-dark btn-edit"
                :disabled="selectedIds.length !== 1"
                @click="editTransactionHandler"
              >
                수정
              </button>
              <button
                class="btn btn-sm btn-outline-dark btn-delete"
                :disabled="selectedIds.length === 0"
                @click="deleteTransactionHandler"
              >
                삭제
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in paginatedTransactions"
            :key="item.id"
            class="clickable-row"
            @mousedown="onRowMouseDown"
            @click="onRowClick(item.id, $event)"
          >
            <td>
              <input
                type="checkbox"
                class="form-check-input"
                :checked="selectedIds.includes(item.id)"
                @change="toggleItem(item.id)"
              />
            </td>
            <td class="text-center">
              <span
                class="badge"
                :class="
                  item.type === 'income' ? 'badge-income' : 'badge-expense'
                "
              >
                {{ item.type === 'income' ? '수입' : '지출' }}
              </span>
            </td>
            <td class="text-body-secondary">{{ formatDate(item.date) }}</td>
            <td>
              <img
                :src="store.getCategoryIcon(item.category)"
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

    <!-- 페이지네이션 -->
    <nav class="pagination-nav" aria-label="페이지 네비게이션">
      <button
        class="page-btn"
        :disabled="currentPage === 1"
        @click="goToPage(currentPage - 1)"
      >
        &lt;
      </button>
      <button
        v-for="page in totalPages"
        :key="page"
        class="page-btn"
        :class="{ active: currentPage === page }"
        @click="goToPage(page)"
      >
        {{ page }}
      </button>
      <button
        class="page-btn"
        :disabled="currentPage === totalPages"
        @click="goToPage(currentPage + 1)"
      >
        &gt;
      </button>
    </nav>
    <AddTransactionModal
      :isOpen="isModalOpen"
      @close="isModalOpen = false"
      @saved="isModalOpen = false"
    />
    <ModifyTransactionModal
      :isOpen="isModifyModalOpen"
      :transaction="selectedTransaction"
      @close="isModifyModalOpen = false"
      @saved="isModifyModalOpen = false"
    />
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, computed } from 'vue';
import { useTransactionStore } from '@/stores/transactions';
import AddTransactionModal from '@/components/common/AddTransactionModal.vue';
import FilterTransactionsModal from '@/components/transactions/FilterTransactionsModal.vue';
import ModifyTransactionModal from '@/components/common/ModifyTransactionModal.vue';

const store = useTransactionStore();

// ───────────────────────────────
// UI 전용 로컬 상태
// ───────────────────────────────
const isModalOpen = ref(false);
const isModifyModalOpen = ref(false);
const selectedTransaction = ref(null);
const showFilterModal = ref(false);
const selectedIds = ref([]);
const currentPage = ref(1);

// 화면 크기에 따라 페이지당 항목 수 조정 (모바일 5건 / 데스크톱 9건)
const isMobile = ref(false);
let mobileMediaQuery = null;

function updateIsMobile(e) {
  isMobile.value = e.matches;
  // 페이지 수가 줄어들면 현재 페이지 보정
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value;
  }
}

const ITEMS_PER_PAGE = computed(() => (isMobile.value ? 5 : 9));

// ───────────────────────────────
// 검색
// ───────────────────────────────
function applySearch() {
  currentPage.value = 1;
  selectedIds.value = [];
}

// ───────────────────────────────
// 필터
// ───────────────────────────────
function toggleFilter() {
  showFilterModal.value = true;
}

function handleFilterApply(filterData) {
  store.applyFilter(filterData);
  showFilterModal.value = false;
  currentPage.value = 1;
  selectedIds.value = [];
}

// ───────────────────────────────
// 모달
// ───────────────────────────────
function openAddModal() {
  isModalOpen.value = true;
}

// ───────────────────────────────
// 페이지네이션
// ───────────────────────────────
const totalPages = computed(() =>
  Math.max(
    1,
    Math.ceil(store.filteredTransactions.length / ITEMS_PER_PAGE.value)
  )
);

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE.value;
  return store.filteredTransactions.slice(start, start + ITEMS_PER_PAGE.value);
});

function goToPage(page) {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  selectedIds.value = [];
}

// ───────────────────────────────
// 체크박스 (현재 페이지 기준)
// ───────────────────────────────
const isAllChecked = computed(() => {
  if (paginatedTransactions.value.length === 0) return false;
  return paginatedTransactions.value.every((item) =>
    selectedIds.value.includes(item.id)
  );
});

function toggleAll() {
  const pageIds = paginatedTransactions.value.map((t) => t.id);
  if (isAllChecked.value) {
    selectedIds.value = selectedIds.value.filter((id) => !pageIds.includes(id));
  } else {
    const newIds = pageIds.filter((id) => !selectedIds.value.includes(id));
    selectedIds.value.push(...newIds);
  }
}

// 행 클릭으로 체크박스 토글 (드래그/텍스트 선택 시 무시)
let mouseDownPos = { x: 0, y: 0 };

function onRowMouseDown(e) {
  mouseDownPos = { x: e.clientX, y: e.clientY };
}

function onRowClick(id, e) {
  if (e.target.type === 'checkbox') return;

  const dx = Math.abs(e.clientX - mouseDownPos.x);
  const dy = Math.abs(e.clientY - mouseDownPos.y);
  if (dx > 5 || dy > 5) return;

  const selection = window.getSelection();
  if (selection && selection.toString().length > 0) return;

  toggleItem(id);
}

function toggleItem(id) {
  const idx = selectedIds.value.indexOf(id);
  if (idx !== -1) {
    selectedIds.value.splice(idx, 1);
  } else {
    selectedIds.value.push(id);
  }
}

// 카드 클릭 (모바일)
function onCardClick(id, e) {
  // 체크박스 자체 클릭은 @click.stop으로 이미 차단됨
  if (e.target.type === 'checkbox') return;
  toggleItem(id);
}

// ───────────────────────────────
// 수정 / 삭제
// ───────────────────────────────
function editTransactionHandler() {
  if (selectedIds.value.length !== 1) return;
  const targetId = selectedIds.value[0];
  const target = store.transactions.find((t) => t.id === targetId);
  if (!target) return;
  selectedTransaction.value = target;
  isModifyModalOpen.value = true;
}

async function deleteTransactionHandler() {
  if (!confirm(`선택한 ${selectedIds.value.length}건을 삭제하시겠습니까?`))
    return;

  try {
    await store.deleteTransactions(selectedIds.value);
    selectedIds.value = [];
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value;
    }
  } catch (err) {
    alert('삭제 중 오류가 발생했습니다: ' + err.message);
  }
}

// ───────────────────────────────
// 포맷 유틸
// ───────────────────────────────
function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-');
  return `${y}년 ${parseInt(m)}월 ${parseInt(d)}일`;
}

function formatAmount(item) {
  const sign = item.type === 'expense' ? '-' : '';
  return `${sign}₩${item.amount.toLocaleString()}`;
}

// ───────────────────────────────
// 초기 데이터 로드
// ───────────────────────────────
onMounted(() => {
  store.fetchTransactions();
  mobileMediaQuery = window.matchMedia('(max-width: 767px)');
  isMobile.value = mobileMediaQuery.matches;
  mobileMediaQuery.addEventListener('change', updateIsMobile);
});

onBeforeUnmount(() => {
  if (mobileMediaQuery) {
    mobileMediaQuery.removeEventListener('change', updateIsMobile);
  }
  store.resetFilter();
});
</script>

<style scoped>
.transactions-page {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 61px);
}

/* ===== 헤더 영역 ===== */
.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin: 1rem 0 1rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.asset-info {
  font-size: 0.9rem;
  color: #555;
  font-weight: 500;
  white-space: nowrap;
  margin-right: 4px;
}

.search-input {
  width: 160px;
  height: 38px;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 0 12px;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;
}
.search-input:focus {
  border-color: #ffbc00;
}

.btn-action {
  height: 38px;
  padding: 0 20px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid #ddd;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-search {
  background-color: #ffbc00;
  border-color: #ffbc00;
  color: #545045;
}
.btn-search:hover {
  background-color: #ffd24d;
  border-color: #ffd24d;
}

.btn-filter {
  background-color: #fff;
  color: #545045;
}
.btn-filter:hover {
  background-color: #f5f5f5;
  border-color: #bbb;
}

.btn-add {
  background-color: #ffbc00;
  border-color: #ffbc00;
  color: #545045;
  border-radius: 20px;
  padding: 0 24px;
}
.btn-add:hover {
  background-color: #ffd24d;
  border-color: #ffd24d;
}

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
.table-area {
  flex: 1;
}

.transactions-table {
  table-layout: fixed;
  width: 100%;
}

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

.clickable-row {
  cursor: pointer;
}

/* 체크박스 */
.checkbox-header {
  width: 40px;
}

/* 선택삭제/수정 버튼 헤더 */
.btn-actions-header {
  width: 110px;
}
.btn-actions-header button + button {
  margin-left: 4px;
}
.btn-edit {
  font-size: 0.72rem;
  font-weight: 600;
  color: #6d6d6d;
  border-color: #aeaeae;
  transition: all 0.2s ease;
}
.btn-edit:not(:disabled) {
  background-color: #ffbc00;
  border-color: #ffbc00;
  color: #545045;
}
.btn-edit:not(:disabled):hover {
  background-color: #ffd24d;
  border-color: #ffd24d;
}
.btn-delete {
  font-size: 0.72rem;
  font-weight: 600;
  color: #6d6d6d;
  border-color: #aeaeae;
  transition: all 0.2s ease;
}
.btn-delete:not(:disabled) {
  background-color: #e06060;
  border-color: #e06060;
  color: #fff;
}
.btn-delete:not(:disabled):hover {
  background-color: #e87c7c;
  border-color: #e87c7c;
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

/* 페이지네이션 */
.pagination-nav {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin: 24px 0 16px;
}

.page-btn {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  color: #555;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.page-btn:hover:not(:disabled):not(.active) {
  background: #f5f5f5;
  border-color: #bbb;
}

.page-btn.active {
  background: #ffbc00;
  border-color: #ffbc00;
  color: #545045;
  font-weight: 700;
}

.page-btn:disabled {
  opacity: 0.35;
  cursor: default;
}

/* ===== 모바일 카드 리스트 ===== */
.card-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.transaction-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 14px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.transaction-card:hover {
  background-color: #fffdf5;
}

.transaction-card.selected {
  border-color: #ffbc00;
  background-color: #fffaeb;
}

.card-checkbox {
  flex-shrink: 0;
  margin: 0;
}

.card-icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  object-fit: contain;
}

.card-body-info {
  flex: 1;
  min-width: 0;
}

.card-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.card-category {
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
}

.card-date {
  font-size: 0.75rem;
  color: #888;
}

.card-memo {
  font-size: 0.78rem;
  color: #999;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-amount {
  font-size: 1rem;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}

.card-empty {
  text-align: center;
  color: #999;
  font-size: 0.9rem;
  padding: 40px 0;
}

/* ===== 모바일 액션 바 ===== */
.mobile-action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  margin-bottom: 12px;
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 10px;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.mobile-action-bar.is-active {
  background: #fffaeb;
  border-color: #ffe9a8;
}

.select-all-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  margin: 0;
}

.selected-count {
  font-size: 0.85rem;
  font-weight: 600;
  color: #545045;
}

.mobile-action-buttons {
  display: flex;
  gap: 6px;
}

.mobile-action-buttons .btn-edit,
.mobile-action-buttons .btn-delete {
  font-size: 0.75rem;
  padding: 0.35rem 0.9rem;
  border-radius: 6px;
  border: 1px solid;
}

.mobile-action-buttons .btn-edit {
  background-color: #ffbc00;
  border-color: #ffbc00;
  color: #545045;
}
.mobile-action-buttons .btn-edit:disabled {
  background-color: #f0f0f0;
  border-color: #ddd;
  color: #aaa;
}

.mobile-action-buttons .btn-delete {
  background-color: #e06060;
  border-color: #e06060;
  color: #fff;
}
.mobile-action-buttons .btn-delete:disabled {
  background-color: #f0f0f0;
  border-color: #ddd;
  color: #aaa;
}

/* ===== 반응형: 헤더 영역 ===== */

/* 태블릿 (≤ 991px) */
@media (max-width: 991px) {
  .transactions-page h1 {
    font-size: 1.6rem !important;
    margin-top: 0.25rem !important;
    margin-bottom: 0.25rem !important;
  }

  .header-actions {
    gap: 8px;
  }

  .search-input {
    width: 140px;
    height: 36px;
  }

  .btn-action {
    height: 36px;
    padding: 0 16px;
    font-size: 0.8rem;
  }

  .btn-add {
    padding: 0 18px;
  }

  .transactions-table thead th,
  .transactions-table tbody td {
    font-size: 0.8rem;
    padding: 0.6rem 0.4rem;
  }

  .transactions-table thead th {
    font-size: 0.9rem;
  }
}

/* 모바일 (≤ 767px) */
@media (max-width: 767px) {
  .header-row {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    margin: 0.25rem 0 0.5rem;
  }

  .transactions-page h1 {
    font-size: 1.4rem !important;
    margin-top: 0rem !important;
    margin-bottom: 0rem !important;
  }

  .header-actions {
    flex-wrap: wrap;
    gap: 6px;
    width: 100%;
  }

  .asset-info {
    flex-basis: 100%;
    font-size: 0.8rem;
    white-space: normal;
    margin-bottom: 4px;
  }

  .search-input {
    flex: 1 1 0;
    min-width: 0;
    width: auto;
    max-width: 140px;
    height: 34px;
    font-size: 0.78rem;
    padding: 0 10px;
  }

  .btn-action {
    flex-shrink: 0;
    padding: 0 12px;
    height: 34px;
    font-size: 0.75rem;
  }

  .btn-add {
    padding: 0 14px;
  }

  /* 페이지네이션: 위아래 여백 확대 */
  .pagination-nav {
    gap: 4px;
    margin: 28px 0 24px;
    flex-wrap: wrap;
  }

  .page-btn {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }
}
</style>
