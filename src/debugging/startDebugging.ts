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

import { WorkspaceFolder, debug, window, workspace, DebugConfiguration } from 'vscode';
import { containsMavenQuarkusProject } from '../utils/workspaceUtils';
import { DebugConfigCreator } from '../debugging/createDebugConfig';
import { getQuarkusDevDebugConfig } from '../utils/launchConfigUtils';

export async function tryStartDebugging() {
  try {
    await startDebugging();
  } catch (message) {
    window.showErrorMessage(message);
  }
}

async function startDebugging(): Promise<void> {

  const workspaceFolder: WorkspaceFolder = getDebugWorkspace();

  if (!(await containsMavenQuarkusProject(workspaceFolder))) {
    throw 'Current workspace folder does not contain a Maven project.';
  }

  let debugConfig: DebugConfiguration|undefined = await getQuarkusDevDebugConfig(workspaceFolder);

  if (!debugConfig) {
    const debugConfigCreator: DebugConfigCreator = new DebugConfigCreator(workspaceFolder.uri);
    await debugConfigCreator.createFiles();
    debugConfig = await getQuarkusDevDebugConfig(workspaceFolder);
  }

  debug.startDebugging(workspaceFolder, debugConfig);
}

function getDebugWorkspace(): WorkspaceFolder {

  const workspaceFolders: WorkspaceFolder[]|undefined = workspace.workspaceFolders;

  if (!workspaceFolders) {
    throw 'No workspace folders are opened.';
  }

  if (workspaceFolders.length === 1) {
    return workspace.workspaceFolders[0];
  }

  // try to return workspace folder containing currently opened file
  const currentDoc = window.activeTextEditor.document.uri;
  if (currentDoc && workspace.getWorkspaceFolder(currentDoc)) {
    return workspace.getWorkspaceFolder(currentDoc);
  }

  // TODO maybe implement an input box to determine which workspace folder to debug in
  return workspace.workspaceFolders[0]; // dummy return statement
}