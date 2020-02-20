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
import { DebugConfiguration, Disposable, QuickPick, QuickPickItem, WorkspaceFolder, debug, window, workspace, Uri } from 'vscode';
import { getWorkspaceProjectLabels, ProjectLabelInfo } from '../utils/workspaceUtils';
import { DebugConfigCreator } from './DebugConfigCreator';
import { getQuarkusDevDebugConfig } from '../utils/launchConfigUtils';
import { BuildSupport } from '../buildSupport/BuildSupport';
import { getBuildSupport } from '../buildSupport/BuildSupportUtils';
import { ProjectLabel } from '../definitions/ProjectLabelInfo';
import { MavenBuildSupport } from '../buildSupport/MavenBuildSupport';

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

  const projectToDebug: string = await getProject();
  const workspaceFolder: WorkspaceFolder|undefined = workspace.getWorkspaceFolder(Uri.file(projectToDebug));

  if (!workspaceFolder) {
    // should not happen
    return;
  }

  // const projectBuildSupport: BuildSupport = await getBuildSupport(workspaceFolder);
  const projectBuildSupport: BuildSupport = new MavenBuildSupport();

  let debugConfig: DebugConfiguration|undefined = await getQuarkusDevDebugConfig(workspaceFolder, projectToDebug, projectBuildSupport);

  if (!debugConfig) {
    await DebugConfigCreator.createFiles(workspaceFolder, projectToDebug, projectBuildSupport);
    debugConfig = await getQuarkusDevDebugConfig(workspaceFolder, projectToDebug, projectBuildSupport);
  }

  debug.startDebugging(workspaceFolder, debugConfig);
}

export async function getProject(): Promise<string> {
  const quarkusProjectInfo: ProjectLabelInfo[] = await getWorkspaceProjectLabels(ProjectLabel.Quarkus);
  const quarkusProjectFolders: string[] = quarkusProjectInfo.map((info) => info.uri);

  // try to return workspace folder containing currently opened file
  if (window.activeTextEditor) {
    const currentDoc: Uri = window.activeTextEditor.document.uri;
    const projectFolder: string|undefined = getFolderContainingPath(quarkusProjectFolders, currentDoc.fsPath);
    if (projectFolder) {
      return projectFolder;
    }
  }

  if (quarkusProjectFolders.length === 1) {
    return quarkusProjectFolders[0];
  }
  return await chooseQuarkusProject(quarkusProjectFolders);
}

function getFolderContainingPath(folders: string[], path: string): string|undefined {
  for (const folder in folders) {
    if (isWithin(folder, path)) {
      return folder;
    }
  }
  return undefined;
}

function isWithin(outer: string, inner: string): boolean {
  const rel: string = path.relative(outer, inner);
  return !rel.startsWith(`..${path.sep}`) && rel !== '..';
}

export async function chooseQuarkusProject(quarkusProjectFolders: string[]): Promise<string> {

  const quickPickitems = await getProjectQuickPickItems(quarkusProjectFolders);
  const disposables: Disposable[] = [];
  const selection: QuickPickItem =  await new Promise<QuickPickItem>((resolve) => {
      const input: QuickPick<QuickPickItem> = window.createQuickPick();
      input.title = 'Choose a project to debug.';
      input.items = quickPickitems;
      input.activeItems = [quickPickitems[0]];

      disposables.push(
          input,
          input.onDidChangeSelection(items => resolve(items[0])),
          input.onDidHide(() => {
              disposables.forEach(d => d.dispose());
          }),
          input.onDidAccept(async () => {
              disposables.forEach(d => d.dispose());
              resolve();
          })
      );
      input.show();
  });

  return selection.label;
}

async function getProjectQuickPickItems(quarkusProjectFolders: string[]): Promise<QuickPickItem[]> {
  return quarkusProjectFolders.map((q) => {
    return {
      label: q
    };
  });
}