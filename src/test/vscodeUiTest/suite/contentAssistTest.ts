/**
 * Copyright 2020 Red Hat, Inc. and others.

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
import * as fs from 'fs-extra';
import * as path from 'path';

import { InputBox, VSBrowser, Workbench, WebDriver, WebElement, By, Key, ContentAssist, EditorView, TextEditor } from 'vscode-extension-tester';
import { ProjectGenerationWizard, QuickPickItemInfo } from '../ProjectGenerationWizard';
import { expect, use } from 'chai';

use(require('chai-fs'));

/**
 * This file contains tests for the ContentAssist in application.properties
 */
describe('Content Assist tests', async () => {
  let driver: WebDriver;
  let assist: ContentAssist;
  let editor: TextEditor;
  const tempDir: string = path.join(__dirname, 'temp');

  before(async () => {
    driver = VSBrowser.instance.driver;
    fs.removeSync(tempDir);
    fs.mkdirSync(tempDir);
  });

  after(async () => {
    fs.removeSync(tempDir);
  });

  /**
   * Tests if the project generation wizard correctly creates a new
   * Quarkus Maven project with some extensions added
   */
  it('Generate maven project and if content assist works in application.properties', async function() {
    this.timeout(60000);

    const projectDestDir: string = path.join(tempDir, 'maven');
    const projectFolderName: string = 'quarkus-maven';

    fs.mkdirSync(projectDestDir);

    expect(await ProjectGenerationWizard.generateProject(driver, {
      buildTool: 'Maven',
      artifactId: projectFolderName,
      extensions: ['Camel Core', 'Eclipse Vert.x'],
      dest: projectDestDir
    })).to.be.true;

    const pathToProperties: string = path.join(projectDestDir, projectFolderName, 'src' , 'main', 'resources', 'application.properties');
    await new Workbench().executeCommand('extest open file');
    const input = await InputBox.create();
    await input.setText(path.resolve(pathToProperties));
    await input.confirm();

    editor = new TextEditor(new EditorView(), 'application.properties');
    assist = await editor.toggleContentAssist(true) as ContentAssist;

    it('getItems retrieves the suggestions', async function() {
      this.timeout(5000);
      const items = await assist.getItems();
      expect(items).not.empty;
  });

    it('ContentAssist retrieves correct suggestions', async function() {
      this.timeout(15000);
      await editor.setTextAtLine(3, 'quarkus.');
      const assist = await editor.toggleContentAssist(true) as ContentAssist;
      expect(await assist.isDisplayed()).is.true;
      const item = await assist.getItem('quarkus.');
      expect(await item.getLabel()).equals('quarkus.');

      await editor.toggleContentAssist(false);
  });

    await (new Workbench).executeCommand('Close Workspace');
    return new Promise(res => setTimeout(res, 5000));
 });
});

async function wizardExists(): Promise<boolean> {
  const input: InputBox = new InputBox();
  try {
    const enclosing: WebElement = input.getEnclosingElement();
    const title: WebElement = await enclosing.findElement(By.className('quick-input-title'));
    return (await title.getText()).includes('Quarkus Tools');
  } catch (e) {
    return false;
  }
}