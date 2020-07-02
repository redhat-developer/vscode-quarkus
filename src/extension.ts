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

import * as path from 'path';
import { VSCodeCommands, MicroProfileLS } from './definitions/constants';
import { DidChangeConfigurationNotification, LanguageClientOptions, LanguageClient } from 'vscode-languageclient';
import { ExtensionContext, commands, window, workspace, Terminal, languages, TextDocument } from 'vscode';
import { QuarkusContext } from './QuarkusContext';
import { addExtensionsWizard } from './wizards/addExtensions/addExtensionsWizard';
import { createTerminateDebugListener } from './wizards/debugging/terminateProcess';
import quarkusProjectListener from './QuarkusProjectListener';
import { generateProjectWizard } from './wizards/generateProject/generationWizard';
import { prepareExecutable } from './languageServer/javaServerStarter';
import { tryStartDebugging } from './wizards/debugging/startDebugging';
import { WelcomeWebview } from './webviews/WelcomeWebview';
import { QuarkusConfig, PropertiesLanguageMismatch } from './QuarkusConfig';
import { registerConfigurationUpdateCommand, registerOpenURICommand, CommandKind } from './lsp-commands';
import { registerYamlSchemaSupport, MicroProfilePropertiesChangeEvent } from './yaml/YamlSchema';
import { terminalCommandRunner } from './terminal/terminalCommandRunner';
import { ProjectLabelInfo } from './definitions/ProjectLabelInfo';

let languageClient: LanguageClient;

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
  /**
   * Register Yaml Schema support to manage application.yaml
   */
  const yamlSchemaCache = registerYamlSchemaSupport();

  connectToLS(context).then(() => {
    yamlSchemaCache.then(cache => { if (cache) { cache.languageClient = languageClient; } });

    /**
     * Delegate requests from MicroProfile LS to the Java JDT LS
     */
    bindRequest(MicroProfileLS.PROJECT_INFO_REQUEST);
    bindRequest(MicroProfileLS.PROPERTY_DEFINITION_REQUEST);
    bindRequest(MicroProfileLS.JAVA_CODEACTION_REQUEST);
    bindRequest(MicroProfileLS.JAVA_CODELENS_REQUEST);
    bindRequest(MicroProfileLS.JAVA_COMPLETION_REQUEST);
    bindRequest(MicroProfileLS.JAVA_DIAGNOSTICS_REQUEST);
    bindRequest(MicroProfileLS.JAVA_HOVER_REQUEST);
    bindRequest(MicroProfileLS.JAVA_FILE_INFO_REQUEST);
    bindRequest(MicroProfileLS.JAVA_PROJECT_LABELS_REQUEST);

    /**
     * Delegate notifications from Java JDT LS to the MicroProfile LS
     */
    context.subscriptions.push(commands.registerCommand(MicroProfileLS.PROPERTIES_CHANGED_NOTIFICATION, (event: MicroProfilePropertiesChangeEvent) => {
      languageClient.sendNotification(MicroProfileLS.PROPERTIES_CHANGED_NOTIFICATION, event);
      yamlSchemaCache.then(cache => { if (cache) cache.evict(event); });
      quarkusProjectListener.propertiesChange(event);
    }));
  }).catch((error) => {
    window.showErrorMessage(error.message, error.label).then((selection) => {
      if (error.label && error.label === selection && error.openUrl) {
        commands.executeCommand('vscode.open', error.openUrl);
      }
    });
  });

  function bindRequest(request: string) {
    languageClient.onRequest(request, async (params: any) =>
      <any>await commands.executeCommand("java.execute.workspaceCommand", request, params)
    );
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

  /**
   * Register standard LSP commands
   */
  context.subscriptions.push(registerConfigurationUpdateCommand());
  context.subscriptions.push(registerOpenURICommand());
}

function connectToLS(context: ExtensionContext) {
  return requirements.resolveRequirements().then(requirements => {
    const clientOptions: LanguageClientOptions = {
      documentSelector: [
        { scheme: 'file', language: 'microprofile-properties' },
        { scheme: 'file', language: 'quarkus-properties' },
        { scheme: 'file', language: 'java' }
      ],
      // wrap with key 'settings' so it can be handled same a DidChangeConfiguration
      initializationOptions: {
        settings: getQuarkusSettings(),
        extendedClientCapabilities: {
          commands: {
            commandsKind: {
              valueSet: [
                CommandKind.COMMAND_CONFIGURATION_UPDATE,
                CommandKind.COMMAND_OPEN_URI
              ]
            }
          }
        }
      },
      synchronize: {
        // preferences starting with these will trigger didChangeConfiguration
        configurationSection: ['quarkus', '[quarkus]']
      },
      middleware: {
        workspace: {
          didChangeConfiguration: () => {
            languageClient.sendNotification(DidChangeConfigurationNotification.type, { settings: getQuarkusSettings() });
          }
        }
      }
    };

    const serverOptions = prepareExecutable(requirements);
    languageClient = new LanguageClient('quarkus.tools', 'Quarkus Tools', serverOptions, clientOptions);
    context.subscriptions.push(languageClient.start());
    return languageClient.onReady();
  });

  /**
   * Returns a json object with key 'quarkus' and a json object value that
   * holds all quarkus. settings.
   *
   * Returns: {
   *            'quarkus': {...}
   *          }
   */
  function getQuarkusSettings(): JSON {
    const configQuarkus = workspace.getConfiguration().get('quarkus');
    let quarkus;
    if (!configQuarkus) { // Set default preferences if not provided
      const defaultValue =
      {
        quarkus: {

        }
      };
      quarkus = defaultValue;
    } else {
      const x = JSON.stringify(configQuarkus); // configQuarkus is not a JSON type
      quarkus = { quarkus: JSON.parse(x) };
    }
    return quarkus;
  }
}
