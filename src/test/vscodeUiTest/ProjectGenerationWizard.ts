/**
 * Copyright 2019 Red Hat, Inc. and others.

 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

 *     http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as _ from 'lodash';
import { By, InputBox, Key, QuickPickItem, WebDriver, WebElement, Workbench } from 'vscode-extension-tester';
import { DialogHandler, OpenDialog } from 'vscode-extension-tester-native';

/**
 * This class represents the project generation wizard visible
 * when the 'Quarkus: Generate a Quarkus project' VS Code command
 * is called.
 */
export class ProjectGenerationWizard extends InputBox {

  private currStep: number = 1;

  /**
   * The number of steps the wizard has
   */
  private lastStep: number = 8;

  /**
   * Opens the project generation wizard
   * @param driver
   */
  public static async openWizard(driver: WebDriver): Promise<ProjectGenerationWizard> {
    await (new Workbench()).executeCommand('Quarkus: Generate a Quarkus project');
    return (new ProjectGenerationWizard().wait(30000));
  }

  /**
   * Opens the project generation wizard and creates a new project
   * according to `options`
   * @param driver
   * @param options
   */
  public static async generateProject(driver: WebDriver, options: {
    buildTool?: string,
    groupId?: string,
    artifactId?: string,
    projectVersion?: string,
    packageName?: string,
    resourceName?: string,
    extensions?: string[],
    dest: string
  }): Promise<boolean> {
    const wizard: ProjectGenerationWizard = await this.openWizard(driver);
    try {
    if (options.buildTool) await wizard.setText(options.buildTool);
    await wizard.next();
    if (options.groupId) await wizard.setText(options.groupId);
    await wizard.next();
    if (options.artifactId) await wizard.setText(options.artifactId);
    await wizard.next();
    if (options.projectVersion) await wizard.setText(options.projectVersion);
    await wizard.next();
    if (options.packageName) await wizard.setText(options.packageName);
    await wizard.next();
    if (options.resourceName) await wizard.setText(options.resourceName);
    await wizard.next();

    if (options.extensions) {
      for (const extensionName of options.extensions) {
        await wizard.setText(extensionName);
        await wizard.confirm();
      }
    }
    await wizard.focusQuickPick(0);
    await wizard.next();
    await wizard.focusQuickPick(0);
    await wizard.next();

    const dialog: OpenDialog = await DialogHandler.getOpenDialog();
    await dialog.selectPath(options.dest);
    await dialog.confirm();
    } catch {
      return false;
    }

    // wait until project finishes downloading
    await new Promise(res => setTimeout(res, 4000));
    return true;
  }

  public async setText(newText: string) {
    await super.sendKeys(Key.ARROW_RIGHT);
    await super.setText(newText);
  }

  /**
   * Goes to the next step in the wizard
   */
  public async next(): Promise<void> {
    const prev: WizardStepInfo = await WizardStepInfo.create(this);
    let curr: WizardStepInfo = prev;

    await this.confirm();
    this.currStep++;
    if (this.currStep > this.lastStep) {
      return; // we don't expect another step after the last one
    }
    while (_.isEqual(prev, curr)) {
      curr = await WizardStepInfo.create(this);
    }
  }

  /**
   * Goes to the previous step in the wizard by
   * clicking the back button
   */
  public async prev(): Promise<void> {
    if (this.currStep === 1) {
      return;
    }
    const prev: WizardStepInfo = await WizardStepInfo.create(this);
    let curr: WizardStepInfo = prev;

    const backButton: WebElement = await this.getBackButton();
    await backButton.click();
    this.currStep--;

    while (_.isEqual(prev, curr)) {
      curr = await WizardStepInfo.create(this);
    }
  }

  /**
   * Returns the back button `WebElement` if currently visible,
   * returns `undefined` otherwise
   */
  public async getBackButton(): Promise<WebElement | undefined> {
    const enclosing: WebElement = this.getEnclosingElement();

    // TODO: Currently, the back button's class is hardcoded here.
    // After https://github.com/redhat-developer/vscode-extension-tester/issues/136 is fixed, remove the hardcoded class
    const backButtonClass: string = 'codicon-quick-input-back';
    try {
      const backButton: WebElement = await enclosing.findElement(By.className(backButtonClass));
      return backButton;
    } catch (e) {
      return undefined;
    }
  }

  /**
   * Returns the title of the input box
   */
  public async getInputBoxTitle(): Promise<string> {
    const enclosing: WebElement = this.getEnclosingElement();
    const title: WebElement = await enclosing.findElement(By.className('quick-input-title'));
    return await title.getText();
  }

  /**
   * Returns `QuickPickItemInfo` of all quick picks including quick picks
   * that are not currently visible
   */
  public async getAllQuickPickInfo(): Promise<QuickPickItemInfo[]> {
    const all: QuickPickItemInfo[] = [];
    const maxVisible: number = (await this.getQuickPicks()).length;
    const idSet = new Set();
    await this.sendKeys(..._.times(maxVisible - 1, _.constant(Key.DOWN)));

    let toAdd: QuickPickItemInfo[] = await this.getVisibleQuickPickItemInfo();
    while (!toAdd.some((info) => idSet.has(info.id))) {
      all.push(...toAdd);
      toAdd.forEach((info: QuickPickItemInfo) => idSet.add(info.id));

      await this.sendKeys(..._.times(maxVisible, _.constant(Key.DOWN)));
      toAdd = await this.getVisibleQuickPickItemInfo();
    }

    const goUp: number = toAdd.filter((info: QuickPickItemInfo) => idSet.has(info.id)).length;
    await this.sendKeys(..._.times(goUp, _.constant(Key.UP)));

    toAdd = await this.getVisibleQuickPickItemInfo();
    for (const info of toAdd) {
      if (!idSet.has(info.id)) {
        all.push(info);
      }
    }
    return all;
  }

  /**
   * Returns `QuickPickItemInfo` of all visible quick picks
   */
  private async getVisibleQuickPickItemInfo(): Promise<QuickPickItemInfo[]> {
    const quickPicks: QuickPickItem[] = await this.getQuickPicks();
    const all: QuickPickItemInfo[] = [];

    for (const quickPickItem of quickPicks) {
      all.push(await this.getQuickPickItemInfo(quickPickItem));
    }
    return all;
  }

  /**
   * Returns the `n`th quick pick item's label string
   * @param n
   */
  public async getNthQuickPickItemLabel(n: number): Promise<string> {
    return (await this.getNthQuickPickItemInfo(n)).label;
  }

  /**
   * Focuses on the quick pick with the given index
   *
   * @param n the index of the quick pick option to focus
   * @returns when the quick pick is focused
   */
  public async focusQuickPick(n: number): Promise<void> {
    const quickPickToFocus: QuickPickItem = await this.findQuickPick(n);
    while (!(await quickPickToFocus.getAttribute('class')).includes('focused')) {
      await this.sendKeys(Key.DOWN);
    }
  }

  /**
   * Returns the `n`th quick pick item's `QuickPickItemInfo`
   * @param n
   */
  public async getNthQuickPickItemInfo(n: number): Promise<QuickPickItemInfo> {
    const quickPicks: QuickPickItem[] = await this.getQuickPicks();
    if (n < 0 || n >= quickPicks.length) {
      throw new Error(`The index ${n} is out of bounds. The number of quickpicks found were ${quickPicks.length}`);
    }

    const quickPickItem: QuickPickItem = quickPicks[n];
    return this.getQuickPickItemInfo(quickPickItem);
  }

  /**
   * Returns `QuickPickItemInfo` for the provided `quickPickItem`
   * @param quickPickItem
   */
  private async getQuickPickItemInfo(quickPickItem: QuickPickItem): Promise<QuickPickItemInfo> {
    const result: QuickPickItemInfo = {
      id: await quickPickItem.getAttribute('id'),
      label: await quickPickItem.getText()
    };

    try {
      result.detail = await this.getStringFromChildElementByClassName(quickPickItem, 'quick-input-list-label-meta');
    } catch (e) {
      // there is no vscode.QuickPickItem.detail for this quick pick item
    }

    try {
      result.description = await this.getStringFromChildElementByClassName(quickPickItem, 'label-description');
    } catch (e) {
      // there is no vscode.QuickPickItem.description for this quick pick item
    }
    return result;
  }

  async getStringFromChildElementByClassName(element: WebElement, className: string): Promise<string> {
    const childElement: WebElement = await element.findElement(By.className(className));
    return childElement.getText();
  }
}

export interface QuickPickItemInfo {
  id: string;
  label: string;
  description?: string;
  detail?: string;
}

class WizardStepInfo {
  message: string;
  placeholder: string;
  text: string;
  quickPicks: QuickPickItem[];

  static async create(input: InputBox): Promise<WizardStepInfo> {
    const info: WizardStepInfo = new WizardStepInfo();
    info.message = await input.getMessage();
    info.placeholder = await input.getPlaceHolder();
    info.text = await input.getText();
    return info;
  }
}
