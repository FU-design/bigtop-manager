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
package org.apache.bigtop.manager.stack.bigtop.v3_3_0.solr;

import org.apache.bigtop.manager.stack.core.spi.param.Params;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class SolrInstanceScriptTest {

    private final SolrInstanceScript solrInstanceScript = new SolrInstanceScript();

    @Test
    public void testGetComponentName() {
        assertEquals("solr_instance", solrInstanceScript.getComponentName());
    }

    @Test
    public void testAddParamsNull() {
        Params params = null;
        assertThrows(NullPointerException.class, () -> solrInstanceScript.add(params));
    }

    @Test
    public void testConfigureParamsNull() {
        Params params = null;
        assertThrows(NullPointerException.class, () -> solrInstanceScript.configure(params));
    }

    @Test
    public void testStartParamsNull() {
        Params params = null;
        assertThrows(NullPointerException.class, () -> solrInstanceScript.start(params));
    }

    @Test
    public void testStopParamsNull() {
        Params params = null;
        assertThrows(NullPointerException.class, () -> solrInstanceScript.stop(params));
    }

    @Test
    public void testStatusParamsNull() {
        Params params = null;
        assertThrows(NullPointerException.class, () -> solrInstanceScript.status(params));
    }
}
