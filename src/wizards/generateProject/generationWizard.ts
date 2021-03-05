/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as path from 'path';
import { commands, OpenDialogOptions, QuickPickItem, Uri, window, workspace } from 'vscode';
import { ZipFile } from 'yauzl';
import { BuildToolName, INPUT_TITLE } from '../../definitions/constants';
import { ProjectGenState } from '../../definitions/inputState';
import { QExtension } from '../../definitions/QExtension';
import { QuarkusContext } from '../../QuarkusContext';
import { CodeQuarkusFunctionality, getCodeQuarkusApiFunctionality, getDefaultFunctionality } from '../../utils/codeQuarkusApiUtils';
import { MultiStepInput, QuickPickParameters } from '../../utils/multiStepUtils';
import { downloadProject } from '../../utils/requestUtils';
import { ExtensionsPicker } from './ExtensionsPicker';
import { validateArtifactId, validateGroupId, validatePackageName, validateResourceName, validateVersion } from './validateInput';

/**
 * A multi-step input using window.createQuickPick() and window.createInputBox().
 *
 * This first part uses the helper class `MultiStepInput` that wraps the API for the multi-step case.
 */
export async function generateProjectWizard() {

  let apiCapabilities: CodeQuarkusFunctionality;
  try {
    apiCapabilities = await getCodeQuarkusApiFunctionality();
  } catch (e) {
    apiCapabilities = getDefaultFunctionality();
  }

  const state: Partial<ProjectGenState> = {
    totalSteps: 7 + (apiCapabilities.canExcludeSampleCode ? 1 : 0)
  };

  async function collectInputs(state: Partial<ProjectGenState>) {
    await MultiStepInput.run(input => inputBuildTool(input, state));
  }

  async function inputBuildTool(input: MultiStepInput, state: Partial<ProjectGenState>) {

    interface BuildToolPickItem extends QuickPickItem {
      preferred: boolean;
    }

    const defaultBuildTool: BuildToolName = QuarkusContext.getDefaultBuildTool();
    const quickPickItems: BuildToolPickItem[] = [
      { label: BuildToolName.Maven, preferred: BuildToolName.Maven === defaultBuildTool },
      { label: BuildToolName.Gradle, preferred: BuildToolName.Gradle === defaultBuildTool }
    ];

    // Place the preferred option first in the quick pick list
    quickPickItems.sort((x: BuildToolPickItem, y: BuildToolPickItem) => {
      return (x.preferred === y.preferred) ? 0 : x.preferred ? -1 : 1;
    });

    state.buildTool = (await input.showQuickPick({
      title: 'Quarkus Tools',
      step: input.getStepNumber(),
      totalSteps: state.totalSteps,
      placeholder: 'Pick build tool',
      items: quickPickItems,
      activeItem: quickPickItems[0]
    })).label;

    return (input: MultiStepInput) => inputGroupId(input, state);
  }

  async function inputGroupId(input: MultiStepInput, state: Partial<ProjectGenState>) {

    const defaultInputBoxValue: string = QuarkusContext.getDefaultGroupId();
    const inputBoxValue: string = state.groupId ? state.groupId : defaultInputBoxValue;

    state.groupId = await input.showInputBox({
      title: INPUT_TITLE,
      step: input.getStepNumber(),
      totalSteps: state.totalSteps,
      value: inputBoxValue,
      prompt: 'Your project groupId',
      validate: validateGroupId
    });

    return (input: MultiStepInput) => inputArtifactId(input, state);
  }

  async function inputArtifactId(input: MultiStepInput, state: Partial<ProjectGenState>) {

    const defaultInputBoxValue: string = QuarkusContext.getDefaultArtifactId();
    const inputBoxValue: string = state.artifactId ? state.artifactId : defaultInputBoxValue;

    state.artifactId = await input.showInputBox({
      title: INPUT_TITLE,
      step: input.getStepNumber(),
      totalSteps: state.totalSteps,
      value: inputBoxValue,
      prompt: 'Your project artifactId',
      validate: validateArtifactId
    });
    return (input: MultiStepInput) => inputProjectVersion(input, state);
  }

  async function inputProjectVersion(input: MultiStepInput, state: Partial<ProjectGenState>) {

    const defaultInputBoxValue: string = QuarkusContext.getDefaultProjectVersion();
    const inputBoxValue: string = state.projectVersion ? state.projectVersion : defaultInputBoxValue;

    state.projectVersion = await input.showInputBox({
      title: INPUT_TITLE,
      step: input.getStepNumber(),
      totalSteps: state.totalSteps,
      value: inputBoxValue,
      prompt: 'Your project version',
      validate: validateVersion
    });
    return (input: MultiStepInput) => inputPackageName(input, state);
  }

  async function inputPackageName(input: MultiStepInput, state: Partial<ProjectGenState>) {

    const defaultInputBoxValue: string = QuarkusContext.getDefaultPackageName();
    const inputBoxValue: string = state.packageName ? state.packageName : (state.groupId ? state.groupId : defaultInputBoxValue);

    state.packageName = await input.showInputBox({
      title: INPUT_TITLE,
      step: input.getStepNumber(),
      totalSteps: state.totalSteps,
      value: inputBoxValue,
      prompt: 'Your package name',
      validate: validatePackageName
    });
    return (input: MultiStepInput) => inputResourceName(input, state);
  }

  async function inputResourceName(input: MultiStepInput, state: Partial<ProjectGenState>) {

    const defaultInputBoxValue: string = QuarkusContext.getDefaultResourceName();
    const inputBoxValue: string = state.resourceName ? state.resourceName : defaultInputBoxValue;

    state.resourceName = await input.showInputBox({
      title: INPUT_TITLE,
      step: input.getStepNumber(),
      totalSteps: state.totalSteps,
      value: inputBoxValue,
      prompt: 'Your resource name',
      validate: validateResourceName
    });
    return (input: MultiStepInput) => ExtensionsPicker.createExtensionsPicker(
      input, state, { showLastUsed: true, showRequiredExtensions: true, allowZeroExtensions: true },
      (apiCapabilities.canExcludeSampleCode ? inputGenerateSampleCode: undefined));
  }

  async function inputGenerateSampleCode(input: MultiStepInput, state: Partial<ProjectGenState>) {
    const YES: string = 'Include sample code';
    const NO: string = 'Do not include sample code';
    const quickPickItems: QuickPickItem[] = [
      {label: YES, picked: true},
      {label: NO}
    ];

    state.isGenerateSampleCode = (await input.showQuickPick<QuickPickItem, QuickPickParameters<QuickPickItem>>({
      title: INPUT_TITLE,
      placeholder: 'Should sample code be included? Additional dependencies may be added along with the sample.',
      step: input.getStepNumber(),
      totalSteps: state.totalSteps,
      items: quickPickItems,
    })).label === YES;
  }

  await collectInputs(state);

  state.targetDir = await getTargetDirectory(state.artifactId);

  const projectGenState: ProjectGenState = state as ProjectGenState;
  saveDefaults(projectGenState);
  deleteFolderIfExists(getNewProjectDirectory(projectGenState));
  await downloadAndSetupProject(projectGenState);
}

async function getTargetDirectory(projectName: string) {
  const MESSAGE_EXISTING_FOLDER = `'${projectName}' already exists in selected directory.`;
  const LABEL_CHOOSE_FOLDER = 'Generate Here';
  const OPTION_OVERWRITE = 'Overwrite';
  const OPTION_CHOOSE_NEW_DIR = 'Choose new directory';

  const defaultDirectoryUri = workspace.workspaceFolders ? workspace.workspaceFolders[0].uri : undefined;
  let directory: Uri | undefined = await showOpenFolderDialog({ openLabel: LABEL_CHOOSE_FOLDER, defaultUri: defaultDirectoryUri });

  while (directory && fs.existsSync(path.join(directory.fsPath, projectName))) {
    const overrideChoice: string = await window.showWarningMessage(MESSAGE_EXISTING_FOLDER, OPTION_OVERWRITE, OPTION_CHOOSE_NEW_DIR);
    if (overrideChoice === OPTION_CHOOSE_NEW_DIR) {
      directory = await showOpenFolderDialog({ openLabel: LABEL_CHOOSE_FOLDER, defaultUri: defaultDirectoryUri });
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

function saveDefaults(state: ProjectGenState): void {

  const optionalExtensions: QExtension[] = state.extensions.filter((extension: QExtension) => !extension.isRequired);

  QuarkusContext.setDefaults({
    buildTool: state.buildTool,
    groupId: state.groupId,
    artifactId: state.artifactId,
    projectVersion: state.projectVersion,
    packageName: state.packageName,
    resourceName: state.resourceName,
    extensions: optionalExtensions.map((extension: QExtension) => {
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
  const projectDir: Uri = getNewProjectDirectory(state);
  const zip: ZipFile = await downloadProject(state);
  zip.on('end', () => {
    openProject(projectDir);
  });
}

async function openProject(uri: Uri): Promise<void> {
  const NEW_WINDOW: string = 'Open in new window';
  const CURRENT_WINDOW: string = 'Open in current window';
  const ADD_TO_WORKSPACE: string = 'Add to current workspace';

  if (workspace.workspaceFolders) {
    const input: string | undefined = await window.showInformationMessage('New project has been generated.', NEW_WINDOW, ADD_TO_WORKSPACE);
    if (!input) return;
    if (input === NEW_WINDOW) {
      commands.executeCommand('vscode.openFolder', uri, true);
    } else {
      addFolderToWorkspace(uri);
    }
  } else if (window.visibleTextEditors.length > 0) {
    const input: string | undefined = await window.showInformationMessage('New project has been generated.', NEW_WINDOW, CURRENT_WINDOW);
    if (!input) return;
    commands.executeCommand('vscode.openFolder', uri, NEW_WINDOW === input);
  } else {
    commands.executeCommand('vscode.openFolder', uri, false);
  }

}

function addFolderToWorkspace(uri: Uri): void {
  workspace.updateWorkspaceFolders(
    workspace.workspaceFolders ? workspace.workspaceFolders.length : 0,
    undefined,
    { uri }
  );
}
