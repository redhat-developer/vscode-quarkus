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
import { commands, ConfigurationChangeEvent, Disposable, ExtensionContext, languages, Terminal, TextDocument, window, workspace } from 'vscode';
import { registerVSCodeCommands } from './commands/registerCommands';
import { ProjectLabelInfo } from './definitions/ProjectLabelInfo';
import { PropertiesLanguageMismatch, QuarkusConfig } from './QuarkusConfig';
import { QuarkusContext } from './QuarkusContext';
import quarkusProjectListener from './QuarkusProjectListener';
import { connectToQuteLS } from './qute/languageServer/client';
import { checkQuteLanguageSupportedContext, checkQuteValidationFromExclusionContext } from './qute/commands/registerCommands';
import { terminalCommandRunner } from './terminal/terminalCommandRunner';
import { initTelemetryService } from './utils/telemetryUtils';
import { WelcomeWebview } from './webviews/WelcomeWebview';
import { createTerminateDebugListener } from './wizards/debugging/terminateProcess';

export async function activate(context: ExtensionContext) {

  await initTelemetryService(context);

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

  // When extension is started, loop for each text documents which are opened to update their language ID.
  workspace.textDocuments.forEach(document => {
    updateLanguageId(document, false);
  });
  // When a text document is opened, update their language ID.
  context.subscriptions.push(
    workspace.onDidOpenTextDocument(async (document) => {
      if (!(document.uri.scheme === 'git')) {
        await updateLanguageId(document, true);
        await checkQuteLanguageSupportedContext(document);
        await checkQuteValidationFromExclusionContext(document.uri);
      }
    })
  );

  registerVSCodeCommands(context);

  await connectToQuteLS(context).catch((error) => {
    window.showErrorMessage(error.message, error.label).then((selection) => {
      if (error.label && error.label === selection && error.openUrl) {
        commands.executeCommand('vscode.open', error.openUrl);
      }
    });
  });

}

export function deactivate() {
}

function displayWelcomePageIfNeeded(context: ExtensionContext): void {
  if (QuarkusConfig.getAlwaysShowWelcomePage()) {
    WelcomeWebview.createOrShow(context);
  }
}

/**
 * Try to force the document language ID to the given language ID.
 *
 * @param document the text document.
 * @param languageId the language ID.
 * @param notifyUser if a notification should appear when the language ID is updated
 */
function tryToForceLanguageId(document: TextDocument, fileName: string, propertiesLanguageMismatch: PropertiesLanguageMismatch, languageId: string, notifyUser: boolean): Promise<void> {
  // Get project label information for the given file URI
  const labelInfo = ProjectLabelInfo.getProjectLabelInfo(document.uri.toString());
  return labelInfo.then(l => {
    if (l.isQuarkusProject()) {
      if (propertiesLanguageMismatch === PropertiesLanguageMismatch.prompt) {
        const YES = "Yes", NO = "No";
        const supportType = languageId.indexOf('qute') > -1 ? 'Qute' : 'Quarkus';
        const response: Thenable<string> = window.showInformationMessage(`The language ID for '${fileName}' must be '${languageId}' to receive ${supportType} support. Set the language ID to '${languageId}?'`, YES, NO);
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
        if (notifyUser) {
          const context = QuarkusContext.getExtensionContext();
          if (!hasShownSetLanguagePopUp(context)) {
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
            context.globalState.update(QuarkusConfig.QUARKUS_OVERRIDE_LANGUAGE_ID, 'true');
          }
        }
      }
    }
  });
}

function hasShownSetLanguagePopUp(context: ExtensionContext): boolean {
  return context.globalState.get(QuarkusConfig.QUARKUS_OVERRIDE_LANGUAGE_ID, false);
}

const APP_PROPERTIES_PATTERN = /^application(?:-[A-Za-z]+)\.properties$/;

const LANGUAGE_MAP = new Map<string, string>([
  [".html", "qute-html"],
  [".txt", "qute-txt"],
  [".yaml", "qute-yaml"],
  [".json", "qute-json"]
]);

/**
 * Update if required the language ID to 'quarkus-properties' if needed.
 *
 * @param document the text document.
 * @param onExtensionLoad if the user manually changed the language id.
 */
async function updateLanguageId(document: TextDocument, onExtensionLoad: boolean) {
  const propertiesLanguageMismatch: PropertiesLanguageMismatch = QuarkusConfig.getPropertiesLanguageMismatch();
  if (propertiesLanguageMismatch === PropertiesLanguageMismatch.ignore) {
    // Do nothing
    return;
  }
  const fileName: string = path.basename(document.fileName);
  if (APP_PROPERTIES_PATTERN.test(fileName)) {
    if (document.languageId === 'quarkus-properties') {
      // the language ID is already quarkus-properties do nothing.
      return;
    }
    tryToForceLanguageId(document, fileName, propertiesLanguageMismatch, 'quarkus-properties', onExtensionLoad);
  } else if (fileName === 'application.yaml' || fileName === 'application.yml') {
    if (document.languageId === 'yaml') {
      // the language ID is already yaml do nothing.
      return;
    }
    tryToForceLanguageId(document, fileName, propertiesLanguageMismatch, 'yaml', onExtensionLoad);
  } else if (document.fileName.includes(`resources${path.sep}templates${path.sep}`)) {
    for (const extension of LANGUAGE_MAP.keys()) {
      if (path.extname(document.fileName) === extension) {
        const quteLanguageId = LANGUAGE_MAP.get(extension);
        tryToForceLanguageId(document, fileName, propertiesLanguageMismatch, quteLanguageId, onExtensionLoad);
        break;
      }
    }
  }
}
