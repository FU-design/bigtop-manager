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

export interface ChatbotConfig {
  authId?: string | number
  platformName?: string
  supportModels?: string
  model?: string
  threadId?: string | number
  threadName?: string
  createTime?: string
  updateTime?: string
}
export interface Platform {
  id: string | number
  platformId: string | number
  platformName: string
  supportModels: string
  currModel?: string
}

export type AuthorizedPlatform = Platform

export interface SupportedPlatform extends Platform {
  id: string | number
  name: string
  supportModels: string
}
export interface CredentialFormItem {
  name: string
  displayName: string
}
export interface ChatThreadCondition {
  authId: string | number
  model: string
}

export interface ChatThread extends ChatThreadCondition {
  threadId: string | number
  threadName: string
  createTime: string
  updateTime: string
}

export interface AuthCredential {
  key: string
  value: string
}

export interface AuthCredentialTestParams {
  platformId: string | number
  authCredentials: AuthCredential[]
}

export interface AuthTestResult {
  id: string | number
  platformId: string | number
  platformName: string
  supportModels: string
}

export type Sender = 'USER' | 'SYSTEM' | 'AI'
export interface ChatThreadHistoryItem {
  sender: Sender
  message: string
  createTime?: string
}

export interface ChatThreadHistoryCondition {
  authId: string | number
  threadId: string | number
}

export interface SendChatMessageCondition extends ChatThreadHistoryCondition {
  message: string
}

export type ChatThreadDelCondition = ChatThreadHistoryCondition
