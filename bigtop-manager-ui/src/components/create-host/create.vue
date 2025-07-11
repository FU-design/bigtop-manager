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
  import { computed, nextTick, ref, watch } from 'vue'
  import { Rule } from 'ant-design-vue/es/form'
  import { message } from 'ant-design-vue'
  import { storeToRefs } from 'pinia'
  import { useI18n } from 'vue-i18n'
  import { UploadOutlined } from '@ant-design/icons-vue'

  import { useLocaleStore } from '@/store/locale'
  import { useClusterStore } from '@/store/cluster'

  import { uploadFile } from '@/api/upload-file'
  import { updateHost } from '@/api/hosts'

  import ParsedPreview from './components/parsed-preview.vue'

  import type { UploadProps } from 'ant-design-vue'
  import type { HostReq } from '@/api/command/types'
  import type { HostParams, HostVO } from '@/api/hosts/types'
  import type { FormItemState } from '@/components/common/auto-form/types'

  enum Mode {
    EDIT = 'cluster.edit_host',
    ADD = 'cluster.add_host'
  }

  interface Emits {
    (
      event: 'onOk',
      type: keyof typeof Mode,
      value: HostReq | HostVO,
      duplicateHosts?: HostReq & { strategy: 'override' | 'keep' }[]
    ): void
  }

  interface Props {
    isPublic?: boolean
    apiEditCaller?: boolean
    currentHosts: HostReq[]
  }

  const props = withDefaults(defineProps<Props>(), { isPublic: false, apiEditCaller: false })
  const emits = defineEmits<Emits>()

  const { t } = useI18n()
  const localeStore = useLocaleStore()
  const clusterStore = useClusterStore()
  const { locale } = storeToRefs(localeStore)

  const open = ref(false)
  const loading = ref(false)
  const mode = ref<keyof typeof Mode>('ADD')
  const hiddenItems = ref<string[]>([])
  const autoFormRef = ref<Comp.AutoFormInstance | null>(null)
  const formValue = ref<HostReq & { hostname?: string }>({})
  const fileName = ref('')
  const previewRef = ref<InstanceType<typeof ParsedPreview> | null>()

  const isEdit = computed(() => mode.value === 'EDIT')

  /**
   * Validates SSH password confirmation.
   */
  const checkSshPassword = async (_rule: Rule, value: string) => {
    if (!value) {
      return Promise.reject(t('common.enter_error', [`${t('host.confirm_password')}`.toLowerCase()]))
    }
    if (value != formValue.value?.sshPassword) {
      return Promise.reject(t('common.password_not_match'))
    } else {
      return Promise.resolve()
    }
  }

  /**
   * Validates SSH key password confirmation.
   */
  const checkSshKeyPassword = async (_rule: Rule, value: string) => {
    if (value != formValue.value?.sshKeyPassword) {
      return Promise.reject(t('host.key_password_not_match'))
    } else {
      return Promise.resolve()
    }
  }

  const formItemsForSshPassword = computed((): FormItemState[] => [
    {
      type: 'inputPassword',
      field: 'sshPassword',
      formItemProps: {
        name: 'sshPassword',
        label: t('host.password_auth'),
        rules: [
          {
            required: true,
            message: t('common.enter_error', [`${t('host.password_auth')}`.toLowerCase()]),
            trigger: 'blur'
          }
        ]
      },
      controlProps: {
        placeholder: t('common.enter_error', [`${t('host.password_auth')}`.toLowerCase()])
      }
    },
    {
      type: 'inputPassword',
      field: 'sshPasswordAgain',
      formItemProps: {
        name: 'sshPasswordAgain',
        label: t('host.confirm_password'),
        rules: [
          {
            required: true,
            validator: checkSshPassword,
            trigger: 'blur'
          }
        ]
      },
      controlProps: {
        placeholder: t('common.enter_error', [`${t('host.confirm_password')}`.toLowerCase()])
      }
    }
  ])

  const formItemsForSshKeyPassword = computed((): FormItemState[] => [
    {
      type: 'radio',
      field: 'inputType',
      defaultValue: '1',
      defaultOptionsMap: [
        { value: '1', label: t('host.file') },
        { value: '2', label: t('host.text') }
      ],
      formItemProps: {
        name: 'inputType',
        label: t('host.input_method'),
        rules: [
          {
            required: true,
            message: t('common.select_error', [`${t('host.input_method')}`.toLowerCase()]),
            trigger: 'blur'
          }
        ]
      }
    },

    {
      type: 'input',
      field: 'sshKeyFilename',
      slot: 'sshKeyFilenameSlot',
      formItemProps: {
        name: 'sshKeyFilename',
        label: t('host.key_file'),
        rules: [
          {
            required: true,
            message: t('common.add_error', [`${t('host.key_file')}`.toLowerCase()]),
            trigger: 'blur'
          }
        ]
      }
    },
    {
      type: 'textarea',
      field: 'sshKeyString',
      formItemProps: {
        name: 'sshKeyString',
        label: t('host.key_text'),
        rules: [
          { required: true, message: t('common.enter_error', [`${t('host.key_text')}`.toLowerCase()]), trigger: 'blur' }
        ]
      },
      controlProps: {
        placeholder: t('common.enter_error', [`${t('host.key_text')}`.toLowerCase()])
      }
    },
    {
      type: 'inputPassword',
      field: 'sshKeyPassword',
      formItemProps: {
        name: 'sshKeyPassword',
        label: t('host.key_password')
      },
      controlProps: {
        placeholder: t('common.enter_error', [`${t('host.key_password')}`.toLowerCase()])
      }
    },
    {
      type: 'inputPassword',
      field: 'sshKeyPasswordAgain',
      formItemProps: {
        name: 'sshKeyPasswordAgain',
        label: t('host.confirm_key_password'),
        rules: [
          {
            required: false,
            validator: checkSshKeyPassword,
            trigger: 'blur'
          }
        ]
      },
      controlProps: {
        placeholder: t('common.enter_error', [`${t('host.confirm_key_password')}`.toLowerCase()])
      }
    }
  ])

  const formItemsOfPublicHost = computed((): FormItemState[] => [
    {
      type: 'select',
      field: 'clusterId',
      defaultValue: '',
      fieldMap: {
        label: 'displayName',
        value: 'clusterId'
      },
      formItemProps: {
        name: 'clusterId',
        label: t('common.cluster'),
        rules: [
          {
            required: true,
            message: t('common.select_error', [`${t('common.cluster')}`.toLowerCase()]),
            trigger: 'blur'
          }
        ]
      },
      controlProps: {
        disabled: isEdit.value,
        placeholder: t('common.select_error', [`${t('common.cluster')}`.toLowerCase()])
      }
    }
  ])

  const formItems = computed((): FormItemState[] => [
    {
      type: 'input',
      field: 'sshUser',
      formItemProps: {
        name: 'sshUser',
        label: t('host.username'),
        rules: [
          { required: true, message: t('common.enter_error', [`${t('host.username')}`.toLowerCase()]), trigger: 'blur' }
        ]
      },
      controlProps: {
        disabled: isEdit.value,
        placeholder: t('common.enter_error', [`${t('host.username')}`.toLowerCase()])
      }
    },
    {
      type: 'radio',
      field: 'authType',
      defaultValue: '1',
      defaultOptionsMap: [
        { value: '1', label: t('host.password_auth') },
        { value: '2', label: t('host.key_auth') },
        { value: '3', label: t('host.no_auth') }
      ],
      formItemProps: {
        name: 'authType',
        label: t('host.auth_method'),
        rules: [
          {
            required: true,
            message: t('common.select_error', [`${t('host.auth_method')}`.toLowerCase()]),
            trigger: 'blur'
          }
        ]
      }
    },
    {
      type: mode.value == 'ADD' ? 'textarea' : 'input',
      field: 'hostname',
      formItemProps: {
        name: 'hostname',
        label: t('host.hostname'),
        rules: [
          { required: true, message: t('common.enter_error', [`${t('host.hostname')}`.toLowerCase()]), trigger: 'blur' }
        ]
      },
      controlProps: {
        disabled: isEdit.value,
        placeholder: t('common.enter_error', [`${t('host.hostname')}`.toLowerCase()])
      }
    },

    {
      type: 'input',
      field: 'agentDir',
      formItemProps: {
        name: 'agentDir',
        label: t('host.agent_path')
      },
      controlProps: {
        disabled: isEdit.value,
        placeholder: t('host.default_agent_path')
      }
    },
    {
      type: 'input',
      field: 'sshPort',
      formItemProps: {
        name: 'sshPort',
        label: t('host.ssh_port')
      },
      controlProps: {
        placeholder: t('host.default_ssh_port')
      }
    },
    {
      type: 'input',
      field: 'grpcPort',
      formItemProps: {
        name: 'grpcPort',
        label: t('host.grpc_port')
      },
      controlProps: {
        placeholder: t('host.default_grpc_port')
      }
    },
    {
      type: 'textarea',
      field: 'desc',
      formItemProps: {
        name: 'desc',
        label: t('host.description')
      },
      controlProps: {
        placeholder: t('common.enter_error', [`${t('host.description')}`.toLowerCase()])
      }
    }
  ])

  const filterFormItems = computed((): FormItemState[] => {
    const baseItems = [...formItems.value]
    const isPublic = props.isPublic

    if (formValue.value.authType === '1') {
      baseItems.splice(2, 0, ...formItemsForSshPassword.value)
    } else if (formValue.value.authType === '2') {
      baseItems.splice(2, 0, ...formItemsForSshKeyPassword.value)
    }

    return isPublic ? [...formItemsOfPublicHost.value, ...baseItems] : baseItems
  })

  watch(
    () => formValue.value.inputType,
    (inputType) => {
      const hiddenMap: Record<string, string[]> = {
        '1': ['sshKeyString'],
        '2': ['sshKeyFilename']
      }
      hiddenItems.value = hiddenMap[inputType] ?? []
    }
  )

  /**
   * Handles host editing.
   */
  const editHost = async (hostConfig: HostReq) => {
    try {
      const data = await updateHost(hostConfig)
      if (data) {
        message.success(t('common.update_success'))
        emits('onOk', mode.value, formValue.value)
        handleCancel()
      }
    } catch (error) {
      console.error('Error editing host:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * Handles parsed data from preview.
   */
  const handleParsed = ({ parsedData, confirmStatus, duplicateHosts }: any) => {
    if (confirmStatus) {
      Object.assign(formValue.value, parsedData)
      emits('onOk', mode.value, formValue.value, duplicateHosts)
      handleCancel()
    }
  }

  const handleOk = async () => {
    const validate = await autoFormRef.value?.getFormValidation()
    if (!validate) return

    if (!isEdit.value) {
      previewRef.value?.parsed(props.currentHosts)
    } else if (props.apiEditCaller) {
      loading.value = true
      await editHost(formValue.value)
    } else {
      emits('onOk', mode.value, formValue.value)
      handleCancel()
    }
  }

  const handleCancel = () => {
    formValue.value = { authType: '1', inputType: '1' }
    fileName.value = ''
    open.value = false
  }

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    if (file.size / 1024 > 10) {
      message.error(t('common.file_size_error'))
      return false
    }
    return true
  }

  const customRequest = async (options: { file: any; onSuccess: any; onError: any }) => {
    const { file, onSuccess, onError } = options
    try {
      const formData = new FormData()
      formData.append('file', file)
      const data = await uploadFile(formData)
      formValue.value!.sshKeyFilename = data
      fileName.value = file.name
      onSuccess(data, file)
      message.success(t('common.upload_success'))
    } catch (error) {
      onError(error)
      message.error(t('common.upload_failed'))
      fileName.value = ''
    }
  }

  const handleOpen = async (type: keyof typeof Mode, payload?: HostParams) => {
    open.value = true
    mode.value = type

    formValue.value = payload
      ? { ...payload, authType: `${payload?.authType ?? 1}`, inputType: `${payload?.inputType ?? 1}` }
      : { authType: '1', inputType: '1' }

    if (props.isPublic) {
      await getClusterSelectOptions()
    }
  }

  const getClusterSelectOptions = async () => {
    await nextTick()
    const formatClusters = Object.values(clusterStore.clusterMap).map((v) => ({ ...v, clusterId: v.id }))
    autoFormRef.value?.setOptions('clusterId', formatClusters)
  }

  defineExpose({
    handleOpen
  })
</script>

<template>
  <div class="add-host">
    <a-modal
      :open="open"
      :width="600"
      :title="Mode[mode] && $t(Mode[mode])"
      :mask-closable="false"
      :confirm-loading="loading"
      :centered="true"
      :destroy-on-close="true"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <auto-form
        ref="autoFormRef"
        v-model:form-value="formValue"
        :label-col="{
          span: locale === 'zh_CN' ? 5 : 7
        }"
        :hidden-items="hiddenItems"
        :show-button="false"
        :form-items="filterFormItems"
      >
        <template #sshKeyFilenameSlot="{ item }">
          <a-form-item v-bind="item.formItemProps">
            <a-upload
              accept="text/plain"
              :before-upload="beforeUpload"
              :custom-request="customRequest"
              :show-upload-list="false"
            >
              <a-button>
                <upload-outlined></upload-outlined>
                {{ $t('common.upload_file') }}
              </a-button>
            </a-upload>
            <span class="filename">{{ fileName ? fileName : mode === 'EDIT' ? formValue[item.field] : '' }}</span>
          </a-form-item>
        </template>
      </auto-form>
      <template #footer>
        <footer>
          <a-space size="middle">
            <a-button @click="handleCancel">
              {{ $t('common.cancel') }}
            </a-button>
            <a-button type="primary" @click="handleOk">
              {{ $t('common.confirm') }}
            </a-button>
          </a-space>
        </footer>
      </template>
    </a-modal>
    <parsed-preview ref="previewRef" :is-public="$props.isPublic" :data="formValue" @parsed="handleParsed" />
  </div>
</template>

<style lang="scss" scoped>
  .filename {
    color: $color-primary;
    padding-inline: $space-sm;
  }
  footer {
    width: 100%;
    @include flexbox($justify: flex-end);
  }
</style>
