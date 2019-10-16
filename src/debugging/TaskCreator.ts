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

import { FsUtils } from '../utils/fsUtils';
import { IBuildSupport } from '../definitions/IBuildSupport';
import { ConfigurationChangeEvent, Disposable, TaskDefinition, WorkspaceFolder, workspace, window } from 'vscode';
import { getQuarkusDevTasks } from '../utils/tasksUtils';

/**
 * This class is responsible for creating the debug Task that calls the
 * Quarkus dev command.
 */
export class TaskCreator {

  private workspaceFolder: WorkspaceFolder;
  private quarkusBuildSupport: IBuildSupport;
  private tasksJsonFile: string;

  /**
   * Returns a debug task that calls the Quarkus dev command
   * @param workspaceFolder the workspaceFolder containing the Quarkus project
   * @param quarkusBuildSupport specifies whether the project in `workspaceFolder` is a Maven project or Gradle project
   */
  public static async createTask(workspaceFolder: WorkspaceFolder, quarkusBuildSupport: IBuildSupport): Promise<void> {
    const taskCreator: TaskCreator = new TaskCreator(workspaceFolder, quarkusBuildSupport);
    await taskCreator.createTasksJsonIfMissing();
    await taskCreator.addTask();
    await taskCreator.waitUntilTaskExists();
  }

  private constructor(workspaceFolder: WorkspaceFolder, quarkusBuildSupport: IBuildSupport) {
    this.workspaceFolder = workspaceFolder;
    this.quarkusBuildSupport = quarkusBuildSupport;
    this.tasksJsonFile = workspaceFolder.uri.fsPath + '/.vscode/tasks.json';
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
    await workspace.getConfiguration('tasks', this.workspaceFolder.uri).update('version', "2.0.0");
    await workspace.getConfiguration('tasks', this.workspaceFolder.uri).update('tasks', []);

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
    await tasksJson.update('tasks', tasks, false);
  }

  private async getTask(): Promise<TaskDefinition> {
    const taskLabel: string = this.quarkusBuildSupport.quarkusDev;
    const unixCommand: string = await this.quarkusBuildSupport.getUnixCommand(this.workspaceFolder);
    const windowsCommand: string = await this.quarkusBuildSupport.getWindowsCommand(this.workspaceFolder);

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
            beginsPattern: "^.*Scanning for projects...*",
            endsPattern: "^.*Quarkus .* started in .*\\. Listening on:*"
          }
        }
      ]
    };

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
