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

import { IBuildSupport } from '../definitions/IBuildSupport';
import { RelativePattern, Uri, WorkspaceFolder, workspace } from "vscode";
import { MavenBuildSupport } from '../definitions/MavenBuildSupport';
import { GradleBuildSupport } from '../definitions/GradleBuildSupport';

/**
 * Returns a promise resolving to `true` only if the project located in `workspaceFolder`
 * is a Quarkus project
 * @param workspaceFolder
 */
export async function containsQuarkusProject(workspaceFolder: WorkspaceFolder): Promise<boolean> {
  // TODO this function must be improved. It only checks if a file named
  // pom.xml or build.gradle exists under the provided workspaceFolder
  return (await getFilePathsFromWorkspace(workspaceFolder, 'pom.xml')).length > 0 ||
      (await getFilePathsFromWorkspace(workspaceFolder, 'build.gradle')).length > 0;
}

/**
 * Determines whether the Quarkus project located in `workspaceFolder` is a Maven project
 * or a Gradle project
 * @param workspaceFolder
 */
export async function getQuarkusProjectBuildSupport(workspaceFolder: WorkspaceFolder): Promise<IBuildSupport | undefined> {

  if ((await getFilePathsFromWorkspace(workspaceFolder, 'build.gradle')).length > 0) {
    return GradleBuildSupport();
  }

  if ((await getFilePathsFromWorkspace(workspaceFolder, 'pom.xml')).length > 0) {
    return MavenBuildSupport();
  }

  throw 'Workspace folder does not contain a Maven or Gradle project';
}

export async function getFilePathsFromWorkspace(workspaceFolder: WorkspaceFolder, fileName: string): Promise<Uri[]> {
  const pattern: string = `**/${fileName}`;
  return await workspace.findFiles(new RelativePattern(workspaceFolder.uri.fsPath, pattern));
}
