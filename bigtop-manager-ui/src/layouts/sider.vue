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
  import { toRefs, ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { RouteExceptions } from '@/enums'
  import { useMenuStore } from '@/store/menu'
  import type { MenuItem } from '@/store/menu/types'
  import type { ClusterStatusType } from '@/api/cluster/types'

  interface Props {
    siderMenuSelectedKey: string
    siderMenus: MenuItem[]
  }

  const props = withDefaults(defineProps<Props>(), {
    siderMenuSelectedKey: ''
  })

  const { siderMenuSelectedKey } = toRefs(props)
  const router = useRouter()
  const menuStore = useMenuStore()
  const menus = ref<MenuItem[]>([])
  const emits = defineEmits(['onSiderClick'])
  const clusterStatus = ref<Record<ClusterStatusType, string>>({
    1: 'success',
    2: 'error',
    3: 'warning'
  })

  watch(
    () => props.siderMenus,
    (val) => {
      menus.value = []
      menus.value = val
    },
    {
      deep: true
    }
  )

  const toggleActivatedIcon = (menuItem: MenuItem) => {
    const { key, icon } = menuItem
    if (menuStore.isDynamicRouteMatched) {
      return key === RouteExceptions.SPECIAL_ROUTE_PATH ? `${icon}_activated` : icon
    } else {
      return key === siderMenuSelectedKey.value ? `${icon}_activated` : icon
    }
  }

  const addCluster = () => {
    router.push({ name: 'CreateCluster' })
  }

  const onSiderClick = ({ key }: any) => {
    emits('onSiderClick', key)
  }
</script>

<template>
  <a-layout-sider class="sider">
    <a-menu :selected-keys="[siderMenuSelectedKey]" mode="inline" @select="onSiderClick">
      <template v-for="menuItem in menus" :key="menuItem.key">
        <a-sub-menu
          v-if="menuItem.children && menuItem.name === RouteExceptions.SPECIAL_ROUTE_NAME"
          :key="menuItem.key"
        >
          <template #icon>
            <svg-icon style="height: 16px; width: 16px" :name="toggleActivatedIcon(menuItem)" />
          </template>
          <template #title>
            <span>{{ $t(menuItem.label) }}</span>
          </template>
          <a-menu-item v-for="child in menuItem.children" :key="child.key">
            <template #icon>
              <div
                style="height: 10px; margin-inline: 7px; display: flex; justify-content: center; align-items: flex-end"
              >
                <status-dot :size="8" :color="clusterStatus[child.status as ClusterStatusType] as any" />
              </div>
            </template>
            <div>
              <span>{{ child.label }}</span>
            </div>
          </a-menu-item>
        </a-sub-menu>
        <template v-else>
          <a-menu-item :key="menuItem.key">
            <template #icon>
              <svg-icon style="height: 16px; width: 16px" :name="toggleActivatedIcon(menuItem)" />
            </template>
            <span>{{ $t(menuItem.label) }}</span>
          </a-menu-item>
        </template>
      </template>
    </a-menu>
    <div v-show="menuStore.isCreateClusterVisible">
      <a-divider />
      <div class="create-option">
        <a-button type="primary" ghost @click="addCluster">
          <div>
            <label>{{ $t('menu.create') }}</label>
          </div>
        </a-button>
      </div>
    </div>
  </a-layout-sider>
</template>

<style scoped lang="scss">
  @mixin reset-sider-menu {
    width: 100%;
    border-radius: 0;
    padding: 0 0 0 14px !important;
    margin: 4px 0 0 0 !important;
  }
  .sider {
    width: $layout-header-height;
    background: $layout-sider-bg-color;
    overflow: auto;

    :deep(.ant-menu-submenu-title) {
      @include reset-sider-menu();
    }

    :deep(.ant-menu-item) {
      @include reset-sider-menu();
    }

    :deep(.ant-menu-item-selected) {
      border-right: 2px solid $color-primary;
    }

    .create-option {
      width: 100%;
      display: flex;
      justify-content: center;
      padding-bottom: $space-lg;
      button {
        width: 160px;
        @include flexbox($align: center, $justify: center);
        label {
          cursor: pointer;
        }
      }
    }
  }
</style>
