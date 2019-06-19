'use strict';

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import * as request from 'request-promise';
import * as unzipper from 'unzipper';

const DEFAULT_API_URL: string = 'http://localhost:8080';
const CONFIG_SECTION_QUARKUS_STARTER: string = 'quarkus-starter';
const CONFIG_DEFAULT_API_URL: string = 'apiUrl';

const CONFIG_SECTION_STARTER = 'quarkus.tools.starter';

const ID_REGEXP: RegExp = RegExp('^[A-Za-z0-9_\\-.]+$');

export interface QExtension {
  name: string;
  labels: string[];
  groupId: string;
  artifactId: string;
  guide?: string;
}

export interface StarterDefaults {
  apiUrl: string;
  groupId: string;
  artifactId: string;
  projectVersion: string;
  packageName: string;
  resourceName: string;
  extensions: QExtension[];
}


export async function createQuarkusProject() {
  // load defaults
  const defaults: undefined | StarterDefaults = loadDefaults();

  let apiUrl = vscode.workspace.getConfiguration(CONFIG_SECTION_QUARKUS_STARTER).get<string>(CONFIG_DEFAULT_API_URL);
  if (!apiUrl) {
    apiUrl = DEFAULT_API_URL;
  }

  const qExtensions = await getQExtensions(apiUrl);

  const groupId = await vscode.window.showInputBox(
    {
      ignoreFocusOut: true,
      prompt: 'Your project group id',
      value: defaults.groupId,
      validateInput: (it: string) => ID_REGEXP.test(it) ? null : 'GroupId invalid'
    }
  );
  if (!groupId) {
    vscode.window.showErrorMessage('Impossible to create Quarkus Project: No groupId provided.');
    return;
  }

  const artifactId = await vscode.window.showInputBox(
    {
      ignoreFocusOut: true,
      prompt: 'Your project artifact id',
      value: defaults.artifactId,
      validateInput: (it: string) => ID_REGEXP.test(it) ? null : 'ArtifactId invalid'
    }
  );
  if (!artifactId) {
    vscode.window.showErrorMessage('Impossible to create Quarkus Project: No artifactId provided.');
    return;
  }

  const projectVersion = await vscode.window.showInputBox(
    {
      ignoreFocusOut: true,
      prompt: 'Your project version',
      value: defaults.projectVersion,
      validateInput: (it: string) => ID_REGEXP.test(it) ? null : 'Project version invalid'
    }
  );
  if (!projectVersion) {
    vscode.window.showErrorMessage('Impossible to create Quarkus Project: No project version provided.');
    return;
  }

  const packageName = await vscode.window.showInputBox(
    {
      ignoreFocusOut: true,
      prompt: 'Your package name',
      value: defaults.packageName,
      validateInput: (it: string) => ID_REGEXP.test(it) ? null : 'Package name invalid'
    }
  );
  if (!packageName) {
    vscode.window.showErrorMessage('Impossible to create Quarkus Project: No package name provided.');
    return;
  }

  const resourceName = await vscode.window.showInputBox(
    {
      ignoreFocusOut: true,
      prompt: 'Your resource name',
      value: defaults.resourceName,
      validateInput: (it: string) => ID_REGEXP.test(it) ? null : 'Resource name invalid'
    }
  );
  if (!resourceName) {
    vscode.window.showErrorMessage('Impossible to create Quarkus Project: No resource name provided.');
    return;
  }


  // TODO change this function to return an object with names as keys and artifact ids as values
  const chosenExtensions: QExtension[] = await showQExtensionsQuickPick(qExtensions, defaults.extensions);

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

  const newDefaults: StarterDefaults = {
    apiUrl: apiUrl,
    groupId: groupId,
    artifactId: artifactId,
    projectVersion: projectVersion,
    packageName: packageName,
    resourceName: resourceName,
    extensions: chosenExtensions
  };

  updateDefaults(newDefaults);

  const chosenExtArtifactIds: string[] = chosenExtensions.map((it) => it.artifactId);
  const qProjectUrl: string = `${apiUrl}/generator?` +
    `g=${groupId}&` +
    `a=${artifactId}&` +
    `pv=${projectVersion}&` +
    `cn=${packageName}.${resourceName}&` +
    `e=${chosenExtArtifactIds.join('&e=')}`;

  downloadProject(qProjectUrl, projectDir).then(() => {
    return vscode.commands.executeCommand('vscode.openFolder', projectDir, true);
  });
}

function loadDefaults(): StarterDefaults {

  let res: undefined | StarterDefaults = vscode.workspace.getConfiguration(CONFIG_SECTION_STARTER).get<StarterDefaults>('defaults');
  if (res) {
    return res;
  }

  return {
    extensions: [],
    apiUrl: CONFIG_DEFAULT_API_URL,
    groupId: 'com.example',
    artifactId: 'starter',
    packageName: 'packageName',
    resourceName: 'resourceName',
    projectVersion: '1.0-SNAPSHOT'
  };
}

function updateDefaults(newDefaults: StarterDefaults) {
  vscode.workspace.getConfiguration(CONFIG_SECTION_STARTER).update('defaults', newDefaults, true);
}


async function getQExtensions(apiUrl: string): Promise<QExtension[]> {
  return await request.get(`${apiUrl}/extension/list`)
    .then((body) => {
      const qExtensions: QExtension[] = JSON.parse(body);
      return qExtensions.sort((a, b) => a.name.localeCompare(b.name));
    });
}

async function downloadProject(url: string, targetDir: vscode.Uri) {
  return request(url)
    .pipe(unzipper.Extract({ path: targetDir.fsPath })).promise();
}

async function showQExtensionsQuickPick(qExtensions: QExtension[], defaultExtensions: QExtension[]): Promise<QExtension[]> {
  let selectedExtensions: QExtension[] = [];
  let unselectedExtensions: QExtension[] = qExtensions;
  let current: any;

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


    if (defaultExtensions.length > 0 &&
      selectedExtensions.length === 0) {
      addLastUsedOption(items, defaultExtensions);
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

    if (current.value === 'lastUsed') {
      return defaultExtensions;
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

  return selectedExtensions;
}

function addLastUsedOption(items: Object[], prevExtensions: QExtension[]) {

  const extensionNames = prevExtensions.map((it) => it.name).join(', ');

  items.unshift({
    value: 'lastUsed',
    label: `$(clock) Last used`,
    description: '',
    detail: extensionNames
  });
}