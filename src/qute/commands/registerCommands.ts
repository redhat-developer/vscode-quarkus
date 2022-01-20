import { TextEncoder } from "util";
import { commands, ConfigurationTarget, ExtensionContext, Position, Range, Selection, Uri, window, workspace, WorkspaceConfiguration } from "vscode";
import { ConfigurationItem, Location } from "vscode-languageclient";
import { QuteSettings } from "../languageServer/settings";
import { QuteClientCommandConstants, QuteJdtLsServerCommandConstants, QuteServerCommandConstants } from "./commandConstants";

/**
 * Register custom vscode command for Qute support.
 *
 * @param context the extension context.
 */
export function registerVSCodeQuteCommands(context: ExtensionContext) {
  registerOpenUriCommand(context);
  registerGenerateTemplateFileCommand(context);
  registerJavaDefinitionCommand(context);
  registerConfigurationUpdateCommand(context);
}

/**
 * Open a Qute template by file Uri.
 *
 * @param context the extension context.
 */
function registerOpenUriCommand(context: ExtensionContext) {
  context.subscriptions.push(commands.registerCommand(QuteClientCommandConstants.OPEN_URI, async (uri?: string) => {
    commands.executeCommand('vscode.open', Uri.parse(uri));
  }));
}

/**
 * Generate Qute template file content from data model and open the Qute template.
 *
 * @param context the extension context.
 */
function registerGenerateTemplateFileCommand(context: ExtensionContext) {
  context.subscriptions.push(commands.registerCommand(QuteClientCommandConstants.GENERATE_TEMPLATE_FILE, async (info?) => {
    const templateContent: string = await commands.executeCommand(QuteServerCommandConstants.GENERATE_TEMPLATE_CONTENT, info);
    const uri = info.templateFileUri;
    const fileUri = Uri.parse(uri);
    await workspace.fs.writeFile(fileUri, new TextEncoder().encode(templateContent));
    window.showTextDocument(fileUri, { preview: false });
  }));
}

/**
 * Go to the definition of Java data model (field, method, method invokation of "data" method).
 *
 * @param context the extension context.
 */
function registerJavaDefinitionCommand(context: ExtensionContext) {
  context.subscriptions.push(commands.registerCommand(QuteClientCommandConstants.JAVA_DEFINTION, async (params) => {
    const lspLocation: Location = await commands.executeCommand(QuteJdtLsServerCommandConstants.JAVA_EXECUTE_WORKPACE_COMMAND, QuteJdtLsServerCommandConstants.JAVA_DEFINTION, params);
    if (lspLocation) {
      try {
        const { uri, range } = lspLocation;
        const javaFileUri = Uri.parse(uri);
        const document = await workspace.openTextDocument(javaFileUri);
        const editor = await window.showTextDocument(document);
        const { start, end } = range;
        const javaFileRange = new Range(new Position(start.line, start.character), new Position(end.line, end.character));
        editor.selection = new Selection(javaFileRange.start, javaFileRange.start);
        editor.revealRange(javaFileRange);
      }
      catch (e) {
        const msg = (e instanceof Error) ? e.message : e;
        window.showErrorMessage(msg);
      }
    }
  }));
}

/**
 * Update a given setting from the Qute language server.
 *
 * @param context the extension context.
 */
export function registerConfigurationUpdateCommand(context: ExtensionContext) {
  context.subscriptions.push(commands.registerCommand(QuteClientCommandConstants.COMMAND_CONFIGURATION_UPDATE, async (configItemEdit: ConfigurationItemEdit) => {
    const section = configItemEdit.section;
    const value = getSettingsValue(configItemEdit.value, configItemEdit.section);
    const config = getConfiguration(configItemEdit.scopeUri);
    switch (configItemEdit.editType) {
      case ConfigurationItemEditType.Add:
        addToPreferenceArray(config, section, value);
        break;
      case ConfigurationItemEditType.Delete: {
        config.workspaceConfiguration.update(section, undefined, config.target);
        break;
      }
      case ConfigurationItemEditType.Update: {
        config.workspaceConfiguration.update(section, value, config.target);
        break;
      }
    }
  }));
}

function getSettingsValue(value: any, section: string) {
  switch (section) {
    case QuteSettings.QUTE_VALIDATION_EXCLUDED:
      return workspace.asRelativePath(Uri.parse(value), false);
    default:
      return value;
  }
}

interface IConfiguration {
  workspaceConfiguration: WorkspaceConfiguration;
  target: ConfigurationTarget;
}

function getConfiguration(scopeUri: string): IConfiguration {
  if (scopeUri) {
    const workspaceFolder = workspace.getWorkspaceFolder(Uri.parse(scopeUri));
    if (workspaceFolder) {
      return {
        workspaceConfiguration: workspace.getConfiguration(undefined, workspaceFolder),
        target: ConfigurationTarget.WorkspaceFolder
      };
    }
  }
  return {
    workspaceConfiguration: workspace.getConfiguration(),
    target: ConfigurationTarget.Workspace
  };
}

function addToPreferenceArray<T>(config: IConfiguration, key: string, value: T): void {
  const workspaceConfiguration = config.workspaceConfiguration;
  const configArray: T[] = workspaceConfiguration.get<T[]>(key, []);
  if (configArray.includes(value)) {
    return;
  }
  configArray.push(value);
  workspaceConfiguration.update(key, configArray, config.target);
}

interface ConfigurationItemEdit extends ConfigurationItem {
  value: any;
  editType: ConfigurationItemEditType;
}

enum ConfigurationItemEditType {
  Add = 0,
  Delete = 1,
  Update = 2
}
