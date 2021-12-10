import * as requirements from './requirements';

import { DidChangeConfigurationNotification, LanguageClientOptions } from 'vscode-languageclient';
import { LanguageClient } from 'vscode-languageclient/node';
import { ExtensionContext, commands, workspace } from 'vscode';
import { prepareExecutable } from './javaServerStarter';
import { registerVSCodeQuteCommands } from '../commands/registerCommands';
import { QuteClientCommandConstants } from '../commands/commandConstants';

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
         //       CommandKind.COMMAND_OPEN_URI
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
    return quteLanguageClient.onReady().then(() => {
      bindQuteRequest('qute/template/project');
      bindQuteRequest('qute/template/projectDataModel');
      bindQuteRequest('qute/template/javaTypes');
      bindQuteRequest('qute/template/resolvedJavaType');
      bindQuteRequest('qute/template/javaDefinition');
      bindQuteRequest('qute/java/codeLens');
      bindQuteRequest('qute/java/diagnostics');
      bindQuteRequest('qute/java/documentLink');
      bindQuteNotification('qute/dataModelChanged');
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
