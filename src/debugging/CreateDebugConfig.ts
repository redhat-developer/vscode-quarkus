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

import { DebugConfiguration, TaskDefinition, Uri, workspace } from 'vscode';
import { getDefaultMavenExecutable, getUnixMavenWrapperExecuteable, getWindowsMavenWrapperExecutable,
  mavenWrapperExistsWindows, mavenWrapperExistsUnix } from '../utils/mavenUtils';

export class DebugConfigCreator {

  public static debugConfigCreator: DebugConfigCreator;

  private workspaceDir: Uri;
  private dotVSCodeDir: string;
  private tasksJsonFile: string;
  private launchJsonFile: string;

  public static async createFiles(directory: Uri): Promise<void> {
    DebugConfigCreator.debugConfigCreator = new DebugConfigCreator(directory);

    DebugConfigCreator.debugConfigCreator.createVSCodeDirIfMissing();
    await DebugConfigCreator.debugConfigCreator.addDebugTask();
    await DebugConfigCreator.debugConfigCreator.addDebugConfig();
  }

  private constructor(directory: Uri) {
    this.workspaceDir = directory;
    this.dotVSCodeDir = directory.fsPath + '/.vscode';
    this.tasksJsonFile = this.dotVSCodeDir + '/tasks.json';
    this.launchJsonFile = this.dotVSCodeDir + '/launch.json';
  }

  private createVSCodeDirIfMissing(): void {
    if (!fs.existsSync(this.dotVSCodeDir)) {
      fs.mkdirSync(this.dotVSCodeDir);
    }
  }

  private async addDebugTask(): Promise<void> {
    await this.createTasksJsonIfMissing();
    const tasksJson = workspace.getConfiguration('tasks', this.workspaceDir);
    const tasks: TaskDefinition[] = tasksJson.get<TaskDefinition[]>('tasks');
    tasks.push(await this.getDebugTask());
    await tasksJson.update('tasks', tasks, false);
  }

  private async addDebugConfig(): Promise<void> {
    await this.createLaunchJsonIfMissing();
    const launchJson = workspace.getConfiguration('launch', this.workspaceDir);
    const configurations: DebugConfiguration[] = launchJson.get<DebugConfiguration[]>('configurations');
    configurations.push(this.getDebugConfig());
    await launchJson.update('configurations', configurations, false);
  }

  /**
   * Creates a tasks.json file (with no tasks) in .vscode/ directory, if
   * one does not exist already
   * @param dotVSCodeDir absolute path to the .vscode/ directory
   */
  private async createTasksJsonIfMissing(): Promise<void> {

    if (fs.existsSync(this.tasksJsonFile)) {
      return;
    }

    // create tasks.json file in .vscode/
    await workspace.getConfiguration('tasks', this.workspaceDir).update('version', "2.0.0");
    await workspace.getConfiguration('tasks', this.workspaceDir).update('tasks', []);

    if (fs.existsSync(this.tasksJsonFile)) {
      this.prependTasksJsonComment();
    }
  }

  private async createLaunchJsonIfMissing(): Promise<void> {

    if (fs.existsSync(this.launchJsonFile)) {
      return;
    }

    await workspace.getConfiguration('launch', this.workspaceDir).update('version', "0.2.0");
    await workspace.getConfiguration('launch', this.workspaceDir).update('configurations', []);

    if (fs.existsSync(this.launchJsonFile)) {
      this.prependLaunchJsonComment();
    }
  }

  private async getDebugTask(): Promise<TaskDefinition> {

    const QUARKUS_DEV: string = 'quarkus:dev';
    let windowsMvn: string;
    let unixMvn: string;

    if (await mavenWrapperExistsWindows(workspace.getWorkspaceFolder(this.workspaceDir))) {
      windowsMvn = getWindowsMavenWrapperExecutable();
    } else {
      windowsMvn = await getDefaultMavenExecutable();
    }

    if (await mavenWrapperExistsUnix(workspace.getWorkspaceFolder(this.workspaceDir))) {
      unixMvn = getUnixMavenWrapperExecuteable();
    } else {
      unixMvn = await getDefaultMavenExecutable();
    }

    const taskToAdd: TaskDefinition = this.getDebugResource<TaskDefinition>('task.json');
    taskToAdd.command = `${unixMvn} ${QUARKUS_DEV}`;
    taskToAdd.windows.command = `${windowsMvn} ${QUARKUS_DEV}`;

    return taskToAdd;
  }

  private getDebugConfig(): DebugConfiguration {
    return this.getDebugResource<DebugConfiguration>('configuration.json');
  }

  private getDebugResource<T>(filename: string): T {
    const pathToFile = path.resolve(__dirname, '../vscode-debug-files/' + filename);
    return JSON.parse(fs.readFileSync(pathToFile).toString());
  }

  private prependTasksJsonComment() {
    let comment: string = `// See https://go.microsoft.com/fwlink/?LinkId=733558\n`;
    comment += `// for the documentation about the tasks.json format\n`;
    this.prependToFile(this.tasksJsonFile, comment);
  }

  private prependLaunchJsonComment() {
    let comment: string = `// A launch configuration that compiles the extension and then opens it inside a new window\n`;
    comment += `// Use IntelliSense to learn about possible attributes.\n`;
    comment += `// Hover to view descriptions of existing attributes.\n`;
    comment += `// For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387\n`;
    this.prependToFile(this.launchJsonFile, comment);
  }

  /**
   * Referenced from https://stackoverflow.com/a/49889780
   * @param fileDir
   * @param str
   */
  private prependToFile(fileDir: string, str: string) {
    const data = fs.readFileSync(fileDir);
    const fd = fs.openSync(fileDir, 'w+');
    const insert = new Buffer(str);
    fs.writeSync(fd, insert, 0, insert.length, 0);
    fs.writeSync(fd, data, 0, data.length, insert.length);
    fs.close(fd, (err) => {
      if (err) throw err;
    });
  }
}