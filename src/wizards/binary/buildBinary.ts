/**
 * Copyright 2021 Red Hat, Inc. and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as fs from "fs-extra";
import * as path from "path";
import { env, Task, tasks, Uri, window, workspace, WorkspaceFolder } from "vscode";
import { BuildSupport } from "../../buildSupport/BuildSupport";
import { ProjectLabelInfo } from "../../definitions/ProjectLabelInfo";
import { TaskCreator } from "../debugging/TaskCreator";
import { getQuarkusProject } from "../getQuarkusProject";
import * as which from "which";

const NATIVE_IMAGE_DOCS_URI: Uri = Uri.parse('https://quarkus.io/guides/building-native-image');

const RUN_ANYWAYS = 'Run anyways';
const DO_NOT_RUN = 'Don\'t run';
const LEARN_MORE = 'Learn more...';

/**
 * Selects a quarkus project, then starts building a binary for it
 *
 * Prompts the user if GraalVM isn't detected
 *
 * @returns when the binary build task has been started
 */
export async function buildBinary(): Promise<void> {
  const projectLabelInfo: ProjectLabelInfo = await getQuarkusProject();
  if (!projectLabelInfo) {
    return;
  }
  if (!hasNativeImageOnGraalVmHome() && !hasNativeImageOnJavaHome() && !await hasNativeImageOnPath()) {
    const result = await window.showInformationMessage(
      'Unable to locate the `native-image` binary, '
      + 'meaning the binary build will likely fail. '
      + 'Attempt to generate a binary anyways?',
      DO_NOT_RUN, RUN_ANYWAYS, LEARN_MORE);
    if (result === LEARN_MORE) {
      env.openExternal(NATIVE_IMAGE_DOCS_URI);
    }
    if (result !== RUN_ANYWAYS) {
      return;
    }
  }
  try {
    await buildBinaryFromProject(projectLabelInfo);
  } catch (e) {
    window.showErrorMessage(`${e}`);
  }
}

/**
 * Returns true if $GRAALVM_HOME/bin/native-image exists, and false otherwise
 *
 * @returns true if $GRAALVM_HOME/bin/native-image exists, and false otherwise
 */
function hasNativeImageOnGraalVmHome(): boolean {
  return pathFromEnvHasNativeImage(process.env.GRAALVM_HOME);
}

/**
 * Returns true if $JAVA_HOME/bin/native-image exists, and false otherwise
 *
 * @returns true if $JAVA_HOME/bin/native-image exists, and false otherwise
 */
function hasNativeImageOnJavaHome(): boolean {
  return pathFromEnvHasNativeImage(process.env.JAVA_HOME);
}

function pathFromEnvHasNativeImage(envVarValue: string | undefined): boolean {
  if (envVarValue && envVarValue.trim()) {
    return fs.existsSync(path.join(envVarValue, 'bin', 'native-image'));
  }
  return false;
}

/**
 * Returns true if `native-image` is on the path and false otherwise
 *
 * @returns true if `native-image` is on the path and false otherwise
 */
async function hasNativeImageOnPath(): Promise<boolean> {
  try {
    return !! await which('native-image');
  } catch (_e) {
    return false;
  }
}

/**
 * Builds a binary of the given Quarkus project
 *
 * @returns when the native-image task has been started (not when it's completed)
 */
async function buildBinaryFromProject(projectLabelInfo: ProjectLabelInfo): Promise<void> {
  const projectBuildSupport: BuildSupport = projectLabelInfo.getBuildSupport();
  const workspaceFolder: WorkspaceFolder | undefined = workspace.getWorkspaceFolder(Uri.file(projectLabelInfo.uri));
  if (!workspaceFolder) {
    throw new Error('The project specified cannot be found in any of the open folders');
  }
  await findAndStartBinaryTask(workspaceFolder, projectLabelInfo.uri, projectBuildSupport);
}

/**
 * Creates the native-image VS Code task if necessary, runs the task, then returns once the task is started
 *
 * @param workspaceFolder
 * @param projectFolder
 * @param quarkusBuildSupport
 * @returns when the native-image task has been started (not when it's completed)
 */
async function findAndStartBinaryTask(
  workspaceFolder: WorkspaceFolder,
  projectFolder: string,
  quarkusBuildSupport: BuildSupport): Promise<void> {
  let nativeImageTasks = await getBinaryTasks(workspaceFolder, projectFolder, quarkusBuildSupport);
  if (nativeImageTasks.length === 0) {
    await TaskCreator.createTask(workspaceFolder, projectFolder, quarkusBuildSupport);
    nativeImageTasks = await getBinaryTasks(workspaceFolder, projectFolder, quarkusBuildSupport);
  } else if (nativeImageTasks.length > 1) {
    console.error('More than one native-image tasks have been created. This likely means something went wrong with vscode-quarkus.');
  }
  tasks.executeTask(nativeImageTasks[0]);
}

/**
 * Returns a list of all the VS Code tasks that build a binary
 *
 * @param workspaceFolder the vscode workspace folder
 * @param projectFolder the quarkus project folder
 * @param quarkusBuildSupport the quarkus build support
 * @returns a list of all the VS Code tasks that build a binary
 */
async function getBinaryTasks(
  workspaceFolder: WorkspaceFolder,
  projectFolder: string,
  quarkusBuildSupport: BuildSupport): Promise<Task[]> {
  const registeredTasks: Task[] = await tasks.fetchTasks();
  const nativeImageTasks: Task[] = registeredTasks.filter((task: Task) => {
    return task.name && task.name === quarkusBuildSupport.getQuarkusBinaryTaskName(workspaceFolder, projectFolder);
  });
  return nativeImageTasks;
}
