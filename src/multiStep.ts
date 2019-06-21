/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as path from 'path';
import * as fs from 'fs';

import { window, ExtensionContext, Uri, commands } from 'vscode';

import { INPUT_TITLE, TOTAL_STEPS } from './constants';
import { MultiStepInput } from './multiStepUtils';
import { getQExtensions, downloadProject } from './requestUtils';
import { QExtension } from './interface/QExtension';
import { State } from './class/State';
import { pickExtensions } from './pickExtensions';

/**
 * A multi-step input using window.createQuickPick() and window.createInputBox().
 * 
 * This first part uses the helper class `MultiStepInput` that wraps the API for the multi-step case.
 */
export async function multiStepInput() {

  let state: State = new State();
  let extensions: QExtension[] = await getQExtensions(state);

  async function collectInputs(state: State) {
    await MultiStepInput.run(input => inputGroupId(input, state));
  }

  async function inputGroupId(input: MultiStepInput, state: State) {
    state.groupId = await input.showInputBox({
      title: INPUT_TITLE,
      step: 1,
      totalSteps: TOTAL_STEPS,
      value: state.groupId,
      prompt: 'Your project group id',
      validate: validateNameIsUnique,
      shouldResume: shouldResume
    });
    return (input: MultiStepInput) => inputArtifactId(input, state);
  }

  async function inputArtifactId(input: MultiStepInput, state: State) {
    state.artifactId = await input.showInputBox({
      title: INPUT_TITLE,
      step: 2,
      totalSteps: TOTAL_STEPS,
      value: state.artifactId,
      prompt: 'Your project artifact id',
      validate: validateNameIsUnique,
      shouldResume: shouldResume
    });
    return (input: MultiStepInput) => inputProjectVersion(input, state);
  }

  async function inputProjectVersion(input: MultiStepInput, state: State) {
    state.projectVersion = await input.showInputBox({
      title: INPUT_TITLE,
      step: 3,
      totalSteps: TOTAL_STEPS,
      value: state.projectVersion,
      prompt: 'Your project version',
      validate: validateNameIsUnique,
      shouldResume: shouldResume
    });
    return (input: MultiStepInput) => inputPackageName(input, state);
  }

  async function inputPackageName(input: MultiStepInput, state: State) {
    state.packageName = await input.showInputBox({
      title: INPUT_TITLE,
      step: 4,
      totalSteps: TOTAL_STEPS,
      value: state.packageName,
      prompt: 'Your package name',
      validate: validateNameIsUnique,
      shouldResume: shouldResume
    });
    return (input: MultiStepInput) => inputResourceName(input, state);
  }

  async function inputResourceName(input: MultiStepInput, state: State) {
    state.resourceName = await input.showInputBox({
      title: INPUT_TITLE,
      step: 5,
      totalSteps: TOTAL_STEPS,
      value: state.resourceName,
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

  await collectInputs(state);

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

  // config.set(state);\
  state.save();
  downloadProject(state).then(() => {
    return commands.executeCommand('vscode.openFolder', state.targetDir, true);
  });
}