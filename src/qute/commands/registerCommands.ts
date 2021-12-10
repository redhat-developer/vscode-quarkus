import { TextEncoder } from "util";
import { commands, ExtensionContext, Position, Range, Selection, Uri, window, workspace } from "vscode";
import { Location } from "vscode-languageclient";
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
}

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
