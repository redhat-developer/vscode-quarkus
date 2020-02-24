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
import { WorkspaceFolder } from 'vscode';
import { getFilePathsFromWorkspace } from '../utils/workspaceUtils';
import { BuildSupport } from './BuildSupport';
import { GradleBuildSupport } from './GradleBuildSupport';
import { MavenBuildSupport } from './MavenBuildSupport';

const POM_XML = 'pom.xml';
const BUILD_GRADLE = 'build.gradle';

/**
 * Determines whether the Quarkus project located in `workspaceFolder` is a Maven project
 * or a Gradle project
 * @param workspaceFolder
 */
export async function getBuildSupport(workspaceFolder: WorkspaceFolder): Promise<BuildSupport | undefined> {
  if ((await getFilePathsFromWorkspace(workspaceFolder, `**/${BUILD_GRADLE}`)).length > 0) {
    return new GradleBuildSupport();
  }

  if ((await getFilePathsFromWorkspace(workspaceFolder, `**/${POM_XML}`)).length > 0) {
    return new MavenBuildSupport();
  }

  throw 'Workspace folder does not contain a Maven or Gradle project';
}