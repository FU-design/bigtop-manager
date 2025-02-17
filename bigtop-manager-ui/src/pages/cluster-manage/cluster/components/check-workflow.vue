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
  import { computed, onMounted, ref, shallowRef, toRefs } from 'vue'
  import type { JobVO, StateType } from '@/api/job/types'
  import { getJobDetails, retryJob } from '@/api/job'
  import { CommandVO } from '@/api/command/types'

  const props = defineProps<{ stepData: CommandVO }>()
  const emits = defineEmits(['updateData'])
  const { stepData } = toRefs(props)
  const activeKey = ref<number[]>([])
  const jobDetail = ref<JobVO>({})
  const spinning = ref(false)
  const status = shallowRef<Record<StateType, string>>({
    Pending: 'installing',
    Processing: 'processing',
    Failed: 'failed',
    Canceled: 'canceled',
    Successful: 'success'
  })
  const stages = computed(() => {
    if (jobDetail.value.stages) {
      return [...jobDetail.value.stages].sort((a, b) => a.order! - b.order!)
    }
    return []
  })

  const getJobInstanceDetails = async () => {
    const { id: jobId } = stepData.value
    if (jobId === undefined) {
      return true
    }
    try {
      const data = await getJobDetails({ jobId, clusterId: 0 })
      jobDetail.value = data
      activeKey.value = data.stages ? data.stages?.map((v) => v.id!) : []
      emits('updateData', { ...stepData.value, ...data })
      return ['Successful', 'Failed'].includes(data.state as StateType)
    } catch (error) {
      console.log('error :>> ', error)
      return true
    }
  }

  const handleRetryJob = async () => {
    const { id: jobId } = stepData.value
    if (jobId === undefined) {
      return true
    }
    try {
      await retryJob({ jobId, clusterId: 0 })
      pollJobDetails(getJobInstanceDetails)
    } catch (error) {
      console.log('error :>> ', error)
    }
  }

  const pollJobDetails = (execFunc: Function, interval: number = 200): void => {
    let firstPoll = true
    let firstPollCompleted = false
    const intervalId = setInterval(async () => {
      if (firstPoll) {
        spinning.value = true
        firstPoll = false
      }
      const result = await execFunc()
      if (!firstPollCompleted) {
        spinning.value = false
        firstPollCompleted = true
      }
      if (result) {
        clearInterval(intervalId)
      }
    }, interval)
  }

  onMounted(() => {
    pollJobDetails(getJobInstanceDetails)
  })
</script>

<template>
  <a-spin :spinning="spinning">
    <a-empty v-if="stages.length == 0" />
    <div v-else class="check-workflow">
      <div class="retry">
        <a-button v-if="stepData.state === 'Failed'" type="link" @click="handleRetryJob">{{
          $t('common.retry')
        }}</a-button>
      </div>
      <a-collapse v-model:active-key="activeKey" :bordered="false" :ghost="true">
        <a-collapse-panel v-for="stage in stages" :key="stage.id">
          <template #header>
            <div class="stage-item">
              <span>{{ stage.name }}</span>
              <svg-icon :name="stage.state && status[stage.state]"></svg-icon>
            </div>
          </template>
          <div v-for="task in stage.tasks" :key="task.id" class="task-item">
            <span>{{ task.name }}</span>
            <a-space :size="16">
              <svg-icon :name="task.state && status[task.state]"></svg-icon>
              <a-button v-if="task.state && !['Canceled', 'Pending'].includes(task.state)" type="link">
                {{ $t('cluster.view_log') }}
              </a-button>
            </a-space>
          </div>
        </a-collapse-panel>
      </a-collapse>
    </div>
  </a-spin>
</template>

<style lang="scss" scoped>
  .check-workflow {
    button {
      padding: 0;
    }
    :deep(.ant-collapse-header) {
      background-color: $color-fill-quaternary;
    }
    :deep(.ant-collapse-content-box) {
      padding: 0 !important;
    }
    .retry {
      text-align: end;
      line-height: 14px;
      margin-bottom: $space-sm;
      button {
        margin: 0;
        padding: 0;
        line-height: inherit;
        height: 0;
      }
    }
  }
  .stage-item {
    @include flexbox($justify: space-between, $align: center);
    padding-right: 65px;
  }
  .task-item {
    height: 45px;
    padding: 10px;
    box-sizing: border-box;
    padding-left: $space-lg;
    border-top: 1px solid $color-border-secondary;
    @include flexbox($justify: space-between, $align: center);
    &:last-child {
      border-bottom: 1px solid $color-border-secondary;
    }
  }
</style>
