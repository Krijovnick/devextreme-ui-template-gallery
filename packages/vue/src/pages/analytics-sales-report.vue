<template>
  <div class="view-wrapper">
    <analytics-toolbar>Sales Report</analytics-toolbar>

    <div class="cards">
      <sales-range-card
        :data="sales"
        class="sales-range-card"
        @range-changed="onRangeChanged"
      />
      <sales-by-range-card :data="salesByCategory" />
      <sales-performance-card
        :data="salesByDateAndCategory"
        :group-by-periods="groupByPeriods"
        :visual-range="visualRange"
        @performance-period-changed="performancePeriodChange"
      />
    </div>
  </div>
  <loading-panel :loading="loading" />
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { SelectionChangedEvent } from 'devextreme/ui/drop_down_button';
import { formatDate } from 'devextreme/localization';

import {
  getSalesByOrderDate,
  getSalesByCategory,
  getSales,
} from 'dx-template-gallery-data';
import {
  Sales,
  SalesByStateAndCity,
} from '@/types/analytics';
import { analyticsPanelItems } from '@/types/resource';
import LoadingPanel from '@/components/loading-panel.vue';
import AnalyticsToolbar from '@/components/analytics-toolbar.vue';
import SalesRangeCard from '@/components/sales-range-card.vue';
import SalesByRangeCard from '@/components/sales-by-range-card.vue';
import SalesPerformanceCard from '@/components/sales-performance-card.vue';

const sales = ref<Sales | null>(null);
const salesByDateAndCategory = ref<Sales | null>(null);
const salesByCategory = ref<SalesByStateAndCity | null>(null);

const visualRange = ref<[Date, Date]>([]);

const groupByPeriods = ['Day', 'Month'];

const loading = ref<boolean>(true);

const performancePeriodChange = async ({ item: period }: SelectionChangedEvent) => {
  loading.value = true;
  salesByDateAndCategory.value = await getSalesByOrderDate(period.toLowerCase());
  loading.value = false;
};

const onRangeChanged = async (dates: [Date, Date]) => {
  visualRange.value = dates;
  loading.value = true;
  salesByCategory.value = await getSalesByCategory(
    ...dates.map((date) => formatDate(date, 'yyyy-MM-dd')),
  );
  loading.value = false;
};

const loadData = async (groupBy: string) => {
  loading.value = true;
  const [startDate, endDate] = analyticsPanelItems[4].value.split('/');

  await Promise.all([
    getSales(startDate, endDate)
      .then((result: Sales) => { sales.value = result; }),
    getSalesByOrderDate(groupBy)
      .then((result: Sales) => { salesByDateAndCategory.value = result; }),
  ]).then(() => { loading.value = false; });
};

onMounted(() => {
  loadData(groupByPeriods[1].toLowerCase());
});
</script>

<style scoped lang="scss">
.view-wrapper {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 20px 16px 0 16px;
}

.cards  {
  display: grid;
  width: 100%;
  grid-gap: 20px;
  gap: 20px;
  grid-template-columns: repeat(1,100%);

  .sales-range-card :deep(.content) {
    height: auto;
  }
}

@media only screen and (max-width: 900px) {
  .view-wrapper .cards {
    grid-template-columns: repeat(1, 100%);
  }
}

@media only screen and (max-width: 400px) {
  .cards :deep(.card) {
    flex: 1 320px;
  }
}
</style>
