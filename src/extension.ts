'use strict';

import * as fs from 'fs';
import * as path from 'path';
import * as request from 'request-promise';
import * as unzipper from 'unzipper';
import * as vscode from 'vscode';

export interface QuickPickItemWithValue extends vscode.QuickPickItem {
  value: string;
}
const DEFAULT_API_URL: string = 'http://localhost:8080';
const CONFIG_SECTION_QUARKUS_STARTER: string = 'quarkus-starter';
const CONFIG_DEFAULT_API_URL: string = 'apiUrl';
const CONFIG_DEFAULT_GROUP_ID:string = 'defaultGroupId';
const CONFIG_DEFAULT_ARTIFACT_ID: string = 'defaultArtifactId';
const CONFIG_PREV_EXTENSIONS: string = 'prevExtensions';
const CONFIG_DEFAULT_PROJECT_VERSION: string = 'defaultProjectVersion';
const CONFIG_DEFAULT_PACKAGE_NAME: string = 'defaultPackageName';
const CONFIG_DEFAULT_RESOURCE_NAME: string = 'defaultResourceName';



const ID_REGEXP: RegExp = RegExp('^[A-Za-z0-9_\\-.]+$');

export interface QExtensions {
  name: string;
  labels: string[];
  groupId: string;
  artifactId: string;
  guide?: string;
}

export interface PrevExtensionFromConfig {
  prevExtensions: PrevExtension[];
}

export interface PrevExtension {
  name: string;
  artifactId: string;
}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('quarkusTools.createMavenProject', () => {
    createQuarkusProject();
  });
  context.subscriptions.push(disposable);
}

async function createQuarkusProject() {
  let apiUrl = vscode.workspace.getConfiguration(CONFIG_SECTION_QUARKUS_STARTER).get<string>(CONFIG_DEFAULT_API_URL);
  if (!apiUrl) {
    apiUrl = DEFAULT_API_URL;
  }

  const qExtensions = await getQExtensions(apiUrl);

  let defaultGroupId = vscode.workspace.getConfiguration(CONFIG_SECTION_QUARKUS_STARTER).get<string>(CONFIG_DEFAULT_GROUP_ID);
  if (!defaultGroupId) {
    defaultGroupId = 'com.example';
  }

  const groupId = await vscode.window.showInputBox(
    {
      ignoreFocusOut: true,
      prompt: 'Your project group id',
      value: defaultGroupId,
      validateInput: (it: string) => ID_REGEXP.test(it) ? null : 'GroupId invalid'
    }
  );
  if (!groupId) {
    vscode.window.showErrorMessage('Impossible to create Quarkus Project: No groupId provided.');
    return;
  }
  vscode.workspace.getConfiguration(CONFIG_SECTION_QUARKUS_STARTER).update(CONFIG_DEFAULT_GROUP_ID, groupId, true);


  let defaultArtifactId = vscode.workspace.getConfiguration(CONFIG_SECTION_QUARKUS_STARTER).get<string>(CONFIG_DEFAULT_ARTIFACT_ID);
  if (!defaultArtifactId) {
    defaultArtifactId = 'starter';
  }
  const artifactId = await vscode.window.showInputBox(
    {
      ignoreFocusOut: true,
      prompt: 'Your project artifact id',
      value: defaultArtifactId,
      validateInput: (it: string) => ID_REGEXP.test(it) ? null : 'ArtifactId invalid'
    }
  );
  if (!artifactId) {
    vscode.window.showErrorMessage('Impossible to create Quarkus Project: No artifactId provided.');
    return;
  }
  vscode.workspace.getConfiguration(CONFIG_SECTION_QUARKUS_STARTER).update(CONFIG_DEFAULT_ARTIFACT_ID, artifactId, true);

  
  let defaultProjectVersion = vscode.workspace.getConfiguration(CONFIG_SECTION_QUARKUS_STARTER).get<string>(CONFIG_DEFAULT_PROJECT_VERSION);
  const projectVersion = await vscode.window.showInputBox(
    {
      ignoreFocusOut: true,
      prompt: 'Your project version',
      value: defaultProjectVersion,
      validateInput: (it: string) => ID_REGEXP.test(it) ? null : 'Project version invalid'
    }
  );
  if (!projectVersion) {
    vscode.window.showErrorMessage('Impossible to create Quarkus Project: No project version provided.');
    return;
  }
  vscode.workspace.getConfiguration(CONFIG_SECTION_QUARKUS_STARTER).update(CONFIG_DEFAULT_PROJECT_VERSION, projectVersion, true);


  
  const defaultPackageName = vscode.workspace.getConfiguration(CONFIG_SECTION_QUARKUS_STARTER).get<string>(CONFIG_DEFAULT_PACKAGE_NAME);
  const packageName = await vscode.window.showInputBox(
    {
      ignoreFocusOut: true,
      prompt: 'Your package name',
      value: defaultPackageName,
      validateInput: (it: string) => ID_REGEXP.test(it) ? null : 'Package name invalid'
    }
  );
  if (!packageName) {
    vscode.window.showErrorMessage('Impossible to create Quarkus Project: No package name provided.');
    return;
  }
  vscode.workspace.getConfiguration(CONFIG_SECTION_QUARKUS_STARTER).update(CONFIG_DEFAULT_PACKAGE_NAME, packageName, true);

  const defaultResourceName = vscode.workspace.getConfiguration(CONFIG_SECTION_QUARKUS_STARTER).get<string>(CONFIG_DEFAULT_RESOURCE_NAME);
  const resourceName = await vscode.window.showInputBox(
    {
      ignoreFocusOut: true,
      prompt: 'Your resource name',
      value: defaultResourceName,
      validateInput: (it: string) => ID_REGEXP.test(it) ? null : 'Resource name invalid'
    }
  );
  if (!resourceName) {
    vscode.window.showErrorMessage('Impossible to create Quarkus Project: No resource name provided.');
    return;
  }

  vscode.workspace.getConfiguration(CONFIG_SECTION_QUARKUS_STARTER).update(CONFIG_DEFAULT_RESOURCE_NAME, resourceName, true);

  const qArtifactIds: string[] = await showQExtensionsQuickPick(qExtensions);

  let targetDir = await vscode.window.showOpenDialog(
    { canSelectFiles: false, canSelectFolders: true, canSelectMany: false, openLabel: 'Generate Here' }
  );
  if (!(targetDir && targetDir[0])) {
    vscode.window.showErrorMessage('Impossible to Create Quarkus Project: No directory provided.');
    return;
  }
  const projectDir = vscode.Uri.file(path.join(targetDir[0].fsPath, artifactId));
  if (fs.existsSync(projectDir.fsPath)) {
    vscode.window.showErrorMessage(`Impossible to Create Quarkus Project: Directory ${projectDir} already exists.`);
    return;
  }

  const qProjectUrl: string = `${apiUrl}/generator?` +
    `g=${groupId}&` +
    `a=${artifactId}&` +
    `pv=${projectVersion}&` +
    `cn=${packageName}.${resourceName}&` +
    `e=${qArtifactIds.join('&e=')}`;
  
  downloadProject(qProjectUrl, projectDir).then(() => {
    return vscode.commands.executeCommand('vscode.openFolder', projectDir, true);
  });
}

async function getQExtensions(apiUrl: string): Promise<QExtensions[]> {
  return await request.get(`${apiUrl}/extension/list`)
    .then((body) => {
      const qExtensions: QExtensions[] = JSON.parse(body);
      return qExtensions.sort((a, b) => a.name.localeCompare(b.name));
    });
}

async function downloadProject(url: string, targetDir: vscode.Uri) {
  return request(url)
  .pipe(unzipper.Extract({ path: targetDir.fsPath })).promise();
}

async function showQExtensionsQuickPick(qExtensions: QExtensions[]): Promise<string[]> {
  let selectedExtensions: QExtensions[] = [];
  let unselectedExtensions: QExtensions[] = qExtensions;
  let current: any;
  let prevExtensions = vscode.workspace.getConfiguration(CONFIG_SECTION_QUARKUS_STARTER).get<Object>(CONFIG_PREV_EXTENSIONS);

  do {
    let items = selectedExtensions.concat(unselectedExtensions).map((it) => {
      return {
        value: it.artifactId,
        label: `${selectedExtensions.some((other) => it.artifactId === other.artifactId) ? '$(check) ' : ''}${it.name}`,
        description: `(${it.artifactId})`,
        detail: ''
      };
    });

    //Push the dependencies selection stopper on top of the dependencies list
    items.unshift({
      value: 'stop',
      label: `$(tasklist) ${selectedExtensions.length} extensions selected`,
      description: '',
      detail: 'Press <Enter>  to continue'
    });


    if (prevExtensions && 
      selectedExtensions.length === 0) {
      addLastUsedOption(items, prevExtensions as PrevExtensionFromConfig);
    }
    
    current = await vscode.window.showQuickPick(
      items,
      { ignoreFocusOut: true, matchOnDetail: true, matchOnDescription: true, placeHolder: 'Quarkus Extensions' }
    );

    if (!current) {
      throw -1;
    }

    if (current.value === 'stop') {
      break;
    }
    
    if (current.value === 'lastUsed' && prevExtensions) {
      return getPrevUsedArtifactIds(prevExtensions as PrevExtensionFromConfig);
   
    } else {
    //When a dependency is picked toggle its status (selected/unselected)

      //unselected
      if (selectedExtensions.some((it) => { return it.artifactId === current.value; })) {
        const dependency = selectedExtensions.find((it) => it.artifactId === current.value);
        if (dependency) {
          selectedExtensions = selectedExtensions.filter((it) => it.artifactId !== current.value);
          unselectedExtensions.push(dependency);
          unselectedExtensions.sort((a, b) => a.name.localeCompare(b.name));
        }
      } else {
        //select
        const dependency = unselectedExtensions.find(((it) => { return it.artifactId === current.value; }));
        if (dependency) {
          unselectedExtensions = unselectedExtensions.filter((it) => it.artifactId !== current.value);
          selectedExtensions.push(dependency);
          selectedExtensions.sort((a, b) => a.name.localeCompare(b.name));
        }
      }
    }
  } while (true);

  saveExtensionsToConfig(selectedExtensions);
  return selectedExtensions.map((it) => it.artifactId);
}

function addLastUsedOption(items: Object[], prevExtensions: PrevExtensionFromConfig) {
  
  const extensionNames = prevExtensions.prevExtensions.map((it) => it.name).join(', ');

  items.unshift({
    value: 'lastUsed',
    label: `$(clock) Last used`,
    description: '',
    detail: extensionNames
  });
}

function getPrevUsedArtifactIds(prevExtensions: PrevExtensionFromConfig) {
  return prevExtensions.prevExtensions.map((it) => it.artifactId);
}

function saveExtensionsToConfig(selectedExtensions: QExtensions[]) {
  const prevExtensions: PrevExtension[] = selectedExtensions.map((it) => {
    return {
      name: it.name,
      artifactId: it.artifactId
    } as PrevExtension;
  });

  const extensions: PrevExtensionFromConfig = { prevExtensions };
  vscode.workspace.getConfiguration(CONFIG_SECTION_QUARKUS_STARTER).update(CONFIG_PREV_EXTENSIONS, extensions, true);
}


export function deactivate() { }
