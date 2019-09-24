/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as path from 'path';
import * as fs from 'fs';
import * as fse from 'fs-extra';

import { INPUT_TITLE } from '../definitions/wizardConstants';
import { QuarkusConfig } from '../QuarkusConfig';
import { MultiStepInput } from '../utils/multiStepUtils';
import { OpenDialogOptions, Uri, commands, window } from 'vscode';
import { ProjectGenState } from '../definitions/inputState';
import { QExtension } from '../definitions/QExtension';
import { ZipFile } from 'yauzl';
import { downloadProject } from '../utils/requestUtils';
import { pickExtensionsWithLastUsed } from './pickExtensions';
import { validateArtifactId, validateGroupId, validatePackageName, validateResourceName, validateVersion } from './validateInput';

/**
 * A multi-step input using window.createQuickPick() and window.createInputBox().
 *
 * This first part uses the helper class `MultiStepInput` that wraps the API for the multi-step case.
 */
export async function generateProjectWizard() {

  const state: Partial<ProjectGenState> = {
    totalSteps: 6
  };

  async function collectInputs(state: Partial<ProjectGenState>) {
    await MultiStepInput.run(input => inputGroupId(input, state));
  }

  async function inputGroupId(input: MultiStepInput, state: Partial<ProjectGenState>) {

    const defaultInputBoxValue: string = QuarkusConfig.getDefaultGroupId();
    const inputBoxValue: string = state.groupId ? state.groupId : defaultInputBoxValue;

    state.groupId = await input.showInputBox({
      title: INPUT_TITLE,
      step: input.getStepNumber(),
      totalSteps: state.totalSteps,
      value: inputBoxValue,
      prompt: 'Your project groupId',
      validate: validateGroupId
    });

    return state.wizardInterrupted ? null : (input: MultiStepInput) => inputArtifactId(input, state);
  }

  async function inputArtifactId(input: MultiStepInput, state: Partial<ProjectGenState>) {

    const defaultInputBoxValue: string = QuarkusConfig.getDefaultArtifactId();
    const inputBoxValue: string = state.artifactId ? state.artifactId : defaultInputBoxValue;

    state.artifactId = await input.showInputBox({
      title: INPUT_TITLE,
      step: input.getStepNumber(),
      totalSteps: state.totalSteps,
      value: inputBoxValue,
      prompt: 'Your project artifactId',
      validate: validateArtifactId
    });
    return state.wizardInterrupted ? null : (input: MultiStepInput) => inputProjectVersion(input, state);
  }

  async function inputProjectVersion(input: MultiStepInput, state: Partial<ProjectGenState>) {

    const defaultInputBoxValue: string = QuarkusConfig.getDefaultProjectVersion();
    const inputBoxValue: string = state.projectVersion ? state.projectVersion : defaultInputBoxValue;

    state.projectVersion = await input.showInputBox({
      title: INPUT_TITLE,
      step: input.getStepNumber(),
      totalSteps: state.totalSteps,
      value: inputBoxValue,
      prompt: 'Your project version',
      validate: validateVersion
    });
    return state.wizardInterrupted ? null : (input: MultiStepInput) => inputPackageName(input, state);
  }

  async function inputPackageName(input: MultiStepInput, state: Partial<ProjectGenState>) {

    const defaultInputBoxValue: string = QuarkusConfig.getDefaultPackageName();
    const inputBoxValue: string = state.packageName ? state.packageName : (state.groupId ? state.groupId : defaultInputBoxValue);

    state.packageName = await input.showInputBox({
      title: INPUT_TITLE,
      step: input.getStepNumber(),
      totalSteps: state.totalSteps,
      value: inputBoxValue,
      prompt: 'Your package name',
      validate: validatePackageName
    });
    return state.wizardInterrupted ? null : (input: MultiStepInput) => inputResourceName(input, state);
  }

  async function inputResourceName(input: MultiStepInput, state: Partial<ProjectGenState>) {

    const defaultInputBoxValue: string = QuarkusConfig.getDefaultResourceName();
    const inputBoxValue: string = state.resourceName ? state.resourceName : defaultInputBoxValue;

    state.resourceName = await input.showInputBox({
      title: INPUT_TITLE,
      step: input.getStepNumber(),
      totalSteps: state.totalSteps,
      value: inputBoxValue,
      prompt: 'Your resource name',
      validate: validateResourceName
    });
    return state.wizardInterrupted ? null : (input: MultiStepInput) => pickExtensionsWithLastUsed(input, state);
  }

  await collectInputs(state);

  if (state.wizardInterrupted) {
    window.showErrorMessage(state.wizardInterrupted.reason);
    return;
  }

  try {
    state.targetDir = await getTargetDirectory(state.artifactId);

    const projectGenState: ProjectGenState = state as ProjectGenState;
    saveDefaultsToConfig(projectGenState);
    deleteFolderIfExists(getNewProjectDirectory(projectGenState));
    await downloadAndSetupProject(projectGenState);
  } catch (message) {
    window.showErrorMessage(message);
  }
}

async function getTargetDirectory(projectName: string) {
  const MESSAGE_EXISTING_FOLDER = `'${projectName}' already exists in selected directory.`;
  const LABEL_CHOOSE_FOLDER = 'Generate Here';
  const OPTION_OVERWRITE = 'Overwrite';
  const OPTION_CHOOSE_NEW_DIR = 'Choose new directory';

  let directory: Uri|undefined = await showOpenFolderDialog({ openLabel: LABEL_CHOOSE_FOLDER });

  while (directory && fs.existsSync(path.join(directory.path, projectName))) {
    const overrideChoice: string = await window.showWarningMessage(MESSAGE_EXISTING_FOLDER, OPTION_OVERWRITE, OPTION_CHOOSE_NEW_DIR);
    if (overrideChoice === OPTION_CHOOSE_NEW_DIR) {
      directory = await showOpenFolderDialog({ openLabel: LABEL_CHOOSE_FOLDER });
    } else if (overrideChoice === OPTION_OVERWRITE) {
      break;
    } else { // User closed the warning window
      directory = undefined;
      break;
    }
  }

  if (!directory) {
    throw 'Project generation has been canceled.';
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

function saveDefaultsToConfig(state: ProjectGenState): void {
  QuarkusConfig.setDefaults({
    groupId: state.groupId,
    artifactId: state.artifactId,
    projectVersion: state.projectVersion,
    packageName: state.packageName,
    resourceName: state.resourceName,
    extensions: state.extensions.map((extension: QExtension) => {
      return extension.getGroupIdArtifactIdString();
    })
  });
}

function deleteFolderIfExists(path: Uri): void {
  if (fs.existsSync(path.fsPath)) {
    fse.removeSync(path.fsPath);
  }
}

function getNewProjectDirectory(state: ProjectGenState): Uri {
  return Uri.file(path.join(state.targetDir.fsPath, state.artifactId));
}

async function downloadAndSetupProject(state: ProjectGenState): Promise<void> {
  const projectDir = getNewProjectDirectory(state);
  const zip: ZipFile = await downloadProject(state);
  zip.on('end', () => {
    commands.executeCommand('vscode.openFolder', projectDir, true);
  });
}