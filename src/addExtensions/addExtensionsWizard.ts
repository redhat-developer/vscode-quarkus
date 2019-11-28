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
import * as path from "path";
import { AddExtensionsState, State } from "../definitions/inputState";

import { MultiStepInput } from "../utils/multiStepUtils";
import { QExtension } from "../definitions/QExtension";
import { QuickPickItem, Terminal, Uri, WorkspaceFolder, window, workspace } from "vscode";
import { ITerminalOptions, terminalCommandRunner } from "../terminal/terminalCommandRunner";
import { getBuildSupport, searchBuildFile } from '../buildSupport/BuildSupportUtils';
import { ExtensionsPicker } from "../generateProject/ExtensionsPicker";
import { TerminalCommand } from "../buildSupport/BuildSupport";

export async function addExtensionsWizard() {
  let currentStep: number = 1;
  const state: Partial<AddExtensionsState> = {
    totalSteps: 2
  };
  async function collectInputs(state: Partial<State>) {
    await MultiStepInput.run(input => chooseBuildFileIfMultipleExists(input, state));
  }

  async function chooseBuildFileIfMultipleExists(input: MultiStepInput, state: Partial<AddExtensionsState>) {

    const buildFileList: Uri[] = await searchBuildFile(); // TODO deal with this better

    if (buildFileList.length === 0) {
      throw 'pom.xml or build.gradle could not be located.';
    } else if (buildFileList.length === 1) {
      state.buildFilePath = buildFileList[0];
      state.totalSteps = 1;
      input.ignoreStep();
    } else {
      // show quick pick in this case

      const quickPickItems: QuickPickItem[] = buildFileList.map((uri: Uri) => {
        return { label: uri.fsPath };
      });

      const selectedPomPath: string = (await input.showQuickPick({
        title: "Multiple build files found under current directory. Choose a build file.",
        items: quickPickItems
      })).label;
      currentStep = 2;

      state.buildFilePath = buildFileList.filter((uri: Uri) => {
        return uri.fsPath === selectedPomPath;
      })[0];
    }

    state.workspaceFolder = workspace.getWorkspaceFolder(state.buildFilePath);
    state.buildSupport = await getBuildSupport(state.workspaceFolder);
    return (input: MultiStepInput) => ExtensionsPicker.createExtensionsPicker(input, state, { showLastUsed: false, allowZeroExtensions: false, step: currentStep });
  }

  try {
    await collectInputs(state);
  } catch (e) {
    window.showErrorMessage(e);
    return;
  }

  await executeAddExtensionsCommand(state as AddExtensionsState);
}

async function executeAddExtensionsCommand(state: AddExtensionsState): Promise<Terminal> {
  const extensionGAVs: string[] = getExtensionGAVs(state.extensions);
  let terminalOptions: ITerminalOptions = {} as ITerminalOptions;

  const terminalCommand: TerminalCommand = await state.buildSupport.getQuarkusAddExtensionsCommand(state.workspaceFolder, extensionGAVs, { buildFilePath: state.buildFilePath.fsPath });
  if (terminalCommand.cwd) {
    terminalOptions.cwd = path.dirname(terminalCommand.cwd);
  }

  const name: string = state.workspaceFolder
    ? `Quarkus-${state.workspaceFolder.name}`
    : "Quarkus";

  terminalOptions =  Object.assign({ name }, terminalOptions);

  return await terminalCommandRunner.runInTerminal(terminalCommand.command, terminalOptions);
}

function getExtensionGAVs(extensions: QExtension[]): string[] {
  return extensions.map((it) => {
    return it.getGroupIdArtifactIdString();
  });
}
