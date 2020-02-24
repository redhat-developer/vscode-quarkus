/**
 * Copyright 2020 Red Hat, Inc. and others.

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
import { Disposable, QuickPickItem, Uri, window, QuickPick } from "vscode";
import { ProjectLabel, ProjectLabelInfo } from "../definitions/ProjectLabelInfo";
import { getWorkspaceProjectLabels } from "../utils/workspaceUtils";

export async function getQuarkusProject(): Promise<ProjectLabelInfo|undefined> {
  const quarkusProjectInfo: ProjectLabelInfo[] = await getWorkspaceProjectLabels(ProjectLabel.Quarkus);
  // try to return workspace folder containing currently opened file
  if (window.activeTextEditor) {
    const currentDoc: Uri = window.activeTextEditor.document.uri;
    const project: ProjectLabelInfo | undefined = getProjectContainingPath(quarkusProjectInfo, currentDoc.fsPath);
    if (project) {
      return project;
    }
  }

  if (quarkusProjectInfo.length === 1) {
    return quarkusProjectInfo[0];
  }
  return await chooseQuarkusProject(quarkusProjectInfo);
}

function getProjectContainingPath(quarkusProjectInfo: ProjectLabelInfo[], path: string): ProjectLabelInfo | undefined {
  for (const project of quarkusProjectInfo) {
    if (isWithin(project.uri, path)) {
      return project;
    }
  }
  return undefined;
}

function isWithin(outer: string, inner: string): boolean {
  const rel: string = path.relative(outer, inner);
  return !rel.startsWith(`..${path.sep}`) && rel !== '..';
}

interface QuickPickProjectItem extends QuickPickItem {
  projectLabelInfo: ProjectLabelInfo;
}

export async function chooseQuarkusProject(quarkusProjectInfo: ProjectLabelInfo[]): Promise<ProjectLabelInfo|undefined> {

  const quickPickitems: QuickPickProjectItem[] = await getProjectQuickPickItems(quarkusProjectInfo);
  const disposables: Disposable[] = [];
  const selection: QuickPickProjectItem|undefined = await new Promise<QuickPickProjectItem|undefined>((resolve) => {
    const input: QuickPick<QuickPickProjectItem> = window.createQuickPick();
    input.title = 'Multiple Quarkus projects were found in the following folders. Choose a Quarkus project.';
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

  if (selection) {
    return selection.projectLabelInfo;
  }
  return undefined;
}

async function getProjectQuickPickItems(quarkusProjectFolders: ProjectLabelInfo[]): Promise<QuickPickProjectItem[]> {
  return quarkusProjectFolders.map((projectInfo) => {
    return {
      detail: projectInfo.uri,
      label: path.basename(projectInfo.uri),
      projectLabelInfo: projectInfo
    };
  });
}