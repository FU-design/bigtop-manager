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

import dayjs from 'dayjs'
import * as ai from '@/api/ai-assistant/index'
import { defineStore, storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { SenderType } from '@/api/ai-assistant/types'
import { getRandomFromTimestamp } from '@/utils/tools'
import { useLlmConfigStore } from '../llm-config'
import type { AxiosProgressEvent, Canceler } from 'axios'
import type { ChatMessageItem, ChatThread, ThreadId } from '@/api/ai-assistant/types'

export const useAiChatStore = defineStore(
  'ai-assistant',
  () => {
    const llmConfigStore = useLlmConfigStore()
    const { currAuthPlatform } = storeToRefs(llmConfigStore)

    const currThread = ref<ChatThread>({})
    const threads = ref<ChatThread[]>([])
    const chatRecords = ref<ChatMessageItem[]>([])
    const canceler = ref<Canceler>()
    const messageReceiver = ref('')
    const isSending = ref(false)
    const loadingChatRecords = ref(false)

    const threadLimit = computed(() => threads.value.length >= 10)

    watch(currAuthPlatform, (val, oldVal) => {
      if (val == undefined) {
        currThread.value = {}
      } else if (val.llmConfigId !== oldVal?.llmConfigId) {
        currThread.value = {}
      }
    })

    const resetState = () => {
      currThread.value = {}
      threads.value = []
      messageReceiver.value = ''
      isSending.value = false
      loadingChatRecords.value = false
    }

    const createChatThread = async () => {
      const tempName = `thread-${getRandomFromTimestamp()}`
      const data = await ai.createChatThread({ id: null, name: tempName })
      getThread(data.threadId as ThreadId)
      getThreadsFromAuthPlatform()
    }

    const updateChatThread = async (thread: ChatThread, newName: string) => {
      try {
        const threadId = thread.threadId as ThreadId
        await ai.updateThread(threadId, { name: newName })
        return true
      } catch (error) {
        return false
      }
    }

    const deleteChatThread = async (thread: ChatThread) => {
      try {
        const threadId = thread.threadId as ThreadId
        await ai.deleteThread(threadId)
        return true
      } catch (error) {
        return false
      }
    }

    const getThread = async (threadId: ThreadId) => {
      try {
        const data = await ai.getThread(threadId)
        currThread.value = data
        getThreadRecords()
      } catch (error) {
        console.log('error :>> ', error)
      }
    }

    const getThreadsFromAuthPlatform = async () => {
      try {
        const data = await ai.getThreadsFromAuthPlatform()
        threads.value = data
      } catch (error) {
        console.log('error :>> ', error)
      }
    }

    const getThreadRecords = async () => {
      try {
        loadingChatRecords.value = true
        const { threadId } = currThread.value
        const data = await ai.getThreadRecords(threadId as ThreadId)
        chatRecords.value = data
      } catch (error) {
        console.log('error :>> ', error)
      } finally {
        loadingChatRecords.value = false
      }
    }

    const talkWithChatbot = async (message: string) => {
      try {
        const { threadId } = currThread.value
        isSending.value = true
        if (threadId) {
          const { cancel, promise } = ai.talkWithChatbot(threadId, { message }, onMessageReceive)
          canceler.value = cancel
          return promise.then(onMessageComplete)
        }
      } catch (error) {
        isSending.value = false
        console.log('error :>> ', error)
      }
    }

    const collectReceiveMessage = async (message: string) => {
      try {
        const res = await talkWithChatbot(message)
        setChatRecordForSender('AI', res?.message || '')
      } catch (error) {
        console.log('error :>> ', error)
      }
    }

    const onMessageReceive = ({ event }: AxiosProgressEvent) => {
      messageReceiver.value = event.target.responseText
        .split('data:')
        .map((s: string) => {
          return s.trimEnd()
        })
        .join('')
    }

    const onMessageComplete = () => {
      const formatResultMsg = messageReceiver.value
      messageReceiver.value = ''
      cancelSseConnect()
      isSending.value = false
      return Promise.resolve({ message: formatResultMsg, state: true })
    }

    const cancelSseConnect = () => {
      if (!canceler.value) {
        return
      }
      canceler.value()
    }

    const setChatRecordForSender = async (sender: SenderType, message: string) => {
      chatRecords.value.push({
        sender,
        message,
        createTime: dayjs().format()
      })
    }

    return {
      currThread,
      threads,
      chatRecords,
      messageReceiver,
      isSending,
      loadingChatRecords,
      threadLimit,
      talkWithChatbot,
      createChatThread,
      updateChatThread,
      deleteChatThread,
      getThread,
      getThreadsFromAuthPlatform,
      cancelSseConnect,
      getThreadRecords,
      setChatRecordForSender,
      collectReceiveMessage,
      resetState
    }
  },
  {
    persist: {
      storage: localStorage,
      paths: ['currThread']
    }
  }
)