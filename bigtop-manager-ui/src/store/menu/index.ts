/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { computed, nextTick, ref, shallowRef } from 'vue'
import { RouteRecordRaw, useRoute, useRouter } from 'vue-router'
import { dynamicRoutes as dr } from '@/router/routes/index'
import { defineStore } from 'pinia'
import { useClusterStore } from '../cluster'

export const useMenuStore = defineStore(
  'menu',
  () => {
    const router = useRouter()
    const route = useRoute()
    const clusterStore = useClusterStore()
    const baseRoutesMap = ref<Record<string, RouteRecordRaw>>({})
    const headerMenus = ref<RouteRecordRaw[]>([])
    const siderMenus = ref<RouteRecordRaw[]>([])
    const headerSelectedKey = ref()
    const siderMenuSelectedKey = ref()
    const routePathFromClusters = shallowRef('/cluster-manage/clusters')
    const clusterList = computed(() => Object.values(clusterStore.clusterMap))

    const buildMenuMap = () => {
      baseRoutesMap.value = dr.reduce((buildRes, { path, name, meta, children }) => {
        !meta?.hidden && (buildRes[path] = { path, name, meta, children })
        return buildRes
      }, {})
    }

    const setupHeader = () => {
      headerSelectedKey.value = route.matched[0].path ?? '/cluster-manage'
      headerMenus.value = Object.values(baseRoutesMap.value)
      siderMenus.value = baseRoutesMap.value[headerSelectedKey.value]?.children || []
    }

    const setupSider = () => {
      siderMenus.value = baseRoutesMap.value[headerSelectedKey.value]?.children || []
      if (siderMenus.value[0]?.redirect) {
        siderMenuSelectedKey.value = siderMenus.value[0].redirect
      } else {
        if (clusterList.value.length > 0) {
          const { id } = clusterList.value[0]
          onSiderClick(`${routePathFromClusters.value}/${id}`)
        } else {
          onSiderClick(`${routePathFromClusters.value}/default`)
        }
      }
    }

    const onHeaderClick = (key: string) => {
      headerSelectedKey.value = key
      router.push({ path: key })
      setupSider()
    }

    const onSiderClick = (key: string) => {
      router.push({ path: key })
    }

    const updateSider = async () => {
      await clusterStore.loadClusters()
      const { id } = clusterList.value[clusterList.value.length - 1]
      await nextTick()
      onSiderClick(`${routePathFromClusters.value}/${id}`)
    }

    const setupMenu = async () => {
      buildMenuMap()
      setupHeader()
      setupSider()
    }

    return {
      headerMenus,
      siderMenus,
      headerSelectedKey,
      siderMenuSelectedKey,
      routePathFromClusters,
      setupMenu,
      updateSider,
      onHeaderClick,
      onSiderClick
    }
  },
  {
    persist: {
      storage: localStorage,
      paths: ['headerMenus', 'siderMenus']
    }
  }
)
