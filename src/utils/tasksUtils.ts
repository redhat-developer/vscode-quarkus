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
import * as _ from 'lodash';

import { parse } from 'comment-json';
import { tasks, ProcessExecution, ShellExecution, Task, TaskExecution, WorkspaceFolder, TaskDefinition } from 'vscode';

export async function getQuarkusDevTasks(workspaceFolder: WorkspaceFolder): Promise<Task[]> {
  const workspaceTasks: Task[] = await getTasksFromWorkspace(workspaceFolder);
  return workspaceTasks.filter((task: Task) => {
    return isQuarkusDevTask(task);
  });
}

export async function getTasksFromWorkspace(workspaceFolder: WorkspaceFolder): Promise<Task[]> {
  const allTasks: Task[] = await tasks.fetchTasks();
  return allTasks.filter((task: Task) => {
    return isTaskFromWorkspace(workspaceFolder, task);
  });
}

export function getQuarkusDevTaskDefinitions(workspaceFolder: WorkspaceFolder): TaskDefinition[] {
  const workspaceTasks: TaskDefinition[] = getTaskDefinitionsFromWorkspace(workspaceFolder);
  return workspaceTasks.filter((task: TaskDefinition) => {
    return task.command && isQuarkusDevCommand(task.command);
  });
}

export function getTaskDefinitionsFromWorkspace(workspaceFolder: WorkspaceFolder): TaskDefinition[] {
  // If the tasks.json was created very recently, await tasks.fetchTasks() cannot
  // retrieve the new tasks.
  const tasksJson: string = workspaceFolder.uri.fsPath + '/.vscode/tasks.json';
  if (fs.existsSync(tasksJson)) {
    const tasks = parse(fs.readFileSync(tasksJson).toString());
    if (tasks.tasks) {
      return tasks.tasks as TaskDefinition[];
    }
  }
  return [];
}

export async function getRunningQuarkusDevTasks(workspaceFolder: WorkspaceFolder): Promise<TaskExecution[]> {
  const runningTasksInWorkspace: TaskExecution[] = tasks.taskExecutions.filter(taskExe => {
    return isTaskFromWorkspace(workspaceFolder, taskExe.task);
  });

  const quarkusDevTasks: Task[] = await getQuarkusDevTasks(workspaceFolder);

  return runningTasksInWorkspace.filter((runningTask: TaskExecution) => {
    return quarkusDevTasks.some((task: Task) => {
      return _.isEqual(runningTask.task, task);
    });
  });
}

function isQuarkusDevTask(task: Task): boolean {
  const execution: ProcessExecution | ShellExecution = task.execution;
  return 'commandLine' in execution && isQuarkusDevCommand(execution.commandLine);
}

function isQuarkusDevCommand(command: string): boolean {
  return command.includes('quarkus:dev');
}

function isTaskFromWorkspace(workspaceFolder: WorkspaceFolder, task: Task): boolean {

  // check if task.scope is a WorkspaceFolder
  if (Object(task.scope) !== task.scope) {
    return false;
  }

  const taskWorkspace: WorkspaceFolder = task.scope as WorkspaceFolder;
  return taskWorkspace.uri === workspaceFolder.uri;
}