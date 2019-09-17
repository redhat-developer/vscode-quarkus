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

import { DebugConfiguration, TaskDefinition, Uri, workspace, tasks } from 'vscode';
import { parse } from 'comment-json';

export async function createDebugConfig(directory: Uri) {

  const vscodeDir: string = directory.fsPath + '/.vscode';
  if (!fs.existsSync(vscodeDir)) {
    fs.mkdirSync(vscodeDir);
  }

  if (fs.existsSync(vscodeDir + '/tasks.json')) {
    const tasksJson = workspace.getConfiguration('tasks', directory);
    const tasks: TaskDefinition[] = tasksJson.get<TaskDefinition[]>('tasks');
    const taskToAdd: TaskDefinition = getDebugResource<TaskDefinition>('tasks.json').tasks[0];
    tasks.push(taskToAdd);
    await tasksJson.update('tasks', tasks, false);
  } else {
    let tasksContent: string = getDebugResourceAsString('tasks.json');
    tasksContent = replaceWithSpacesIfNeeded(tasksContent);
    fs.writeFileSync(vscodeDir + '/tasks.json', tasksContent);
  }

  if (fs.existsSync(vscodeDir + '/launch.json')) {
    const launchConfig = workspace.getConfiguration('launch', directory);
    const configurations: DebugConfiguration[] = launchConfig.get<DebugConfiguration[]>('configurations');
    const configToAdd: DebugConfiguration = getDebugResource<DebugConfiguration>('launch.json').configurations[0];
    configurations.push(configToAdd);
    await launchConfig.update('configurations', configurations, false);
  } else {
    let launchContent: string = getDebugResourceAsString('launch.json');
    launchContent = replaceWithSpacesIfNeeded(launchContent);
    fs.writeFileSync(vscodeDir + '/launch.json', launchContent);
  }
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