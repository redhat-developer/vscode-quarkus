/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as path from 'path';
import * as fs from 'fs';

import { window, Uri, commands } from 'vscode';

import { INPUT_TITLE } from '../definitions/constants';
import { ConfigManager } from '../definitions/ConfigManager';
import { MultiStepInput } from '../utils/multiStepUtils';
import { downloadProject } from '../utils/requestUtils';
import { State } from '../definitions/State';
import { pickExtensionsWithLastUsed } from './pickExtensions';
import { SettingsJson } from '../definitions/ConfigManager';


import { 
  DEFAULT_GROUP_ID, 
  DEFAULT_ARTIFACT_ID, 
  DEFAULT_PROJECT_VERSION, 
  DEFAULT_PACKAGE_NAME, 
  DEFAULT_RESOURCE_NAME } from '../definitions/constants';

/**
 * A multi-step input using window.createQuickPick() and window.createInputBox().
 * 
 * This first part uses the helper class `MultiStepInput` that wraps the API for the multi-step case.
 */
export async function generateProject(configManager: ConfigManager) {

  let state: Partial<State> = {
    totalSteps: 6
  };

  const settings: SettingsJson = configManager.getSettingsJson();
  
  async function collectInputs(state: Partial<State>) {
    await MultiStepInput.run(input => inputGroupId(input, state));
  }

  async function inputGroupId(input: MultiStepInput, state: Partial<State>) {
    
    const inputBoxValue = settings.defaults.groupId ? settings.defaults.groupId : DEFAULT_GROUP_ID;
    
    state.groupId = await input.showInputBox({
      title: INPUT_TITLE,
      step: input.getStepNumber(),
      totalSteps: state.totalSteps!,
      value: inputBoxValue,
      prompt: 'Your project group id',
      validate: validateInput('group id')
    });
    return (input: MultiStepInput) => inputArtifactId(input, state);
  }

  async function inputArtifactId(input: MultiStepInput, state: Partial<State>) {
    
    const inputBoxValue = settings.defaults.artifactId ? settings.defaults.artifactId : DEFAULT_ARTIFACT_ID;
    
    state.artifactId = await input.showInputBox({
      title: INPUT_TITLE,
      step: input.getStepNumber(),
      totalSteps: state.totalSteps!,
      value: inputBoxValue,
      prompt: 'Your project artifact id',
      validate: validateInput('artifact id')
    });
    return (input: MultiStepInput) => inputProjectVersion(input, state);
  }

  async function inputProjectVersion(input: MultiStepInput, state: Partial<State>) {
    
    const inputBoxValue = settings.defaults.projectVersion ? settings.defaults.projectVersion : DEFAULT_PROJECT_VERSION;
    
    state.projectVersion = await input.showInputBox({
      title: INPUT_TITLE,
      step: input.getStepNumber(),
      totalSteps: state.totalSteps!,
      value: inputBoxValue,
      prompt: 'Your project version',
      validate: validateInput('project version')
    });
    return (input: MultiStepInput) => inputPackageName(input, state);
  }

  async function inputPackageName(input: MultiStepInput, state: Partial<State>) {

    const inputBoxValue = settings.defaults.packageName ? settings.defaults.packageName : DEFAULT_PACKAGE_NAME;

    state.packageName = await input.showInputBox({
      title: INPUT_TITLE,
      step: input.getStepNumber(),
      totalSteps: state.totalSteps!,
      value: inputBoxValue,
      prompt: 'Your package name',
      validate: validateInput('package name')
    });
    return (input: MultiStepInput) => inputResourceName(input, state);
  }

  async function inputResourceName(input: MultiStepInput, state: Partial<State>) {

    const inputBoxValue = settings.defaults.resourceName ? settings.defaults.resourceName : DEFAULT_RESOURCE_NAME;

    state.resourceName = await input.showInputBox({
      title: INPUT_TITLE,
      step: input.getStepNumber(),
      totalSteps: state.totalSteps!,
      value: inputBoxValue,
      prompt: 'Your resource name',
      validate: validateInput('resource name')
    });
    return (input: MultiStepInput) => pickExtensionsWithLastUsed(input, state, settings);
  }

  await collectInputs(state);

  let targetDir = await window.showOpenDialog(
    { canSelectFiles: false, canSelectFolders: true, canSelectMany: false, openLabel: 'Generate Here' }
  );
  if (!(targetDir && targetDir[0])) {
    window.showErrorMessage('Impossible to Create Quarkus Project: No directory provided.');
    return;
  }
  state.targetDir = Uri.file(path.join(targetDir[0].fsPath, state.artifactId!));
  if (fs.existsSync(state.targetDir.fsPath)) {
    window.showErrorMessage(`Impossible to Create Quarkus Project: Directory ${state.targetDir} already exists.`);
    return;
  }

  const fullState = state as State;

  configManager.saveDefaultsToConfig({
    groupId: fullState.groupId,
    artifactId: fullState.artifactId,
    projectVersion: fullState.projectVersion,
    packageName: fullState.packageName,
    resourceName: fullState.resourceName,
    extensions: fullState.extensions
  });

  downloadProject(fullState, settings.apiUrl).then(() => {
    return commands.executeCommand('vscode.openFolder', fullState.targetDir, true);
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