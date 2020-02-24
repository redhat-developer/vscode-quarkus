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
import { RelativePattern, Uri, WorkspaceFolder, workspace } from "vscode";
import { ProjectLabel, ProjectLabelInfo } from "../definitions/ProjectLabelInfo";

export async function getFilePathsFromWorkspace(workspaceFolder: WorkspaceFolder, glob: string): Promise<Uri[]> {
  return await getFilePathsFromFolder(workspaceFolder.uri.fsPath, glob);
}

export async function getFilePathsFromFolder(folderPath: string, glob: string): Promise<Uri[]> {
  return await workspace.findFiles(new RelativePattern(folderPath, glob));
}

/**
 * Returns an array of `ProjectTypeInfo` containing information for each project
 * in the current workspace
 *
 * @param projectLabel optioanlly specify what project label to retrieve
 */
export async function getWorkspaceProjectLabels(projectLabel?: ProjectLabel): Promise<ProjectLabelInfo[]> {
  const result: ProjectLabelInfo[] = await ProjectLabelInfo.getWorkspaceProjectLabelInfo();
  if (!projectLabel) return result;
  return result.filter((projectLabelInfo: ProjectLabelInfo) => {
    return projectLabelInfo.labels.includes(projectLabel);
  });
}