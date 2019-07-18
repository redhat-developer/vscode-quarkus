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

import * as vscode from "vscode";

class QuarkusOutputChannel implements vscode.Disposable {
	private readonly channel: vscode.OutputChannel = vscode.window.createOutputChannel(
		"Quarkus Extension"
	);

	public appendLine(message: any, title?: string): void {
		if (title) {
			const simplifiedTime: string = new Date()
				.toISOString()
				.replace(/z|t/gi, " ")
				.trim(); // YYYY-MM-DD HH:mm:ss.sss
			const hightlightingTitle: string = `[${title} ${simplifiedTime}]`;
			this.channel.appendLine(hightlightingTitle);
		}
		this.channel.appendLine(message);
	}

	public append(message: any): void {
		this.channel.append(message);
	}

	public show(): void {
		this.channel.show();
	}

	public dispose(): void {
		this.channel.dispose();
	}
}

export const quarkusOutputChannel: QuarkusOutputChannel = new QuarkusOutputChannel();
