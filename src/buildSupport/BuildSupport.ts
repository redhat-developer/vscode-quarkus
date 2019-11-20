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
import * as findUp from 'find-up';
import { Uri, WorkspaceFolder } from 'vscode';
import { FsUtils } from '../utils/fsUtils';
import { TaskPattern } from './TaskPattern';
import { formattedPathForTerminal } from '../utils/shellUtils';
import { getFilePathsFromWorkspace } from '../utils/workspaceUtils';

interface BuildSupportData {
  buildFile: string;
  defaultExecutable: string;
  quarkusDev: string;
  wrapper: string;
  wrapperWindows: string;
  taskBeginsPattern: string;
  taskEndsPattern: string;
}

/**
 * Interface representing a command for the terminal to run
 *
 * `cwd` change working directory: path to cd to before running `command`
 * `command` the command to run
 */
export interface TerminalCommand {
  cwd?: string;
  command: string;
}

/**
 * Options for creating a `TerminalCommand`
 *
 * `buildFilePath` is the absolute path to the pom.xml or build.gradle
 *                 this is needed for the `mvn -f` or `gradle -b` flags
 * `windows` whether the command is for windows or not. If omitted, the OS
 *           is detected automatically
 */
export interface TerminalCommandOptions {
  buildFilePath?: string;
  windows?: boolean ;
}

export abstract class BuildSupport {
  buildSupportData: BuildSupportData;

  constructor(buildSupportData: BuildSupportData) {
    this.buildSupportData = buildSupportData;
  }

  /**
   * Returns a command that adds all extensions listed in `extensionGAVs`
   * @param workspaceFolder
   * @param extensionGAVs
   * @param options
   */
  public abstract getQuarkusAddExtensionsCommand(workspaceFolder: WorkspaceFolder, extensionGAVs: string[], options?: TerminalCommandOptions): Promise<TerminalCommand>;

  /**
   * Returns a command that runs the Quarkus application using 'Quarkus Dev'
   * @param workspaceFolder
   * @param options
   */
  public abstract getQuarkusDevCommand(workspaceFolder: WorkspaceFolder, options?: TerminalCommandOptions): Promise<TerminalCommand>;

  /**
   * Returns an appropriate build tool command depending on `options` and `buildFilePath`
   *
   * Examples:
   * `mvn`
   * `./mvnw`
   * `.\\mvnw.cmd`
   * `gradle`
   * `./gradlew`
   * `.\\gradlew.bat`
   *
   * @param workspaceFolder
   * @param buildFilePath used to help locate an appropriate wrapper file
   * @param options
   */
  public async getCommand(workspaceFolder: WorkspaceFolder, buildFilePath?: string, options?: { windows?: boolean }): Promise<string> {
    if ((options && options.windows) || ((!options || typeof options.windows === 'undefined') && process.platform === 'win32')) {
      return await this.getWindowsCommand(workspaceFolder, buildFilePath);
    } else {
      return await this.getUnixCommand(workspaceFolder, buildFilePath);
    }
  }

  private async getWindowsCommand(workspaceFolder: WorkspaceFolder, buildFilePath?: string): Promise<string> {
    let command: string;
    if (await this.wrapperExistsWindows(workspaceFolder, buildFilePath)) {
      command = `.\\${this.buildSupportData.wrapperWindows}`;
    } else {
      command = await formattedPathForTerminal(this.buildSupportData.defaultExecutable);
    }
    return command;
  }

  private async getUnixCommand(workspaceFolder: WorkspaceFolder, buildFilePath?: string): Promise<string> {
    let command: string;
    if (await this.wrapperExistsUnix(workspaceFolder, buildFilePath)) {
      command = `./${this.buildSupportData.wrapper}`;
    } else {
      command = this.buildSupportData.defaultExecutable;
    }
    return command;
  }

  /**
   * Determines if Windows wrapper file exists
   *
   * If `buildFilePath` is provided, checks if wrapper file exists between root of `workspaceFolder` and
   * directory of `buildFilePath` inclusive
   *
   * If `buildFilePath` is not provided, checks if wrapper file exists in root of `workspaceFolder`
   *
   * @param workspaceFolder
   * @param buildFilePath
   */
  private async wrapperExistsWindows(workspaceFolder: WorkspaceFolder, buildFilePath?: string) {
    if (buildFilePath) {
      return await this.getWrapperPathFromBuildFile(buildFilePath, workspaceFolder, { windows: true }) !== undefined;
    } else {
      return (await getFilePathsFromWorkspace(workspaceFolder, this.buildSupportData.wrapperWindows)).length > 0;
    }
  }

  /**
   * Determines if Unix wrapper file exists
   *
   * If `buildFilePath` is provided, checks if wrapper file exists between root of `workspaceFolder` and
   * directory of `buildFilePath` inclusive
   *
   * If `buildFilePath` is not provided, checks if wrapper file exists in root of `workspaceFolder`
   *
   * @param workspaceFolder
   * @param buildFilePath
   */
  private async wrapperExistsUnix(workspaceFolder: WorkspaceFolder, buildFilePath?: string) {
    if (buildFilePath) {
      return await this.getWrapperPathFromBuildFile(buildFilePath, workspaceFolder, { windows: false }) !== undefined;
    } else {
      return (await getFilePathsFromWorkspace(workspaceFolder, this.buildSupportData.wrapper)).length > 0;
    }
  }

  /**
   * Returns a promise resolving with the absolute path of the
   * wrapper file located closest to build file (pom.xml/build.gradle)
   * provided by `buildFilePath`.
   * @param buildFilePath path to build file (pom.xml/build.gradle)
   * @param workspaceFolder workspace folder containing pom.xml specified by `buildFilePath`
   * @param options options for OS
   */
  public async getWrapperPathFromBuildFile(buildFilePath: string|Uri, workspaceFolder: WorkspaceFolder, options?: { windows: boolean }): Promise<string | undefined> {
    const findUpOptions = { cwd: typeof buildFilePath === 'string' ? buildFilePath : buildFilePath.fsPath };
    const wrapperFileName: string = ((options && options.windows) || process.platform === 'win32') ? this.buildSupportData.wrapperWindows : this.buildSupportData.wrapper;

    const topLevelFolder: string = workspaceFolder.uri.fsPath;
    return await findUp(dir => {
      return (!FsUtils.isSameDirectory(topLevelFolder, dir) && !FsUtils.isSubDirectory(topLevelFolder, dir)) ? findUp.stop : wrapperFileName;
    }, findUpOptions);
  }

  public getQuarkusDev(): string {
    return this.buildSupportData.quarkusDev;
  }

  public getDefaultExecutable(): string {
    return this.buildSupportData.defaultExecutable;
  }

  public getWrapper(): string {
    return this.buildSupportData.wrapper;
  }

  public getWrapperWindows(): string {
    return this.buildSupportData.wrapperWindows;
  }

  public getTaskPatterns(): TaskPattern {
    return {
      beginsPattern: this.buildSupportData.taskBeginsPattern,
      endsPattern: this.buildSupportData.taskEndsPattern
    };
  }
}
