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
  import { computed, onActivated, reactive, ref, toRefs, useAttrs } from 'vue'
  import { usePngImage } from '@/utils/tools'
  import useCreateService from './use-create-service'
  import type { ExpandServiceVO } from '@/store/stack'
  import { ComponentVO } from '@/api/component/types.ts'

  interface State {
    isAddableData: ExpandServiceVO[]
    selectedData: ExpandServiceVO[]
  }

  const { creationMode } = useAttrs()
  const searchStr = ref('')
  const state = reactive<State>({
    isAddableData: [],
    selectedData: []
  })
  const {
    clusterId,
    selectedServices,
    servicesOfInfra,
    servicesOfExcludeInfra,
    installedStore,
    confirmServiceDependencies,
    setDataByCurrent
  } = useCreateService()
  const { isAddableData } = toRefs(state)
  const checkSelectedServicesOnlyInstalled = computed(
    () => selectedServices.value.filter((v: ExpandServiceVO) => !v.isInstalled).length === 0
  )
  const filterAddableData = computed(() =>
    isAddableData.value.filter(
      (v) =>
        v.displayName?.toString().toLowerCase().includes(searchStr.value.toString().toLowerCase()) ||
        v.desc?.toString().toLowerCase().includes(searchStr.value.toString().toLowerCase())
    )
  )

  const insertByOrder = <T extends { order: number }>(array: T[], item: T) => {
    const index = findInsertIndex(array, item.order)
    array.splice(index, 0, item)
  }

  const moveItem = <T extends { name?: string; order: number }>(from: T[], to: T[], item: T, key: keyof T = 'name') => {
    const index = from.findIndex((v) => v[key] === item[key])
    if (index !== -1) {
      const [removedItem] = from.splice(index, 1)
      insertByOrder(to, removedItem)
    }
  }

  //  Binary search
  const findInsertIndex = <T extends { order: number }>(array: T[], order: number) => {
    let low = 0
    let high = array.length

    while (low < high) {
      const mid = (low + high) >>> 1
      if (array[mid].order < order) {
        low = mid + 1
      } else {
        high = mid
      }
    }
    return low
  }

  const handleInstallItem = (item: ExpandServiceVO, from: ExpandServiceVO[], to: ExpandServiceVO[]) => {
    item.components = item.components?.map((v) => ({ ...v, hosts: [] }))
    moveItem(from, to, item)
    setDataByCurrent(state.selectedData)
  }

  const addInstallItem = async (item: ExpandServiceVO) => {
    const items = await confirmServiceDependencies(item)
    if (items.length > 0) {
      items.forEach((i) => {
        handleInstallItem(i, state.isAddableData, state.selectedData)
      })
    }
  }

  const removeInstallItem = (item: ExpandServiceVO) => {
    handleInstallItem(item, state.selectedData, state.isAddableData)
  }

  const splitSearchStr = (splitStr: string) => {
    return splitStr.toString().split(new RegExp(`(?<=${searchStr.value})|(?=${searchStr.value})`, 'i'))
  }

  const mergeComponents = (components: ComponentVO[]) => {
    return Object.values(
      components.reduce((acc, item) => {
        const { name, hostname } = item
        if (!acc[name!]) {
          acc[name!] = {
            ...item,
            hosts: [{ hostname, name: hostname, displayName: hostname }]
          }
        } else {
          acc[name!].hosts.push({ hostname, name: hostname, displayName: hostname })
        }
        return acc
      }, {})
    )
  }

  const initInstalledServicesDetail = async () => {
    const detailRes = await installedStore.getInstalledServicesDetailByKey(`${clusterId.value}`)
    const detailMap = new Map<string, ExpandServiceVO>()
    if (!detailRes) {
      return detailMap
    } else {
      return detailRes.reduce(
        (pre, val) =>
          pre.set(val.name!, {
            ...val,
            components: mergeComponents(val.components || [])
          } as ExpandServiceVO),
        detailMap
      )
    }
  }

  const addInstalledSymbolForSelectedServices = async (onlyInstalled: boolean) => {
    if (onlyInstalled) {
      const installedServiceMap = await initInstalledServicesDetail()
      const installedServiceNames = installedStore.getInstalledNamesOrIdsOfServiceByKey(`${clusterId.value}`)
      const data = creationMode === 'internal' ? servicesOfExcludeInfra.value : servicesOfInfra.value
      data.forEach((v) => {
        if (installedServiceNames.includes(v.name || '')) {
          Object.assign(v, installedServiceMap.get(v.name!))
          v.isInstalled = true
          state.selectedData.push(v as ExpandServiceVO)
        } else {
          state.isAddableData.push(v as ExpandServiceVO)
        }
      })
      setDataByCurrent(state.selectedData)
    } else {
      state.selectedData = [...selectedServices.value]
    }
  }

  onActivated(async () => {
    await addInstalledSymbolForSelectedServices(checkSelectedServicesOnlyInstalled.value)
  })

  defineExpose({
    addInstallItem
  })
</script>

<template>
  <div class="service-selector">
    <div>
      <div class="list-title">
        <div>{{ $t('service.select_service') }}</div>
        <a-input v-model:value="searchStr" :placeholder="$t('service.please_enter_search_keyword')" />
      </div>
      <a-list item-layout="horizontal" :data-source="filterAddableData">
        <template #renderItem="{ item }">
          <a-list-item>
            <template #actions>
              <a-button type="primary" @click="addInstallItem(item)">{{ $t('common.add') }}</a-button>
            </template>
            <a-list-item-meta>
              <template #title>
                <div class="ellipsis item-name" :title="item.displayName">
                  <template v-for="(fragment, i) in splitSearchStr(item.displayName)">
                    <mark v-if="fragment.toLowerCase() === searchStr.toLowerCase()" :key="i" class="highlight">
                      {{ fragment }}
                    </mark>
                    <template v-else>{{ fragment }}</template>
                  </template>
                </div>
              </template>
              <template #description>
                <div class="ellipsis" :title="item.desc">
                  <template v-for="(fragment, i) in splitSearchStr(item.desc)">
                    <mark v-if="fragment.toLowerCase() === searchStr.toLowerCase()" :key="i" class="highlight">
                      {{ fragment }}
                    </mark>
                    <template v-else>{{ fragment }}</template>
                  </template>
                </div>
              </template>
              <template #avatar>
                <a-avatar
                  v-if="item.displayName"
                  :src="usePngImage(item.displayName.toLowerCase())"
                  :size="54"
                  class="header-icon"
                />
              </template>
            </a-list-item-meta>
          </a-list-item>
        </template>
      </a-list>
    </div>
    <a-divider type="vertical" class="divider" />
    <div>
      <div class="list-title">
        <div>{{ $t('service.pending_installation_services') }}</div>
      </div>
      <a-list item-layout="horizontal" :data-source="state.selectedData">
        <template #renderItem="{ item }">
          <a-list-item>
            <template #actions>
              <a-button danger :disabled="item.isInstalled" type="primary" @click="removeInstallItem(item)">
                {{ $t('common.remove') }}
              </a-button>
            </template>
            <a-list-item-meta>
              <template #title>
                <div class="ellipsis item-name" :data-tooltip="item.displayName">
                  {{ item.displayName }}
                </div>
              </template>
              <template #description>
                <div class="ellipsis" :data-tooltip="item.desc">
                  {{ item.desc }}
                </div>
              </template>
              <template #avatar>
                <a-avatar
                  v-if="item.displayName"
                  :src="usePngImage(item.displayName.toLowerCase())"
                  :size="54"
                  class="header-icon"
                />
              </template>
            </a-list-item-meta>
          </a-list-item>
        </template>
      </a-list>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .highlight {
    background-color: rgb(255, 192, 105);
    padding: 0px;
  }

  .item-name {
    font-size: 16px;
  }

  .service-selector {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    grid-template-rows: auto;
    justify-content: space-between;

    .list-title {
      display: flex;
      height: 32px;
      align-items: center;
      justify-content: space-between;
      font-weight: 500;
      border-bottom: 1px solid $color-border;
      padding-bottom: 16px;

      .ant-input {
        flex: 0 1 160px;
      }
    }

    .ant-list {
      max-height: 500px;
      overflow: auto;
    }
  }

  .divider {
    height: 100%;
    margin-inline: 16px;
  }

  :deep(.ant-avatar) {
    border-radius: 4px;

    img {
      object-fit: contain !important;
    }
  }
</style>
