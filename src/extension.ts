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
import { ExtensionContext, commands, window, workspace, Terminal, languages, TextDocument, ConfigurationChangeEvent, Disposable } from 'vscode';
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
import { requestStandardMode } from './utils/requestStandardMode';
import { getTelemetryService, TelemetryService } from '@redhat-developer/vscode-redhat-telemetry';

export async function activate(context: ExtensionContext) {

  const telemetryService: TelemetryService = await getTelemetryService("redhat.vscode-quarkus");
  await telemetryService.sendStartupEvent();

  QuarkusContext.setContext(context);
  displayWelcomePageIfNeeded(context);
  commands.executeCommand('setContext', 'quarkusProjectExistsOrLightWeight', true);

  context.subscriptions.push(createTerminateDebugListener());
  quarkusProjectListener.getQuarkusProjectListener().then((disposableListener: Disposable) => {
    context.subscriptions.push(disposableListener);
  });
  context.subscriptions.push(terminalCommandRunner);
  context.subscriptions.push(
    window.onDidCloseTerminal((closedTerminal: Terminal) => {
      terminalCommandRunner.dispose(closedTerminal.name);
    })
  );

  let updatedDocumentsCache: string[] = [];
  // When extension is started, loop for each text documents which are opened to update their language ID.
  workspace.textDocuments.forEach(document => {
    updateLanguageId(document, updatedDocumentsCache, false);
  });
  // When a text document is opened,  update their language ID.
  context.subscriptions.push(
    workspace.onDidOpenTextDocument((document) => {
      updateLanguageId(document, updatedDocumentsCache, true);
    })
  );
  context.subscriptions.push(
    workspace.onDidChangeConfiguration((e: ConfigurationChangeEvent) => {
      if (e.affectsConfiguration(QuarkusConfig.QUARKUS_CONFIG_NAME)) {
        updatedDocumentsCache = [];
      }
    })
  );

  /**
   * Update if required the language ID to 'quarkus-properties' if needed.
   *
   * @param document the text document.
   * @param documentCache cache of documents for which the user has already been notified about the
   * @param onExtensionLoad if the user manually changed the language id.
   */
  async function updateLanguageId(document: TextDocument, documentCache: string[], onExtensionLoad: boolean) {
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
      tryToForceLanguageId(document, fileName, documentCache, propertiesLanguageMismatch, 'quarkus-properties', onExtensionLoad);
    } else if (fileName === 'application.yaml' || fileName === 'application.yml') {
      if (document.languageId === 'yaml') {
        // the language ID is already yaml do nothing.
        return;
      }
      tryToForceLanguageId(document, fileName, documentCache, propertiesLanguageMismatch, 'yaml', onExtensionLoad);
    }
  }

  /**
   * Try to force the document language ID to the given language ID.
   *
   * @param document the text document.
   * @param documentCache Cache of files that the user has already been prompted for
   * @param languageId the language ID.
   * @param notifyUser if a notification should appear when the language ID is updated
   */
  function tryToForceLanguageId(document: TextDocument, fileName: string, documentCache: string[], propertiesLanguageMismatch: PropertiesLanguageMismatch, languageId: string, notifyUser: boolean): Promise<void> {
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
          const oldLanguageId: string = document.languageId;
          languages.setTextDocumentLanguage(document, languageId);
          if (notifyUser && !documentCache.includes(document.fileName)) {
            const CONFIGURE_IN_SETTINGS = "Configure in Settings";
            const DISABLE_IN_SETTINGS = "Disable Language Updating";
            const response: Thenable<string> = window.showInformationMessage(
                `Quarkus Tools for Visual Studio Code automatically switched the language ID of '${fileName}' `
                + `to be '${languageId}' in order to provide language support. `
                + `This behavior can be configured in settings.`, DISABLE_IN_SETTINGS, CONFIGURE_IN_SETTINGS);
            response.then(result => {
              if (result === CONFIGURE_IN_SETTINGS) {
                commands.executeCommand('workbench.action.openSettings', QuarkusConfig.PROPERTIES_LANGUAGE_MISMATCH);
              } else if (result === DISABLE_IN_SETTINGS) {
                QuarkusConfig.setPropertiesLanguageMismatch(PropertiesLanguageMismatch.ignore).then(() => {
                  languages.setTextDocumentLanguage(document, oldLanguageId);
                });
              }
            });
            documentCache.push(document.fileName);
          }
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

  const notAQuarkusProjectWarning: (ignored: any) => PromiseLike<any> = (ignored: any): PromiseLike<any> => {
    return window.showErrorMessage('No Quarkus projects were detected in this folder', 'Ok');
  };

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
    requestStandardMode("Adding extensions").then((isStandardMode) => {
      if (isStandardMode) {
        ProjectLabelInfo.getWorkspaceProjectLabelInfo().then((projectLabelInfo: ProjectLabelInfo[]) => {
          if (projectLabelInfo.filter(info => info.isQuarkusProject()).length) {
            addExtensionsWizard();
          } else {
            notAQuarkusProjectWarning(null);
          }
        }).catch(notAQuarkusProjectWarning);
      }
    });
  }));

  /**
   * Command for debugging current Quarkus Maven project
   */
  context.subscriptions.push(commands.registerCommand(VSCodeCommands.DEBUG_QUARKUS_PROJECT, () => {
    requestStandardMode("Debugging the project").then((isStandardMode) => {
      if (isStandardMode) {
        ProjectLabelInfo.getWorkspaceProjectLabelInfo().then((projectLabelInfo: ProjectLabelInfo[]) => {
          if (projectLabelInfo.filter(info => info.isQuarkusProject()).length) {
            tryStartDebugging();
          } else {
            notAQuarkusProjectWarning(null);
          }
        }).catch(notAQuarkusProjectWarning);
      }
    });
  }));

  /**
   * Command for displaying welcome page
   */
  context.subscriptions.push(commands.registerCommand(VSCodeCommands.QUARKUS_WELCOME, () => {
    WelcomeWebview.createOrShow(context);
  }));
}
