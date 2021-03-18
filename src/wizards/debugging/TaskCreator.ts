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
import { ConfigurationChangeEvent, ConfigurationTarget, Disposable, TaskDefinition, workspace, WorkspaceFolder } from 'vscode';
import { BuildSupport } from '../../buildSupport/BuildSupport';
import { TaskPattern } from '../../buildSupport/TaskPattern';
import { FsUtils } from '../../utils/fsUtils';
import { getQuarkusDevTasks } from '../../utils/tasksUtils';

const TASK_DEFINITION_PROTOTYPE: TaskDefinition =
{
  type: "shell",
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
      }
    }
  ],
  group: "build"
};

/**
 * This class is responsible for creating the tasks.json, with tasks for:
 *  * Running Quarkus dev mode
 *  * Building a binary
 */
export class TaskCreator {

  private workspaceFolder: WorkspaceFolder;
  private projectFolder: string;
  private quarkusBuildSupport: BuildSupport;
  private tasksJsonFile: string;

  /**
   * Creates a tasks.json with tasks for:
   *  * Running Quarkus dev mode
   *  * Building a binary
   *
   * @param workspaceFolder the workspaceFolder containing the Quarkus project
   * @param quarkusBuildSupport specifies whether the project in `workspaceFolder` is a Maven project or Gradle project
   */
  public static async createTask(workspaceFolder: WorkspaceFolder, projectFolder: string, quarkusBuildSupport: BuildSupport): Promise<void> {
    const taskCreator: TaskCreator = new TaskCreator(workspaceFolder, projectFolder, quarkusBuildSupport);
    await taskCreator.createTasksJsonIfMissing();
    await taskCreator.addTask(await taskCreator.getQuarkusDevTask());
    await taskCreator.addTask(await taskCreator.getQuarkusBinaryTask());
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

  /**
   * Adds the given task definition to the tasks.json
   *
   * @param taskDefinition the TaskDefinition to add to the tasks.json
   * @returns when the TaskDefinition has been added
   */
  private async addTask(taskDefinition: TaskDefinition): Promise<void> {
    const tasksJson = workspace.getConfiguration('tasks', this.workspaceFolder.uri);
    const tasks: TaskDefinition[] = tasksJson.get<TaskDefinition[]>('tasks');
    tasks.push(taskDefinition);
    await tasksJson.update('tasks', tasks, ConfigurationTarget.WorkspaceFolder);
  }

  /**
   * Returns a task definition given a label, command, and patterns to identify the beginning and end of the task
   *
   * @param taskLabel the label for the task
   * @param unixCommand the command to run under unix OSs
   * @param windowsCommand the command to run under Windows
   * @param taskPattern the begin and end patterns for the task
   */
  private async getTaskFromCommandLine(taskLabel: string, unixCommand: string, windowsCommand: string,
    taskPattern?: TaskPattern): Promise<TaskDefinition> {
    const taskDefinition: TaskDefinition = JSON.parse(JSON.stringify(TASK_DEFINITION_PROTOTYPE));
    taskDefinition['label'] = taskLabel;
    taskDefinition['command'] = unixCommand;
    taskDefinition['windows'] = { command: windowsCommand };

    if (taskPattern) {
      taskDefinition['problemMatcher'][0]['background']['beginsPattern'] = taskPattern.beginsPattern;
      taskDefinition['problemMatcher'][0]['background']['endsPattern'] = taskPattern.endsPattern;
    }

    if (!FsUtils.isSameDirectory(this.workspaceFolder.uri.fsPath, this.projectFolder)) {
      taskDefinition.options = { cwd: path.relative(this.workspaceFolder.uri.fsPath, this.projectFolder) };
    }

    return taskDefinition;
  }

  /**
   * Returns the task definition for starting Quarkus development mode
   *
   * @returns the task definition for starting Quarkus development mode
   */
  private async getQuarkusDevTask(): Promise<TaskDefinition> {
    const taskLabel: string = this.quarkusBuildSupport.getQuarkusDevTaskName(this.workspaceFolder, this.projectFolder);
    const unixCommand: string = (await this.quarkusBuildSupport.getQuarkusDevCommand(this.projectFolder, { windows: false })).command;
    const windowsCommand: string = (await this.quarkusBuildSupport.getQuarkusDevCommand(this.projectFolder, { windows: true })).command;
    const taskPatterns: TaskPattern = this.quarkusBuildSupport.getTaskPatterns();
    return this.getTaskFromCommandLine(taskLabel, unixCommand, windowsCommand, taskPatterns);
  }

  /**
   * Returns the task definition for building a native image of the Quarkus app
   *
   * @returns the task definition for building a native image of the Quarkus app
   */
  private async getQuarkusBinaryTask(): Promise<TaskDefinition> {
    const taskLabel: string = this.quarkusBuildSupport.getQuarkusBinaryTaskName(this.workspaceFolder, this.projectFolder);
    const unixCommand: string = (await this.quarkusBuildSupport.getQuarkusBinaryCommand(this.projectFolder, { windows: false })).command;
    const windowsCommand: string = (await this.quarkusBuildSupport.getQuarkusBinaryCommand(this.projectFolder, { windows: true })).command;
    return this.getTaskFromCommandLine(taskLabel, unixCommand, windowsCommand);
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
