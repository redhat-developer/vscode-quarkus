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
import { readFile } from 'fs-extra';
import * as path from 'path';
import { commands, Disposable, ExtensionContext, extensions, Terminal, TextDocument, window, workspace, debug } from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
import { registerVSCodeClientCommands, registerVSCodeCommands } from './commands/registerCommands';
import { QuarkusConfig, QuarkusPropertiesLanguageMismatch } from './QuarkusConfig';
import { QuarkusContext } from './QuarkusContext';
import quarkusProjectListener from './QuarkusProjectListener';
import { connectToQuteLS } from './qute/languageServer/client';
import { terminalCommandRunner } from './terminal/terminalCommandRunner';
import { tryToForceLanguageId } from './utils/languageMismatch';
import { initRecommendationService } from './utils/recommendationUtils';
import { JAVA_EXTENSION_ID } from './utils/requestStandardMode';
import { initTelemetryService } from './utils/telemetryUtils';
import { getFilePathsFromWorkspace } from './utils/workspaceUtils';
import { WelcomeWebview } from './webviews/WelcomeWebview';
import { createTerminateDebugListener } from './wizards/debugging/terminateProcess';
import { QuteDebugAdapterFactory } from './qute/debugAdapter/quteDebugAdapterFactory';
import { QuteDebugAdapterTrackerFactory } from './qute/debugAdapter/quteDebugAdapterTrackerFactory';

// alias for vscode-java's ExtensionAPI
export type JavaExtensionAPI = any;

let quteLanguageClient: LanguageClient | null = null;

export async function activate(context: ExtensionContext) {

  const telemetryService = await initTelemetryService(context);
  initRecommendationService(context, telemetryService);

  QuarkusContext.setContext(context);

  registerVSCodeClientCommands(context);
  // Check if activation occured due to a 'java' language document
  const onLanguageJavaWasActivated = workspace.textDocuments.some(doc => doc.languageId === 'java');
  if (onLanguageJavaWasActivated) {
    /* Consider duplicating activationEvents above to avoid re-checking when
    an activation event should be sufficient */
    // Check if Java project is also a Quarkus project
    const shouldActivate = await isQuarkusProject();
    if (shouldActivate) {
      doActivate(context);
    }
  } else {
    doActivate(context);
  }

  // Register the Qute Debugger
  const quteDebugFactory = new QuteDebugAdapterFactory();
  const quteDebugTrackerFactory = new QuteDebugAdapterTrackerFactory();
  context.subscriptions.push(
    debug.registerDebugAdapterDescriptorFactory('qute', quteDebugFactory)
  );
  context.subscriptions.push(
    debug.registerDebugAdapterTrackerFactory('qute', quteDebugTrackerFactory)
  );
}

async function doActivate(context: ExtensionContext): Promise<void> {
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
    updateLanguageId(context, document, false);
  });
  // When a text document is opened, update their language ID.
  context.subscriptions.push(
    workspace.onDidOpenTextDocument(async (document) => {
      if (!(document.uri.scheme === 'git')) {
        await updateLanguageId(context, document, true);
      }
    })
  );

  registerVSCodeCommands(context);
  const api: JavaExtensionAPI = await getJavaExtensionAPI();

  try {
    quteLanguageClient = await connectToQuteLS(context, api);
  } catch (error) {
    window
      .showErrorMessage(error.message, error.label) //
      .then((selection) => {
        if (error.label && error.label === selection && error.openUrl) {
          commands.executeCommand("vscode.open", error.openUrl);
        }
      });
  }
}

export async function deactivate(): Promise<void> {
  if (quteLanguageClient) {
    await quteLanguageClient.stop();
  }
}

function displayWelcomePageIfNeeded(context: ExtensionContext): void {
  if (QuarkusConfig.getAlwaysShowWelcomePage()) {
    WelcomeWebview.createOrShow(context);
  }
}

const APP_PROPERTIES_PATTERN = /^application(?:-[A-Za-z]+)?\.properties$/;

/**
 * Update if required the language ID to 'quarkus-properties' if needed.
 *
 * @param context the extension context
 * @param document the text document.
 * @param onExtensionLoad if the user manually changed the language id.
 */
async function updateLanguageId(context: ExtensionContext, document: TextDocument, onExtensionLoad: boolean) {
  const propertiesLanguageMismatch: QuarkusPropertiesLanguageMismatch = QuarkusConfig.getPropertiesLanguageMismatch();
  if (propertiesLanguageMismatch === QuarkusPropertiesLanguageMismatch.ignore) {
    // Do nothing
    return;
  }
  const fileName: string = path.basename(document.fileName);
  if (APP_PROPERTIES_PATTERN.test(fileName)) {
    if (document.languageId === 'quarkus-properties') {
      // the language ID is already quarkus-properties do nothing.
      return;
    }
    tryToForceLanguageId(context, document, fileName, propertiesLanguageMismatch, 'quarkus-properties', onExtensionLoad, QuarkusConfig.QUARKUS_OVERRIDE_LANGUAGE_ID, QuarkusConfig.QUARKUS_PROPERTIES_LANGUAGE_MISMATCH);
  } else if (fileName === 'application.yaml' || fileName === 'application.yml') {
    if (document.languageId === 'yaml') {
      // the language ID is already yaml do nothing.
      return;
    }
    tryToForceLanguageId(context, document, fileName, propertiesLanguageMismatch, 'yaml', onExtensionLoad, QuarkusConfig.QUARKUS_OVERRIDE_LANGUAGE_ID, QuarkusConfig.QUARKUS_PROPERTIES_LANGUAGE_MISMATCH);
  }
}

export async function getJavaExtensionAPI(): Promise<JavaExtensionAPI> {
  const vscodeJava = extensions.getExtension(JAVA_EXTENSION_ID);
  if (!vscodeJava) {
    return Promise.resolve(undefined);
  }

  const api = await vscodeJava.activate();
  return Promise.resolve(api);
}
async function isQuarkusProject(): Promise<boolean> {
  if (!workspace.workspaceFolders) {
    return false;
  }
  return Promise.all(workspace.workspaceFolders.map(async ws => {
    const buildFileUris = await getFilePathsFromWorkspace(ws, "**/{pom.xml,build.gradle}");
    const ret = await Promise.all(buildFileUris.map(uri => {
      return readFile(uri.fsPath).then((doc) => {
        return doc.includes("io.quarkus") ? Promise.reject() : Promise.resolve();
      })
    })).then(() => {
      return false;
    }).catch(() => {
      return true;
    });
    return ret ? Promise.resolve() : Promise.reject();
  })).then(() => {
    return true;
  }).catch(() => {
    return false;
  });
}
