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
import { DebugConfiguration, WorkspaceFolder, workspace } from 'vscode';
import { getQuarkusDevTaskNames } from '../utils/tasksUtils';
import { BuildSupport } from '../buildSupport/BuildSupport';

export async function getQuarkusDevDebugConfig(workspaceFolder: WorkspaceFolder, projectBuildSupport: BuildSupport): Promise<DebugConfiguration | undefined> {
  const debugConfig: DebugConfiguration[] = getConfigsWithPreLaunchTask(workspaceFolder);
  const devTasksNames: string[] = await getQuarkusDevTaskNames(workspaceFolder, projectBuildSupport);

  for (const config of debugConfig) {
    if (devTasksNames.includes(config.preLaunchTask)) {
      return config;
    }
  }
  return undefined;
}

function getConfigsWithPreLaunchTask(workspaceFolder: WorkspaceFolder): DebugConfiguration[] {
  return getLaunchConfig(workspaceFolder).filter((config: DebugConfiguration) => {
    return typeof config.preLaunchTask !== 'undefined';
  });
}

function getLaunchConfig(workspaceFolder: WorkspaceFolder): DebugConfiguration[] {
  return workspace.getConfiguration('launch', workspaceFolder.uri).get<DebugConfiguration[]>('configurations');
}
