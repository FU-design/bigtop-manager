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
package org.apache.bigtop.manager.server.model.converter;

import org.apache.bigtop.manager.dao.po.PlatformPO;
import org.apache.bigtop.manager.server.config.MapStructSharedConfig;
import org.apache.bigtop.manager.server.model.dto.PlatformDTO;
import org.apache.bigtop.manager.server.model.req.AuthCredentialReq;
import org.apache.bigtop.manager.server.model.req.PlatformReq;
import org.apache.bigtop.manager.server.model.vo.PlatformVO;

import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Mapper(
        uses = {ConverterTool.class},
        config = MapStructSharedConfig.class)
public interface PlatformConverter {
    PlatformConverter INSTANCE = Mappers.getMapper(PlatformConverter.class);

    PlatformDTO fromReq2DTO(PlatformReq platformReq);

    PlatformVO fromPO2VO(PlatformPO platformPO);

    List<PlatformVO> fromPO2VO(List<PlatformPO> platformPOList);

    default Map<String, String> mapAuthCredentials(List<AuthCredentialReq> authCredentials) {
        if (authCredentials == null) {
            return null;
        }
        return authCredentials.stream()
                .collect(Collectors.toMap(AuthCredentialReq::getKey, AuthCredentialReq::getValue));
    }

    @AfterMapping
    default void afterMapping(@MappingTarget PlatformDTO platformDTO, PlatformReq platformReq) {
        platformDTO.setAuthCredentials(mapAuthCredentials(platformReq.getAuthCredentials()));
    }

    @Mapping(source = "credential", target = "authCredentials", qualifiedByName = "jsonString2Map")
    PlatformDTO fromPO2DTO(PlatformPO platformPO);
}
