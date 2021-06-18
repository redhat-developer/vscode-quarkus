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
import { debug, DebugConfiguration, Uri, window, workspace, WorkspaceFolder, extensions } from 'vscode';
import { BuildSupport } from '../../buildSupport/BuildSupport';
import { ProjectLabelInfo } from '../../definitions/ProjectLabelInfo';
import { getQuarkusDevDebugConfig } from '../../utils/launchConfigUtils';
import { getQuarkusProject } from '../getQuarkusProject';
import { DebugConfigCreator } from './DebugConfigCreator';
import { VSCodeCommands } from '../../definitions/constants';
import { QuarkusContext } from '../../QuarkusContext';

/**
 * Start debugging a Quarkus project
 *
 * This function should only be called if there is a Quarkus project in the current workspace
 *
 * @returns when the debugging starts
 * @throws if the workspace folder for the selected project could not be detected
 */
export async function startDebugging(): Promise<void> {

  if (!hasShownDeployToOpenShiftPopUp()) {
    showDeployToOpenShiftPopUp();
  }

  const projectToDebug: ProjectLabelInfo = (await getQuarkusProject());
  const workspaceFolder: WorkspaceFolder | undefined = workspace.getWorkspaceFolder(Uri.file(projectToDebug.uri));

  if (!workspaceFolder) {
    throw new Error('The workspace folder for the current project could not be detected');
  }

  const projectBuildSupport: BuildSupport = projectToDebug.getBuildSupport();

  let debugConfig: DebugConfiguration | undefined = await getQuarkusDevDebugConfig(workspaceFolder, projectToDebug.uri, projectBuildSupport);

  if (!debugConfig) {
    await DebugConfigCreator.createFiles(workspaceFolder, projectToDebug.uri, projectBuildSupport);
    debugConfig = await getQuarkusDevDebugConfig(workspaceFolder, projectToDebug.uri, projectBuildSupport);
  }

  await debug.startDebugging(workspaceFolder, debugConfig);
}

const DEPLOY_TO_OPENSHIFT_ADVERTISEMENT_MEMENTO = 'deployToOpenshift.advertisementShown';

function hasShownDeployToOpenShiftPopUp(): boolean {
  return QuarkusContext.getExtensionContext().globalState.get(DEPLOY_TO_OPENSHIFT_ADVERTISEMENT_MEMENTO, false);
}

function showDeployToOpenShiftPopUp(): void {
  const DEPLOY_TO_OPENSHIFT_ADVERTISEMENT = 'You can deploy to OpenShift right from VS Code using ' + //
      '"Quarkus: Deploy Current project to OpenShift (odo)" from the command palette';
  window.showInformationMessage(DEPLOY_TO_OPENSHIFT_ADVERTISEMENT);
  QuarkusContext.getExtensionContext().globalState.update(DEPLOY_TO_OPENSHIFT_ADVERTISEMENT_MEMENTO, 'true');
}
