/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// -------------------------------------------------------
// Reference:
// https://github.com/microsoft/vscode-extension-samples/blob/master/quickinput-sample/src/multiStepInput.ts
// -------------------------------------------------------
import { QuickPickItem, window, Disposable, InputBox, QuickInputButton, QuickInput, QuickInputButtons, QuickPick, Uri, workspace, ConfigurationChangeEvent } from 'vscode';

class InputFlowAction {
  private constructor() { }
  static back = new InputFlowAction();
  static cancel = new InputFlowAction();
}

type InputStep = (input: MultiStepInput) => Thenable<InputStep | void>;

export interface QuickPickParameters<T extends QuickPickItem> {
  title: string;
  step?: number;
  totalSteps?: number;
  items: T[];
  activeItem?: T;
  placeholder?: string;
  buttons?: QuickInputButtonWithCallback[];
  configChanges?: ConfigChangeCallback[];
}

export interface InputBoxParameters {
  title: string;
  step?: number;
  totalSteps?: number;
  value: string;
  prompt: string;
  validate: (value: string) => Promise<string | undefined>;
  buttons?: QuickInputButtonWithCallback[];
  configChanges?: ConfigChangeCallback[];
}

export interface QuickInputButtonWithCallback extends QuickInputButton {
  callback: () => any;
}

export interface ConfigChangeCallback {
  configName: string;
  callback: () => any;
}

export class MultiStepInput {

  static async run(start: InputStep) {
    const input = new MultiStepInput();
    return input.stepThrough(start);
  }

  private current?: QuickInput;
  private steps: InputStep[] = [];

  public getStepNumber(): number {
    return this.steps.length;
  }

  public ignoreStep(): void {
    this.steps.pop();
  }

  private async stepThrough(start: InputStep) {
    let step: InputStep | void = start;
    while (step) {
      this.steps.push(step);
      if (this.current) {
        this.current.enabled = false;
        this.current.busy = true;
      }
      try {
        step = await step(this);
      } catch (err) {
        if (err === InputFlowAction.back) {
          this.steps.pop();
          step = this.steps.pop();
        } else if (err === InputFlowAction.cancel) {
          step = undefined;
        } else {
          throw err;
        }
      }
    }
    if (this.current) {
      this.current.dispose();
    }
  }

  async showQuickPick<T extends QuickPickItem, P extends QuickPickParameters<T>>({ title, step, totalSteps, items, activeItem, placeholder, buttons, configChanges}: P) {
    const disposables: Disposable[] = [];
    const displaySteps: boolean = typeof step !== 'undefined' && typeof totalSteps !== 'undefined';

    return await new Promise<T | (P extends { buttons: (infer I)[] } ? I : never)>((resolve, reject) => {
      const input: QuickPick<T> = window.createQuickPick<T>();
      input.title = title;

      if (displaySteps) {
        input.step = step;
        input.totalSteps = totalSteps;
      }

      input.totalSteps = totalSteps;
      input.placeholder = placeholder;
      input.items = items;
      if (activeItem) {
        input.activeItems = [activeItem];
      }

      input.buttons = [
        ...(this.steps.length > 1 ? [QuickInputButtons.Back] : []),
        ...(buttons || [])
      ];
      input.ignoreFocusOut = true;
      disposables.push(
        input.onDidTriggerButton((item: QuickInputButton) => {
          disposables.forEach(d => d.dispose());
          if (buttons && buttons.includes(item as QuickInputButtonWithCallback)) {
            (item as QuickInputButtonWithCallback).callback();
            resolve();
          } else if (item === QuickInputButtons.Back) {
            reject(InputFlowAction.back);
          } else {
            resolve(<any>item);
          }
        }),
        input.onDidChangeSelection(items => {
          disposables.forEach(d => d.dispose());
          resolve(items[0]);
        }),
        input.onDidHide(() => {
          input.dispose();
          disposables.forEach(d => d.dispose());
        })
      );

      if (configChanges) {
        disposables.push(workspace.onDidChangeConfiguration((event: ConfigurationChangeEvent) => {
          const configNames: string[] = configChanges.map((configChange: ConfigChangeCallback) => configChange.configName);
          const configName: string|undefined = configNames.find((name: string) => event.affectsConfiguration(name));
          if (!configName) return;

          configChanges.forEach((configChange: ConfigChangeCallback) => {
            if (configChange.configName === configName) {
              configChange.callback();
              resolve();
            }
          });
        }));
      }

      this.current = input;
      this.current.show();
    });
  }

  async showInputBox<P extends InputBoxParameters>({ title, step, totalSteps, value, prompt, validate, buttons, configChanges }: P) {
    const disposables: Disposable[] = [];
    const displaySteps: boolean = typeof step !== 'undefined' && typeof totalSteps !== 'undefined';

    return await new Promise<string | (P extends { buttons: (infer I)[] } ? I : never)>(async (resolve, reject) => {
      const input: InputBox = window.createInputBox();
      input.title = title;

      if (displaySteps) {
        input.step = step;
        input.totalSteps = totalSteps;
      }
      input.value = value;
      input.prompt = prompt;

      input.buttons = [
        ...(this.steps.length > 1 ? [QuickInputButtons.Back] : []),
        ...(buttons || [])
      ];
      input.ignoreFocusOut = true;
      const validationMessage: string = await validate(input.value);
      if (validationMessage) {
        input.validationMessage = validationMessage;
      }
      disposables.push(
        input.onDidTriggerButton((item: QuickInputButton) => {
          disposables.forEach(d => d.dispose());
          if (buttons && buttons.includes(item as QuickInputButtonWithCallback)) {
            (item as QuickInputButtonWithCallback).callback();
            resolve();
          } else if (item === QuickInputButtons.Back) {
            reject(InputFlowAction.back);
          } else {
            resolve(<any>item);
          }
        }),
        input.onDidAccept(async () => {
          const value = input.value;
          input.enabled = false;
          input.busy = true;
          if (!(await validate(value))) {
            resolve(value);
          }
          input.enabled = true;
          input.busy = false;
        }),
        input.onDidChangeValue(async text => {
          const current = validate(text);
          const validating = current;
          const validationMessage = await current;
          if (current === validating) {
            input.validationMessage = validationMessage;
          }
        }),
        input.onDidHide(() => {
          input.dispose();
          disposables.forEach(d => d.dispose());
        })
      );

      if (configChanges) {
        disposables.push(workspace.onDidChangeConfiguration((event: ConfigurationChangeEvent) => {
          const configNames: string[] = configChanges.map((configChange: ConfigChangeCallback) => configChange.configName);
          const configName: string|undefined = configNames.find((name: string) => event.affectsConfiguration(name));
          if (!configName) return;

          configChanges.forEach((configChange: ConfigChangeCallback) => {
            if (configChange.configName === configName) {
              configChange.callback();
              resolve();
            }
          });
        }));
      }

      this.current = input;
      this.current.show();
    });
  }
}
