/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// -------------------------------------------------------
// Reference:
// https://github.com/microsoft/vscode-extension-samples/blob/master/quickinput-sample/src/multiStepInput.ts
// -------------------------------------------------------
import { QuickPickItem, window, Disposable, InputBox, QuickInputButton, QuickInput, QuickInputButtons, QuickPick } from 'vscode';

class InputFlowAction {
  private constructor() { }
  static back = new InputFlowAction();
  static cancel = new InputFlowAction();
}

type InputStep = (input: MultiStepInput) => Thenable<InputStep | void>;

interface QuickPickParameters<T extends QuickPickItem> {
  title: string;
  step?: number;
  totalSteps?: number;
  items: T[];
  activeItem?: T;
  placeholder?: string;
  buttons?: QuickInputButton[];
}

interface InputBoxParameters {
  title: string;
  step?: number;
  totalSteps?: number;
  value: string;
  prompt: string;
  validate: (value: string) => Promise<string | undefined>;
  buttons?: QuickInputButton[];
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

  async showQuickPick<T extends QuickPickItem, P extends QuickPickParameters<T>>({ title, step, totalSteps, items, activeItem, placeholder, buttons }: P) {
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
        input.onDidTriggerButton(item => {
          if (item === QuickInputButtons.Back) {
            reject(InputFlowAction.back);
          } else {
            resolve(<any>item);
          }
        }),
        input.onDidChangeSelection(items => resolve(items[0])),
        input.onDidHide(() => {
          input.dispose();
          disposables.forEach(d => d.dispose());
        })
      );
      this.current = input;
      this.current.show();
    });
  }

  async showInputBox<P extends InputBoxParameters>({ title, step, totalSteps, value, prompt, validate, buttons }: P) {
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
        input.onDidTriggerButton(item => {
          if (item === QuickInputButtons.Back) {
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
      this.current = input;
      this.current.show();
    });
  }
}
