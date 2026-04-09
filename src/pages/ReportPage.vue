<template>
  <div>
    <h1>리포트 페이지</h1>

    <p>거래 개수: {{ transactions.length }}</p>

    <ul>
      <li v-for="item in transactions" :key="item.id">
        {{ item.date }} / {{ item.type }} / {{ item.category }} /
        {{ item.amount }}원
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const transactions = ref([]);

const fetchTransactions = async () => {
  try {
    const response = await axios.get(
      'http://localhost:3000/transactions?userId=1',
    );
    transactions.value = response.data;
    console.log('거래 데이터:', response.data);
  } catch (error) {
    console.error('거래 데이터 불러오기 실패:', error);
  }
};

onMounted(() => {
  fetchTransactions();
});
</script>
