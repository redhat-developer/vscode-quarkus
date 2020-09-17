import * as vscode from "vscode";

const JAVA_EXTENSION_ID = "redhat.java";

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
  const api = await extension.activate();
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
  return new Promise((resolve) => {
    const javaExt = vscode.extensions.getExtension(JAVA_EXTENSION_ID);
    if (javaExt) {
      javaExt.activate().then((javaExtApi)=> {
        if (javaExtApi) {
          javaExtApi.onDidServerModeChange((mode: string) => {
            if (mode === ServerMode.STANDARD) {
              resolve();
            }
          });
        }
      });
    }
  });
}
