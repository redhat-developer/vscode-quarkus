/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as path from 'path';
import * as fs from 'fs';

import { window, Uri, commands } from 'vscode';

import { INPUT_TITLE, TOTAL_STEPS } from '../definitions/constants';
import { MultiStepInput } from '../utils/multiStepUtils';
import { downloadProject } from '../utils/requestUtils';
import { State } from '../definitions/State';
import { pickExtensionsWithLastUsed } from './pickExtensions';

/**
 * A multi-step input using window.createQuickPick() and window.createInputBox().
 * 
 * This first part uses the helper class `MultiStepInput` that wraps the API for the multi-step case.
 */
export async function generateProject() {

  let state: State = new State();
  
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
      validate: validateInput('group id')
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
      validate: validateInput('artifact id')
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
      validate: validateInput('project version')
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
      validate: validateInput('package name')
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
      validate: validateInput('resource name')
    });
    return (input: MultiStepInput) => pickExtensionsWithLastUsed(input, state);
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

function validateInput(name: string) {
  return async function f(userInput : string) {
    const re = new RegExp("^[A-Za-z0-9_\\-.]+$");
    if (!re.test(userInput)) {
      return `Invalid ${name}`;
    }
    return undefined;
  };
}