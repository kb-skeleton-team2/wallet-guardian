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

    <!-- 거래 테이블 -->
    <TransactionTable
      :transactions="store.filteredTransactions"
      :all-transactions="store.transactions"
      :get-category-icon="store.getCategoryIcon"
      :reset-key="resetKey"
      @edit="handleEdit"
      @delete="handleDelete"
    />

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
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { useTransactionStore } from '@/stores/transactions';
import AddTransactionModal from '@/components/common/AddTransactionModal.vue';
import FilterTransactionsModal from '@/components/transactions/FilterTransactionsModal.vue';
import ModifyTransactionModal from '@/components/common/ModifyTransactionModal.vue';
import TransactionTable from '@/components/transactions/TransactionTable.vue';

const store = useTransactionStore();

const isModalOpen = ref(false);
const isModifyModalOpen = ref(false);
const selectedTransaction = ref(null);
const showFilterModal = ref(false);
const resetKey = ref(false);

function applySearch() {
  resetKey.value = !resetKey.value;
}

function toggleFilter() {
  showFilterModal.value = true;
}

function handleFilterApply(filterData) {
  store.applyFilter(filterData);
  showFilterModal.value = false;
  resetKey.value = !resetKey.value;
}

function openAddModal() {
  isModalOpen.value = true;
}

function handleEdit(transaction) {
  selectedTransaction.value = transaction;
  isModifyModalOpen.value = true;
}

async function handleDelete(ids) {
  try {
    await store.deleteTransactions(ids);
  } catch (err) {
    alert('삭제 중 오류가 발생했습니다: ' + err.message);
  }
}

onMounted(() => {
  store.fetchTransactions();
});

onBeforeUnmount(() => {
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
}
</style>
