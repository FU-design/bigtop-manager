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
package org.apache.bigtop.manager.stack.core.utils;

import org.apache.bigtop.manager.common.constants.CacheFiles;
import org.apache.bigtop.manager.common.utils.JsonUtils;
import org.apache.bigtop.manager.common.utils.ProjectPathUtils;
import org.apache.bigtop.manager.common.utils.os.OSDetection;
import org.apache.bigtop.manager.grpc.pojo.ClusterInfo;
import org.apache.bigtop.manager.grpc.pojo.RepoInfo;
import org.apache.bigtop.manager.grpc.pojo.ToolInfo;
import org.apache.bigtop.manager.stack.core.exception.StackException;

import com.fasterxml.jackson.core.type.TypeReference;
import lombok.extern.slf4j.Slf4j;

import java.io.File;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
public class LocalSettings {

    public static Object configurations(String service, String type, String key, Object defaultValue) {
        Map<String, Object> configMap = configurations(service, type);
        return configMap.getOrDefault(key, defaultValue);
    }

    public static Map<String, Object> configurations(String service, String type) {
        Map<String, Object> configDataMap = new HashMap<>();
        File file = createFile(ProjectPathUtils.getAgentCachePath() + CacheFiles.CONFIGURATIONS_INFO);
        try {
            if (file.exists()) {
                Map<String, Map<String, Object>> configJson = JsonUtils.readFromFile(file, new TypeReference<>() {});
                Object configData =
                        configJson.getOrDefault(service, new HashMap<>()).get(type);
                if (configData != null) {
                    configDataMap = JsonUtils.readFromString(configData.toString(), new TypeReference<>() {});
                }
            }
        } catch (Exception e) {
            log.warn("{} parse error", CacheFiles.CONFIGURATIONS_INFO, e);
        }

        return configDataMap;
    }

    public static List<String> hosts(String componentName) {
        return hosts().getOrDefault(componentName, List.of());
    }

    public static Map<String, List<String>> hosts() {
        Map<String, List<String>> hostJson = new HashMap<>();
        File file = createFile(ProjectPathUtils.getAgentCachePath() + CacheFiles.HOSTS_INFO);
        if (file.exists()) {
            hostJson = JsonUtils.readFromFile(file, new TypeReference<>() {});
        }
        return hostJson;
    }

    public static Map<String, Object> basicInfo() {
        Map<String, Object> settings = new HashMap<>();
        File file = createFile(ProjectPathUtils.getAgentCachePath() + CacheFiles.SETTINGS_INFO);
        if (file.exists()) {
            settings = JsonUtils.readFromFile(file, new TypeReference<>() {});
        }
        return settings;
    }

    public static Map<String, String> users() {
        Map<String, String> userMap = new HashMap<>();
        File file = createFile(ProjectPathUtils.getAgentCachePath() + CacheFiles.USERS_INFO);
        if (file.exists()) {
            userMap = JsonUtils.readFromFile(file, new TypeReference<>() {});
        }
        return userMap;
    }

    public static List<String> packages() {
        return List.of();
    }

    public static List<RepoInfo> repos() {
        List<RepoInfo> repoInfoList = List.of();
        File file = createFile(ProjectPathUtils.getAgentCachePath() + CacheFiles.REPOS_INFO);
        if (file.exists()) {
            repoInfoList = JsonUtils.readFromFile(file, new TypeReference<>() {});
        }
        return repoInfoList;
    }

    public static ClusterInfo cluster() {
        ClusterInfo clusterInfo = new ClusterInfo();
        File file = createFile(ProjectPathUtils.getAgentCachePath() + CacheFiles.CLUSTER_INFO);
        if (file.exists()) {
            clusterInfo = JsonUtils.readFromFile(file, new TypeReference<>() {});
        }
        return clusterInfo;
    }

    public static ToolInfo getTool(String name) {
        return getTool(name, OSDetection.getArch());
    }

    public static ToolInfo getTool(String name, String arch) {
        ClusterInfo clusterInfo = cluster();
        for (ToolInfo toolInfo : clusterInfo.getTools()) {
            if (toolInfo.getName().equals(name) && toolInfo.getArch().contains(arch)) {
                return toolInfo;
            }
        }

        log.error("Cannot find tool: [{}] for arch: [{}]", name, arch);
        throw new StackException("Tool not found: " + name);
    }

    protected static File createFile(String fileName) {
        return new File(fileName);
    }
}
