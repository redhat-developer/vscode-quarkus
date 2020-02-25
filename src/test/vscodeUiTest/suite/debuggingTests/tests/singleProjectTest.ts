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
import { expect } from 'chai';
import * as del from 'del';
import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import { By, DialogHandler, OpenDialog, VSBrowser, WebDriver, Workbench } from 'vscode-extension-tester';
import { log } from '../../../log';
import { ProjectInfo, QUARKUS_GRADLE_1, QUARKUS_MAVEN_1 } from '../debugProjectInfo';
import { assertInDebugSession, assertLaunchJson, assertTasksJson, copyToTempDir, deleteLaunchAndTasksJson, endDebugSession, endDebugSessionPrematurely, removeWrapperFiles, TEST_PROJECTS_DIR, waitForQuarkusWelcomePage, WorkspaceInfo } from '../utils';

describe('Single Project Tests', function () {
  this.bail(true);
  this.retries(3);

  let driver: WebDriver;
  const tempDir: string = path.join(__dirname, 'temp');

  before(() => {
    driver = VSBrowser.instance.driver;
  });

  beforeEach(async function () {
    this.timeout(10000);
    await new Promise((res) => setTimeout(res, 3000));
    if (fs.existsSync(tempDir)) {
      await del(tempDir);
    }
    fs.mkdirSync(tempDir);
  });

  after(async function() {
    this.timeout(5000);
    if (fs.existsSync(tempDir)) {
      await del(tempDir);
    }
  });

  afterEach(async function () {
    this.timeout(5000);
    await VSBrowser.instance.waitForWorkbench();
    await (new Workbench()).executeCommand('Close Workspace');
  });

  it('should debug Quarkus Maven project', async function () {
    this.timeout(300000);
    await assertDebuggingSingleProject(QUARKUS_MAVEN_1);
  });

  it('should debug Quarkus Gradle project', async function () {
    this.timeout(300000);
    await assertDebuggingSingleProject(QUARKUS_GRADLE_1);
  });

  async function setupWorkspace(project: ProjectInfo): Promise<WorkspaceInfo> {
    const projectsDir: string = path.join(TEST_PROJECTS_DIR, project.parentFolderName, project.projectName);
    const tempProjectDir: string = await copyToTempDir(projectsDir, tempDir);
    await openFolder(tempProjectDir);
    return {
      workspaceFolders: [tempProjectDir]
    };
  }

  async function assertDebuggingSingleProject(project: ProjectInfo) {
    const projectDir: string = (await setupWorkspace(project)).workspaceFolders[0];
    log('Finished setting up workspace');
    await waitForQuarkusWelcomePage(driver);
    log('Finished waiting for Quarkus Welcome page');
    const len = await driver.findElements(By.linkText('Quarkus Tools for Visual Studio Code'));
    log(`len: ${len.length}`);
    if (len.length !== 2) expect.fail();
    await new Workbench().executeCommand('Quarkus: Debug current Quarkus project');
    log('Finished executing debug command');
    await assertInDebugSession(driver, project);
    log('Finished entering debug session');
    assertTasksJson(projectDir,
      [{
        label: project.buildSupport.getQuarkusDev(),
        command: project.buildSupport.getCommand({ useWrapper: true }),
        windowsCommand: project.buildSupport.getWindowsCommand({ useWrapper: true })
      }]
    );

    assertLaunchJson(
      projectDir,
      [
        { preLaunchTask: project.buildSupport.getQuarkusDev(), name: "Debug Quarkus application" }
      ]
    );
    await endDebugSession(driver);
    log('Finished terminating debug session');
    // Debug once more to test if duplicate tasks/launch config are created
    await new Workbench().executeCommand('Quarkus: Debug current Quarkus project');
    log('Finished executing debug command');
    await endDebugSessionPrematurely();
    log('Finished prematurely terminating debug session');
    assertTasksJson(
      projectDir,
      [
        { label: project.buildSupport.getQuarkusDev(), command: project.buildSupport.getCommand({ useWrapper: true }), windowsCommand: project.buildSupport.getWindowsCommand({ useWrapper: true }) }
      ]
    );

    assertLaunchJson(
      projectDir,
      [
        { preLaunchTask: project.buildSupport.getQuarkusDev(), name: "Debug Quarkus application" }
      ]
    );
    // Debug once more to test if correct tasks are being created when wrapper files are not availible
    deleteLaunchAndTasksJson(projectDir);
    removeWrapperFiles(projectDir, project);
    await new Promise((res) => setTimeout(res, 4000));
    await new Workbench().executeCommand('Quarkus: Debug current Quarkus project');
    log('Finished executing debug command');
    await endDebugSessionPrematurely();
    log('Finished prematurely terminating debug session');

    assertTasksJson(
      projectDir,
      [
        { label: project.buildSupport.getQuarkusDev(), command: project.buildSupport.getCommand({ useWrapper: false }), windowsCommand: project.buildSupport.getWindowsCommand({ useWrapper: false }) }
      ]
    );

    assertLaunchJson(
      projectDir,
      [
        { preLaunchTask: project.buildSupport.getQuarkusDev(), name: "Debug Quarkus application" }
      ]
    );
  }
});

async function openFolder(folderPath: string) {
  let command: string = 'File: Open Folder...';
  if (os.platform() === 'darwin') command = 'File: Open...';
  await new Workbench().executeCommand(command);
  const dialog: OpenDialog = await DialogHandler.getOpenDialog();
  await dialog.selectPath(folderPath);
  await dialog.confirm();
}