import { BuildSupport, TerminalCommand, TerminalCommandOptions } from "./BuildSupport";
import { WorkspaceFolder } from 'vscode';
import { formattedPathForTerminal } from '../utils/shellUtils';

export class GradleBuildSupport extends BuildSupport {

  constructor() {
    super({
      buildFile: 'build.gradle',
      defaultExecutable: 'gradle',
      quarkusDev: 'quarkusDev',
      wrapper: 'gradlew',
      wrapperWindows: 'gradlew.bat',
      taskBeginsPattern: '^.*Starting a Gradle Daemon*',
      taskEndsPattern: '^.*Quarkus .* started in .*\\. Listening on:*'
    });
  }

  public async getQuarkusAddExtensionsCommand(folderPath: string, extensionGAVs: string[], options?: TerminalCommandOptions): Promise<TerminalCommand> {
    const addExtensions: string = `addExtension --extensions="${extensionGAVs.join(',')}"`;
    const buildGradlePath: string = `-b "${await formattedPathForTerminal(options.buildFilePath)}"`;
    const gradle: string = await this.getCommand(folderPath, options && options.buildFilePath, { windows: options && options.windows });
    const command = [gradle, addExtensions, buildGradlePath].join(' ');

    const wrapperPath: string|undefined = await this.getWrapperPathFromBuildFile(options.buildFilePath, folderPath);

    return {
      cwd: wrapperPath ? wrapperPath : undefined,
      command
    };
  }

  public async getQuarkusDevCommand(folderPath: string, options?: TerminalCommandOptions): Promise<TerminalCommand> {
    const quarkusDev: string = `${this.getQuarkusDev()} --console=plain`;
    const gradle: string = await this.getCommand(folderPath, options.buildFilePath, { windows: options.windows });
    return { command: [gradle, quarkusDev].join(' ') };
  }
}
