'use strict';



import * as vscode from 'vscode';
import { generateProject } from './generateProject/generationWizard';
import { add } from './addExtemsions/addExtensions';
import { ConfigManager } from './definitions/ConfigManager'

export interface QuickPickItemWithValue extends vscode.QuickPickItem {
  value: string;
}

export function activate(context: vscode.ExtensionContext) {

  const configManager = new ConfigManager();


  const createMavenProject = vscode.commands.registerCommand('quarkusTools.createMavenProject', () => {
    generateProject(configManager);
  });
  context.subscriptions.push(createMavenProject);

  const addQuarkusExtensions = vscode.commands.registerCommand('quarkusTools.addExtension', () => {
    add(configManager);
  });
  context.subscriptions.push(addQuarkusExtensions);

}

export function deactivate() { }