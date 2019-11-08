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

import { JdtLSCommands, QuarkusLS, VSCodeCommands } from './definitions/constants';

import { DidChangeConfigurationNotification, Disposable, LanguageClientOptions, LanguageClient, RequestType } from 'vscode-languageclient';
import { ExtensionContext, commands, window, workspace } from 'vscode';
import { QuarkusContext } from './QuarkusContext';
import { addExtensionsWizard } from './addExtensions/addExtensionsWizard';
import { createTerminateDebugListener } from './debugging/terminateProcess';
import { generateProjectWizard } from './generateProject/generationWizard';
import { prepareExecutable } from './languageServer/javaServerStarter';
import { tryStartDebugging } from './debugging/startDebugging';
import { WelcomeWebview } from './webviews/WelcomeWebview';
import { QuarkusConfig } from './QuarkusConfig';

let languageClient: LanguageClient;

interface QuarkusProjectInfoParams {
  uri: string;
  documentationFormat: string[];
  scope: number;
}

interface QuarkusPropertiesChangeEvent {
  type: number;
  projectURIs: string[];
}

interface QuarkusPropertyDefinitionParams {
	uri: string;
	propertySource: string;
}

export function activate(context: ExtensionContext) {
  QuarkusContext.setContext(context);
  displayWelcomePageIfNeeded(context);

  context.subscriptions.push(createTerminateDebugListener());

  connectToLS(context).then(() => {
    const quarkusPojectInfoRequest = new RequestType<QuarkusProjectInfoParams, any, void, void>(QuarkusLS.PROJECT_REQUEST);
    languageClient.onRequest(quarkusPojectInfoRequest, async (params: QuarkusProjectInfoParams) =>
       <any> await commands.executeCommand("java.execute.workspaceCommand", JdtLSCommands.PROJECT_INFO_COMMAND, params)
    );

    const quarkusPropertyDefinitionRequest = new RequestType<QuarkusPropertyDefinitionParams, any, void, void>(QuarkusLS.PROPERTY_DEFINITION_REQUEST);
    languageClient.onRequest(quarkusPropertyDefinitionRequest, async (params: QuarkusPropertyDefinitionParams) =>
       <any> await commands.executeCommand("java.execute.workspaceCommand", JdtLSCommands.PROPERTY_DEFINITION_COMMAND, params)
    );

    /**
     * Command for resetting Quarkus properties cache
     */
    context.subscriptions.push(commands.registerCommand('quarkusTools.quarkusPropertiesChanged', (event: QuarkusPropertiesChangeEvent) => {
      languageClient.sendNotification("quarkus/quarkusPropertiesChanged", event);
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

function connectToLS(context: ExtensionContext) {
  return requirements.resolveRequirements().then(requirements => {
    const clientOptions: LanguageClientOptions = {
      documentSelector: [
        { scheme: 'file', language: 'quarkus-properties' }
      ],
      // wrap with key 'settings' so it can be handled same a DidChangeConfiguration
      initializationOptions: {
        settings: getQuarkusSettings()
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
      quarkus = { quarkus : JSON.parse(x)};
    }
    return quarkus;
  }
}
