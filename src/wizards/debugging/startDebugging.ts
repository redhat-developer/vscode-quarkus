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
import { debug, DebugConfiguration, Uri, window, workspace, WorkspaceFolder } from 'vscode';
import { BuildSupport } from '../../buildSupport/BuildSupport';
import { getQuarkusDevDebugConfig } from '../../utils/launchConfigUtils';
import { getQuarkusProject } from '../getQuarkusProject';
import { DebugConfigCreator } from './DebugConfigCreator';
import { ProjectLabelInfo } from '../../definitions/ProjectLabelInfo';

export async function tryStartDebugging() {
  try {
    await startDebugging();
  } catch (message) {
    window.showErrorMessage(message);
  }
}

/**
 * This function should only be called if there is a Quarkus project in the current workspace
 */
async function startDebugging(): Promise<void> {

  const projectToDebug: ProjectLabelInfo = (await getQuarkusProject());
  const workspaceFolder: WorkspaceFolder|undefined = workspace.getWorkspaceFolder(Uri.file(projectToDebug.uri));

  if (!workspaceFolder) {
    // should not happen
    return;
  }

  const projectBuildSupport: BuildSupport = projectToDebug.getBuildSupport();

  let debugConfig: DebugConfiguration|undefined = await getQuarkusDevDebugConfig(workspaceFolder, projectToDebug.uri, projectBuildSupport);

  if (!debugConfig) {
    await DebugConfigCreator.createFiles(workspaceFolder, projectToDebug.uri, projectBuildSupport);
    debugConfig = await getQuarkusDevDebugConfig(workspaceFolder, projectToDebug.uri, projectBuildSupport);
  }

  debug.startDebugging(workspaceFolder, debugConfig);
}