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
import * as path from 'path';
import { DebugConfiguration, WorkspaceFolder, workspace, Task } from 'vscode';
import { getTaskExecutionWorkingDir, getQuarkusDevTasks } from '../utils/tasksUtils';
import { BuildSupport } from '../buildSupport/BuildSupport';
import { FsUtils } from './fsUtils';

/**
 * Returns the debug config in the provided `workspaceFolder`, which calls the Quarkus
 * dev task for a Quarkus project located in `projectFolder`.
 *
 * Please note that the `workspaceFolder`'s path and the `projectFolder` path could be different.
 *
 * The Quarkus project could be located in any depth within the `workspaceFolder`'s path, but must
 * be located directly within the `projectFolder` path.
 *
 * @param workspaceFolder     the workspace folder containing the Quarkus project
 * @param projectFolder       the path to the project folder to debug
 * @param projectBuildSupport the build support for the project to debug
 */
export async function getQuarkusDevDebugConfig(workspaceFolder: WorkspaceFolder, projectFolder: string, projectBuildSupport: BuildSupport): Promise<DebugConfiguration | undefined> {
  const debugConfig: DebugConfiguration[] = getConfigsWithPreLaunchTask(workspaceFolder);
  const tasks: Task[] = (await getQuarkusDevTasks(workspaceFolder, projectBuildSupport)).filter((t) => {
    return t.name === projectBuildSupport.getQuarkusDevTaskName(workspaceFolder, projectFolder);
  });

  const workspaceFolderDir: string = workspaceFolder.uri.fsPath;
  for (const config of debugConfig) {
    const potentialTasks: Task[] = tasks.filter((t: Task) => t.name === config.preLaunchTask);
    for (const task of potentialTasks) {
      const taskWorkingDir: string = getTaskExecutionWorkingDir(task);
      // Case 1: When Quarkus project is in the current `workspaceFolder`
      if (taskWorkingDir === '${workspaceFolder}') {
        if (FsUtils.isSameDirectory(workspaceFolder.uri.fsPath, projectFolder)) {
          return config;
        }
      }

      // Case 2: When Quarkus project is in a child directory of the current `workspaceFolder`
      const taskWorkingAbsDir: string = path.resolve(workspaceFolderDir, taskWorkingDir);
      if (FsUtils.isSameDirectory(taskWorkingAbsDir, projectFolder)) {
        return config;
      }
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
