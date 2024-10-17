import * as path from 'path';
import { TextEncoder } from "util";
import { commands, ExtensionContext, Position, Range, Selection, TextDocument, TextEditor, Uri, window, workspace } from "vscode";
import { Location, TextEdit } from "vscode-languageclient";
import { QuteSettings, QuteTemplateLanguageMismatch } from "../languageServer/settings";
import { QuteClientCommandConstants, QuteJdtLsServerCommandConstants, QuteServerCommandConstants } from "./commandConstants";
import { CancellationToken, ExecuteCommandParams, ExecuteCommandRequest, TextDocumentIdentifier } from "vscode-languageclient";
import { LanguageClient } from "vscode-languageclient/node";
import { tryToForceLanguageId } from '../../utils/languageMismatch';
import { registerReferencesCommands, registerOpenUriCommand, registerConfigurationUpdateCommand, ConfigurationItemEditType, ConfigurationItemEdit } from '../../lsp-commands';

/**
 * Register custom vscode command for Qute support.
 *
 * @param context the extension context.
 */
export function registerVSCodeQuteCommands(context: ExtensionContext) {
  registerOpenUriCommandForQute(context);
  registerGenerateTemplateFileCommand(context);
  registerJavaDefinitionCommand(context);
  registerConfigurationUpdateCommandForQute(context);
  registerQuteValidationToggleCommand(context);
  context.subscriptions.push(
    workspace.onDidOpenTextDocument((document) => {
      updateQuteLanguageId(context, document, true);
    })
  );
  // When extension is started, loop for each text documents which are opened to update their language ID.
  workspace.textDocuments.forEach(document => {
    updateQuteLanguageId(context, document, false);
  });
}

export function registerQuteLSDependentCommands(context: ExtensionContext, languageClient: LanguageClient) {
  registerRefactorCommands(context, languageClient);
  registerReferencesForQute(context, languageClient);
  // Register client command to execute custom Qute Language Server command
  context.subscriptions.push(commands.registerCommand(QuteClientCommandConstants.EXECUTE_WORKSPACE_COMMAND, (command, ...rest) => {
    let token: CancellationToken;
    let commandArgs: any[] = rest;
    if (rest && rest.length && CancellationToken.is(rest[rest.length - 1])) {
      token = rest[rest.length - 1];
      commandArgs = rest.slice(0, rest.length - 1);
    }
    const params: ExecuteCommandParams = {
      command,
      arguments: commandArgs
    };
    if (token) {
      return languageClient.sendRequest(ExecuteCommandRequest.type, params, token);
    }
    else {
      return languageClient.sendRequest(ExecuteCommandRequest.type, params);
    }
  }));
}

/**
 * Open a Qute template by file Uri.
 *
 * @param context the extension context.
 */
function registerOpenUriCommandForQute(context: ExtensionContext) {
  registerOpenUriCommand(QuteClientCommandConstants.OPEN_URI, context);
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
 * Toggle for enabling/disabling Qute validation.
 *
 * @param context
 */
function registerQuteValidationToggleCommand(context: ExtensionContext) {
  // Toggle off - add file to exclusion
  context.subscriptions.push(commands.registerCommand(QuteClientCommandConstants.QUTE_VALIDATION_ENABLED_TOGGLE_OFF, async (uri?: Uri) => {
    // Add the editor document file uri to the `qute.validation.exclusion` array
    const templateUri = uri.toString();
    const edit = {
      scopeUri: templateUri,
      value: templateUri,
      editType: ConfigurationItemEditType.Add,
      section: QuteSettings.QUTE_VALIDATION_EXCLUDED
    } as ConfigurationItemEdit;
    await commands.executeCommand(QuteClientCommandConstants.COMMAND_CONFIGURATION_UPDATE, edit);
    await commands.executeCommand('setContext', 'editorQuteValidationEnabled', false);
  }));

  // Toggle on - remove file(s) from exclusion
  context.subscriptions.push(commands.registerCommand(QuteClientCommandConstants.QUTE_VALIDATION_ENABLED_TOGGLE_ON, async (uri?: Uri) => {
    const templateUri = uri.toString();
    // Consume `qute.command.validation.template.status` command from qute-ls to retrieve files excluded from validation
    const result: TemplateValidationStatus = await commands.executeCommand(QuteServerCommandConstants.QUTE_VALIDATION_TEMPLATE_STATUS, templateUri);
    // Enable the workspace `qute.validation.enabled` setting
    if (!result.validationEnabled) {
      const edit = {
        scopeUri: templateUri,
        value: true,
        editType: ConfigurationItemEditType.Update,
        section: QuteSettings.QUTE_VALIDATION_ENABLED
      } as ConfigurationItemEdit;
      await commands.executeCommand(QuteClientCommandConstants.COMMAND_CONFIGURATION_UPDATE, edit);
    }
    // Remove the editor document file uri to the `qute.validation.exclusion` array if it exists
    if (result.excluded.length > 0) {
      const edit = {
        scopeUri: templateUri,
        value: result.excluded,
        editType: ConfigurationItemEditType.Remove,
        section: QuteSettings.QUTE_VALIDATION_EXCLUDED
      } as ConfigurationItemEdit;
      await commands.executeCommand(QuteClientCommandConstants.COMMAND_CONFIGURATION_UPDATE, edit);
    }
    await commands.executeCommand('setContext', 'editorQuteValidationEnabled', true);
  }));
}

/**
 * Update a given setting from the Qute language server.
 *
 * @param context the extension context.
 */
export function registerConfigurationUpdateCommandForQute(context: ExtensionContext) {
  registerConfigurationUpdateCommand(QuteClientCommandConstants.COMMAND_CONFIGURATION_UPDATE, getSettingsValue, context);
}

/**
   * Sets the `editorQuteValidationEnabled` based on `qute.command.validation.template.status` and `qute.validation.enabled`.
   */
async function checkQuteValidationFromExclusionContext(uri: Uri) {
  const templateUri = uri.toString();
  const result: TemplateValidationStatus = await commands.executeCommand(QuteClientCommandConstants.EXECUTE_WORKSPACE_COMMAND, QuteServerCommandConstants.QUTE_VALIDATION_TEMPLATE_STATUS, templateUri);
  await commands.executeCommand('setContext', 'editorQuteValidationEnabled', (result.validationEnabled && (!result.excluded || result.excluded.length === 0)));
}

/**
   * Synchronize Qute validation button from the activated editor:
   *
   * - the button can be hidden (when file is not a Qute template file).
   * - the button can be shown with eye-closed (when file is a Qute template file and validation is enabled).
   * - the button can be shown with eye-opened (when file is a Qute template file and validation is disabled)
   */
export async function synchronizeQuteValidationButton(editor: TextEditor) {
  const document = editor?.document;
  if (!document) {
    return;
  }
  // Is the document is a Qute template file?
  const quteSupported = document.languageId.includes('qute');
  await commands.executeCommand('setContext', 'editorLangIdSupportsQute', quteSupported);
  if (quteSupported) {
    // Here the button will be visible, we should display it with eye-closed icon (validation is enabled) or with eye-opened icon (validation is disabled).
    await checkQuteValidationFromExclusionContext(document.uri);
  }
}

function getSettingsValue(value: any, section: string, editType: ConfigurationItemEditType) {
  switch (section) {
    case QuteSettings.QUTE_VALIDATION_EXCLUDED:
      if (editType === ConfigurationItemEditType.Add) {
        return workspace.asRelativePath(Uri.parse(value), false);
      }
      break;
  }
  return value;
}

const LANGUAGE_MAP = new Map<string, string>([
  [".html", "qute-html"],
  [".htm", "qute-html"],
  [".txt", "qute-txt"],
  [".yaml", "qute-yaml"],
  [".yml", "qute-yaml"],
  [".json", "qute-json"]
]);

/**
 * Update the language ID to a supported Qute language id if needed.
 *
 * @param context the extension context
 * @param document the text document.
 * @param onExtensionLoad if the user manually changed the language id.
 */
async function updateQuteLanguageId(context: ExtensionContext, document: TextDocument, onExtensionLoad: boolean) {
  if (document.uri.scheme === 'git') {
    return;
  }

  const fileExtension = path.extname(document.fileName);
  const expectedLanguageId = LANGUAGE_MAP.get(fileExtension);
  if (!expectedLanguageId) {
    // the file is not an html, txt, yaml, or json file
    return;
  }
  if (expectedLanguageId === document.languageId) {
    // the document has the expected qute-* language id.
    return;
  }

  const propertiesLanguageMismatch: QuteTemplateLanguageMismatch = QuteSettings.getQuteTemplatesLanguageMismatch();
  // Check if the setting is set to ignore or if the language ID is already set to Qute
  if (propertiesLanguageMismatch === QuteTemplateLanguageMismatch.ignore) {
    // Do nothing
    return;
  }

  if (await isInTemplates(document)) {
    // The html, txt, yaml, json file is in src/main/resources/templates folder
    // The document must be forced with qute-* language id
    const fileName: string = path.basename(document.fileName);
    await tryToForceLanguageId(context, document, fileName, propertiesLanguageMismatch, expectedLanguageId, onExtensionLoad, QuteSettings.QUTE_OVERRIDE_LANGUAGE_ID, QuteSettings.QUTE_TEMPLATES_LANGUAGE_MISMATCH);
  }

}

async function isInTemplates(document: TextDocument): Promise<boolean> {
  if (document.fileName.includes(`resources${path.sep}templates${path.sep}`)) {
    // HTML, etc file is included in src/main/resources/templates
    return true;
  }
  if (document.uri.scheme === 'jdt' && document.uri.path.startsWith(`/templates`)) {
    // HTML, etc file is included in a JAR in templates JAR entry
    return true;
  }
  // consume JDT LS 'qute/template/isInTemplate' command
  const params = { templateFileUri: document.uri.toString() };
  return await commands.executeCommand("java.execute.workspaceCommand", QuteJdtLsServerCommandConstants.IS_IN_TEMPLATE_COMMAND_ID, params);
}

interface TemplateValidationStatus {
  validationEnabled: boolean;
  excluded: string[];
}

/**
 * Register commands used for showing references in Qute template
 *
 * @param context the extension context
 */
function registerReferencesForQute(context: ExtensionContext, languageClient: LanguageClient) {
  registerReferencesCommands(QuteClientCommandConstants.COMMAND_SHOW_REFERENCES, context, languageClient);
}

interface SurroundWithResponse {
  start: TextEdit;
  end: TextEdit;
}

class SurroundWithKind {

  static readonly section = 'section';
  static readonly comments = 'comments';
  static readonly cdata = 'cdata';

}

/**
 * Register commands used for refactoring Qute files
 *
 * @param context the extension context
 */
function registerRefactorCommands(context: ExtensionContext, languageClient: LanguageClient) {

  // Surround with Section
  context.subscriptions.push(commands.registerCommand(QuteClientCommandConstants.REFACTOR_SURROUND_WITH_SECTION, async () => {
    await surroundWith(SurroundWithKind.section, languageClient);
  }));

  // Surround with Comments
  context.subscriptions.push(commands.registerCommand(QuteClientCommandConstants.REFACTOR_SURROUND_WITH_COMMENTS, async () => {
    await surroundWith(SurroundWithKind.comments, languageClient);
  }));

  // Surround with CDATA
  context.subscriptions.push(commands.registerCommand(QuteClientCommandConstants.REFACTOR_SURROUND_WITH_CDATA, async () => {
    await surroundWith(SurroundWithKind.cdata, languageClient);
  }));

}

async function surroundWith(surroundWithType: SurroundWithKind, languageClient: LanguageClient) {
  const activeEditor = window.activeTextEditor;
  if (!activeEditor) {
    return;
  }
  const selection = activeEditor.selections[0];
  if (!selection) {
    return;
  }

  const uri = window.activeTextEditor.document.uri;
  const identifier = TextDocumentIdentifier.create(uri.toString());
  const range = languageClient.code2ProtocolConverter.asRange(selection);
  const supportsSnippet = false;

  let result: SurroundWithResponse;
  try {
    result = await commands.executeCommand(QuteServerCommandConstants.REFACTOR_SURROUND_WITH, identifier, range, surroundWithType, supportsSnippet);
  } catch (error) {
    console.log(`Error while surround with : ${error}`);
  }

  if (!result) {
    return;
  }

  const startTag = result.start.newText;
  const endTag = result.end.newText;

  // SnippetTextEdit is not supported, update start / end tag
  const startPos = languageClient.protocol2CodeConverter.asPosition(result.start.range.start);
  const endPos = languageClient.protocol2CodeConverter.asPosition(result.end.range.start);
  activeEditor.edit((selectedText) => {
    selectedText.insert(startPos, startTag);
    selectedText.insert(endPos, endTag);
  })

  if (surroundWithType === SurroundWithKind.section) {
    // Force the show of completion
    const pos = languageClient.protocol2CodeConverter.asPosition(result.start.range.start);
    const posAfterStartBracket = new Position(pos.line, pos.character + 2);
    activeEditor.selections = [new Selection(posAfterStartBracket, posAfterStartBracket)];
    commands.executeCommand("editor.action.triggerSuggest");
  }

}
