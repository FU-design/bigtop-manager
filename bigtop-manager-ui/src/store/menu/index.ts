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

import { computed, ref, watchPostEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { dynamicRoutes as dr } from '@/router/routes/index'
import { defineStore, storeToRefs } from 'pinia'
import { useClusterStore } from '@/store/cluster/index'
import cloneDeep from 'lodash/cloneDeep'

import {
  DEFAULT_ROUTE_NAME,
  DYNAMIC_ROUTE_MATCH,
  SPECIAL_ROUTE_NAME,
  SPECIAL_ROUTE_PATH
} from '@/router/routes/modules/clusters'

export interface MenuItem {
  icon: string
  key: string
  label: string
  title: string
  name?: string
  activeMenu?: string
  children?: MenuItem[]
}

export const useMenuStore = defineStore(
  'menu',
  () => {
    const router = useRouter()
    const route = useRoute()
    const clusterStore = useClusterStore()
    const { clusters } = storeToRefs(clusterStore)

    const baseRoutesMap = ref<Map<string, MenuItem[]>>(new Map())
    const headerMenus = ref(dr.filter((v) => v.meta?.title && !v.meta.hidden))
    const headerSelectedKey = ref(headerMenus.value[0].path)

    const hasCluster = computed(() => clusters.value.length > 0)
    const isClusterCreateVisible = computed(() =>
      SPECIAL_ROUTE_PATH.includes(route.matched[0].path)
    )
    const isDynamicRouteMatched = computed(() => {
      return route.matched.at(-1)?.path.includes(DYNAMIC_ROUTE_MATCH)
    })
    const siderMenus = computed((): MenuItem[] => {
      const siderMenuTemplate =
        baseRoutesMap.value.get(headerSelectedKey.value) || []
      const formatSider = cloneDeep(siderMenuTemplate)
      if (hasCluster.value) {
        updateSiderItemByClusters(formatSider as MenuItem[])
      }
      return formatSider
    })
    const siderMenuSelectedKey = ref(findActivePath(siderMenus.value[0]))

    watchPostEffect(() => {
      // resolve highlight menu
      const activeMenu = route.meta.activeMenu || route.path
      const matchedNames = [SPECIAL_ROUTE_NAME, DEFAULT_ROUTE_NAME]
      headerSelectedKey.value = route.matched[0].path

      if (matchedNames.includes(route.name as string)) {
        if (hasCluster.value && isDynamicRouteMatched.value) {
          siderMenuSelectedKey.value = findActivePath(siderMenus.value[0])
        } else {
          siderMenuSelectedKey.value = activeMenu
          redirectRouterToDefault()
        }
      } else {
        if (!activeMenu || (isDynamicRouteMatched.value && !hasCluster.value)) {
          redirectRouterToDefault()
          return
        }
        siderMenuSelectedKey.value = activeMenu
      }
    })

    function redirectRouterToDefault() {
      siderMenuSelectedKey.value = ''
      router.replace({ name: DEFAULT_ROUTE_NAME })
    }

    function updateSiderItemByClusters(formatSider: MenuItem[]) {
      formatSider.forEach((item) => {
        if (item.name == SPECIAL_ROUTE_NAME) {
          item.children = clusters.value.map((v) => {
            return {
              icon: '',
              key: `${item.key}/${v.clusterName}/${v.id}`,
              label: v.clusterName,
              title: v.clusterName,
              activeMenu: item.key
            }
          })
        }
      })
    }

    function formatRouteToMenu(tree: any[], upPath = ''): MenuItem[] {
      return tree
        .filter(({ meta }) => !meta?.hidden)
        .map(({ path, name, meta, children }) => {
          const fullPath = `${upPath}${path}`
          return {
            icon: meta.icon,
            key: fullPath,
            label: meta.title || '',
            title: meta.title || '',
            name: name || '',
            children:
              children && children.length > 0
                ? formatRouteToMenu(children, fullPath)
                : []
          }
        })
    }

    function setBaseRoutesMap() {
      dr.forEach((route) => {
        if (!route.meta?.hidden) {
          const exist = baseRoutesMap.value.get(route.path) || []
          baseRoutesMap.value.set(route.path, [
            ...exist,
            ...formatRouteToMenu(route.children || [], route.path)
          ])
        }
      })
    }

    function findActivePath(menu: MenuItem): string {
      return menu?.children && menu?.children.length > 0
        ? findActivePath(menu.children[0])
        : menu?.key
    }

    function onHeaderClick(key: string) {
      headerSelectedKey.value = key
      if (!hasCluster.value && route.name == SPECIAL_ROUTE_NAME) {
        return
      }
      siderMenuSelectedKey.value = findActivePath(siderMenus.value[0])
      router.push(siderMenuSelectedKey.value)
    }

    function onSiderClick(key: string) {
      siderMenuSelectedKey.value = key
      router.push(key)
    }

    async function updateSiderMenu(isDelete = false) {
      isDelete
        ? await clusterStore.delCluster()
        : await clusterStore.addCluster()
      siderMenuSelectedKey.value =
        siderMenus.value[0].children?.at(-1)?.key || SPECIAL_ROUTE_PATH
      router.push(siderMenuSelectedKey.value)
    }

    return {
      headerMenus,
      siderMenus,
      headerSelectedKey,
      siderMenuSelectedKey,
      isClusterCreateVisible,
      isDynamicRouteMatched,
      setBaseRoutesMap,
      onHeaderClick,
      onSiderClick,
      updateSiderMenu
    }
  },
  {
    persist: false
  }
)
