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
import * as fs from 'fs';

import { DebugConfiguration, WorkspaceFolder, TaskDefinition } from 'vscode';
import { getQuarkusDevTaskDefinitions } from '../utils/tasksUtils';
import { parse } from 'comment-json';

function getQuarkusDevTaskNames(workspaceFolder: WorkspaceFolder): string[] {

  const quarkusDevTaskDefinitions: TaskDefinition[] = getQuarkusDevTaskDefinitions(workspaceFolder);
  return quarkusDevTaskDefinitions.filter((taskDefinition: TaskDefinition) => {
    return typeof taskDefinition.label !== 'undefined';
  }).map((taskDefinition: TaskDefinition) => {
    return taskDefinition.label;
  });
}

export async function getQuarkusDevDebugConfig(workspaceFolder: WorkspaceFolder): Promise<DebugConfiguration | undefined> {
  const debugConfig: DebugConfiguration[] = getConfigsWithPreLaunchTask(workspaceFolder);
  const devTasksNames: string[] = getQuarkusDevTaskNames(workspaceFolder);

  for (const config of debugConfig) {
    if (devTasksNames.includes(config.preLaunchTask)) {
      return config;
    }
  }

  return undefined;
}

export function getConfigsWithPreLaunchTask(workspaceFolder: WorkspaceFolder): DebugConfiguration[] {
  return getLaunchConfig(workspaceFolder).filter((config: DebugConfiguration) => {
    return typeof config.preLaunchTask !== 'undefined';
  });
}

export function getLaunchConfig(workspaceFolder: WorkspaceFolder): DebugConfiguration[] {
  // If the launch.json was created very recently, workspace.getConfiguration(launch, workspaceFolder.uri)
  // cannot retrieve it.
  const launchJson: string = workspaceFolder.uri.fsPath + '/.vscode/launch.json';
  if (fs.existsSync(launchJson)) {
    const launchConfig = parse(fs.readFileSync(launchJson).toString());
    if (launchConfig.configurations) {
      return launchConfig.configurations as DebugConfiguration[];
    }
  }
  return [];
}