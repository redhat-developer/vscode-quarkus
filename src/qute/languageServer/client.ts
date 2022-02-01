import * as requirements from './requirements';

import { DidChangeConfigurationNotification, LanguageClientOptions } from 'vscode-languageclient';
import { LanguageClient } from 'vscode-languageclient/node';
import { ExtensionContext, commands, workspace, window, ConfigurationTarget, WorkspaceConfiguration } from 'vscode';
import { prepareExecutable } from './javaServerStarter';
import { registerVSCodeQuteCommands } from '../commands/registerCommands';
import { QuteClientCommandConstants } from '../commands/commandConstants';
import { QuteSettings } from './settings';

export function connectToQuteLS(context: ExtensionContext) {
  registerVSCodeQuteCommands(context);

  return requirements.resolveRequirements().then(requirements => {
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
          didChangeConfiguration: () => {
            quteLanguageClient.sendNotification(DidChangeConfigurationNotification.type, { settings: getQuteSettings() });
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
      bindQuteRequest('qute/template/javaTypes');
      bindQuteRequest('qute/template/resolvedJavaType');
      bindQuteRequest('qute/template/javaDefinition');
      bindQuteRequest('qute/java/codeLens');
      bindQuteRequest('qute/java/diagnostics');
      bindQuteRequest('qute/java/documentLink');
      bindQuteNotification('qute/dataModelChanged');
      if (!hasShownQuteValidationPopUp(context)) {
        await showQuteValidationPopUp(context);
      }
      await setQuteValidationEnabledContext();
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
   * Sets the `quteValidationEnabled` context to `true` if the `qute.validation.enabled`
   * setting is set to true. Sets to `false` otherwise.
   */
export async function setQuteValidationEnabledContext() {
  await commands.executeCommand('setContext', 'quteValidationEnabled', workspace.getConfiguration().get(QuteSettings.QUTE_VALIDATION_ENABLED));
}
