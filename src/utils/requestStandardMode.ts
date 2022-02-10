import * as vscode from "vscode";
import { workspace } from "vscode";
import { ProjectLabelInfo } from "../definitions/ProjectLabelInfo";
import { getJavaExtensionAPI } from "../extension";

export const JAVA_EXTENSION_ID = "redhat.java";

export enum ServerMode {
  STANDARD = "Standard",
  LIGHTWEIGHT = "LightWeight",
  HYBRID = "Hybrid",
}

/**
 * Returns true if the Java server is in standard mode or the user allows it to be changed to standard mode, and false otherwise.
 *
 * Adopted from https://github.com/microsoft/vscode-java-debug/blob/master/src/utility.ts#L214
 *
 * @param opName The operation that requires standard mode
 * @returns true if the Java server is in standard mode or the user allows it to be changed to standard mode, and false otherwise.
 */
export async function requestStandardMode(opName: string): Promise<boolean> {
  const extension = vscode.extensions.getExtension(JAVA_EXTENSION_ID);
  if (!extension) {
    return false;
  }
  const api = await getJavaExtensionAPI();
  if (api && api.serverMode === ServerMode.LIGHTWEIGHT) {
    const answer = await vscode.window.showInformationMessage(`${opName} requires the Java language server to run in Standard mode. ` +
      "Do you want to switch it to Standard mode now?", "Yes", "Cancel");
    if (answer === "Yes") {
      return vscode.window.withProgress<boolean>({ location: vscode.ProgressLocation.Window }, async (progress) => {
        if (api.serverMode === ServerMode.STANDARD) {
          return true;
        }
        progress.report({ message: "Switching to Standard mode..." });
        return new Promise<boolean>((resolve) => {
          api.onDidServerModeChange((mode: string) => {
            if (mode === ServerMode.STANDARD) {
              resolve(true);
            }
          });

          vscode.commands.executeCommand("java.server.mode.switch", ServerMode.STANDARD, true);
        });
      });
    }
    return false;
  } else if (api && api.serverMode === ServerMode.HYBRID) {
    return new Promise<boolean>((resolve) => {
      api.onDidServerModeChange((mode: string) => {
        if (mode === ServerMode.STANDARD) {
          resolve(true);
        }
      });
    });
  }
  return true;
}

/**
 * Returns a promise that resolves when the Java server is in standard mode
 *
 * If the java extension is not installed, this promise never resolves.
 * This promise never rejects.
 */
export async function waitForStandardMode(): Promise<void> {
  return new Promise(async (resolve) => {
    const javaExtApi = await getJavaExtensionAPI();
    javaExtApi.onDidServerModeChange((mode: string) => {
      if (mode === ServerMode.STANDARD) {
        resolve();
      }
    });
  });
}

/**
 * Request vscode-java standard mode, then try to run the given action in standard mode. Fail gracefully if no Quarkus projects exist.
 *
 * @param action A function to perform that requires standard mode
 * @param actionDescription Human legible description of what is trying to be accomplished
 */
export function runWithStandardMode(action: () => void, actionDescription: string) {
  requestStandardMode(actionDescription).then((isStandardMode) => {
    if (isStandardMode) {
      ProjectLabelInfo.getWorkspaceProjectLabelInfo().then((projectLabelInfo: ProjectLabelInfo[]) => {
        if (projectLabelInfo.filter(info => info.isQuarkusProject()).length) {
          action();
        } else {
          notAQuarkusProjectWarning();
        }
      }).catch(notAQuarkusProjectWarning);
    }
  });
}

/**
 * Warns the user that no Quarkus projects were detected
 *
 * @param ignored Ignored
 */
function notAQuarkusProjectWarning(ignored?: any): PromiseLike<any> {
  const numFolders: number = workspace.workspaceFolders.length;
  let msg: string;
  if (numFolders === 0) {
    msg = 'No Quarkus projects were detected since no folders are open';
  } else if (numFolders === 1) {
    msg = 'No Quarkus projects were detected in this folder';
  } else {
    msg = 'No Quarkus projects were detected in any of the open folders';
  }
  return vscode.window.showErrorMessage(msg);
}
