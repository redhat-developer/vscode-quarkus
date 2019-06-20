/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { QuickPickItem, window, CancellationToken, QuickInputButton, ExtensionContext, Uri } from 'vscode';

import { MultiStepInput } from './multiStepUtils';
import { getQExtensions } from './requestUtils';

import { QExtension } from './definitions';

const INPUT_TITLE: string = 'Quarkus Tools';
const TOTAL_STEPS: number = 6;

interface State {
  groupId: string;
  artifactId: string;
  projectVersion: string;
  packageName: string;
  resourceName: string;
  extensions: string[];
}

/**
 * A multi-step input using window.createQuickPick() and window.createInputBox().
 * 
 * This first part uses the helper class `MultiStepInput` that wraps the API for the multi-step case.
 */
export async function multiStepInput(context: ExtensionContext) {

  const resourceGroups: QuickPickItem[] = ['vscode-data-function', 'vscode-appservice-microservices', 'vscode-appservice-monitor', 'vscode-appservice-preview', 'vscode-appservice-prod']
    .map(label => ({ label }));

  async function collectInputs() {
    const state = {} as Partial<State>;
    // await MultiStepInput.run(input => inputGroupId(input, state));

    await MultiStepInput.run(input => pickExtensions(input, state));
    return state as State;
  }

  async function inputGroupId(input: MultiStepInput, state: Partial<State>) {
    state.groupId = await input.showInputBox({
      title: INPUT_TITLE,
      step: 1,
      totalSteps: TOTAL_STEPS,
      value: 'Default group id',
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
      value: 'Default artifact id',
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
      value: 'Default project version',
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
      value: 'Default package name',
      prompt: 'Your package name',
      validate: validateNameIsUnique,
      shouldResume: shouldResume
    });
    return (input: MultiStepInput) => inputResourceName(input, state);
  }

  async function inputResourceName(input: MultiStepInput, state: Partial<State>) {
    state.packageName = await input.showInputBox({
      title: INPUT_TITLE,
      step: 5,
      totalSteps: TOTAL_STEPS,
      value: 'Default resource name',
      prompt: 'Your resource name',
      validate: validateNameIsUnique,
      shouldResume: shouldResume
    });
    return (input: MultiStepInput) => pickExtensions(input, state);
  }

  async function pickExtensions(input: MultiStepInput, state: Partial<State>) {
    const extensions: QExtension[] = await getQExtensions();

    const pick = await input.showQuickPick({
      title: INPUT_TITLE,
      step: 6,
      totalSteps: TOTAL_STEPS,
      placeholder: 'Pick extensions (placeholder)',
      items: resourceGroups,
      shouldResume: shouldResume
    });
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

  async function getAvailableRuntimes(resourceGroup: QuickPickItem | string, token?: CancellationToken): Promise<QuickPickItem[]> {
    // ...retrieve...
    // await new Promise(resolve => setTimeout(resolve, 1000));
    return ['Node 8.9', 'Node 6.11', 'Node 4.5']
      .map(label => ({ label }));
  }

  const state = await collectInputs();
  window.showInformationMessage(`Creating Application Service '${state.groupId}'`);
}