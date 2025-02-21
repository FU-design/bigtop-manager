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

import { defineStore } from 'pinia'
import { dynamicRoutes as dr } from '@/router/routes/index'
import { ref, shallowRef } from 'vue'
import type { MenuItem } from './types'
import { useRouter, type RouteRecordRaw } from 'vue-router'
import type { MenuProps } from 'ant-design-vue'

export const useMenuStoreTemp = defineStore(
  'menu-temp',
  () => {
    const router = useRouter()
    const headerMenus = shallowRef<MenuItem[]>([])
    const siderMenus = ref<MenuItem[]>([])
    const headerSelectedKeys = ref<MenuProps['selectedKeys']>([])
    const siderMenuSelectedKeys = ref<MenuProps['selectedKeys']>([])
    const isClusterCreateVisible = ref(true)

    const generateMenuItemFromRoute = (route: RouteRecordRaw): MenuItem => {
      const menuItem: MenuItem = {
        icon: route.meta?.icon || '',
        key: route.path,
        label: route.meta?.title || '',
        title: route.meta?.title || '',
        hidden: route.meta?.hidden,
        isDynamic: route.meta?.isDynamic,
        name: (route.name as string) || '',
        children: []
      }
      if (route.children && route.children.length > 0) {
        menuItem.children = route.children.map((child) => generateMenuItemFromRoute(child))
      }
      return menuItem
    }

    const initHeaderMenus = () => {
      const filterRoutes = dr.filter((v) => v.meta?.title && !v.meta.hidden)
      headerMenus.value = filterRoutes.map((v) => generateMenuItemFromRoute(v))
      headerSelectedKeys.value = [headerMenus.value[0].key]
      initSiderMenus()
    }

    const initSiderMenus = () => {
      if (!headerSelectedKeys.value) {
        return
      }
      const key = headerSelectedKeys.value[0] as string
      const data = headerMenus.value.find((v) => v.key === key)?.children
      siderMenus.value = data || []
      siderMenuSelectedKeys.value = [siderMenus.value[0].key]
      router.push({ path: key })
    }

    const onHeaderClick = () => {
      initSiderMenus()
    }

    const onSiderClick = (key: string) => {
      siderMenuSelectedKeys.value = [siderMenus.value[0].key]
      router.push({ path: key })
    }

    const setUpMenu = () => {
      initHeaderMenus()
      initSiderMenus()
    }
    return {
      headerMenus,
      siderMenus,
      headerSelectedKeys,
      siderMenuSelectedKeys,
      isClusterCreateVisible,
      setUpMenu,
      onHeaderClick,
      onSiderClick,
      generateMenuItemFromRoute
    }
  },
  {
    persist: {
      storage: window.localStorage,
      paths: ['headerMenus']
    }
  }
)
