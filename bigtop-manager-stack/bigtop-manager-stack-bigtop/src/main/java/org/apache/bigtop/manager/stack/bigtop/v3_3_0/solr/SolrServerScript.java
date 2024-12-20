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

import org.apache.bigtop.manager.common.shell.ShellResult;
import org.apache.bigtop.manager.stack.core.exception.StackException;
import org.apache.bigtop.manager.stack.core.spi.param.Params;
import org.apache.bigtop.manager.stack.core.spi.script.AbstractServerScript;
import org.apache.bigtop.manager.stack.core.spi.script.Script;
import org.apache.bigtop.manager.stack.core.utils.linux.LinuxOSUtils;

import com.google.auto.service.AutoService;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.text.MessageFormat;

@Slf4j
@AutoService(Script.class)
public class SolrServerScript extends AbstractServerScript {

    @Override
    public ShellResult configure(Params params) {
        return SolrSetup.config(params);
    }

    @Override
    public ShellResult start(Params params) {
        configure(params);
        SolrParams solrParams = (SolrParams) params;
        String confdir = MessageFormat.format("export SOLR_INCLUDE={0}/solr-env.sh", solrParams.confDir());
        ShellResult shellResult = create_solr_znode(params);
        String cmd = MessageFormat.format(
                "{0} && {1}/bin/solr start -cloud -noprompt -s {2} -z {3}",
                confdir, solrParams.serviceHome(), solrParams.getSolrDataDir(), solrParams.zkHost());
        try {
            return LinuxOSUtils.sudoExecCmd(cmd, solrParams.user());
        } catch (IOException e) {
            throw new StackException(e);
        }
    }

    @Override
    public ShellResult stop(Params params) {
        SolrParams solrParams = (SolrParams) params;
        String cmd = MessageFormat.format("{0}/bin/solr stop -all", solrParams.serviceHome());
        try {
            return LinuxOSUtils.sudoExecCmd(cmd, solrParams.user());
        } catch (IOException e) {
            throw new StackException(e);
        }
    }

    @Override
    public ShellResult status(Params params) {
        SolrParams solrParams = (SolrParams) params;
        return LinuxOSUtils.checkProcess(solrParams.getSolrPidFile());
    }

    public ShellResult create_solr_znode(Params params) {
        configure(params);
        SolrParams solrParams = (SolrParams) params;
        String zNode = solrParams.getZnode();
        String solrZkString = solrParams.getzkString();
        String cmd = MessageFormat.format(
                "{0}/bin/solr zk mkroot {1} -z {2} 2>&1", solrParams.serviceHome(), zNode, solrZkString);
        try {
            return LinuxOSUtils.sudoExecCmd(cmd, solrParams.user());
        } catch (IOException e) {
            throw new StackException(e);
        }
    }

    @Override
    public String getComponentName() {
        return "solr_server";
    }
}
