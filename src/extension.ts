'use strict';



import * as vscode from 'vscode';
import { multiStepInput } from './multiStep';
import { add } from './addExtemsions/addExtensions';

export interface QuickPickItemWithValue extends vscode.QuickPickItem {
  value: string;
}

export function activate(context: vscode.ExtensionContext) {
  const createMavenProject = vscode.commands.registerCommand('quarkusTools.createMavenProject', () => {
    multiStepInput();
  });
  context.subscriptions.push(createMavenProject);

  const addQuarkusExtensions = vscode.commands.registerCommand('quarkusTools.addExtension', () => {
    add();
  });
  context.subscriptions.push(addQuarkusExtensions);

}

export function deactivate() { }