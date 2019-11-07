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

import { ConfigurationTarget, Disposable, commands, workspace, Uri } from 'vscode';

export namespace CommandKind {
  export const COMMAND_REFERENCES = 'quarkus.command.references';
  export const COMMAND_IMPLEMENTATIONS = 'quarkus.command.implementations';
  export const COMMAND_OPEN_URI = 'quarkus.command.open.uri';
  export const COMMAND_CONFIGURATION_UPDATE = 'quarkus.command.configuration.update';
}

/**
 * Registers the `CommandKind.COMMAND_CONFIGURATION_UPDATE` command
 */
export function registerConfigurationUpdateCommand(): Disposable {
  return commands.registerCommand(CommandKind.COMMAND_CONFIGURATION_UPDATE, resolveConfigurationItemEdit);
}

/**
 * Registers the `quarkus.command.open.uri` command.
 * This command gives the capability to open the given uri of the command.
 */
export function registerOpenURICommand(): Disposable {
  return commands.registerCommand(CommandKind.COMMAND_OPEN_URI, (uri) => {
    commands.executeCommand('vscode.open', Uri.parse(uri));
  });
}

/**
 * Registers the `CommandKind.COMMAND_IMPLEMENTATIONS` command
 */
export function registerImplementationsCommand(): Disposable {
  return commands.registerCommand(CommandKind.COMMAND_IMPLEMENTATIONS, () => {

  });
}

/**
 * Registers the `CommandKind.COMMAND_REFERENCES` command
 */
export function registerReferencesCommand(): Disposable {
  return commands.registerCommand(CommandKind.COMMAND_REFERENCES, () => {

  });
}

function resolveConfigurationItemEdit<T>(configItemEdit: ConfigurationItemEdit) {
  switch (configItemEdit.editType) {
    case ConfigurationItemEditType.Add:
      addToPreferenceArray<T>(configItemEdit.section, configItemEdit.value);
      break;
    case ConfigurationItemEditType.Delete: {
      break;
    }
    case ConfigurationItemEditType.Update: {
      break;
    }
  }
}

function addToPreferenceArray<T>(key: string, value: T): void {
  const configArray: T[] = workspace.getConfiguration().get<T[]>(key, []);
  if (configArray.includes(value)) {
    return;
  }
  configArray.push(value);
  workspace.getConfiguration().update(key, configArray, ConfigurationTarget.Workspace);
}

interface ConfigurationItemEdit {
  section: string;
  value: any;
  editType: ConfigurationItemEditType;
}

enum ConfigurationItemEditType {
  Add = 0,
  Delete = 1,
  Update = 2
}
