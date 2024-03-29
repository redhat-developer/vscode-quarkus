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

import { tasks, ProcessExecution, ShellExecution, Task, TaskExecution, WorkspaceFolder, CustomExecution } from 'vscode';
import { BuildSupport } from '../buildSupport/BuildSupport';
import { getFilePathsFromFolder } from '../utils/workspaceUtils';

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

export function getTaskExecutionWorkingDir(task: Task): string|undefined {
  if (!task.execution || task.execution instanceof CustomExecution) return undefined;

  const taskExecution: ProcessExecution | ShellExecution = task.execution;
  if (!taskExecution.options || !taskExecution.options.cwd) {
    return './';
  }

  return task.execution.options.cwd;
}

async function getTasksFromWorkspace(workspaceFolder: WorkspaceFolder): Promise<Task[]> {
  const allTasks: Task[] = await tasks.fetchTasks();
  return allTasks.filter((task: Task) => {
    return isTaskFromWorkspace(workspaceFolder, task);
  });
}

function isQuarkusDevTask(task: Task, projectBuildSupport: BuildSupport): boolean {

  const execution: ProcessExecution | ShellExecution | CustomExecution = task.execution;

  if (!execution || !(execution as ShellExecution)) {
    return false;
  }

  const shellExecution: ShellExecution = execution as ShellExecution;

  return shellExecution?.commandLine?.includes(projectBuildSupport.getDefaultExecutable())
    || shellExecution?.commandLine?.includes(projectBuildSupport.getWrapper())
    || shellExecution?.commandLine?.includes(projectBuildSupport.getWrapperWindows());
}

export async function shouldUpdateTaskCommand(folderPath: string, task: Task, projectBuildSupport: BuildSupport): Promise<boolean> {

  const execution: ProcessExecution | ShellExecution | CustomExecution = task.execution;

  if (!execution || !(execution as ShellExecution)) {
    return false;
  }

  const shellExecution: ShellExecution = execution as ShellExecution;

  if (process.platform === 'win32') {
    const wrapperExistsWindows = (await getFilePathsFromFolder(folderPath, projectBuildSupport.getWrapperWindows())).length > 0;
    if (shellExecution?.commandLine?.includes(projectBuildSupport.getWrapperWindows())) {
      // should update task command if the current command calls wrapper and wrapper does not exist
      return !wrapperExistsWindows;
    }
    // should update task command if the current command does not use wrapper but wrapper exists
    return wrapperExistsWindows;
  } else {
    // on linux:
    const wrapperExistsUnix = (await getFilePathsFromFolder(folderPath, projectBuildSupport.getWrapper())).length > 0;
    if (shellExecution?.commandLine?.includes(projectBuildSupport.getWrapper())) {
      return !wrapperExistsUnix;
    }
    return wrapperExistsUnix;
  }
}

function isTaskFromWorkspace(workspaceFolder: WorkspaceFolder, task: Task): boolean {

  // check if task.scope is a WorkspaceFolder
  if (Object(task.scope) !== task.scope) {
    return false;
  }

  const taskWorkspace: WorkspaceFolder = task.scope as WorkspaceFolder;
  return taskWorkspace.uri.toString() === workspaceFolder.uri.toString();
}
