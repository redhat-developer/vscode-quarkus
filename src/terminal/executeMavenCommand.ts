// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import * as path from "path";

import { Uri, Terminal, WorkspaceFolder, workspace } from "vscode";
import { ITerminalOptions, mavenTerminal } from "./mavenTerminal";
import { getDefaultMavenExecutable, getMavenWrapperExecuteable, getMavenWrapperPathFromPom } from '../utils/mavenUtils';
import { formattedPathForTerminal } from '../utils/shellUtils';

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
		mvnString = await formattedPathForTerminal(
			await getDefaultMavenExecutable()
		);
	}

	if (mvnString === undefined) {
		return;
	}

	const fullCommand: string = [
		mvnString,
		command.trim(),
		pomPath &&
			`-f "${await formattedPathForTerminal(pomPath.fsPath)}"`
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