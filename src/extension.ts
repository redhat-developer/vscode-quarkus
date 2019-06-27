'use strict';



import * as vscode from 'vscode';
import { generateProject } from './generateProject/generationWizard';
import { add } from './addExtemsions/addExtensions';

export interface QuickPickItemWithValue extends vscode.QuickPickItem {
  value: string;
}

export function activate(context: vscode.ExtensionContext) {
  const createMavenProject = vscode.commands.registerCommand('quarkusTools.createMavenProject', () => {
    generateProject();
  });
  context.subscriptions.push(createMavenProject);

  const addQuarkusExtensions = vscode.commands.registerCommand('quarkusTools.addExtension', () => {
    add();
  });
  context.subscriptions.push(addQuarkusExtensions);

}

export function deactivate() { }