// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import * as path from "path";
import * as findUp from "find-up";
import * as which from "which";
import { Uri, Terminal, WorkspaceFolder, workspace } from "vscode";
import { quarkusOutputChannel } from "./quarkusOutputChannel";
import { ITerminalOptions, getMavenWrapperExecuteable, getMavenWrapperFilename, mavenTerminal } from "./mavenTerminal";

/**
 * Executes maven command
 * @param command maven command without `./mvnw` or `mvn` prepended
 * @param pomPath absolute path to pom.xml
 */
export async function executeMavenCommand (
	command: string,
	pomPath: Uri
): Promise<Terminal> {
	const workspaceFolder: WorkspaceFolder = workspace.getWorkspaceFolder(pomPath);

	const mvnWrapperPath: string|undefined = await getMavenWrapperPathFromPom(pomPath, workspaceFolder);
	const terminalOptions: ITerminalOptions = {} as ITerminalOptions;

	let mvnString;
	if (mvnWrapperPath !== undefined) {
		// cd to the directory containing mvn wrapper
		terminalOptions.cwd = path.dirname(mvnWrapperPath);
		mvnString = getMavenWrapperExecuteable();
	} else {
		mvnString = await mavenTerminal.formattedPathForTerminal(
			await defaultMavenExecutable()
		);
	}

	if (mvnString === undefined) {
		return;
	}

	const fullCommand: string = [
		mvnString,
		command.trim(),
		pomPath &&
			`-f "${await mavenTerminal.formattedPathForTerminal(pomPath.fsPath)}"`
	]
		.filter(Boolean)
		.join(" ");

	const name: string = workspaceFolder
		? `Quarkus-${workspaceFolder.name}`
		: "Quarkus";
	const terminal: Terminal = await mavenTerminal.runInTerminal(
		fullCommand,
		Object.assign({ name }, terminalOptions)
	);

	return terminal;
}

/**
 * Returns a promise resolving with the absolute path of the
 * Maven wrapper file (mvnw.cmd for windows, mvnw for unix)
 * located closest to pom.xml provided by `pomPath`.
 * @param pomPath path to pom.xml
 * @param workspaceFolder workspace folder containing pom.xml specified by `pomPath`
 */
async function getMavenWrapperPathFromPom(pomPath: Uri, workspaceFolder: WorkspaceFolder): Promise<string | undefined> {
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

/**
 * Returns a promise resolving with `'mvn'` if Maven
 * executable is found in PATH.
 * Resolves with undefined otherwise.
 */
async function defaultMavenExecutable(): Promise<string> {
	return new Promise<string>((resolve) => {
			which("mvn", (_err, filepath) => {
					if (filepath) {
							resolve("mvn");
					} else {
							quarkusOutputChannel.appendLine("Maven executable not found in PATH.");
							resolve(undefined);
					}
			});
	});
}