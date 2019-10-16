import * as which from "which";
import * as findUp from "find-up";

import { FsUtils } from './fsUtils';
import { Uri, WorkspaceFolder } from "vscode";

const MVNW: string = 'mvnw';
const MVNW_CMD: string = 'mvnw.cmd';

export namespace MavenUtils {

  export const QUARKUS_DEV: string = 'quarkus:dev';

  export function getMavenWrapperExecuteable(): string {
    if (process.platform === "win32") {
      return getWindowsMavenWrapperExecutable();
    }
    return getUnixMavenWrapperExecutable();
  }

  /**
   * Returns Maven wrapper executable command for Windows
   */
  export function getWindowsMavenWrapperExecutable(): string {
    return `.\\${MVNW_CMD}`;
  }
  /**
   * Returns Maven wrapper executable
   */
  export function getUnixMavenWrapperExecutable(): string {
    return `./${MVNW}`;
  }

  /**
   * Returns a promise resolving with `'mvn'` if Maven
   * executable is found in PATH.
   * Resolves with undefined otherwise.
   */
  export async function getDefaultMavenExecutable(): Promise<string> {
    return await (new Promise<string>((resolve) => {
      which("mvn", (_err, filepath) => {
        if (filepath) {
          resolve("mvn");
        } else {
          resolve(undefined);
        }
      });
    }));
  }

  /**
   * Returns true if mvnw.cmd file exists in root of `workspaceFolder`
   * @param workspaceFolder
   */
  export async function mavenWrapperExistsWindows(workspaceFolder: WorkspaceFolder) {
    return await getMavenWrapperPathFromPom(workspaceFolder.uri, workspaceFolder, MVNW_CMD) !== undefined;
  }

  /**
   * Returns true if mvnw file exists in root of `workspaceFolder`
   * @param workspaceFolder
   */
  export async function mavenWrapperExistsUnix(workspaceFolder: WorkspaceFolder) {
    return await getMavenWrapperPathFromPom(workspaceFolder.uri, workspaceFolder, MVNW) !== undefined;
  }

  /**
   * Returns a promise resolving with the absolute path of the
   * Maven wrapper file (mvnw.cmd for windows, mvnw for unix)
   * located closest to pom.xml provided by `pomPath`.
   * @param pomPath path to pom.xml
   * @param workspaceFolder workspace folder containing pom.xml specified by `pomPath`
   * @param filename name of the maven wrapper file (mvnw or mvnw.cmd
   *                 if not provided, detect automatically depending on OS (windows = mwnw.cmd, else = mvnw)
   */
  export async function getMavenWrapperPathFromPom(pomPath: Uri, workspaceFolder: WorkspaceFolder, filename?: string): Promise<string | undefined> {
    const options = { cwd: pomPath.fsPath };
    const topLevelFolder: string = workspaceFolder.uri.fsPath;
    const mvnw = filename ? filename : getMavenWrapperFilename();
    return await findUp(dir => {
      return (!FsUtils.isSameDirectory(topLevelFolder, dir) && !FsUtils.isSubDirectory(topLevelFolder, dir)) ? findUp.stop : mvnw;
    }, options);
  }

  /**
   * Returns the maven wrapper filename depending on current OS
   */
  export function getMavenWrapperFilename(): string {
    if (process.platform === "win32") {
      return MVNW_CMD;
    }
    return MVNW;
  }
}