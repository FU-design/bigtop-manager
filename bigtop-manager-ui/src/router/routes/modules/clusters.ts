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
    path: '/cluster-mange',
    component: pageView,
    redirect: '/cluster-mange/clusters',
    meta: {
      title: '集群管理'
    },
    children: [
      {
        name: 'Clusters',
        path: 'clusters',
        redirect: '',
        meta: {
          icon: 'clusters',
          title: '集群管理'
        },
        children: [
          {
            name: 'ClusterDetail',
            path: ':cluster/:id',
            component: () => import('@/pages/cluster-mange/cluster/index.vue'),
            meta: {
              hidden: true,
              title: '集群详情'
            }
          },
          {
            name: 'ClusterAdd',
            path: 'add',
            component: () => import('@/pages/cluster-mange/cluster/add.vue'),
            meta: {
              hidden: true,
              title: '新增集群'
            }
          }
        ]
      }
    ]
  }
]

export { routes }
