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
import { formattedPathForTerminal } from '../utils/shellUtils';
import { BuildSupport, TerminalCommand, TerminalCommandOptions } from "./BuildSupport";

export class MavenBuildSupport extends BuildSupport {
  constructor() {
    super({
      buildFile: 'pom.xml',
      defaultExecutable: 'mvn',
      quarkusDev: 'quarkus:dev',
      wrapper: 'mvnw',
      wrapperWindows: 'mvnw.cmd',
      taskBeginsPattern: '^.*Scanning for projects...*',
      taskEndsPattern: '^.*Quarkus .* started in .*\\. Listening on:*'
    });
  }

  public async getQuarkusAddExtensionsCommand(folderPath: string, extensionGAVs: string[], options?: TerminalCommandOptions): Promise<TerminalCommand> {
    const addExtensions: string = `quarkus:add-extension -Dextensions="${extensionGAVs.join(',')}"`;
    const pomPath: string = options.buildFilePath ? `-f "${await formattedPathForTerminal(options.buildFilePath)}"` : '';
    const mvn: string = await this.getCommand(folderPath, options && options.buildFilePath, { windows: options && options.windows });
    const command: string = [mvn, addExtensions, pomPath].join(' ');
    const wrapperPath: string|undefined = await this.getWrapperPathFromBuildFile(options.buildFilePath, folderPath);

    return {
      cwd: wrapperPath ? wrapperPath : undefined,
      command
    };
  }

  public async getQuarkusDevCommand(folderPath: string, options?: TerminalCommandOptions): Promise<TerminalCommand> {
    const pomPath: string = options.buildFilePath ? `-f ${await formattedPathForTerminal(options.buildFilePath)}` : '';
    const mvn: string = await this.getCommand(folderPath, options && options.buildFilePath, { windows: options && options.windows });
    return { command: [mvn, this.getQuarkusDev(), pomPath].join(' ') };

  }

}
