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
import { BuildSupport } from '../buildSupport/BuildSupport';

/**
 * This class is responsible for creating the .vscode/ folder (if it does not
 * exist already) and adding the launch configuration and task that runs the
 * Quarkus application in `workspaceFolder` when a debug session starts
 */
export class DebugConfigCreator {

  private dotVSCodeDir: string;

  public static async createFiles(workspaceFolder: WorkspaceFolder, projectBuildSupport: BuildSupport): Promise<void> {
    const debugConfigCreator: DebugConfigCreator = new DebugConfigCreator(workspaceFolder);
    debugConfigCreator.createVSCodeDirIfMissing();
    await TaskCreator.createTask(workspaceFolder, projectBuildSupport);
    await LaunchConfigCreator.createLaunchConfig(workspaceFolder, projectBuildSupport);
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
