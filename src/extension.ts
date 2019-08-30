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
import * as requirements from './languageServer/requirements';

import { QUARKUS_PROJECT_REQUEST, JDTLS_PROJECT_INFO_COMMAND } from './definitions/wizardConstants';
import { ExtensionContext, commands, window } from 'vscode';
import { LanguageClientOptions, LanguageClient, RequestType } from 'vscode-languageclient';
import { add } from './addExtensions/addExtensions';
import { generateProject } from './generateProject/generationWizard';
import { prepareExecutable } from './languageServer/javaServerStarter';

let languageClient: LanguageClient;

interface QuarkusProjectInfoParams {
  uri: string;
  documentationFormat: string[];
}

export function activate(context: ExtensionContext) {

  connectToLS().then(() => {
    const quarkusPojectInfoRequest = new RequestType<QuarkusProjectInfoParams, any, void, void>(QUARKUS_PROJECT_REQUEST);
    languageClient.onRequest(quarkusPojectInfoRequest, async (params: QuarkusProjectInfoParams) =>
       <any> await commands.executeCommand("java.execute.workspaceCommand", JDTLS_PROJECT_INFO_COMMAND, params)
    );

    /**
     * Command for resetting Quarkus properties cache
     */
    context.subscriptions.push(commands.registerCommand('quarkusTools.classpathChanged', (projects) => {
      languageClient.sendNotification("quarkus/classpathChanged", projects);
    }));

  }).catch((error) => {
    window.showErrorMessage(error.message, error.label).then((selection) => {
      if (error.label && error.label === selection && error.openUrl) {
        commands.executeCommand('vscode.open', error.openUrl);
      }
    });
  });

  registerVSCodeCommands(context);

}

export function deactivate() { }

function registerVSCodeCommands(context: ExtensionContext) {

  /**
   * Command for creating a Quarkus Maven project
   */
  context.subscriptions.push(commands.registerCommand('quarkusTools.createMavenProject', () => {
    generateProject();
  }));

  /**
   * Command for adding Quarkus extensions to current Quarkus Maven project
   */
  context.subscriptions.push(commands.registerCommand('quarkusTools.addExtension', () => {
    add();
  }));
}

function connectToLS() {
  return requirements.resolveRequirements().then(requirements => {
    const clientOptions: LanguageClientOptions = {
      documentSelector: [
        { scheme: 'file', pattern: '**/application.properties' }
      ]
    };

    const serverOptions = prepareExecutable(requirements);
    languageClient = new LanguageClient('quarkus.tools', 'Quarkus Tools', serverOptions, clientOptions);
    languageClient.start();
    return languageClient.onReady();
  });
}
