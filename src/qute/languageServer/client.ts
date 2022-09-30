import * as requirements from './requirements';

import { DidChangeConfigurationNotification, LanguageClientOptions } from 'vscode-languageclient';
import { LanguageClient } from 'vscode-languageclient/node';
import { ExtensionContext, commands, workspace, window, ConfigurationTarget, languages } from 'vscode';
import { prepareExecutable } from './quteServerStarter';
import { registerQuteExecuteWorkspaceCommand, registerVSCodeQuteCommands, synchronizeQuteValidationButton } from '../commands/registerCommands';
import { QuteClientCommandConstants } from '../commands/commandConstants';
import { QuteSettings } from './settings';
import { JavaExtensionAPI } from '../../extension';
import { QuteInlayHintsProvider } from './inlayHintsProvider';

export function connectToQuteLS(context: ExtensionContext, api: JavaExtensionAPI) {
  registerVSCodeQuteCommands(context);

  return requirements.resolveRequirements(api).then(requirements => {
    const clientOptions: LanguageClientOptions = {
      documentSelector: [
        { scheme: 'file', language: 'qute-html' },
        { scheme: 'file', language: 'qute-json' },
        { scheme: 'file', language: 'qute-yaml' },
        { scheme: 'file', language: 'qute-txt' },
        { scheme: 'untitled', language: 'qute-html' },
        { scheme: 'vscode-notebook-cell', language: 'qute-html' },
        { scheme: 'file', language: 'java' }
      ],
      // wrap with key 'settings' so it can be handled same a DidChangeConfiguration
      initializationOptions: {
        settings: getQuteSettings(),
        extendedClientCapabilities: {
          commands: {
            commandsKind: {
              valueSet: [
                QuteClientCommandConstants.OPEN_URI,
                QuteClientCommandConstants.JAVA_DEFINTION,
                QuteClientCommandConstants.COMMAND_CONFIGURATION_UPDATE
              ]
            }
          },
          shouldLanguageServerExitOnShutdown: true
        }
      },
      synchronize: {
        // preferences starting with these will trigger didChangeConfiguration
        configurationSection: ['qute']
      },
      middleware: {
        workspace: {
          didChangeConfiguration: async () => {
            // A settings.json is updated:
            // 1. send the new Quet settings to the Qute language server
            quteLanguageClient.sendNotification(DidChangeConfigurationNotification.type, { settings: getQuteSettings() });
            // 2. synchronize the Qute toggle button for validation
            await synchronizeQuteValidationButton(window.activeTextEditor);
          }
        }
      }
    };

    function bindQuteRequest(request: string) {
      quteLanguageClient.onRequest(request, async (params: any) =>
        <any>await commands.executeCommand("java.execute.workspaceCommand", request, params)
      );
    }

    function bindQuteNotification(notification: string) {
      context.subscriptions.push(commands.registerCommand(notification, (event: any) => {
        quteLanguageClient.sendNotification(notification, event);
      }));
    }

    const serverOptions = prepareExecutable(requirements);
    const quteLanguageClient = new LanguageClient('qute', 'Qute Support', serverOptions, clientOptions);
    context.subscriptions.push(quteLanguageClient.start());

    return quteLanguageClient.onReady().then(async () => {
      bindQuteRequest('qute/template/project');
      bindQuteRequest('qute/template/projectDataModel');
      bindQuteRequest('qute/template/userTags');
      bindQuteRequest('qute/template/javaTypes');
      bindQuteRequest('qute/template/resolvedJavaType');
      bindQuteRequest('qute/template/javaDefinition');
      bindQuteRequest('qute/template/generateMissingJavaMember');
      bindQuteRequest('qute/java/codeLens');
      bindQuteRequest('qute/java/diagnostics');
      bindQuteRequest('qute/java/documentLink');
      bindQuteNotification('qute/dataModelChanged');

      registerQuteExecuteWorkspaceCommand(context, quteLanguageClient);
      // Refresh the Qute context when editor tab has the focus
      context.subscriptions.push(
        window.onDidChangeActiveTextEditor(async editor => {
          await synchronizeQuteValidationButton(editor);
        })
      );
      // Refresh the Qute context when the language id changed (HTML -> Qute HTML or Qute HTML -> HTML)
      context.subscriptions.push(
        workspace.onDidOpenTextDocument(async (document) => {
          // when settings.json is updated, onDidOpenTextDocument is called,
          // the Qute context must be refreshed only for the activate text editor.
          if (window.activeTextEditor?.document === document) {
            await synchronizeQuteValidationButton(window.activeTextEditor);
          }
          // Display the experimental Qute validation pop-up if it hasn't been displayed and a Qute file is open
          if (!hasShownQuteValidationPopUp(context) && document.languageId.includes('qute')) {
            showQuteValidationPopUp(context);
          }
        })
      );
      // Display the experimental Qute validation pop-up if it hasn't been displayed and a Qute file is open
      if (!hasShownQuteValidationPopUp(context)) {
        for (const textDocument of workspace.textDocuments) {
          if (textDocument.languageId.includes('qute')) {
            showQuteValidationPopUp(context);
          }
        }
      }
      await setQuteValidationEnabledContext();
      await synchronizeQuteValidationButton(window.activeTextEditor);

      const supportRegisterInlayHintsProvider = (languages as any).registerInlayHintsProvider;
      if (supportRegisterInlayHintsProvider) {
        context.subscriptions.push(languages.registerInlayHintsProvider(clientOptions.documentSelector, new QuteInlayHintsProvider(quteLanguageClient)));
      }
    });
  });
}

/**
 * Returns a json object with key 'qute' and a json object value that
 * holds all qute. settings.
 *
 * Returns: {
 *            'qute': {...}
 *          }
 */
function getQuteSettings(): any {
  if (workspace.workspaceFolders && workspace.workspaceFolders.length > 1) {
    // There are several workspace folders, returns the JSON qute settings per workspace folder:
    //
    /**
     * "qute": {
            "workspaceFolders": {
                "file:///c%3A/Users/azerr/git/quarkus-ls/qute.jdt/com.redhat.qute.jdt.test/projects/maven/qute-quickstart": {
                    "validation": {
                        "enabled": true
                    }
                },
                "file:///c%3A/Users/azerr/git/quarkus-ls/qute.jdt/com.redhat.qute.jdt.test/projects/maven/qute-java17": {
                    "validation": {
                        "enabled": true
                    }
                }
            }
        }
     */

    const foldersSettings = {};
    workspace.workspaceFolders.forEach(folder => {
      const folderConfigQute = workspace.getConfiguration(undefined, folder).get('qute');
      foldersSettings[folder.uri.toString()] = toJSONObject(folderConfigQute);
    });
    const qute = { qute: { workspaceFolders: foldersSettings } };
    return qute;
  }

  // One workspace folder or none folder, return a single settings:
  //
  /**
   * "qute": {
         "validation": {
              "enabled": true
          }
      }
   */
  const configQute = workspace.getConfiguration().get('qute');
  const qute = { qute: toJSONObject(configQute) };
  return qute;
}

function toJSONObject(configQute: unknown): any {
  const x = JSON.stringify(configQute); // configQute is not a JSON type
  return JSON.parse(x);
}

function hasShownQuteValidationPopUp(context: ExtensionContext): boolean {
  return context.globalState.get(QuteSettings.EXPERIMENTAL_QUTE_VALIDATION_FLAG, false);
}

async function showQuteValidationPopUp(context: ExtensionContext) {
  const EXPERIMENTAL_QUTE_VALIDATION_ADVERTISEMENT = `Enable experimental validation for Qute files?
  (You may change this setting, \`${QuteSettings.QUTE_VALIDATION_ENABLED}}\`, later)`;
  const ENABLE_MESSAGE = `Enable`;
  const DONT_SHOW_AGAIN_MESSAGE = "Don't show this again";
  const input = await window.showInformationMessage(EXPERIMENTAL_QUTE_VALIDATION_ADVERTISEMENT, ENABLE_MESSAGE, DONT_SHOW_AGAIN_MESSAGE);
  if (input === ENABLE_MESSAGE) {
    workspace.getConfiguration().update(QuteSettings.QUTE_VALIDATION_ENABLED, true, ConfigurationTarget.Global);
  }
  context.globalState.update(QuteSettings.EXPERIMENTAL_QUTE_VALIDATION_FLAG, 'true');
}

/**
   * Sets the `editorQuteValidationEnabled` context to `true` if the `qute.validation.enabled`
   * setting is set to true. Sets to `false` otherwise.
   */
export async function setQuteValidationEnabledContext() {
  await commands.executeCommand('setContext', 'editorQuteValidationEnabled', workspace.getConfiguration().get(QuteSettings.QUTE_VALIDATION_ENABLED));
}
