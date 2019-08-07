'use strict';

import { window, commands, ExtensionContext } from 'vscode';
import { generateProject } from './generateProject/generationWizard';
import { add } from './addExtensions/addExtensions';
import { ConfigManager } from './definitions/configManager';
import { QUARKUS_PROJECT_REQUEST, JDTLS_PROJECT_INFO_COMMAND } from './definitions/commandConstants';
import * as requirements from './languageServer/requirements';
import { prepareExecutable } from './languageServer/javaServerStarter';
import { LanguageClientOptions, LanguageClient, RequestType } from 'vscode-languageclient';

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
  const configManager = new ConfigManager();

  /**
   * Command for creating a Quarkus Maven project
   */
  context.subscriptions.push(commands.registerCommand('quarkusTools.createMavenProject', () => {
    generateProject(configManager);
  }));

  /**
   * Command for adding Quarkus extensions to current Quarkus Maven project
   */
  context.subscriptions.push(commands.registerCommand('quarkusTools.addExtension', () => {
    add(configManager);
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
    languageClient = new LanguageClient('Quarkus', 'Quarkus Tools', serverOptions, clientOptions);
    languageClient.start();
    return languageClient.onReady();
  });
}
