<!--
  ~ Licensed to the Apache Software Foundation (ASF) under one
  ~ or more contributor license agreements.  See the NOTICE file
  ~ distributed with this work for additional information
  ~ regarding copyright ownership.  The ASF licenses this file
  ~ to you under the Apache License, Version 2.0 (the
  ~ "License"); you may not use this file except in compliance
  ~ with the License.  You may obtain a copy of the License at
  ~
  ~   http://www.apache.org/licenses/LICENSE-2.0
  ~
  ~ Unless required by applicable law or agreed to in writing,
  ~ software distributed under the License is distributed on an
  ~ "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  ~ KIND, either express or implied.  See the License for the
  ~ specific language governing permissions and limitations
  ~ under the License.
-->

<script setup lang="ts">
  import { ref } from 'vue'

  export type TabsProps = {
    key: number | string
    label: string
  }

  interface Props {
    tabsConfig?: TabsProps[]
  }

  const props = withDefaults(defineProps<Props>(), {
    tabsConfig: () => []
  })
  defineEmits(['onChange'])
  const activeKey = ref(props.tabsConfig[0]?.key || '')
</script>

<template>
  <a-card class="content-bottom">
    <slot>
      <a-tabs v-model:activeKey="activeKey" @change="$emit('onChange', $event)">
        <a-tab-pane
          v-for="{ key, label } in props.tabsConfig"
          :key="key"
          :tab="label"
        >
        </a-tab-pane>
      </a-tabs>
    </slot>
  </a-card>
</template>

<style lang="scss" scoped>
  .content-bottom {
    :deep(.ant-card-body) {
      padding: 0 $space-md $space-md !important;
      overflow: auto;
    }
  }
</style>
