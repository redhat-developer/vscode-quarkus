/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as path from 'path';
import * as fs from 'fs';

import { window, ExtensionContext, workspace, Uri, commands } from 'vscode';

import { MultiStepInput } from './multiStepUtils';
import { getQExtensions, downloadProject } from './requestUtils';

import { QExtension } from './interface/QExtension';
import { State } from './interface/State';

import { Config } from './class/Config';

import { pickExtensions } from './pickExtensions';

const INPUT_TITLE: string = 'Quarkus Tools';
const TOTAL_STEPS: number = 6;
const DEFAULT_URL: string = 'http://quarkus-generator.6923.rh-us-east-1.openshiftapps.com';

/**
 * A multi-step input using window.createQuickPick() and window.createInputBox().
 * 
 * This first part uses the helper class `MultiStepInput` that wraps the API for the multi-step case.
 */
export async function multiStepInput(context: ExtensionContext) {

  const config: Config = new Config();
  let extensions: QExtension[] = await getQExtensions(config);

  async function collectInputs() {
    const state = {} as Partial<State>;
    await MultiStepInput.run(input => inputGroupId(input, state));
    return state as State;
  }

  async function inputGroupId(input: MultiStepInput, state: Partial<State>) {
    state.groupId = await input.showInputBox({
      title: INPUT_TITLE,
      step: 1,
      totalSteps: TOTAL_STEPS,
      value: state.groupId ? state.groupId : 'Default group id',
      prompt: 'Your project group id',
      validate: validateNameIsUnique,
      shouldResume: shouldResume
    });
    return (input: MultiStepInput) => inputArtifactId(input, state);
  }

  async function inputArtifactId(input: MultiStepInput, state: Partial<State>) {
    state.artifactId = await input.showInputBox({
      title: INPUT_TITLE,
      step: 2,
      totalSteps: TOTAL_STEPS,
      value: state.artifactId ? state.artifactId : 'Default artifact id',
      prompt: 'Your project artifact id',
      validate: validateNameIsUnique,
      shouldResume: shouldResume
    });
    return (input: MultiStepInput) => inputProjectVersion(input, state);
  }

  async function inputProjectVersion(input: MultiStepInput, state: Partial<State>) {
    state.projectVersion = await input.showInputBox({
      title: INPUT_TITLE,
      step: 3,
      totalSteps: TOTAL_STEPS,
      value: state.projectVersion ? state.projectVersion : 'Default project version',
      prompt: 'Your project version',
      validate: validateNameIsUnique,
      shouldResume: shouldResume
    });
    return (input: MultiStepInput) => inputPackageName(input, state);
  }

  async function inputPackageName(input: MultiStepInput, state: Partial<State>) {
    state.packageName = await input.showInputBox({
      title: INPUT_TITLE,
      step: 4,
      totalSteps: TOTAL_STEPS,
      value: state.packageName ? state.packageName : 'Default package name',
      prompt: 'Your package name',
      validate: validateNameIsUnique,
      shouldResume: shouldResume
    });
    return (input: MultiStepInput) => inputResourceName(input, state);
  }

  async function inputResourceName(input: MultiStepInput, state: Partial<State>) {
    state.resourceName = await input.showInputBox({
      title: INPUT_TITLE,
      step: 5,
      totalSteps: TOTAL_STEPS,
      value: state.resourceName ? state.resourceName : 'Default resource name',
      prompt: 'Your resource name',
      validate: validateNameIsUnique,
      shouldResume: shouldResume
    });
    return (input: MultiStepInput) => pickExtensions(input, state, extensions);
  }

  function shouldResume() {
    // Could show a notification with the option to resume.
    return new Promise<boolean>((resolve, reject) => {
      window.showInformationMessage('Hello World!', 'happy', 'sad').then((answer) => {
        resolve(true);
      });
    });
  }

  async function validateNameIsUnique(name: string) {
    // ...validate...
    // await new Promise(resolve => setTimeout(resolve, 1000));
    return name === 'vscode' ? 'Name not unique' : undefined;
  }

  const state = await collectInputs();

  let targetDir = await window.showOpenDialog(
    { canSelectFiles: false, canSelectFolders: true, canSelectMany: false, openLabel: 'Generate Here' }
  );
  if (!(targetDir && targetDir[0])) {
    window.showErrorMessage('Impossible to Create Quarkus Project: No directory provided.');
    return;
  }
  state.targetDir = Uri.file(path.join(targetDir[0].fsPath, state.artifactId));
  if (fs.existsSync(state.targetDir.fsPath)) {
    window.showErrorMessage(`Impossible to Create Quarkus Project: Directory ${state.targetDir} already exists.`);
    return;
  }

  config.set(state);
  downloadProject(config).then(() => {
    return commands.executeCommand('vscode.openFolder', config.targetDir, true);
  });

  window.showInformationMessage(`Creating Application Service '${state.groupId}'`);
}


function saveToConfig(state: Partial<State>) {
  const config = {
    apiUrl: DEFAULT_URL,
    defaults: {
      groupId: state.groupId,
      artifactId: state.artifactId,
      projectVersion: state.projectVersion,
      packageName: state.packageName,
      resourceName: state.resourceName,
      extensions: state.extensions
    }
  };
  workspace.getConfiguration().update('quarkus.tools.starter', config, true);
}