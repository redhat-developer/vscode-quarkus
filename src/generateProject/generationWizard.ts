/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as path from 'path';
import * as fs from 'fs';

import { OpenDialogOptions, Uri, commands, window } from 'vscode';
import { Config } from '../Config';
import { MultiStepInput } from '../utils/multiStepUtils';
import { downloadProject } from '../utils/requestUtils';
import { ProjectGenState } from '../definitions/inputState';
import { pickExtensionsWithLastUsed } from './pickExtensions';
import { INPUT_TITLE } from '../definitions/projectGenerationConstants';

/**
 * A multi-step input using window.createQuickPick() and window.createInputBox().
 *
 * This first part uses the helper class `MultiStepInput` that wraps the API for the multi-step case.
 */
export async function generateProject() {

  const state: Partial<ProjectGenState> = {
    totalSteps: 6
  };

  async function collectInputs(state: Partial<ProjectGenState>) {
    await MultiStepInput.run(input => inputGroupId(input, state));
  }

  async function inputGroupId(input: MultiStepInput, state: Partial<ProjectGenState>) {

    const defaultInputBoxValue: string = Config.getDefaultGroupId();
    const inputBoxValue: string = state.groupId ? state.groupId : defaultInputBoxValue;

    state.groupId = await input.showInputBox({
      title: INPUT_TITLE,
      step: input.getStepNumber(),
      totalSteps: state.totalSteps,
      value: inputBoxValue,
      prompt: 'Your project group id',
      validate: validateInput('group id')
    });

    return state.wizardInterrupted ? null : (input: MultiStepInput) => inputArtifactId(input, state);
  }

  async function inputArtifactId(input: MultiStepInput, state: Partial<ProjectGenState>) {

    const defaultInputBoxValue: string = Config.getDefaultArtifactId();
    const inputBoxValue: string = state.artifactId ? state.artifactId : defaultInputBoxValue;

    state.artifactId = await input.showInputBox({
      title: INPUT_TITLE,
      step: input.getStepNumber(),
      totalSteps: state.totalSteps,
      value: inputBoxValue,
      prompt: 'Your project artifact id',
      validate: validateInput('artifact id')
    });
    return state.wizardInterrupted ? null : (input: MultiStepInput) => inputProjectVersion(input, state);
  }

  async function inputProjectVersion(input: MultiStepInput, state: Partial<ProjectGenState>) {

    const defaultInputBoxValue: string = Config.getDefaultProjectVersion();
    const inputBoxValue: string = state.projectVersion ? state.projectVersion : defaultInputBoxValue;

    state.projectVersion = await input.showInputBox({
      title: INPUT_TITLE,
      step: input.getStepNumber(),
      totalSteps: state.totalSteps,
      value: inputBoxValue,
      prompt: 'Your project version',
      validate: validateInput('project version')
    });
    return state.wizardInterrupted ? null : (input: MultiStepInput) => inputPackageName(input, state);
  }

  async function inputPackageName(input: MultiStepInput, state: Partial<ProjectGenState>) {

    const defaultInputBoxValue: string = Config.getDefaultPackageName();
    const inputBoxValue: string = state.packageName ? state.packageName : defaultInputBoxValue;

    state.packageName = await input.showInputBox({
      title: INPUT_TITLE,
      step: input.getStepNumber(),
      totalSteps: state.totalSteps,
      value: inputBoxValue,
      prompt: 'Your package name',
      validate: validateInput('package name')
    });
    return state.wizardInterrupted ? null : (input: MultiStepInput) => inputResourceName(input, state);
  }

  async function inputResourceName(input: MultiStepInput, state: Partial<ProjectGenState>) {

    const defaultInputBoxValue: string = Config.getDefaultResourceName();
    const inputBoxValue: string = state.resourceName ? state.resourceName : defaultInputBoxValue;

    state.resourceName = await input.showInputBox({
      title: INPUT_TITLE,
      step: input.getStepNumber(),
      totalSteps: state.totalSteps,
      value: inputBoxValue,
      prompt: 'Your resource name',
      validate: validateInput('resource name')
    });
    return state.wizardInterrupted ? null : (input: MultiStepInput) => pickExtensionsWithLastUsed(input, state);
  }

  await collectInputs(state);

  if (state.wizardInterrupted) {
    window.showErrorMessage(state.wizardInterrupted.reason);
    return;
  }

  state.targetDir = await getTargetDirectory(state.artifactId);

  if (!state.targetDir) {
    window.showErrorMessage(`Project generation has been canceled.`);
    return;
  }

  Config.saveDefaults({
    groupId: state.groupId,
    artifactId: state.artifactId,
    projectVersion: state.projectVersion,
    packageName: state.packageName,
    resourceName: state.resourceName,
    extensions: state.extensions
  });

  tryDownloadProject(state as ProjectGenState);
}

async function tryDownloadProject(state: ProjectGenState): Promise<void> {
  try {
    await downloadProject(state);
    const dirToOpen = Uri.file(path.join(state.targetDir.fsPath, state.artifactId));
    commands.executeCommand('vscode.openFolder', dirToOpen, true);
  } catch (err) {
    window.showErrorMessage(err);
  }
}
async function getTargetDirectory(projectName: string) {
  const MESSAGE_EXISTING_FOLDER = `'${projectName}' already exists in selected directory.`;
  const LABEL_CHOOSE_FOLDER = 'Generate Here';
  const OPTION_OVERWRITE = 'Overwrite';
  const OPTION_CHOOSE_NEW_DIR = 'Choose new directory';

  let directory = await showOpenFolderDialog({ openLabel: LABEL_CHOOSE_FOLDER });

  while (directory && fs.existsSync(path.join(directory.path, projectName))) {
    const overrideChoice: string = await window.showWarningMessage(MESSAGE_EXISTING_FOLDER, OPTION_OVERWRITE, OPTION_CHOOSE_NEW_DIR);
    if (overrideChoice === OPTION_CHOOSE_NEW_DIR) {
      directory = await showOpenFolderDialog({ openLabel: LABEL_CHOOSE_FOLDER });
    } else if (overrideChoice === OPTION_OVERWRITE) {
        break;
    } else { // User closed the warning window
      return;
    }
  }
  return directory;
}

async function showOpenFolderDialog(customOptions: OpenDialogOptions): Promise<Uri> {
  const options: OpenDialogOptions = {
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
  };

  const result: Uri[] = await window.showOpenDialog(Object.assign(options, customOptions));
  if (result && result.length) {
      return Promise.resolve(result[0]);
  } else {
      return Promise.resolve(undefined);
  }
}

function validateInput(name: string) {
  return async function f(userInput: string) {
    const re = new RegExp("^[A-Za-z0-9_\\-.]+$");
    if (!re.test(userInput)) {
      return `Invalid ${name}`;
    }
    return undefined;
  };
}
