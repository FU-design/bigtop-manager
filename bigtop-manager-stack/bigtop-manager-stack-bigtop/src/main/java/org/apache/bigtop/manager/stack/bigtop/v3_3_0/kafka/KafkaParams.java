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
package org.apache.bigtop.manager.stack.bigtop.v3_3_0.kafka;

import org.apache.bigtop.manager.grpc.payload.ComponentCommandPayload;
import org.apache.bigtop.manager.stack.bigtop.param.BigtopParams;
import org.apache.bigtop.manager.stack.core.annotations.GlobalParams;
import org.apache.bigtop.manager.stack.core.spi.param.Params;
import org.apache.bigtop.manager.stack.core.utils.LocalSettings;

import com.google.auto.service.AutoService;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Map;

@Getter
@AutoService(Params.class)
@NoArgsConstructor
public class KafkaParams extends BigtopParams {

    private String kafkaLogDir = "/var/log/kafka";
    private String kafkaPidDir = "/var/run/kafka";
    private String kafkaPidFile = "/var/run/kafka/kafka_broker.pid";
    private String kafkaDataDir = "/kafka-logs";
    private String kafkaEnvContent;
    private String kafkaLog4jContent;

    public KafkaParams(ComponentCommandPayload componentCommandPayload) {
        super(componentCommandPayload);
        globalParamsMap.put("kafka_user", user());
        globalParamsMap.put("kafka_group", group());
        globalParamsMap.put("java_home", javaHome());
        globalParamsMap.put("kafka_conf_dir", confDir());
        globalParamsMap.put("security_enabled", false);
    }

    @GlobalParams
    public Map<String, Object> kafkaBroker() {
        Map<String, Object> kafkaBroker = LocalSettings.configurations(getServiceName(), "kafka-broker");
        kafkaDataDir = (String) kafkaBroker.get("log.dirs");
        return kafkaBroker;
    }

    @GlobalParams
    public Map<String, Object> kafkaEnv() {
        Map<String, Object> kafkaEnv = LocalSettings.configurations(getServiceName(), "kafka-env");
        kafkaPidDir = (String) kafkaEnv.get("kafka_pid_dir");
        kafkaPidFile = kafkaPidDir + "/kafka_broker.pid";
        kafkaLogDir = (String) kafkaEnv.get("kafka_log_dir");
        kafkaEnvContent = (String) kafkaEnv.get("content");
        return kafkaEnv;
    }

    @GlobalParams
    public Map<String, Object> kafkaLog4j() {
        Map<String, Object> kafkaLog4j = LocalSettings.configurations(getServiceName(), "kafka-log4j");
        kafkaLog4jContent = (String) kafkaLog4j.get("content");
        return kafkaLog4j;
    }

    public String kafkaLimits() {
        Map<String, Object> kafkaLimits = LocalSettings.configurations(getServiceName(), "kafka.conf");
        return (String) kafkaLimits.get("content");
    }

    @Override
    public String confDir() {
        return serviceHome() + "/config";
    }

    @Override
    public String getServiceName() {
        return "kafka";
    }
}
