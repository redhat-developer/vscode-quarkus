import * as child_process from "child_process";
import * as fse from "fs-extra";
import * as md5 from "md5";
import * as path from "path";
import * as vscode from "vscode";
import { quarkusOutputChannel } from "./quarkusoutputchannel";
import { ITerminalOptions, quarkusTerminal } from "./quarkusterminal";
import { Settings } from "./settings";
import { getPathToTempFolder, getPathToWorkspaceStorage } from "./contextutils";

export async function rawEffectivePom(
	pomPath: string
): Promise<string | undefined> {
	const outputPath: string = getTempTolder(pomPath);
	await executeInBackground(
		`help:effective-pom -Doutput="${outputPath}"`,
		pomPath
	);
	const pomxml: string | undefined = await readFileIfExists(outputPath);
	await fse.remove(outputPath);
	return pomxml;
}

export async function rawDependencyTree(
	pomPath: string
): Promise<string | undefined> {
	const outputPath: string = getTempTolder(pomPath);
	await executeInBackground(
		`dependency:tree -Dverbose -DoutputFile="${outputPath}"`,
		pomPath
	);
	const pomxml: string | undefined = await readFileIfExists(outputPath);
	await fse.remove(outputPath);
	return pomxml;
}

export async function pluginDescription(
	pluginId: string,
	pomPath: string
): Promise<string | undefined> {
	const outputPath: string = getTempTolder(pluginId);
	// For MacOSX, add "-Dapple.awt.UIElement=true" to prevent showing icons in dock
	await executeInBackground(
		`help:describe -Dapple.awt.UIElement=true -Dplugin=${pluginId} -Doutput="${outputPath}"`,
		pomPath
	);
	const content: string | undefined = await readFileIfExists(outputPath);
	await fse.remove(outputPath);
	return content;
}

async function executeInBackground(
	mvnArgs: string,
	pomfile?: string
): Promise<any> {
	const workspaceFolder: vscode.WorkspaceFolder | undefined = pomfile
		? vscode.workspace.getWorkspaceFolder(vscode.Uri.file(pomfile))
		: undefined;
	const mvn: string = await getMaven(workspaceFolder);
	const command: string = await wrappedWithQuotes(mvn);
	const cwd: string | undefined = workspaceFolder
		? path.resolve(workspaceFolder.uri.fsPath, mvn, "..")
		: undefined;
	const userArgs: string | undefined = Settings.Executable.options(pomfile);
	const matched: RegExpMatchArray | null = [mvnArgs, userArgs]
		.filter(Boolean)
		.join(" ")
		.match(/(?:[^\s"]+|"[^"]*")+/g); // Split by space, but ignore spaces in quotes
	const args: string[] = matched !== null ? matched : [];
	if (pomfile) {
		args.push("-f", `"${pomfile}"`);
	}
	const spawnOptions: child_process.SpawnOptions = {
		cwd,
		env: Object.assign({}, process.env, Settings.getEnvironment()),
		shell: true
	};
	return new Promise<{}>(
		(resolve: (value: any) => void, reject: (e: Error) => void): void => {
			quarkusOutputChannel.appendLine(
				`Spawn ${JSON.stringify({ command, args })}`
			);
			const proc: child_process.ChildProcess = child_process.spawn(
				command,
				args,
				spawnOptions
			);
			proc.on("error", (err: Error) => {
				reject(
					new Error(
						`Error occurred in background process. ${err.message}`
					)
				);
			});
			proc.on("exit", (code: number, signal: string) => {
				if (code !== null) {
					if (code === 0) {
						resolve(code);
					} else {
						reject(
							new Error(
								`Background process terminated with code ${code}.`
							)
						);
					}
				} else {
					reject(
						new Error(
							`Background process killed by signal ${signal}.`
						)
					);
				}
			});
			proc.stdout.on("data", (chunk: Buffer) => {
				quarkusOutputChannel.append(chunk.toString());
			});
			proc.stderr.on("data", (chunk: Buffer) => {
				quarkusOutputChannel.append(chunk.toString());
			});
		}
	);
}

export async function executeInTerminal(
	command: string,
	prependMvn: boolean,
	pomfile?: string,
	options?: ITerminalOptions
): Promise<vscode.Terminal> {
	const workspaceFolder: vscode.WorkspaceFolder | undefined = pomfile
		? vscode.workspace.getWorkspaceFolder(vscode.Uri.file(pomfile))
		: undefined;
	var mvnString: string = "";
	if (prependMvn) {
		mvnString = wrappedWithQuotes(
			await quarkusTerminal.formattedPathForTerminal(
				await getMaven(workspaceFolder)
			)
		);
	} else {
		mvnString = "";
	}
	const fullCommand: string = [
		mvnString,
		command.trim(),
		pomfile &&
			`-f "${await quarkusTerminal.formattedPathForTerminal(pomfile)}"`,
		Settings.Executable.options(pomfile)
	]
		.filter(Boolean)
		.join(" ");
	const name: string = workspaceFolder
		? `Quarkus-${workspaceFolder.name}`
		: "Quarkus";
	const terminal: vscode.Terminal = await quarkusTerminal.runInTerminal(
		fullCommand,
		Object.assign({ name }, options)
	);

	return terminal;
}

async function getMaven(
	workspaceFolder?: vscode.WorkspaceFolder
): Promise<string> {
	if (!workspaceFolder) {
		const executableFromSettings:
			| string
			| undefined = Settings.Executable.path();
		return executableFromSettings ? executableFromSettings : "mvn";
	}

	const executablePathInConf: string | undefined = Settings.Executable.path(
		workspaceFolder.uri
	);
	if (executablePathInConf) {
		return path.resolve(workspaceFolder.uri.fsPath, executablePathInConf);
	}

	const preferMavenWrapper: boolean = Settings.Executable.preferMavenWrapper(
		workspaceFolder.uri
	);
	const mvnwPathWithoutExt: string = path.join(
		workspaceFolder.uri.fsPath,
		"mvnw"
	);
	if (preferMavenWrapper && (await fse.pathExists(mvnwPathWithoutExt))) {
		return mvnwPathWithoutExt;
	} else {
		return "mvn";
	}
}

function wrappedWithQuotes(mvn: string): string {
	if (mvn === "mvn") {
		return mvn;
	} else {
		return `"${mvn}"`;
	}
}

async function readFileIfExists(filepath: string): Promise<string | undefined> {
	if (await fse.pathExists(filepath)) {
		return (await fse.readFile(filepath)).toString();
	}
	return undefined;
}

function getTempTolder(identifier: string): string {
	const outputPath: string | undefined = getPathToWorkspaceStorage(
		md5(identifier)
	);
	return outputPath ? outputPath : getPathToTempFolder(md5(identifier));
}
