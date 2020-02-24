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

import { WorkspaceFolder } from 'vscode';
import { TaskCreator } from './TaskCreator';
import { LaunchConfigCreator } from './LaunchConfigCreator';
import { BuildSupport } from '../../buildSupport/BuildSupport';

/**
 * This class is responsible for creating the .vscode/ folder (if it does not
 * exist already) and adding the launch configuration and task that runs the
 * Quarkus application in `workspaceFolder` when a debug session starts
 */
export class DebugConfigCreator {
  private dotVSCodeDir: string;

  /**
   * Creates the necessary debug configuration and task in order to debug a Quarkus project
   * located directly under `projectFolder`.
   *
   * Please note that the `workspaceFolder`'s path and the `projectFolder` path could be different.
   *
   * The Quarkus project could be located in any depth within the `workspaceFolder`'s path, but must
   * be located directly within the `projectFolder` path.
   *
   * @param workspaceFolder     the workspace folder containing the Quarkus project
   * @param projectFolder       the path to the project folder to debug
   * @param projectBuildSupport the build support for the project to debug
   */
  public static async createFiles(workspaceFolder: WorkspaceFolder, projectFolder: string, projectBuildSupport: BuildSupport): Promise<void> {
    const debugConfigCreator: DebugConfigCreator = new DebugConfigCreator(workspaceFolder);
    debugConfigCreator.createVSCodeDirIfMissing();
    await TaskCreator.createTask(workspaceFolder, projectFolder, projectBuildSupport);
    await LaunchConfigCreator.createLaunchConfig(workspaceFolder, projectFolder, projectBuildSupport);
  }

  private constructor(workspaceFolder: WorkspaceFolder) {
    this.dotVSCodeDir = workspaceFolder.uri.fsPath + '/.vscode';
  }

  private createVSCodeDirIfMissing(): void {
    if (!fs.existsSync(this.dotVSCodeDir)) {
      fs.mkdirSync(this.dotVSCodeDir);
    }
  }
}
