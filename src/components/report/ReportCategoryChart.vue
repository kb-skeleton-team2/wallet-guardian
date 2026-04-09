<template>
  <div class="chart-wrapper">
    <Doughnut :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Doughnut } from 'vue-chartjs';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  elements,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const emit = defineEmits(['select-category']);
const props = defineProps({
  expenseByCategory: {
    type: Array,
    required: true,
  },
});

const chartData = computed(() => {
  return {
    labels: props.expenseByCategory.map((item) => item.category),
    datasets: [
      {
        data: props.expenseByCategory.map((item) => item.amount),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#8DD17E',
          '#C9CBCF',
        ],
        borderWidth: 1,
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  onClick: (event, elements) => {
    if (!elements.length) return;

    const clickedIndex = elements[0].index;
    const clickedCategory = props.expenseByCategory[clickedIndex].category;
    emit('select-category', clickedCategory);
  },
  plugins: {
    legend: {
      position: 'right',
    },
  },
};
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  max-width: 600px;
  height: 320px;
}
</style>
