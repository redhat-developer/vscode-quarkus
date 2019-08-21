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
import { RelativePattern, Uri, QuickPickItem, WorkspaceFolder, workspace, window } from "vscode";
import { executeMavenCommand } from "../terminal/quarkusTerminalUtils";
import { State, AddExtensionsState } from "../definitions/inputState";
import { ConfigManager } from "../definitions/configManager";
import { MultiStepInput } from "../utils/multiStepUtils";
import { pickExtensionsWithoutLastUsed } from "../generateProject/pickExtensions";
import { QExtension } from "../definitions/extension";

export async function add(configManager: ConfigManager) {
  const state: Partial<AddExtensionsState> = {
    totalSteps: 1
  };
  async function collectInputs(state: Partial<State>) {
    await MultiStepInput.run(input => pickExtensionsWithoutLastUsed(input, state, configManager.getSettingsJson(), choosePomIfMultipleExists));
  }

  async function choosePomIfMultipleExists(input: MultiStepInput, state: Partial<AddExtensionsState>) {

    const pomList: Uri[] = await searchPomXml();

    if (pomList.length === 0) {
      state.wizardInterrupted = { reason: 'pom.xml could not be located.' };
      return;
    } else if (pomList.length === 1) {
      state.pomPath = pomList[0];
      return;
    }

    const quickPickItems: QuickPickItem[] = pomList.map((pomUri: Uri) => {
      return { label: pomUri.fsPath };
    });

    const selectedPomPath: string = (await input.showQuickPick({
      title: "Multiple pom.xml found under current directory. Choose a pom.xml.",
      items: quickPickItems
    })).label;

    state.pomPath = pomList.filter((pomUri: Uri) => {
      return pomUri.fsPath === selectedPomPath;
    })[0];

    return;
  }

  await collectInputs(state);

  if (state.wizardInterrupted) {
    window.showErrorMessage('pom.xml could not be located.');
    return;
  }

  const artifactIds: String[] = getArtifactIds(state.extensions!);
  const command = `quarkus:add-extension -Dextensions="${artifactIds.join(',')}"`;

  await executeMavenCommand(command, state.pomPath);
}

function getArtifactIds(extensions: QExtension[]): string[] {
  return extensions.map((it) => it.artifactId);
}

/**
 * Returns a promise resolving with an array of absolute paths to pom.xml
 * files, under every currently opened workspace folder.
 */
async function searchPomXml(): Promise<Uri[]> {
  const pattern: string = '**/pom.xml';
  const workspaceFolders: WorkspaceFolder[] | undefined = workspace.workspaceFolders;

  if (workspaceFolders === undefined) {
    return [];
  }

  const folderPaths: Uri[] = workspaceFolders.map((folder) => folder.uri);

  const pomPaths: Uri[] = await folderPaths.reduce(async (pomPaths: Promise<Uri[]>, folderToSearch: Uri) => {
    const accumulator = await pomPaths;
    const pomFileUris: Uri[] = await workspace.findFiles(new RelativePattern(folderToSearch.fsPath, pattern));

    return Promise.resolve(accumulator.concat(pomFileUris));
  }, Promise.resolve([]));

  return pomPaths;
}