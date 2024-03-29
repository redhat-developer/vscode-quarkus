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
import * as fs from "fs";
import * as path from "path";
import { Terminal, Uri, workspace, WorkspaceFolder } from "vscode";
import { TerminalCommand } from "../../buildSupport/BuildSupport";
import { AddExtensionsState, State } from "../../definitions/inputState";
import { ProjectLabelInfo } from "../../definitions/ProjectLabelInfo";
import { QExtension } from "../../definitions/QExtension";
import { ITerminalOptions, terminalCommandRunner } from "../../terminal/terminalCommandRunner";
import { MultiStepInput } from "../../utils/multiStepUtils";
import { ExtensionsPicker } from "../generateProject/ExtensionsPicker";
import { getQuarkusProject } from "../getQuarkusProject";
import { sendTelemetry } from "../../utils/telemetryUtils";
import { VSCodeCommands } from "../../definitions/constants";

export async function addExtensionsWizard(): Promise<void> {
  const currentStep = 1;
  const state: Partial<AddExtensionsState> = {
    totalSteps: 1
  };
  async function collectInputs(state: Partial<State>) {
    await MultiStepInput.run(input => ExtensionsPicker.createExtensionsPicker(input, state, { showLastUsed: false, showRequiredExtensions: false, allowZeroExtensions: false, step: currentStep }));
  }

  const projectInfo: ProjectLabelInfo | undefined = await getQuarkusProject();
  if (!projectInfo) return;
  const workspaceFolder: WorkspaceFolder | undefined = workspace.getWorkspaceFolder(Uri.file(projectInfo.uri));
  state.workspaceFolder = workspaceFolder;
  state.buildSupport = projectInfo.getBuildSupport();

  const buildFilePath: string = path.join(projectInfo.uri, state.buildSupport.getBuildFile());
  if (!fs.existsSync(buildFilePath)) {
    throw `${state.buildSupport.getBuildFile()} does not exist under ${path.basename(projectInfo.uri)}`;
  }

  state.buildFilePath = Uri.file(buildFilePath);
  await collectInputs(state);

  await executeAddExtensionsCommand(state as AddExtensionsState);
}

async function executeAddExtensionsCommand(state: AddExtensionsState): Promise<Terminal> {
  const extensionGAVs: string[] = getExtensionGAVs(state.extensions);
  let terminalOptions: ITerminalOptions = {} as ITerminalOptions;

  const terminalCommand: TerminalCommand = await state.buildSupport.getQuarkusAddExtensionsCommand(state.workspaceFolder.uri.fsPath, extensionGAVs, { buildFilePath: state.buildFilePath.fsPath });
  if (terminalCommand.cwd) {
    terminalOptions.cwd = path.dirname(terminalCommand.cwd);
  }

  const name: string = state.workspaceFolder
    ? `Quarkus-${state.workspaceFolder.name}`
    : "Quarkus";

  terminalOptions = Object.assign({ name }, terminalOptions);

  sendTelemetry(VSCodeCommands.ADD_EXTENSIONS, {
    extensions: state.extensions.map(e => e.getGroupIdArtifactIdString()),
  });
  return await terminalCommandRunner.runInTerminal(terminalCommand.command, terminalOptions);
}

function getExtensionGAVs(extensions: QExtension[]): string[] {
  return extensions.map((it) => {
    return it.getGroupIdArtifactIdString();
  });
}
