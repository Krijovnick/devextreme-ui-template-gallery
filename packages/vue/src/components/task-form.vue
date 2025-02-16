<template>
  <div id="task-form">
    <dx-toolbar v-if="!isCreateMode">
      <dx-toolbar-item location="before">
        <span class="dx-form-group-caption">Details</span>
      </dx-toolbar-item>
      <dx-toolbar-item
        location="after"
        locate-in-menu="after"
        :visible="!isEditing"
      >
        <dx-button
          text="Edit"
          icon="edit"
          styling-mode="outlined"
          type="default"
          @click="handleEditClick"
        />
      </dx-toolbar-item>
      <dx-toolbar-item
        location="after"
        locate-in-menu="after"
        :visible="isEditing"
      >
        <dx-button
          text="Save"
          styling-mode="outlined"
          type="default"
          @click="handleSaveClick"
        />
      </dx-toolbar-item>
      <dx-toolbar-item
        location="after"
        locate-in-menu="after"
        :visible="isEditing"
      >
        <dx-button
          text="Cancel"
          @click="handleCancelClick"
          styling-mode="text"
        />
      </dx-toolbar-item>
    </dx-toolbar>
    <load-component
      :is-loading="isLoading"
      :container-selector="'#task-form'"
      :has-data="!!props.data"
    >
      <dx-form
        :form-data="data"
        class="plain-styled-form"
        :class="{'view-mode': !isEditing}"
      >
        <dx-form-item
          v-if="isCreateMode"
          :col-span="2"
        >
          <form-textbox
            label="Subject"
            v-model="data.text"
            :is-editing="isEditing"
          />
        </dx-form-item>
        <dx-form-group-item :col-count="2">
          <dx-col-count-by-screen
            :xs="props.contentByScreen.xs"
            :sm="props.contentByScreen.sm"
            :md="2"
            :lg="2"
          />

          <dx-form-item css-class="accent">
            <form-textbox
              label="Company"
              v-model="data.company"
              :is-editing="isEditing"
            />
          </dx-form-item>

          <dx-form-item css-class="accent">
            <form-textbox
              label="Assigned to"
              v-model="data.owner"
              :is-editing="isEditing"
            />
          </dx-form-item>

          <dx-form-item>
            <dx-select-box
              label="Priority"
              v-model="data.priority"
              :items="taskPriorityList"
              :read-only="!isEditing"
              field-template="field"
              item-template="item"
              v-bind="formSelectBoxProps"
            >
              <template #field>
                <div class="task-editor-field">
                  <status-indicator
                    :is-field="true"
                    :show-bar="true"
                    :value="data.priority"
                  />
                </div>
              </template>
              <template #item="item">
                <status-indicator
                  :show-bar="true"
                  :value="item.data"
                />
              </template>
            </dx-select-box>
          </dx-form-item>

          <dx-form-item>
            <dx-select-box
              label="Status"
              v-model="data.status"
              :items="taskStatusList"
              :read-only="!isEditing"
              field-template="field"
              item-template="item"
              v-bind="formSelectBoxProps"
            >
              <template #field>
                <div class="task-editor-field">
                  <status-indicator
                    :is-field="true"
                    :value="data.status"
                  />
                </div>
              </template>
              <template #item="item">
                <status-indicator
                  :value="item.data"
                />
              </template>
            </dx-select-box>
          </dx-form-item>

          <dx-form-item>
            <form-datebox
              label="Start Date"
              v-model="data.startDate"
              :is-editing="isEditing"
            />
          </dx-form-item>

          <dx-form-item>
            <form-datebox
              label="Due Date"
              v-model="data.dueDate"
              :is-editing="isEditing"
            />
          </dx-form-item>
        </dx-form-group-item>
        <dx-form-item>
          <dx-text-area
            label="Details"
            styling-mode="filled"
            v-model="data.description"
          />
        </dx-form-item>
      </dx-form>
    </load-component>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue';
import StatusIndicator from '@/components/status-indicator.vue';
import { DxButton } from 'devextreme-vue/button';
import { DxTextArea } from 'devextreme-vue/text-area';
import {
  taskPriorityList, Task, taskStatusList,
} from '@/types/task';
import {
  DxToolbar,
  DxItem as DxToolbarItem,
} from 'devextreme-vue/toolbar';
import {
  DxForm,
  DxItem as DxFormItem,
  DxGroupItem as DxFormGroupItem,
  DxColCountByScreen,
} from 'devextreme-vue/form';
import { DxSelectBox } from 'devextreme-vue/select-box';
import { ClickEvent } from 'devextreme/ui/button';
import LoadComponent from '@/components/load-component.vue';
import FormTextbox from '@/components/form-textbox.vue';
import FormDatebox from '@/components/form-datebox.vue';
import { formSelectBoxProps } from '@/shared/form-editor-config';

const props = withDefaults(defineProps<{
  isCreateMode?: boolean,
  isLoading?: boolean,
  data?: Task,
  contentByScreen: { xs: number, sm: number },
  validationGroup?: string,
}>(), {
  data: undefined,
  isLoading: false,
  isCreateMode: false,
  validationGroup: undefined,
});

const isEditing = ref(props.isCreateMode);
const data = ref(props.data);

watch(
  () => props.data,
  (newValue) => {
    data.value = newValue;
  },
);

let dataSaved: Task;

function handleEditClick() {
  dataSaved = { ...data.value };
  isEditing.value = true;
}

function handleSaveClick({ validationGroup }: ClickEvent) {
  if (validationGroup.validate().isValid) {
    isEditing.value = false;
  }
}

function handleCancelClick() {
  if (dataSaved) {
    data.value = dataSaved;
  }

  isEditing.value = false;
}
</script>
<style scoped lang="scss">
@use "@/variables.scss" as *;

#task-form {
  min-height: 250px;

  .dx-toolbar {
    margin-bottom: $toolbar-margin-bottom;
  }
}
</style>
