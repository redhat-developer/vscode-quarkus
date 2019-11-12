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
import * as _ from 'lodash';

import { tasks, ProcessExecution, ShellExecution, Task, TaskExecution, WorkspaceFolder } from 'vscode';
import { BuildSupport } from '../buildSupport/BuildSupport';

export async function getQuarkusDevTaskNames(workspaceFolder: WorkspaceFolder, projectBuildSupport: BuildSupport) {
  const quarkusDevTaskDefinitions: Task[] = await getQuarkusDevTasks(workspaceFolder, projectBuildSupport);
  return quarkusDevTaskDefinitions.filter((task: Task) => {
    return typeof task.name !== 'undefined';
  }).map((task: Task) => {
    return task.name;
  });
}

export async function getQuarkusDevTasks(workspaceFolder: WorkspaceFolder, projectBuildSupport: BuildSupport): Promise<Task[]> {
  const workspaceTasks: Task[] = await getTasksFromWorkspace(workspaceFolder);
  return workspaceTasks.filter((task: Task) => {
    return isQuarkusDevTask(task, projectBuildSupport);
  });
}

export async function getRunningQuarkusDevTasks(workspaceFolder: WorkspaceFolder, projectBuildSupport: BuildSupport): Promise<TaskExecution[]> {
  const runningTasksInWorkspace: TaskExecution[] = tasks.taskExecutions.filter(taskExe => {
    return isTaskFromWorkspace(workspaceFolder, taskExe.task);
  });

  const quarkusDevTasks: Task[] = await getQuarkusDevTasks(workspaceFolder, projectBuildSupport);

  return runningTasksInWorkspace.filter((runningTask: TaskExecution) => {
    return quarkusDevTasks.some((task: Task) => {
      return _.isEqual(runningTask.task, task);
    });
  });
}

async function getTasksFromWorkspace(workspaceFolder: WorkspaceFolder): Promise<Task[]> {
  const allTasks: Task[] = await tasks.fetchTasks();
  return allTasks.filter((task: Task) => {
    return isTaskFromWorkspace(workspaceFolder, task);
  });
}

function isQuarkusDevTask(task: Task, projectBuildSupport: BuildSupport): boolean {
  const execution: ProcessExecution | ShellExecution = task.execution;
  return 'commandLine' in execution &&
    (execution.commandLine.includes(projectBuildSupport.getDefaultExecutable()) ||
    execution.commandLine.includes(projectBuildSupport.getWrapper()) ||
    execution.commandLine.includes(projectBuildSupport.getWrapperWindows()));
}

function isTaskFromWorkspace(workspaceFolder: WorkspaceFolder, task: Task): boolean {

  // check if task.scope is a WorkspaceFolder
  if (Object(task.scope) !== task.scope) {
    return false;
  }

  const taskWorkspace: WorkspaceFolder = task.scope as WorkspaceFolder;
  return taskWorkspace.uri.toString() === workspaceFolder.uri.toString();
}
