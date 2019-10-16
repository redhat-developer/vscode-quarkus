
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import { Disposable, Terminal, window } from "vscode";
import { Settings } from "./settings";

import { WindowsShellType, currentWindowsShell, getCommand, getCDCommand, setupEnvForWSL } from '../utils/shellUtils';

export interface ITerminalOptions {
    addNewLine?: boolean;
    name: string;
    cwd?: string;
    env?: { [key: string]: string };
}

class TerminalCommandRunner implements Disposable {
    private readonly terminals: { [id: string]: Terminal } = {};

    public async runInTerminal(command: string, options: ITerminalOptions): Promise<Terminal> {
        const defaultOptions = { addNewLine: true };
        const { addNewLine, name, cwd } = Object.assign(defaultOptions, options);
        if (this.terminals[name] === undefined) {
            const env: { [envKey: string]: string } = { ...Settings.getEnvironment(), ...options.env };
            this.terminals[name] = window.createTerminal({ name, env });
            // Workaround for WSL custom envs.
            // See: https://github.com/Microsoft/vscode/issues/71267
            if (currentWindowsShell() === WindowsShellType.WSL) {
                setupEnvForWSL(this.terminals[name], env);
            }
        }
        this.terminals[name].show();
        if (cwd) {
            this.terminals[name].sendText(await getCDCommand(cwd), true);
        }
        this.terminals[name].sendText(getCommand(command), addNewLine);
        return this.terminals[name];
    }

    public closeAllTerminals(): void {
        Object.keys(this.terminals).forEach((id: string) => {
            this.terminals[id].dispose();
            delete this.terminals[id];
        });
    }

    public onDidCloseTerminal(closedTerminal: Terminal): void {
        try {
            delete this.terminals[closedTerminal.name];
        } catch (error) {
            // ignore it.
        }
    }

    public dispose(id?: string): void {
        if (id) {
            this.terminals[id].dispose();
        } else {
            this.closeAllTerminals();
        }
    }
}

export const terminalCommandRunner: TerminalCommandRunner = new TerminalCommandRunner();
