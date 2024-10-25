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
  interface Props {
    icon?: string
    title?: string
    desc?: string
  }
  const props = withDefaults(defineProps<Props>(), {
    icon: '',
    title: '',
    desc: ''
  })
</script>

<template>
  <a-card class="content-top">
    <section class="content-top-wrp">
      <slot name="content">
        <div class="content-top-info">
          <div class="content-top-img">
            <img src="../../../assets/images/login.png" />
          </div>
          <div class="content-top-desc">
            <a-typography-title :level="5">
              {{ props.title }}
            </a-typography-title>
            <a-typography-text type="secondary">
              {{ props.desc }}
            </a-typography-text>
          </div>
        </div>
        <a-space :wrap="true">
          <slot name="actions"> </slot>
        </a-space>
      </slot>
    </section>
  </a-card>
</template>

<style lang="scss" scoped>
  .content-top {
    :deep(.ant-card-body) {
      padding: $space-lg $space-md !important;
      overflow: auto;
    }

    .content-top-wrp {
      @include flexbox($wrap: wrap, $justify: space-between, $align: center);
      gap: $space-md;
    }

    .content-top-info {
      @include flexbox($wrap: wrap, $align: center);
      .content-top-img {
        width: 54px;
        height: 54px;
        margin-right: $space-md;
        object-fit: contain;
        flex-shrink: 0;
        img {
          width: 100%;
          height: 100%;
        }
      }
      .content-top-desc {
        @include flexbox(column);
      }
    }
  }
</style>
