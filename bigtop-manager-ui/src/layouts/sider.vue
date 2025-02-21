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
  import { computed, ref } from 'vue'
  import { storeToRefs } from 'pinia'
  import { RouteExceptions } from '@/enums'
  import { useRouter } from 'vue-router'
  import { useMenuStoreTemp } from '@/store/menu/menuStore'
  import type { MenuItem } from '@/store/menu/types'
  import type { ClusterStatusType } from '@/api/cluster/types'
  import type { MentionsProps } from 'ant-design-vue'

  const menuStoreTemp = useMenuStoreTemp()
  const { siderMenuSelectedKeys, siderMenus } = storeToRefs(menuStoreTemp)
  const data = computed(() => router.getRoutes().filter((v) => v.meta.isDynamic))

  const router = useRouter()
  const clusterStatus = ref<Record<ClusterStatusType, string>>({
    1: 'success',
    2: 'error',
    3: 'warning'
  })

  const toggleActivatedIcon = (menuItem: MenuItem) => {
    const { key, icon } = menuItem
    const selectedKey = siderMenuSelectedKeys.value ? siderMenuSelectedKeys.value[0] : ''
    if (menuItem.isDynamic) {
      return key === RouteExceptions.SPECIAL_ROUTE_PATH ? `${icon}_activated` : icon
    } else {
      return key === selectedKey ? `${icon}_activated` : icon
    }
  }

  const addCluster = () => {
    router.push({ name: 'ClusterCreate' })
  }

  const onSiderClick: MentionsProps['onSelect'] = ({ key }) => {
    menuStoreTemp.onSiderClick(key)
  }
</script>

<template>
  <a-layout-sider class="sider">
    <a-menu v-model:selected-keys="siderMenuSelectedKeys" mode="inline" @select="onSiderClick">
      <template v-for="menuItem in siderMenus" :key="menuItem.key">
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
          <template v-for="child in data.map((v) => menuStoreTemp.generateMenuItemFromRoute(v))" :key="child.key">
            <a-menu-item v-if="!child.hidden" :key="child.key">
              <template #icon>
                <div class="status-wrp">
                  <status-dot :size="8" :color="clusterStatus[child.status as ClusterStatusType] as any" />
                </div>
              </template>
              <div>
                <span>{{ child.label }}</span>
              </div>
            </a-menu-item>
          </template>
        </a-sub-menu>
        <template v-else>
          <a-menu-item v-if="!menuItem.hidden" :key="menuItem.key">
            <template #icon>
              <svg-icon style="height: 16px; width: 16px" :name="toggleActivatedIcon(menuItem)" />
            </template>
            <span>{{ $t(menuItem.label) }}</span>
          </a-menu-item>
        </template>
      </template>
    </a-menu>
    <div v-show="menuStoreTemp?.isClusterCreateVisible">
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

    .status-wrp {
      height: 10px;
      margin-inline: 7px;
      display: flex;
      justify-content: center;
      align-items: flex-end;
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
