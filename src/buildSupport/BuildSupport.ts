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
import * as path from 'path';
import * as findUp from 'find-up';
import { Uri, WorkspaceFolder } from 'vscode';
import { FsUtils } from '../utils/fsUtils';
import { TaskPattern } from './TaskPattern';
import { formattedPathForTerminal } from '../utils/shellUtils';
import { getFilePathsFromFolder } from '../utils/workspaceUtils';

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
   * @param folderPath
   * @param extensionGAVs
   * @param options
   */
  public abstract getQuarkusAddExtensionsCommand(folderPath: string, extensionGAVs: string[], options?: TerminalCommandOptions): Promise<TerminalCommand>;

  /**
   * Returns a command that runs the Quarkus application using 'Quarkus Dev'
   * @param folderPath
   * @param options
   */
  public abstract getQuarkusDevCommand(folderPath: string, options?: TerminalCommandOptions): Promise<TerminalCommand>;

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
   * @param folderPath
   * @param buildFilePath used to help locate an appropriate wrapper file
   * @param options
   */
  public async getCommand(folderPath: string, buildFilePath?: string, options?: { windows?: boolean }): Promise<string> {
    if ((options && options.windows) || ((!options || typeof options.windows === 'undefined') && process.platform === 'win32')) {
      return await this.getWindowsCommand(folderPath, buildFilePath);
    } else {
      return await this.getUnixCommand(folderPath, buildFilePath);
    }
  }

  private async getWindowsCommand(folderPath: string, buildFilePath?: string): Promise<string> {
    let command: string;
    if (await this.wrapperExistsWindows(folderPath, buildFilePath)) {
      command = `.\\${this.buildSupportData.wrapperWindows}`;
    } else {
      command = await formattedPathForTerminal(this.buildSupportData.defaultExecutable);
    }
    return command;
  }

  private async getUnixCommand(folderPath: string, buildFilePath?: string): Promise<string> {
    let command: string;
    if (await this.wrapperExistsUnix(folderPath, buildFilePath)) {
      command = `./${this.buildSupportData.wrapper}`;
    } else {
      command = this.buildSupportData.defaultExecutable;
    }
    return command;
  }

  /**
   * Determines if Windows wrapper file exists
   *
   * If `buildFilePath` is provided, checks if wrapper file exists between root of `folderPath` and
   * directory of `buildFilePath` inclusive
   *
   * If `buildFilePath` is not provided, checks if wrapper file exists in root of `folderPath`
   *
   * @param folderPath
   * @param buildFilePath
   */
  private async wrapperExistsWindows(folderPath: string, buildFilePath?: string) {
    if (buildFilePath) {
      return await this.getWrapperPathFromBuildFile(buildFilePath, folderPath, { windows: true }) !== undefined;
    } else {
      return (await getFilePathsFromFolder(folderPath, this.buildSupportData.wrapperWindows)).length > 0;
    }
  }

  /**
   * Determines if Unix wrapper file exists
   *
   * If `buildFilePath` is provided, checks if wrapper file exists between root of `folderPath` and
   * directory of `buildFilePath` inclusive
   *
   * If `buildFilePath` is not provided, checks if wrapper file exists in root of `folderPath`
   *
   * @param folderPath
   * @param buildFilePath
   */
  private async wrapperExistsUnix(folderPath: string, buildFilePath?: string) {
    if (buildFilePath) {
      return await this.getWrapperPathFromBuildFile(buildFilePath, folderPath, { windows: false }) !== undefined;
    } else {
      return (await getFilePathsFromFolder(folderPath, this.buildSupportData.wrapper)).length > 0;
    }
  }

  /**
   * Returns a promise resolving with the absolute path of the
   * wrapper file located closest to build file (pom.xml/build.gradle)
   * provided by `buildFilePath`.
   * @param buildFilePath path to build file (pom.xml/build.gradle)
   * @param folderPath folder containing pom.xml specified by `buildFilePath`
   * @param options options for OS
   */
  public async getWrapperPathFromBuildFile(buildFilePath: string|Uri, folderPath: string, options?: { windows: boolean }): Promise<string | undefined> {
    const findUpOptions = { cwd: typeof buildFilePath === 'string' ? buildFilePath : buildFilePath.fsPath };
    const wrapperFileName: string = ((options && options.windows) || process.platform === 'win32') ? this.buildSupportData.wrapperWindows : this.buildSupportData.wrapper;

    return await findUp(dir => {
      return (!FsUtils.isSameDirectory(folderPath, dir) && !FsUtils.isSubDirectory(folderPath, dir)) ? findUp.stop : wrapperFileName;
    }, findUpOptions);
  }

  public getBuildFile(): string {
    return this.buildSupportData.buildFile;
  }

  public getQuarkusDev(): string {
    return this.buildSupportData.quarkusDev;
  }

  public getQuarkusDevTaskName(workspaceFolder: WorkspaceFolder, projectFolder: string): string {
    const relativePath: string =  path.relative(workspaceFolder.uri.fsPath, projectFolder);
    return  this.buildSupportData.quarkusDev + (relativePath.length > 0 ? ` (${relativePath})` : '');
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
