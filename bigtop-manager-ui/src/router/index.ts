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

import routes from './routes'
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { createRouterGuard } from './guard'
import { getClusterList } from '@/api/cluster'
import type { ClusterVO } from '@/api/cluster/types'

const router = createRouter({
  routes,
  history: createWebHistory(import.meta.env.VITE_APP_BASE)
})

createRouterGuard(router)

//  Add dynamic router
const addDynamicRouterByCluster = async () => {
  try {
    const clusters = await getClusterList()
    clusters.forEach((cluster: ClusterVO) => {
      if (!router.hasRoute(`${cluster.name}-${cluster.id}`)) {
        const dynamicRoute = createDynamicRoutesByCluster(cluster)
        router.addRoute('Clusters', dynamicRoute)
      }
    })
  } catch (error) {
    console.error('Failed to load dynamic routes:', error)
  }
}

// Create dynamic routes for cluster management
const createDynamicRoutesByCluster = (cluster: ClusterVO) => {
  return {
    name: `${cluster.name}-${cluster.id}`,
    path: `/cluster-manage/clusters/${cluster.name}/${cluster.id}`,
    component: () => import('@/pages/cluster-manage/cluster/index.vue'),
    meta: { title: cluster.name, isDynamic: true },
    props: true
  } as RouteRecordRaw
}

await addDynamicRouterByCluster()

console.log('object :>> ', router.getRoutes())
export default router
