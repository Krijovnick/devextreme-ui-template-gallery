<template>
  <div class="view-wrapper">
    <analytics-toolbar
      :show-tabs="true"
      @tab-change="tabChange($event)"
    >
      Geography
    </analytics-toolbar>

    <sales-map-card :data="salesByStateMarkers" />

    <div class="cards">
      <revenue-analysis-card :data="salesByStateAndCity" />
      <revenue-snapshot-card :data="salesByState" />
    </div>
  </div>
  <loading-panel :loading="loading" />
</template>
<script setup lang="ts">
import { ref } from 'vue';
// eslint-disable-next-line import/no-unresolved
import { getSalesByStateAndCity, calcSalesByState } from 'dx-template-gallery-data';

import { SalesByState, SalesByStateAndCity } from '@/types/analytics';
import AnalyticsToolbar from '@/components/analytics-toolbar.vue';
import LoadingPanel from '@/components/loading-panel.vue';
import SalesMapCard from '@/components/sales-map-card.vue';
import RevenueAnalysisCard from '@/components/revenue-analysis-by-states-card.vue';
import RevenueSnapshotCard from '@/components/revenue-snapshot-by-states-card.vue';

const salesByState = ref<SalesByState | null>(null);
const salesByStateAndCity = ref<SalesByStateAndCity | null>(null);
const salesByStateMarkers = ref<Record<string, unknown> | null>(null);

const loading = ref<boolean>(true);

const createMapCoords = (coords: string) => coords.split(', ').map((coord) => parseFloat(coord));

const getSalesByStateMarkers = () => ({
  type: 'StateCollection',
  features: salesByState.value?.map((item: Record<string, unknown>) => ({
    type: 'State',
    geometry: {
      type: 'Point',
      coordinates: createMapCoords(item.stateCoords),
    },
    properties: {
      text: item.stateName,
      value: item.total,
      tooltip: `<b>${item.stateName}</b>\n${item.total}K`,
    },
  })),
});

const loadData = async (startDate: string, endDate: string) => {
  loading.value = true;
  salesByStateAndCity.value = await getSalesByStateAndCity(startDate, endDate);
  salesByState.value = await calcSalesByState(salesByStateAndCity.value);
  salesByStateMarkers.value = getSalesByStateMarkers();
  loading.value = false;
};

const tabChange = ([startDate, endDate]: string[]) => loadData(startDate, endDate);
</script>

<style scoped lang="scss">
.view-wrapper {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 20px 16px 0 16px;
}

.cards {
  display: grid;
  width: 100%;
  grid-gap: 20px;
  gap: 20px;
  grid-template-columns: repeat(2, calc(50% - 10px));
}

@media only screen and (max-width: 900px) {
  .view-wrapper .cards {
    grid-template-columns: repeat(1, 100%);
  }
}
</style>
