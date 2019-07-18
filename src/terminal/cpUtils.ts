/**
 * Copyright 2019 Red Hat, Inc. and others.

 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

 *     http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as cp from "child_process";
import * as vscode from "vscode";
import { quarkusOutputChannel } from "./quarkusOutputChannel";

export async function executeCommand(
	command: string,
	args: string[],
	options: cp.SpawnOptions = { shell: true }
): Promise<string> {
	return new Promise(
		(resolve: (res: string) => void, reject: (e: Error) => void): void => {
			quarkusOutputChannel.appendLine(`${command}, [${args.join(",")}]`);
			let result: string = "";
			const childProc: cp.ChildProcess = cp.spawn(command, args, options);
			childProc.stdout.on("data", (data: string | Buffer) => {
				data = data.toString();
				result = result.concat(data);
			});
			childProc.on("error", reject);
			childProc.on("close", (code: number) => {
				if (code !== 0 || result.indexOf("ERROR") > -1) {
					reject(
						new Error(
							`Command "${command} ${args.toString()}" failed with exit code "${code}".`
						)
					);
				} else {
					resolve(result);
				}
			});
		}
	);
}

export async function executeCommandWithProgress(
	message: string,
	command: string,
	args: string[],
	options: cp.SpawnOptions = { shell: true }
): Promise<string> {
	let result: string = "";
	await vscode.window.withProgress(
		{ location: vscode.ProgressLocation.Window },
		async (p: vscode.Progress<{}>) => {
			quarkusOutputChannel.appendLine(`${command}, [${args.join(",")}]`);
			return new Promise(
				async (
					resolve: () => void,
					reject: (e: Error) => void
				): Promise<void> => {
					p.report({ message });
					try {
						result = await executeCommand(command, args, options);
						resolve();
					} catch (e) {
						reject(e);
					}
				}
			);
		}
	);
	return result;
}
