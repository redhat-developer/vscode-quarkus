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

import * as vscode from 'vscode';
import { generateProject } from './generateProject/generationWizard';
import { add } from './addExtensions/addExtensions';
import { ConfigManager } from './definitions/configManager';

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