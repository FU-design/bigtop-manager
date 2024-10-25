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
  import ContentTop from '@/components/common/content-top/index.vue'
  import ContentBottom from '@/components/common/content-bottom/index.vue'
  import type { TabsProps } from '@/components/common/content-bottom/index.vue'

  const actions = [
    {
      key: 1,
      label: '启动集群'
    },
    {
      key: 2,
      label: '重启集群'
    },
    {
      key: 3,
      label: '停止集群'
    },
    {
      key: 4,
      label: '删除集群'
    }
  ]

  const tabsConfig: TabsProps[] = [
    {
      key: 1,
      label: '概率'
    },
    {
      key: 2,
      label: '服务'
    },
    {
      key: 3,
      label: '主机'
    },
    {
      key: 4,
      label: '用户'
    },
    {
      key: 5,
      label: '作业'
    }
  ]

  const onChange = (val: number | string) => {
    console.log('val :>> ', val)
  }
</script>

<template>
  <div class="cluster">
    <content-top>
      <template #actions>
        <a-button type="primary">添加服务</a-button>
        <a-dropdown>
          <template #overlay>
            <a-menu>
              <a-menu-item v-for="{ key, label } in actions" :key="key">
                {{ label }}
              </a-menu-item>
            </a-menu>
          </template>
          <a-button> 其他操作 </a-button>
        </a-dropdown>
      </template>
    </content-top>
    <content-bottom :tabs-config="tabsConfig" @on-change="onChange" />
  </div>
</template>

<style lang="scss" scoped>
  .cluster {
    @include flexbox($direction: column);
    gap: $space-md;
  }
</style>
