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
import * as fs from 'fs';
import * as path from 'path';

import { Uri, workspace } from 'vscode';

export function createDebugConfig(directory: Uri) {

  const vscodeDir: string = directory.fsPath + '/.vscode';
  if (!fs.existsSync(vscodeDir)) {
    fs.mkdirSync(vscodeDir);
  }

  let tasksContent: string = getDebugConfigFile('tasks.json');
  let launchContent: string = getDebugConfigFile('launch.json');

  const insertSpaces: boolean = workspace.getConfiguration('editor').get('insertSpaces');
  if (insertSpaces) {
    const numSpaces: number = workspace.getConfiguration('editor').get('tabSize');
    tasksContent = replaceTabsWithSpaces(tasksContent, numSpaces);
    launchContent = replaceTabsWithSpaces(launchContent, numSpaces);
  }

  fs.writeFileSync(vscodeDir + '/tasks.json', tasksContent);
  fs.writeFileSync(vscodeDir + '/launch.json', launchContent);
}

function getDebugConfigFile(filename: string): string {
  const pathToFile = path.resolve(__dirname, '../vscode-debug-files/' + filename);
  return fs.readFileSync(pathToFile).toString();
}

function replaceTabsWithSpaces(originalStr: string, numSpaces: number): string {
  return originalStr.replace(/\t/g, ' '.repeat(numSpaces));
}