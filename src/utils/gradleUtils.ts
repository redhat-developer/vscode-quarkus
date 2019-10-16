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

import * as which from "which";
import * as fs from 'fs';
import { WorkspaceFolder } from 'vscode';

const GRADLEW: string = 'gradlew';
const GRADLEW_BAT: string = 'gradlew.bat';

export namespace GradleUtils {

  export const QUARKUS_DEV: string = 'quarkusDev';

  /**
   * Returns true if gradlew.bat file exists in root of `workspaceFolder`
   * @param workspaceFolder
   */
  export function gradleWrapperExistsWindows(workspaceFolder: WorkspaceFolder) {
    const gradlew: string[] = fs.readdirSync(workspaceFolder.uri.fsPath).filter(fn => fn === GRADLEW_BAT);
    return gradlew.length > 0;
  }

  /**
   * Returns true if gradlew file exists in root of `workspaceFolder`
   * @param workspaceFolder
   */
  export function gradleWrapperExistsUnix(workspaceFolder: WorkspaceFolder) {
    const gradlew: string[] = fs.readdirSync(workspaceFolder.uri.fsPath).filter(fn => fn === GRADLEW);
    return gradlew.length > 0;
  }

  /**
   * Returns a promise resolving with `'gradle'` if Gradle
   * executable is found in PATH.
   * Resolves with `undefined` otherwise.
   */
  export async function getDefaultGradleExecutable(): Promise<String | undefined> {
    return await (new Promise<string>((resolve) => {
      which("gradle", (_err, filepath) => {
          if (filepath) {
              resolve("gradle");
          } else {
              resolve(undefined);
          }
      });
    }));
  }

  export function getUnixGradleWrapperExecutable() {
    return `./${GRADLEW}`;
  }

  export function getWindowsGradleWrapperExecutable() {
    return `.\\${GRADLEW_BAT}`;
  }

  export function isGradleQuarkusDevCommand(command: string) {
    return command.includes(QUARKUS_DEV) && command.includes('gradle');
  }
}