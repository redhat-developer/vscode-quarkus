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
import * as path from 'path';
import { VSCodeCommands } from './definitions/constants';
import { ExtensionContext, commands, window, workspace, Terminal, languages, TextDocument } from 'vscode';
import { QuarkusContext } from './QuarkusContext';
import { addExtensionsWizard } from './wizards/addExtensions/addExtensionsWizard';
import { createTerminateDebugListener } from './wizards/debugging/terminateProcess';
import quarkusProjectListener from './QuarkusProjectListener';
import { generateProjectWizard } from './wizards/generateProject/generationWizard';
import { tryStartDebugging } from './wizards/debugging/startDebugging';
import { WelcomeWebview } from './webviews/WelcomeWebview';
import { QuarkusConfig, PropertiesLanguageMismatch } from './QuarkusConfig';
import { terminalCommandRunner } from './terminal/terminalCommandRunner';
import { ProjectLabelInfo } from './definitions/ProjectLabelInfo';

export function activate(context: ExtensionContext) {
  QuarkusContext.setContext(context);
  displayWelcomePageIfNeeded(context);
  quarkusProjectListener.updateCacheAndContext();

  context.subscriptions.push(createTerminateDebugListener());
  context.subscriptions.push(quarkusProjectListener.getQuarkusProjectListener());
  context.subscriptions.push(terminalCommandRunner);
  context.subscriptions.push(
    window.onDidCloseTerminal((closedTerminal: Terminal) => {
      terminalCommandRunner.dispose(closedTerminal.name);
    })
  );

  // When extension is started, loop for each text documents which are opened to update their language ID.
  workspace.textDocuments.forEach(document => {
    updateLanguageId(document);
  });
  // When a text document is opened,  update their language ID.
  context.subscriptions.push(
    workspace.onDidOpenTextDocument((document) => {
      updateLanguageId(document);
    })
  );

  /**
   * Update if required the language ID to 'quarkus-properties' if needed.
   *
   * @param document the text document.
   */
  async function updateLanguageId(document: TextDocument) {
    const propertiesLanguageMismatch: PropertiesLanguageMismatch = QuarkusConfig.getPropertiesLanguageMismatch();
    if (propertiesLanguageMismatch === PropertiesLanguageMismatch.ignore) {
      // Do nothing
      return;
    }
    const fileName: string = path.basename(document.fileName);
    if (fileName === 'application.properties') {
      if (document.languageId === 'quarkus-properties') {
        // the language ID is already quarkus-properties do nothing.
        return;
      }
      tryToForceLanguageId(document, fileName, propertiesLanguageMismatch, 'quarkus-properties');
    } else if (fileName === 'application.yaml' || fileName === 'application.yml') {
      if (document.languageId === 'yaml') {
        // the language ID is already yaml do nothing.
        return;
      }
      tryToForceLanguageId(document, fileName, propertiesLanguageMismatch, 'yaml');
    }
  }

  /**
   * Try to force the document language ID to the given language ID.
   *
   * @param document the text document.
   * @param languageId the language ID.
   */
  async function tryToForceLanguageId(document: TextDocument, fileName: string, propertiesLanguageMismatch: PropertiesLanguageMismatch, languageId: string) {
    // Get project label information for the given file URI
    const labelInfo = ProjectLabelInfo.getProjectLabelInfo(document.uri.toString());
    return labelInfo.then(l => {
      if (l.isQuarkusProject()) {
        if (propertiesLanguageMismatch === PropertiesLanguageMismatch.prompt) {
          const YES = "Yes", NO = "No";
          const response: Thenable<string> = window.showInformationMessage(`The language ID for '${fileName}' must be '${languageId}' to receive Quarkus support. Set the language ID to '${languageId}?'`, YES, NO);
          response.then(result => {
            if (result === YES) {
              // The application.properties file belong to a Quarkus project, force to the quarkus-properties language
              languages.setTextDocumentLanguage(document, languageId);
            }
          });
        } else {
          // The application.properties file belong to a Quarkus project, force to the quarkus-properties language
          languages.setTextDocumentLanguage(document, languageId);
        }
      }
    });
  }
  registerVSCodeCommands(context);
}

export function deactivate() {
}

function displayWelcomePageIfNeeded(context: ExtensionContext): void {
  if (QuarkusConfig.getAlwaysShowWelcomePage()) {
    WelcomeWebview.createOrShow(context);
  }
}

function registerVSCodeCommands(context: ExtensionContext) {

  /**
   * Command for creating a Quarkus Maven project
   */
  context.subscriptions.push(commands.registerCommand(VSCodeCommands.CREATE_PROJECT, () => {
    generateProjectWizard();
  }));

  /**
   * Command for adding Quarkus extensions to current Quarkus Maven project
   */
  context.subscriptions.push(commands.registerCommand(VSCodeCommands.ADD_EXTENSIONS, () => {
    addExtensionsWizard();
  }));

  /**
   * Command for debugging current Quarkus Maven project
   */
  context.subscriptions.push(commands.registerCommand(VSCodeCommands.DEBUG_QUARKUS_PROJECT, () => {
    tryStartDebugging();
  }));

  /**
   * Command for displaying welcome page
   */
  context.subscriptions.push(commands.registerCommand(VSCodeCommands.QUARKUS_WELCOME, () => {
    WelcomeWebview.createOrShow(context);
  }));
}
