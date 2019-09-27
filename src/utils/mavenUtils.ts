import * as which from "which";
import * as findUp from "find-up";
import * as path from "path";

import { Uri, WorkspaceFolder } from "vscode";

export function getMavenWrapperExecuteable(): string {
	if (process.platform === "win32") {
		return getWindowsMavenWrapperExecutable();
	}
	return getUnixMavenWrapperExecuteable();
}

export function getWindowsMavenWrapperExecutable(): string {
	return '.\\mvnw.cmd';
}

export function getUnixMavenWrapperExecuteable(): string {
	return './mvnw';
}

/**
 * Returns a promise resolving with `'mvn'` if Maven
 * executable is found in PATH.
 * Resolves with undefined otherwise.
 */
export async function getDefaultMavenExecutable(): Promise<string> {
	return new Promise<string>((resolve) => {
			which("mvn", (_err, filepath) => {
					if (filepath) {
							resolve("mvn");
					} else {
							resolve(undefined);
					}
			});
	});
}

export function getMavenWrapperFilename(): string {
  if (process.platform === "win32") {
      return 'mvnw.cmd';
  }
  return 'mvnw';
}

/**
 * Returns true if Maven wrapper file exists in root of `workspaceFolder`
 * @param workspaceFolder
 */
export async function mavenWrapperExists(workspaceFolder: WorkspaceFolder) {
	return getMavenWrapperPathFromPom(workspaceFolder.uri, workspaceFolder) !== undefined;
}

/**
 * Returns a promise resolving with the absolute path of the
 * Maven wrapper file (mvnw.cmd for windows, mvnw for unix)
 * located closest to pom.xml provided by `pomPath`.
 * @param pomPath path to pom.xml
 * @param workspaceFolder workspace folder containing pom.xml specified by `pomPath`
 */
export async function getMavenWrapperPathFromPom(pomPath: Uri, workspaceFolder: WorkspaceFolder): Promise<string | undefined> {
	const options = { cwd: pomPath.fsPath };
	const topLevelFolder: string = workspaceFolder.uri.fsPath;
	const mvnw = getMavenWrapperFilename();
	return await findUp(dir => {
		return (!isSameDirectory(topLevelFolder, dir) && !isSubDirectory(topLevelFolder, dir)) ? findUp.stop : mvnw;
	}, options);
}

/**
 * Returns `true` if `second` is a sub directory
 * of `first`. Returns `false` otherwise.
 * @param first
 * @param second
 */
function isSubDirectory(first: string, second: string): boolean {
	return path.relative(second, first).startsWith('..');
}

/**
 * Returns `true` if `first` and `second` resolve to the
 * same directory. Returns `false` otherwise.
 * @param first
 * @param second
 */
function isSameDirectory(first: string, second: string): boolean {
	return path.relative(second, first).length === 0;
}