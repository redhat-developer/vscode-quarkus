import { expect } from 'chai';
import * as fs from 'fs-extra';
import * as hjson from 'hjson';
import * as _ from 'lodash';
import * as path from 'path';
import * as request from 'request-promise';
import { By, InputBox, Notification, until, WebDriver, Workbench, BottomBarPanel, WebElement } from 'vscode-extension-tester';
import { ProjectInfo } from './debugProjectInfo';
import ncp = require('ncp');

export const TEST_PROJECTS_DIR: string = path.join(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  '..',
  'test-projects'
);

export interface WorkspaceInfo {
  workspaceFolders: string[];
}

export interface TaskInfo {
  label: string;
  command: string;
  windowsCommand: string;
}

export interface LaunchConfigInfo {
  preLaunchTask: string;
  name: string;
}

export async function openFolder(folderPath: string) {
  await new Workbench().executeCommand('Extest: Open Folder');
  const input = await InputBox.create();
  await input.setText(folderPath);
  await input.confirm();
}

export async function addFolder(folderPath: string) {
  await new Workbench().executeCommand('Extest: Add Folder');
  const input = await InputBox.create();
  await input.setText(folderPath);
  await input.confirm();
}

export function assertTasksJson(projectDir: string, taskInfoList: TaskInfo[]) {
  const tasksPath: string = path.join(projectDir, '.vscode', 'tasks.json');
  const actualTasks: any[] = readJsonFile(tasksPath).tasks;
  expect(actualTasks.length).to.be.equal(
    taskInfoList.length,
    'Either there are duplicate tasks, or tasks are not being saved.'
  );
  actualTasks.forEach(a => (a.windowsCommand = a.windows.command));

  taskInfoList.forEach(info => {
    expect(_.some(actualTasks, info)).to.be.true;
  });
}

export function assertLaunchJson(
  projectDir: string,
  launchConfigInfoList: LaunchConfigInfo[]
) {
  const launchPath: string = path.join(projectDir, '.vscode', 'launch.json');
  const actualLaunchConfig: any[] = readJsonFile(launchPath).configurations;
  expect(actualLaunchConfig.length).to.be.equal(launchConfigInfoList.length);
  launchConfigInfoList.forEach(info => {
    expect(_.some(actualLaunchConfig, info)).to.be.true;
  });
}

export function deleteLaunchAndTasksJson(projectDir: string) {
  fs.removeSync(path.join(projectDir, '.vscode', 'launch.json'));
  fs.removeSync(path.join(projectDir, '.vscode', 'tasks.json'));
}

export async function assertDebugProjectWhenNoEditorsOpen(
  driver: WebDriver,
  project: ProjectInfo,
  { endPrematurely }: { endPrematurely: boolean }
) {
  await new Workbench().executeCommand(
    'Quarkus: Debug current Quarkus project'
  );
  await driver.wait(
    until.elementLocated(By.className('quick-input-widget')),
    10000
  );
  const input: InputBox = await new InputBox().wait();
  await new Promise(res => setTimeout(res, 300));
  await input.setText(project.projectName);
  await new Promise(res => setTimeout(res, 300));
  await input.confirm();
  if (endPrematurely) {
    await endDebugSessionPrematurely();
  } else {
    await assertInDebugSession(driver, project);
    await endDebugSession(driver);
  }
}

export async function assertDebugProjectWhenProjectFileOpen(
  driver: WebDriver,
  project: ProjectInfo,
  { endPrematurely }: { endPrematurely: boolean }
) {
  const prompt = await new Workbench().openCommandPrompt();
  await prompt.setText(project.resourceClass);
  await prompt.confirm();
  await new Workbench().executeCommand(
    'Quarkus: Debug current Quarkus project'
  );

  if (endPrematurely) {
    await endDebugSessionPrematurely();
  } else {
    await assertInDebugSession(driver, project);
    await endDebugSession(driver);
  }
  await new Workbench().executeCommand('View: Close All Editors');
}

function readJsonFile(path: string): any {
  const contents: string = fs.readFileSync(path, { encoding: 'utf8' });
  return hjson.parse(contents);
}

export async function endDebugSessionPrematurely() {

  await new Promise(res => setTimeout(res, 3000));
  await new Workbench().executeCommand('Debug: Stop');
  await new Promise(res => setTimeout(res, 300));
  await (new Workbench()).executeCommand('Terminate Task');
  await new Promise(res => setTimeout(res, 300));
  const input: InputBox = new InputBox();
  await new Promise(res => setTimeout(res, 300));
  await input.confirm();
  await new Promise((res) => setTimeout(res, 1000));

}

export async function endDebugSession(driver: WebDriver) {
  await new Workbench().executeCommand('Debug: Disconnect');
  let notification: Notification = (await driver.wait(() => {
    return getQuarkusNotification();
  }, 2000)) as Notification;
  await new Promise(res => setTimeout(res, 200));
  await notification.takeAction('Terminate task');
  notification = (await driver.wait(() => {
    return getQuarkusNotification();
  }, 2000)) as Notification;
  await new Promise(res => setTimeout(res, 200));
  await notification.takeAction('Ask again next time');
}

export function copyToTempDir(src: string, tempDir: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const srcBaseName: string = path.basename(src);
    const dest: string = path.join(tempDir, srcBaseName);
    ncp(src, dest, (err: Error[]) => {
      if (err) {
        reject(err);
      }
      resolve(dest);
    });
  });
}

/**
 * To assert that VS Code is in debug mode (is debugging a Quarkus project),
 * this function will wait until the '1 active session' string exists
 * in the debug icon title from the activity bar (the leftmost bar).
 *
 * After waiting until VS Code is in debug mode, this function
 * will send an http request to ensure that the Quarkus application
 * is running.
 *
 * @param driver  the {@link WebDriver} instance
 * @param project the Quarkus project that is being debugged
 */
export async function assertInDebugSession(
  driver: WebDriver,
  project: ProjectInfo
) {
  await driver.wait(async () => {
    const disconnectBtn: WebElement[] = await driver.findElements(By.className('codicon-debug-disconnect'));

    for (const btn of disconnectBtn) {
      try {
        if (await btn.isDisplayed()) return true;
      } catch (e) {
        // do nothing
      }
    }
    return false;
  }, 120000);
  const response: string = await request(
    `http://localhost:${project.port}/hello`
  );
  expect(response).to.equal(project.message);
}

export function removeWrapperFiles(projectDir: string, project: ProjectInfo) {
  const wrapper: string = path.join(
    projectDir,
    path.basename(project.buildSupport.getWrapper())
  );
  const windowsWrapper: string = path.join(
    projectDir,
    path.win32.basename(project.buildSupport.getWindowsWrapper())
  );
  fs.removeSync(wrapper);
  fs.removeSync(windowsWrapper);
}

export async function openFileEditor(fileName: string) {
  await new Promise(res => setTimeout(res, 300)); // important
  const prompt = await new Workbench().openCommandPrompt();
  await new Promise(res => setTimeout(res, 300)); // important
  await prompt.setText(fileName); // open Java file to trigger vscode-java welcome page
  await new Promise(res => setTimeout(res, 300)); // important
  await prompt.confirm();
}

export async function waitForQuarkusWelcomePage(driver: WebDriver) {
  await driver.wait(until.elementLocated(By.linkText('Quarkus Tools for Visual Studio Code')), 120000);
}

/**
 * Example wait condition for WebDriver. Wait for a notification with given text to appear.
 * Wait conditions resolve when the first truthy value is returned.
 * In this case we choose to return the first matching notification object we find,
 * or undefined if no such notification is found.
 */
async function getQuarkusNotification(): Promise<Notification | undefined> {
  const QUARKUS_SOURCE = 'Quarkus (Extension)';
  const notifications: Notification[] = await new Workbench().getNotifications();
  for (const notification of notifications) {
    const source: string = await notification.getSource();
    if (source.indexOf(QUARKUS_SOURCE) >= 0) {
      return notification;
    }
  }
  return undefined;
}
