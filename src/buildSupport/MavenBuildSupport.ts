import { BuildSupport, TerminalCommand, TerminalCommandOptions } from "./BuildSupport";
import { WorkspaceFolder } from 'vscode';
import { formattedPathForTerminal } from '../utils/shellUtils';

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

  public async getQuarkusAddExtensionsCommand(workspaceFolder: WorkspaceFolder, extensionGAVs: string[], options?: TerminalCommandOptions): Promise<TerminalCommand> {
    const addExtensions: string = `quarkus:add-extension -Dextensions="${extensionGAVs.join(',')}"`;
    const pomPath: string = options.buildFilePath ? `-f "${await formattedPathForTerminal(options.buildFilePath)}"` : '';
    const mvn: string = await this.getCommand(workspaceFolder, options && options.buildFilePath, { windows: options && options.windows });
    const command: string = [mvn, addExtensions, pomPath].join(' ');
    const wrapperPath: string|undefined = await this.getWrapperPathFromBuildFile(options.buildFilePath, workspaceFolder);

    return {
      cwd: wrapperPath ? wrapperPath : undefined,
      command
    };
  }

  public async getQuarkusDevCommand(workspaceFolder: WorkspaceFolder, options?: TerminalCommandOptions): Promise<TerminalCommand> {
    const pomPath: string = options.buildFilePath ? `-f ${await formattedPathForTerminal(options.buildFilePath)}` : '';
    const mvn: string = await this.getCommand(workspaceFolder, options && options.buildFilePath, { windows: options && options.windows });
    return { command: [mvn, this.getQuarkusDev(), pomPath].join(' ') };

  }

}
