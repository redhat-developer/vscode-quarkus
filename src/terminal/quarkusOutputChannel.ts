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
