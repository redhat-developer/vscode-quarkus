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

import { window, commands, ExtensionContext, QuickPickItem } from 'vscode';
import { generateProject } from './generateProject/generationWizard';
import { add } from './addExtensions/addExtensions';
import { ConfigManager } from './definitions/configManager';
import * as requirements from './languageServer/requirements';
import { prepareExecutable } from './languageServer/javaServerStarter';
import { LanguageClientOptions, LanguageClient} from 'vscode-languageclient';

export interface QuickPickItemWithValue extends QuickPickItem {
  value: string;
}

export function activate(context: ExtensionContext) {
  console.log("ACTIVATE");
  registerVSCodeCommands(context);
  setTimeout(function () {
    connectToLS();
  }, 500); 
}

export function deactivate() { }

function registerVSCodeCommands(context: ExtensionContext) {
  const configManager = new ConfigManager();

  const createMavenProject = commands.registerCommand('quarkusTools.createMavenProject', () => {
    generateProject(configManager);
  });
  context.subscriptions.push(createMavenProject);

  const addQuarkusExtensions = commands.registerCommand('quarkusTools.addExtension', () => {
    add(configManager);
  });
  context.subscriptions.push(addQuarkusExtensions);
}

function connectToLS() {
  return requirements.resolveRequirements().catch(error => {
    //show error
    window.showErrorMessage(error.message, error.label).then((selection) => {
      if (error.label && error.label === selection && error.openUrl) {
        commands.executeCommand('vscode.open', error.openUrl);
      }
    });
    // rethrow to disrupt the chain.
    throw error;
  }).then(requirements => {
    let clientOptions: LanguageClientOptions = {
      documentSelector: [
        { scheme: 'file', language: 'plaintext' }
      ]
    };

    let serverOptions = prepareExecutable(requirements);
    let languageClient = new LanguageClient('Quarkus', 'Quarkus Tools', serverOptions, clientOptions);
    languageClient.start();
  });
}