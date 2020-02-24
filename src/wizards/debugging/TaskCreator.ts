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

import { FsUtils } from '../../utils/fsUtils';
import { BuildSupport } from '../../buildSupport/BuildSupport';
import { ConfigurationChangeEvent, Disposable, TaskDefinition, WorkspaceFolder, workspace, ConfigurationTarget } from 'vscode';
import { TaskPattern } from '../../buildSupport/TaskPattern';
import { getQuarkusDevTasks } from '../../utils/tasksUtils';

/**
 * This class is responsible for creating the debug Task that calls the
 * Quarkus dev command.
 */
export class TaskCreator {

  private workspaceFolder: WorkspaceFolder;
  private projectFolder: string;
  private quarkusBuildSupport: BuildSupport;
  private tasksJsonFile: string;

  /**
   * Returns a debug task that calls the Quarkus dev command
   * @param workspaceFolder the workspaceFolder containing the Quarkus project
   * @param quarkusBuildSupport specifies whether the project in `workspaceFolder` is a Maven project or Gradle project
   */
  public static async createTask(workspaceFolder: WorkspaceFolder, projectFolder: string, quarkusBuildSupport: BuildSupport): Promise<void> {
    const taskCreator: TaskCreator = new TaskCreator(workspaceFolder, projectFolder, quarkusBuildSupport);
    await taskCreator.createTasksJsonIfMissing();
    await taskCreator.addTask();
    await taskCreator.waitUntilTaskExists();
  }

  private constructor(workspaceFolder: WorkspaceFolder, projectFolder: string, quarkusBuildSupport: BuildSupport) {
    this.workspaceFolder = workspaceFolder;
    this.projectFolder = projectFolder;
    this.quarkusBuildSupport = quarkusBuildSupport;
    this.tasksJsonFile = workspaceFolder.uri.fsPath + '/.vscode/tasks.json';
  }

  /**
   * Creates a tasks.json file (with no tasks), if
   * one does not exist already
   */
  private async createTasksJsonIfMissing(): Promise<void> {
    const tasksKey = 'tasks';
    const versionKey = 'version';
    const version = '2.0.0';

    const workspaceConfiguration = workspace.getConfiguration(tasksKey, this.workspaceFolder.uri);

    // Get all registered tasks and current version
    const tasks = workspaceConfiguration.get(tasksKey);
    const currentVersion = workspaceConfiguration.get(versionKey);

    if (Array.isArray(tasks) && currentVersion) {
      return;
    }

    // Create tasks.json file with empty list of tasks and with version 2.0.0
    await workspaceConfiguration.update(versionKey, version, ConfigurationTarget.WorkspaceFolder);
    await workspaceConfiguration.update(tasksKey, [], ConfigurationTarget.WorkspaceFolder);

    // If tasks.json was created in .vscode/ directory, add special comments on top of the file
    if (fs.existsSync(this.tasksJsonFile)) {
      this.prependTasksJsonComment();
    }
  }

  private prependTasksJsonComment(): void {
    let comment: string = `// See https://go.microsoft.com/fwlink/?LinkId=733558\n`;
    comment += `// for the documentation about the tasks.json format\n`;
    FsUtils.prependToFile(this.tasksJsonFile, comment);
  }

  private async addTask(): Promise<void> {
    const tasksJson = workspace.getConfiguration('tasks', this.workspaceFolder.uri);
    const tasks: TaskDefinition[] = tasksJson.get<TaskDefinition[]>('tasks');
    tasks.push(await this.getTask());
    await tasksJson.update('tasks', tasks, ConfigurationTarget.WorkspaceFolder);
  }

  private async getTask(): Promise<TaskDefinition> {
    const taskLabel: string = this.quarkusBuildSupport.getQuarkusDevTaskName(this.workspaceFolder, this.projectFolder);
    const unixCommand: string = (await this.quarkusBuildSupport.getQuarkusDevCommand(this.projectFolder, { windows: false })).command;
    const windowsCommand: string = (await this.quarkusBuildSupport.getQuarkusDevCommand(this.projectFolder, { windows: true })).command;

    const taskPatterns: TaskPattern = this.quarkusBuildSupport.getTaskPatterns();
    const task: TaskDefinition =
    {
      label: taskLabel,
      type: "shell",
      command: unixCommand,
      windows: {
        command: windowsCommand
      },
      isBackground: true,
      problemMatcher: [
        {
          pattern: [
            {
              regexp: "\\b\\B",
              file: 1,
              location: 2,
              message: 3
            }
          ],
          background: {
            activeOnStart: true,
            beginsPattern: taskPatterns.beginsPattern,
            endsPattern: taskPatterns.endsPattern,
          }
        }
      ]
    };

    if (!FsUtils.isSameDirectory(this.workspaceFolder.uri.fsPath, this.projectFolder)) {
      task.options = {cwd: path.relative(this.workspaceFolder.uri.fsPath, this.projectFolder)};
    }

    return task;
  }

  private async waitUntilTaskExists(): Promise<void> {
    if ((await getQuarkusDevTasks(this.workspaceFolder, this.quarkusBuildSupport)).length > 0) {
      return;
    }

    return new Promise((resolve, reject) => {
      const disposable: Disposable = workspace.onDidChangeConfiguration(async (event: ConfigurationChangeEvent) => {
        if (event.affectsConfiguration('tasks', this.workspaceFolder.uri)) {
          if ((await getQuarkusDevTasks(this.workspaceFolder, this.quarkusBuildSupport)).length > 0) {
            disposable.dispose();
            resolve();
          }
        }
      });
    });
  }
}
