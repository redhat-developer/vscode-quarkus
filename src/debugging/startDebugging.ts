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

import { WorkspaceFolder, debug, window, DebugConfiguration } from 'vscode';
import { containsQuarkusProject, getTargetWorkspace } from '../utils/workspaceUtils';
import { DebugConfigCreator } from './DebugConfigCreator';
import { getQuarkusDevDebugConfig } from '../utils/launchConfigUtils';
import { BuildSupport } from '../buildSupport/BuildSupport';
import { getBuildSupport } from '../buildSupport/BuildSupportUtils';

export async function tryStartDebugging() {
  try {
    await startDebugging();
  } catch (message) {
    window.showErrorMessage(message);
  }
}

async function startDebugging(): Promise<void> {

  const workspaceFolder: WorkspaceFolder = getTargetWorkspace();

  if (!(await containsQuarkusProject(workspaceFolder))) {
    throw 'Current workspace folder does not contain a Quarkus project.';
  }

  const projectBuildSupport: BuildSupport = await getBuildSupport(workspaceFolder);
  let debugConfig: DebugConfiguration|undefined = await getQuarkusDevDebugConfig(workspaceFolder, projectBuildSupport);

  if (!debugConfig) {
    await DebugConfigCreator.createFiles(workspaceFolder, projectBuildSupport);
    debugConfig = await getQuarkusDevDebugConfig(workspaceFolder, projectBuildSupport);
  }

  debug.startDebugging(workspaceFolder, debugConfig);
}
