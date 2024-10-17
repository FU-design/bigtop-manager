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

import { RouteRecordRaw } from 'vue-router'
import pageView from '@/layouts/index.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/clusterMange/',
    component: pageView,
    redirect: '/clusterMange/cluster',
    meta: {
      title: '集群管理'
    },
    children: [
      {
        path: '/clusterMange/cluster/',
        redirect: '/clusterMange/cluster/stack',
        meta: {
          title: '集群管理'
        },
        children: [
          {
            path: 'stack',
            component: () =>
              import('@/pages/clusterMange/cluster/stack/index.vue'),
            meta: {
              title: 'Stack'
            }
          },
          {
            path: 'account',
            component: () =>
              import('@/pages/clusterMange/cluster/account/index.vue'),
            meta: {
              title: 'Account'
            }
          }
        ]
      }
    ]
  }
]

export { routes }
