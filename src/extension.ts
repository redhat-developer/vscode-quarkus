'use strict';

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