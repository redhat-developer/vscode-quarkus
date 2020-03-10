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
import { assertDebugProjectWhenNoEditorsOpen, assertLaunchJson, assertTasksJson, copyToTempDir, LaunchConfigInfo, openFileEditor, openFolder, TaskInfo, TEST_PROJECTS_DIR, waitForQuarkusWelcomePage, WorkspaceInfo } from '../utils';

describe('Debug multiple project one workspace tests', function () {
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

  afterEach(async function () {
    this.timeout(10000);
    await VSBrowser.instance.waitForWorkbench();
    await (new Workbench()).executeCommand('Clear Editor History');
    await (new Workbench()).executeCommand('Close Workspace');
  });

  it('should debug Quarkus Maven projects under one workspace folder', async function () {
    this.timeout(300000);
    await assertDebuggingMultipleProjects(QUARKUS_MAVEN_1, QUARKUS_MAVEN_2);
  });

  it('should debug Quarkus Gradle projects under one workspace folder', async function () {
    this.timeout(300000);
    await assertDebuggingMultipleProjects(QUARKUS_GRADLE_1, QUARKUS_GRADLE_2);
  });

  async function setupWorkspace(projectDir: string): Promise<WorkspaceInfo> {
    const parentFolderDir: string = path.join(TEST_PROJECTS_DIR, projectDir);
    const workspaceDir: string = path.join(TEST_PROJECTS_DIR, 'empty.code-workspace');
    const tempParentDir: string = await copyToTempDir(parentFolderDir, tempDir);
    const tempWorkspace: string = await copyToTempDir(workspaceDir, tempDir);
    await new Workbench().executeCommand('Workspaces: Open Workspace...');
    const dialog: OpenDialog = await DialogHandler.getOpenDialog();
    await dialog.selectPath(tempWorkspace);
    await dialog.confirm();
    await openFolder(tempParentDir);
    return {
      workspaceFolders: [tempParentDir]
    };
  }

  async function assertDebuggingMultipleProjects(
    project1: ProjectInfo,
    project2: ProjectInfo
  ) {
    const workspace: WorkspaceInfo = await setupWorkspace(
      project1.parentFolderName
    );
    await openFileEditor(project1.resourceClass); // open Java file to trigger vscode-java welcome page
    await waitForQuarkusWelcomePage(driver);
    await new Workbench().executeCommand("View: Close All Editors"); // close welcome pages
    await assertDebugProjectWhenNoEditorsOpen(driver, project1, {endPrematurely: false});
    // await assertDebugProjectWhenProjectFileOpen(driver, project1, {endPrematurely: true});
    await assertDebugProjectWhenNoEditorsOpen(driver, project2, {endPrematurely: false});
    // await assertDebugProjectWhenProjectFileOpen(driver, project2, {endPrematurely: true});

    const parentDir: string = workspace.workspaceFolders[0];
    assertTasksJson(parentDir, [
      expectedTask(project1, true),
      expectedTask(project2, true)
    ]);
    assertLaunchJson(parentDir, [
      expectedLaunchConfig(project1),
      expectedLaunchConfig(project2)
    ]);

    // deleteLaunchAndTasksJson(parentDir);
    // removeWrapperFiles(path.join(parentDir, project1.projectName), project1);
    // removeWrapperFiles(path.join(parentDir, project2.projectName), project2);

    // await assertDebugProjectWhenNoEditorsOpen(driver, project1, {endPrematurely: true});
    // await assertDebugProjectWhenNoEditorsOpen(driver, project2, {endPrematurely: true});

    // assertTasksJson(parentDir, [
    //   expectedTask(project1, false),
    //   expectedTask(project2, false)
    // ]);
    // assertLaunchJson(parentDir, [
    //   expectedLaunchConfig(project1),
    //   expectedLaunchConfig(project2)
    // ]);
  }

  function expectedTask(project: ProjectInfo, useWrapper: boolean): TaskInfo {
    return { label: `${project.buildSupport.getQuarkusDev()} (${project.projectName})`,
      command: project.buildSupport.getCommand({useWrapper}),
     windowsCommand: project.buildSupport.getWindowsCommand({useWrapper})
    };
  }

  function expectedLaunchConfig(project: ProjectInfo): LaunchConfigInfo {
    return {
      preLaunchTask: `${project.buildSupport.getQuarkusDev()} (${project.projectName})`,
      name: `Debug Quarkus application (${project.projectName})`
    };
  }
});