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
import * as del from 'del';
import * as fs from 'fs-extra';
import * as path from 'path';
import { DialogHandler, OpenDialog, VSBrowser, WebDriver, Workbench } from 'vscode-extension-tester';
import { ProjectInfo, QUARKUS_GRADLE_1, QUARKUS_GRADLE_2, QUARKUS_MAVEN_1, QUARKUS_MAVEN_2 } from '../debugProjectInfo';
import { addFolder, assertDebugProjectWhenNoEditorsOpen, assertLaunchJson, assertTasksJson, copyToTempDir, LaunchConfigInfo, TaskInfo, TEST_PROJECTS_DIR, waitForQuarkusWelcomePage, WorkspaceInfo } from '../utils';

describe('Debug multiple project multiple workspace tests', function () {
  this.bail(true);
  this.retries(3);

  let driver: WebDriver;
  const tempDir: string = path.join(__dirname, 'temp');

  before(() => {
    driver = VSBrowser.instance.driver;
  });

  beforeEach(async function() {
    this.timeout(10000);
    await new Promise((res) => setTimeout(res, 3000));
    if (fs.existsSync(tempDir)) {
      await del(tempDir);
    }
    fs.mkdirSync(tempDir);
  });

  after(async function() {
    this.timeout(10000);
    if (fs.existsSync(tempDir)) {
      await del(tempDir);
    }
  });

  afterEach(async function() {
    this.timeout(10000);
    await VSBrowser.instance.waitForWorkbench();
    await (new Workbench()).executeCommand('Clear Editor History');
    await (new Workbench()).executeCommand('Close Workspace');
  });

  it('should debug Quarkus Maven projects in separate workspace folders', async function () {
    this.timeout(300000);
    await assertDebuggingTwoProjects(QUARKUS_MAVEN_1, QUARKUS_MAVEN_2);
  });

  it('should debug Quarkus Gradle projects in separate workspace folders', async function () {
    this.timeout(300000);
    await assertDebuggingTwoProjects(QUARKUS_GRADLE_1, QUARKUS_GRADLE_2);
  });

  async function setupWorkspace(project1: ProjectInfo, project2: ProjectInfo): Promise<WorkspaceInfo> {
    const project1Dir: string = path.join(TEST_PROJECTS_DIR, project1.parentFolderName, project1.projectName);
    const project2Dir: string = path.join(TEST_PROJECTS_DIR, project2.parentFolderName, project2.projectName);
    const workspaceDir: string = path.join(TEST_PROJECTS_DIR, 'empty.code-workspace');
    const tempProject1Dir: string = await copyToTempDir(project1Dir, tempDir);
    const tempProject2Dir: string = await copyToTempDir(project2Dir, tempDir);
    const tempWorkspace: string = await copyToTempDir(workspaceDir, tempDir);
    await new Workbench().executeCommand('Workspaces: Open Workspace...');
    const dialog: OpenDialog = await DialogHandler.getOpenDialog();
    await dialog.selectPath(tempWorkspace);
    await dialog.confirm();
    await addFolder(path.join(tempProject1Dir));
    await addFolder(path.join(tempProject2Dir));
    return {
      workspaceFolders: [tempProject1Dir, tempProject2Dir]
    };
  }

  async function assertDebuggingTwoProjects(
    project1: ProjectInfo,
    project2: ProjectInfo
  ) {
    const workspace: WorkspaceInfo = await setupWorkspace(project1, project2);
    await waitForQuarkusWelcomePage(driver);
    await new Workbench().executeCommand("View: Close All Editors"); // close welcome pages
    await assertDebugProjectWhenNoEditorsOpen(driver, project1, {endPrematurely: false});
    // await assertDebugProjectWhenProjectFileOpen(driver, project1, {endPrematurely: true});
    await assertDebugProjectWhenNoEditorsOpen(driver, project2, {endPrematurely: false});
    // await assertDebugProjectWhenProjectFileOpen(driver, project2, {endPrematurely: true});

    assertTasksJson(workspace.workspaceFolders[0], [
      expectedTask(project1, true)
    ]);
    assertTasksJson(workspace.workspaceFolders[1], [
      expectedTask(project2, true)
    ]);
    assertLaunchJson(workspace.workspaceFolders[0], [
      expectedLaunchConfig(project1)
    ]);
    assertLaunchJson(workspace.workspaceFolders[1], [
      expectedLaunchConfig(project1)
    ]);

    // deleteLaunchAndTasksJson(workspace.workspaceFolders[0]);
    // deleteLaunchAndTasksJson(workspace.workspaceFolders[1]);
    // removeWrapperFiles(workspace.workspaceFolders[0], project1);
    // removeWrapperFiles(workspace.workspaceFolders[1], project2);

    // await assertDebugProjectWhenNoEditorsOpen(driver, project1, {endPrematurely: true});
    // await assertDebugProjectWhenNoEditorsOpen(driver, project2, {endPrematurely: true});

    // assertTasksJson(workspace.workspaceFolders[0], [
    //   expectedTask(project1, false)
    // ]);
    // assertTasksJson(workspace.workspaceFolders[1], [
    //   expectedTask(project2, false)
    // ]);
    // assertLaunchJson(workspace.workspaceFolders[0], [
    //   expectedLaunchConfig(project1)
    // ]);
    // assertLaunchJson(workspace.workspaceFolders[1], [
    //   expectedLaunchConfig(project2)
    // ]);
  }

  function expectedTask(project: ProjectInfo, useWrapper: boolean): TaskInfo {
    return {
      label: project.buildSupport.getQuarkusDev(),
      command: project.buildSupport.getCommand({ useWrapper }),
      windowsCommand: project.buildSupport.getWindowsCommand({ useWrapper })
    };
  }

  function expectedLaunchConfig(project: ProjectInfo): LaunchConfigInfo {
    return {
      preLaunchTask: `${project.buildSupport.getQuarkusDev()}`,
      name: 'Debug Quarkus application'
    };
  }
});