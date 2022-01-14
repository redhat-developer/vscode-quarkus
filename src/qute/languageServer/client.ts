import * as requirements from './requirements';

import { DidChangeConfigurationNotification, LanguageClientOptions } from 'vscode-languageclient';
import { LanguageClient } from 'vscode-languageclient/node';
import { ExtensionContext, commands, workspace, window, ConfigurationTarget } from 'vscode';
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
        configurationSection: ['quarkus', '[qute]']
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
    return quteLanguageClient.onReady().then(async() => {
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
    }
    );
  });
}

/**
 * Returns a json object with key 'quarkus' and a json object value that
 * holds all quarkus. settings.
 *
 * Returns: {
 *            'quarkus': {...}
 *          }
 */
function getQuteSettings(): JSON {
  const configQuarkus = workspace.getConfiguration().get('quarkus');
  let quarkus;
  if (!configQuarkus) { // Set default preferences if not provided
    const defaultValue =
    {
      qute: {

      }
    };
    quarkus = defaultValue;
  } else {
    const x = JSON.stringify(configQuarkus); // configQuarkus is not a JSON type
    quarkus = { quarkus: JSON.parse(x) };
  }
  return quarkus;
}

function hasShownQuteValidationPopUp(context: ExtensionContext): boolean {
  return context.globalState.get(QuteSettings.EXPERIMENTAL_QUTE_VALIDATION_FLAG, false);
}

async function showQuteValidationPopUp(context: ExtensionContext) {
  const EXPERIMENTAL_QUTE_VALIDATION_ADVERTISEMENT = 'Enable experimental validation for Qute files? ' + //
        '(You may change this setting, `quarkus.tools.qute.validation.enabled`, later)';
  const ENABLE_MESSAGE = `Enable`;
  const DONT_SHOW_AGAIN_MESSAGE = "Don't show this again";
  const input = await window.showInformationMessage(EXPERIMENTAL_QUTE_VALIDATION_ADVERTISEMENT, ENABLE_MESSAGE, DONT_SHOW_AGAIN_MESSAGE);
  if (input === ENABLE_MESSAGE) {
    workspace.getConfiguration().update(QuteSettings.QUTE_VALIDATION_ENABLED, true, ConfigurationTarget.Global);
  }
  context.globalState.update(QuteSettings.EXPERIMENTAL_QUTE_VALIDATION_FLAG, 'true');
}
