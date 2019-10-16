/**
 * Copyright 2019 Red Hat, Inc. and others.

 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

 *     http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { IBuildSupport } from './IBuildSupport';
import { WorkspaceFolder } from 'vscode';
import { MavenUtils } from '../utils/mavenUtils';

export function MavenBuildSupport(): IBuildSupport {
  return {
    quarkusDev: MavenUtils.QUARKUS_DEV,
    getWindowsCommand: async (workspaceFolder: WorkspaceFolder): Promise<string> => {
      let mvnWindows: string;
      if (await MavenUtils.mavenWrapperExistsWindows(workspaceFolder)) {
        mvnWindows = MavenUtils.getWindowsMavenWrapperExecutable();
      } else {
        mvnWindows = await MavenUtils.getDefaultMavenExecutable();
      }
      return `${mvnWindows} ${MavenUtils.QUARKUS_DEV}`;
    },

    getUnixCommand: async (workspaceFolder: WorkspaceFolder): Promise<string> => {
      let mvnUnix: string;
      if (await MavenUtils.mavenWrapperExistsUnix(workspaceFolder)) {
        mvnUnix = MavenUtils.getUnixMavenWrapperExecutable();
      } else {
        mvnUnix = await MavenUtils.getDefaultMavenExecutable();
      }
      return `${mvnUnix} ${MavenUtils.QUARKUS_DEV}`;
    },

    isQuarkusDevCommand: (command: string): boolean => {
      return command.includes(MavenUtils.QUARKUS_DEV) && command.includes('mvn');
    }
  };
}