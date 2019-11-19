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
import { QuarkusConfig, TerminateProcessConfig } from '../QuarkusConfig';
import { DebugSession, TaskExecution, debug, window } from 'vscode';
import { Disposable } from 'vscode-languageclient';
import { getRunningQuarkusDevTasks } from '../utils/tasksUtils';
import { BuildSupport } from '../buildSupport/BuildSupport';
import { getBuildSupport } from '../buildSupport/BuildSupportUtils';

export function createTerminateDebugListener(): Disposable {

  return debug.onDidTerminateDebugSession(async (debugSession: DebugSession) => {

    if (QuarkusConfig.getTerminateProcessOnDebugExit() === TerminateProcessConfig.Ask) {
      await new Promise((resolve) => setTimeout(resolve, 400));
    }

    let quarkusDevTaskExe: TaskExecution;

    try {
      checkHasPreLaunchTask(debugSession);
      quarkusDevTaskExe = await getPreLaunchTaskExecution(debugSession);
    } catch (message) {
      // debugger for a non Quarkus project has terminated
      // don't display an error message
      return;
    }

    const terminate: boolean = await getUserInputTerminate();

    if (terminate) {
      quarkusDevTaskExe.terminate();
    }

  });
}

function checkHasPreLaunchTask(debugSession: DebugSession): void {
  if (typeof debugSession.configuration.preLaunchTask === 'undefined') {
    throw 'Pre launch task does not exist';
  }
}

async function getPreLaunchTaskExecution(debugSession: DebugSession): Promise<TaskExecution> {

  const preLaunchTask: string = debugSession.configuration.preLaunchTask;

  const projectBuildSupport: BuildSupport = await getBuildSupport(debugSession.workspaceFolder);
  const runningQuarkusDevTasks: TaskExecution[] = await getRunningQuarkusDevTasks(debugSession.workspaceFolder, projectBuildSupport);

  for (const taskExe of runningQuarkusDevTasks) {
    if (taskExe.task.name === preLaunchTask) {
      return taskExe;
    }
  }
  throw `Task named ${preLaunchTask} is not a running quarkus:dev task in closed debug session's WorkspaceFolder`;
}

function saveToConfig(terminate: boolean, askAgain: boolean): void {
  let save: TerminateProcessConfig;
  if (askAgain) {
    save = TerminateProcessConfig.Ask;
  } else if (terminate) {
    save = TerminateProcessConfig.Terminate;
  } else if (!terminate) {
    save = TerminateProcessConfig.DontTerminate;
  }
  QuarkusConfig.setTerminateProcessOnDebugExit(save);
}

async function getUserInputTerminate(): Promise<boolean> {
  const terminateConfig: TerminateProcessConfig = QuarkusConfig.getTerminateProcessOnDebugExit();

  if (terminateConfig === TerminateProcessConfig.Ask) {
    const TERM_TASK = 'Terminate task';
    const DONT_TERM_TASK = 'Keep task running';
    const REMEMBER = 'Remember my choice';
    const ASK_AGAIN = 'Ask again next time';

    const terminateInput: string | undefined = await window.showInformationMessage('Debug session was terminated. Would you like to terminate the quarkus:dev task?', TERM_TASK, DONT_TERM_TASK);

    if (typeof terminateInput === 'undefined') {
      return false;
    }
    const terminate: boolean = terminateInput === TERM_TASK;
    const rememberMessage = `Do you want to always ${terminate ? 'terminate the task': 'keep the task running'}?`;
    const rememberInput: string | undefined = await window.showInformationMessage(rememberMessage, REMEMBER, ASK_AGAIN);

    if (typeof rememberInput === 'undefined') {
      return terminate;
    }

    const askAgain: boolean = rememberInput === ASK_AGAIN;
    saveToConfig(terminate, askAgain);

    return terminateInput === TERM_TASK;
  }

  return terminateConfig === TerminateProcessConfig.Terminate;
}
