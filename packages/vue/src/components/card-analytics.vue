<template>
  <div class="card-wrapper">
    <div
      class="card"
      :class="props.contentClass"
    >
      <div class="header">
        <card-menu
          :visible="props.isMenuVisible"
          class="overflow-menu"
          :items="menuItems"
        />
        <div
          v-if="props.title"
          class="title"
        >
          {{ props.title }}
        </div>
        <slot name="filter" />
      </div>
      <div
        v-if="showData"
        class="content"
      >
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CardMenu from '@/components/card-menu.vue';

const menuItems: Array<{ text: string }> = [
  { text: 'Configure' },
  { text: 'Remove' },
];

const props = withDefaults(defineProps<{
  title?: string,
  contentClass?: string,
  showData?: boolean,
  isMenuVisible?: boolean,
}>(), {
  title: '',
  showData: true,
  contentClass: '',
  isMenuVisible: true,
});

</script>

<style scoped lang="scss">
@use '@/variables.scss' as *;

.card {
  border-radius: 4px;
  box-shadow: none;
  position: relative;
  background-color: $background-color;
  border: 1px solid $border-color;
  overflow: hidden;

  .header {
    padding: $content-padding $content-padding 0;
  }

  .overflow-menu {
    position: absolute;
    right: 8px;
    left: auto;
    top: 10px;
  }

  :deep(.content) {
    padding: 0 $content-padding $content-padding;
    box-sizing: content-box;
    color: #757575;
    font-size: 14px;
    line-height: 17px;
    height: 270px;
  }

  :deep(.title) {
    color: $base-text-color;
    line-height: 19px;
    font-weight: 500;
    font-size: 16px;
    margin-bottom: 20px;
    display: inline-block;
    padding-right: 25px;
  }

  &.grid {
    .content {
      border-top: 1px solid $base-border-color;
      padding-left: 0;
      padding-right: 0;
    }
  }

}

@media only screen and (max-width: 900px) {
  .card .content {
    height: auto;
  }
}

@media only screen and (max-width: 400px) {
  .card {
    flex: 1 360px;

    .content {
      height: auto;
    }
  }
}
</style>
