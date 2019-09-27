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
import * as fs from 'fs';
import * as path from 'path';

import { DebugConfiguration, TaskDefinition, Uri, workspace, TaskPanelKind } from 'vscode';
import { getDefaultMavenExecutable, getUnixMavenWrapperExecuteable, getWindowsMavenWrapperExecutable, mavenWrapperExists } from '../utils/mavenUtils';
import { parse } from 'comment-json';

/**
 * Creates a .vscode/ directory in `directory` (if it does not exist)
 * and adds a new task and debug configuration which starts the quarkus:dev command
 * @param directory workspace directory to generate debug config in
 */
export async function createDebugConfig(directory: Uri) {

  const vscodeDir: string = directory.fsPath + '/.vscode';
  if (!fs.existsSync(vscodeDir)) {
    fs.mkdirSync(vscodeDir);
  }

  await addDebugTask(directory);
  await addDebugConfig();
}

async function addDebugTask(directory: Uri): Promise<void> {
  await createTasksJsonIfMissing(directory);
  const tasksJson = workspace.getConfiguration('tasks', directory);
  const tasks: TaskDefinition[] = tasksJson.get<TaskDefinition[]>('tasks');
  tasks.push(await getDebugTask(directory));
  await tasksJson.update('tasks', tasks, false);

}

async function addDebugConfig() {
  await createLaunchJsonIfMissing(directory);

  // if (fs.existsSync(vscodeDir + '/launch.json')) {
  //   const launchConfig = workspace.getConfiguration('launch', directory);
  //   const configurations: DebugConfiguration[] = launchConfig.get<DebugConfiguration[]>('configurations');
  //   const configToAdd: DebugConfiguration = getDebugResource<DebugConfiguration>('launch.json').configurations[0];
  //   configurations.push(configToAdd);
  //   await launchConfig.update('configurations', configurations, false);
  // } else {
  //   let launchContent: string = getDebugResourceAsString('launch.json');
  //   launchContent = replaceWithSpacesIfNeeded(launchContent);
  //   fs.writeFileSync(vscodeDir + '/launch.json', launchContent);
  // }
}

/**
 * Creates a tasks.json file (with no tasks) in .vscode/ directory, if
 * one does not exist already
 * @param dotVSCodeDir absolute path to the .vscode/ directory
 */
async function createTasksJsonIfMissing(directory: Uri): Promise<void> {
  const vscodeDir: string = directory.fsPath + '/.vscode';
  if (!fs.existsSync(vscodeDir + '/tasks.json')) {
    await workspace.getConfiguration('tasks', directory).update('version', "2.0.0");
    await workspace.getConfiguration('tasks', directory).update('tasks', []);
  }
}

async function createLaunchJsonIfMissing(directory: Uri): Promise<void> {
  const vscodeDir: string = directory.fsPath + '/.vscode';
  if (!fs.existsSync(vscodeDir + '/launch.json')) {
    await workspace.getConfiguration('launch', directory).update('version', "0.2.0");
    await workspace.getConfiguration('launch', directory).update('configurations', []);
  }
}


async function getDebugTask(directory: Uri): Promise<TaskDefinition> {

  const QUARKUS_DEV: string = 'quarkus:dev';
  let windowsMvn: string;
  let unixMvn: string;

  if (mavenWrapperExists(workspace.getWorkspaceFolder(directory))) {
    windowsMvn = getWindowsMavenWrapperExecutable();
    unixMvn = getUnixMavenWrapperExecuteable();
  } else {
    windowsMvn = await getDefaultMavenExecutable();
    unixMvn = await getDefaultMavenExecutable();
  }

  const taskToAdd: TaskDefinition = getDebugResource<TaskDefinition>('task.json');
  taskToAdd.command = `${unixMvn} ${QUARKUS_DEV}`;
  taskToAdd.windows.command = `${windowsMvn} ${QUARKUS_DEV}`;

  return taskToAdd;
}

function getDebugResource<T>(filename: string): T {
  return parse(getDebugResourceAsString(filename));
}

function getDebugResourceAsString(filename: string): string {
  const pathToFile = path.resolve(__dirname, '../vscode-debug-files/' + filename);
  return fs.readFileSync(pathToFile).toString();
}

function replaceWithSpacesIfNeeded(str: string): string {
  if (workspace.getConfiguration('editor').get('insertSpaces')) {
    const numSpaces: number = workspace.getConfiguration('editor').get('tabSize');
    return replaceTabsWithSpaces(str, numSpaces);
  }

  return str;
}

function replaceTabsWithSpaces(str: string, numSpaces: number): string {
  return str.replace(/\t/g, ' '.repeat(numSpaces));
}