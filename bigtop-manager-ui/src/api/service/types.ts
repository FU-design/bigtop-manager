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

export interface ServiceVO {
  id?: number
  serviceName: string
  displayName: string
  serviceDesc: string
  serviceVersion: string
  clusterName?: string
  serviceUser?: string
  serviceGroup?: string
  isClient?: boolean
  isHealthy?: boolean
  quickLinks?: QuickLinkVO[]
}

export interface QuickLinkVO {
  displayName: string
  url: string
}

export enum StateColor {
  Installed = '#2196F3',
  Started = '#52c41a',
  Maintained = '#d9d9d9',
  Uninstalled = '#f0f964',
  Stopped = '#ff4d4f'
}
