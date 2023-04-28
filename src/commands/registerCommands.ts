import { commands, ExtensionContext, window } from "vscode";
import { VSCodeCommands } from "../definitions/constants";
import { ProjectLabelInfo } from "../definitions/ProjectLabelInfo";
import { requestStandardMode } from "../utils/requestStandardMode";
import { sendCommandFailedTelemetry, sendCommandSucceededTelemetry } from "../utils/telemetryUtils";
import { WelcomeWebview } from "../webviews/WelcomeWebview";
import { addExtensionsWizard } from "../wizards/addExtensions/addExtensionsWizard";
import { buildBinary } from "../wizards/binary/buildBinary";
import { startDebugging } from "../wizards/debugging/startDebugging";
import { deployToOpenShift } from "../wizards/deployToOpenShift/deployToOpenShift";
import { generateProjectWizard } from "../wizards/generateProject/generationWizard";

const NOT_A_QUARKUS_PROJECT = new Error('No Quarkus projects were detected in this folder');
const STANDARD_MODE_REQUEST_FAILED = new Error('Error occurred while requesting standard mode from the Java language server');


export function registerVSCodeClientCommands(context: ExtensionContext): void {
  /**
   * Command for creating a Quarkus project
   */
  registerCommandWithTelemetry(context, VSCodeCommands.CREATE_PROJECT, generateProjectWizard, true);

  /**
   * Command for displaying welcome page
   */
  registerCommandWithTelemetry(context, VSCodeCommands.QUARKUS_WELCOME, async () => { WelcomeWebview.createOrShow(context); });
}

/**
 * Register the vscode-quarkus commands
 *
 * @param context the extension context
 */
export function registerVSCodeCommands(context: ExtensionContext): void {

  /**
   * Command for adding Quarkus extensions to current Quarkus Maven project
   */
  context.subscriptions.push(commands.registerCommand(VSCodeCommands.ADD_EXTENSIONS, withStandardMode(addExtensionsWizard, "Adding extensions")));

  /**
   * Command for debugging current Quarkus Maven project
   */
  registerCommandWithTelemetry(context, VSCodeCommands.DEBUG_QUARKUS_PROJECT, withStandardMode(startDebugging, "Debugging the extension"));
  registerCommandWithTelemetry(context, VSCodeCommands.DEBUG_QUARKUS_PROJECT + VSCodeCommands.SHORT_SUFFIX, withStandardMode(startDebugging, "Debugging the extension"));

  /**
   * Command for deploying current Quarkus project to OpenShift with OpenShift Connector
   */
  registerCommandWithTelemetry(context, VSCodeCommands.DEPLOY_TO_OPENSHIFT, withStandardMode(deployToOpenShift, "Deploying to OpenShift"));
  registerCommandWithTelemetry(context, VSCodeCommands.DEPLOY_TO_OPENSHIFT + VSCodeCommands.SHORT_SUFFIX, withStandardMode(deployToOpenShift, "Deploying to OpenShift"));

  /**
   * Command for building a binary
   */
  registerCommandWithTelemetry(context, VSCodeCommands.BUILD_BINARY, withStandardMode(buildBinary, "Building a binary"));

}

/**
 * Register a command with the given name and async function
 *
 * Displays errors raised by the function as error messages,
 * and sends telemetry when the command succeeds or fails.
 *
 * @param context the extension context
 * @param commandName the name of the command to register
 * @param commandAction the async function to run when the command is called
 * @param skipSuccess whether the success of the command should be reported
 */
async function registerCommandWithTelemetry(context: ExtensionContext, commandName: string, commandAction: () => Promise<any>, skipSuccess?: boolean): Promise<void> {
  context.subscriptions.push(commands.registerCommand(commandName, async () => {
    try {
      await commandAction();
      if (!skipSuccess) {
        sendCommandSucceededTelemetry(commandName);
      }
    } catch (e) {
      const msg = (e instanceof Error) ? e.message : e;
      window.showErrorMessage(msg);
      sendCommandFailedTelemetry(commandName, msg);
    }
  }));
}

/**
 * Returns an async function that runs the given function in standard mode
 *
 * The returned function resolves when one of the following happen:
 *  * The user rejects standard mode
 *  * The user accepts standard mode and the passed function resolves
 *
 * The returned function rejects when one of the following happen:
 *  * An error occurs when requesting standard mode
 *  * There are no Quarkus projects detected
 *  * The passed function rejects
 *
 * @param commandAction the function that needs standard mode to run
 * @param commandDescription a short description to explain to the user what action requires standard mode
 * @returns an async function that runs the given function in standard mode
 */
function withStandardMode(commandAction: () => Promise<any>, commandDescription: string): () => Promise<void> {
  return async () => {
    let isStandardMode = false;
    try {
      isStandardMode = await requestStandardMode(commandDescription);
    } catch {
      throw STANDARD_MODE_REQUEST_FAILED;
    }
    if (!isStandardMode) {
      return;
    }
    let projectLabelInfo: ProjectLabelInfo[] = null;
    try {
      projectLabelInfo = await ProjectLabelInfo.getWorkspaceProjectLabelInfo();
    } catch {
      throw NOT_A_QUARKUS_PROJECT;
    }
    if (projectLabelInfo.filter(info => info.isQuarkusProject()).length) {
      await commandAction();
    } else {
      throw NOT_A_QUARKUS_PROJECT;
    }
  };
}
