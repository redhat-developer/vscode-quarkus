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
import { ConfigurationChangeEvent, Disposable, DebugConfiguration, WorkspaceFolder, workspace, ConfigurationTarget } from 'vscode';
import { BuildSupport } from '../../buildSupport/BuildSupport';
import { FsUtils } from '../../utils/fsUtils';
import { getQuarkusDevDebugConfig } from '../../utils/launchConfigUtils';

/**
 * This class is responsible for creating the debug Task that calls the
 * Quarkus dev command.
 */
export class LaunchConfigCreator {

  private workspaceFolder: WorkspaceFolder;
  private projectFolder: string;
  private quarkusBuildSupport: BuildSupport;
  private launchJsonFile: string;

  /**
   * Returns a debug task that calls the Quarkus dev command
   * @param workspaceFolder the workspaceFolder containing the Quarkus project
   * @param quarkusBuildSupport specifies whether the project in `workspaceFolder` is a Maven project or Gradle project
   */
  public static async createLaunchConfig(workspaceFolder: WorkspaceFolder, projectFolder: string, quarkusBuildSupport: BuildSupport): Promise<void> {
    const launchConfigCreator: LaunchConfigCreator = new LaunchConfigCreator(workspaceFolder, projectFolder, quarkusBuildSupport);
    await launchConfigCreator.createLaunchJsonIfMissing();
    await launchConfigCreator.addLaunchConfig();
    await launchConfigCreator.waitUntilTaskExists();
  }

  private constructor(workspaceFolder: WorkspaceFolder, projectFolder: string, quarkusBuildSupport: BuildSupport) {
    this.workspaceFolder = workspaceFolder;
    this.projectFolder = projectFolder;
    this.quarkusBuildSupport = quarkusBuildSupport;
    this.launchJsonFile = workspaceFolder.uri.fsPath + '/.vscode/launch.json';
  }

  private async createLaunchJsonIfMissing(): Promise<void> {
    const configurationsKey = 'configurations';
    const launchKey = 'launch';
    const versionKey = 'version';
    const launchVersion = '0.2.0';

    const workspaceConfiguration = workspace.getConfiguration(launchKey, this.workspaceFolder.uri);

    // Get all registered launch configurations and version
    const configurations = workspaceConfiguration.get(configurationsKey);
    const version = workspaceConfiguration.get(versionKey);

    if (Array.isArray(configurations) && version) {
      return;
    }

    // Create launch.json file with empty list of configurations and with version 0.2.0
    await workspaceConfiguration.update(versionKey, launchVersion, ConfigurationTarget.WorkspaceFolder);
    await workspaceConfiguration.update(configurationsKey, [], ConfigurationTarget.WorkspaceFolder);

    // If launch.json was created in .vscode/ directory, add special comments on top of the file
    if (fs.existsSync(this.launchJsonFile)) {
      this.prependLaunchJsonComment();
    }
  }

  private prependLaunchJsonComment() {
    let comment: string = `// A launch configuration that compiles the extension and then opens it inside a new window\n`;
    comment += `// Use IntelliSense to learn about possible attributes.\n`;
    comment += `// Hover to view descriptions of existing attributes.\n`;
    comment += `// For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387\n`;
    FsUtils.prependToFile(this.launchJsonFile, comment);
  }

  private async addLaunchConfig(): Promise<void> {
    const launchJson = workspace.getConfiguration('launch', this.workspaceFolder.uri);
    const configurations: DebugConfiguration[] = launchJson.get<DebugConfiguration[]>('configurations');
    configurations.push(await this.getLaunchConfig());
    await launchJson.update('configurations', configurations, ConfigurationTarget.WorkspaceFolder);
  }

  private async getLaunchConfig(): Promise<DebugConfiguration> {
    const relativePath: string = path.relative(this.workspaceFolder.uri.fsPath, this.projectFolder);
    const launchConfigName: string = `Debug Quarkus application${(relativePath.length > 0 ? ` (${relativePath})` : '')}`;

    const launchConfig: DebugConfiguration =
      {
        preLaunchTask: this.quarkusBuildSupport.getQuarkusDevTaskName(this.workspaceFolder, this.projectFolder),
        type: 'java',
        request: 'attach',
        hostName: 'localhost',
        name: launchConfigName,
        port: 5005
      } as DebugConfiguration;

    return launchConfig;
  }

  private async waitUntilTaskExists(): Promise<void> {
    if (await getQuarkusDevDebugConfig(this.workspaceFolder, this.projectFolder, this.quarkusBuildSupport)) {
      return;
    }

    return new Promise((resolve) => {
      const disposable: Disposable = workspace.onDidChangeConfiguration(async (event: ConfigurationChangeEvent) => {
        if (event.affectsConfiguration('launch', this.workspaceFolder.uri)) {
          if (await getQuarkusDevDebugConfig(this.workspaceFolder, this.projectFolder, this.quarkusBuildSupport)) {
            disposable.dispose();
            resolve();
          }
        }
      });
    });
  }
}
