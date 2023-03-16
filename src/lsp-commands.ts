/**
 * Copyright 2023 Red Hat, Inc. and others.

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

import { commands, ConfigurationTarget, WorkspaceConfiguration, Uri, workspace, ExtensionContext, Position } from 'vscode';
import { ReferencesRequest, ConfigurationItem } from "vscode-languageclient";
import { LanguageClient } from 'vscode-languageclient/node';

/**
 * VScode client commands.
 */
/**
 * Show editor references
 */
const EDITOR_SHOW_REFERENCES = 'editor.action.showReferences';

/**
 * Open a Qute template by file Uri.
 *
 * @param context the extension context.
 */
export function registerOpenUriCommand(openUriCommandId: string, context: ExtensionContext) {
  context.subscriptions.push(commands.registerCommand(openUriCommandId, async (uri?: string) => {
    commands.executeCommand('vscode.open', Uri.parse(uri));
  }));
}

// Command for LSP references

/**
 * Register commands used for code lens "references"
 *
 * @param context the extension context
 * @param languageClient the language server client
 */
export function registerReferencesCommands(showReferencesCommandId : string, context: ExtensionContext, languageClient: LanguageClient) {
  context.subscriptions.push(commands.registerCommand(showReferencesCommandId, (uriString: string, position: Position) => {
    const uri = Uri.parse(uriString);
    workspace.openTextDocument(uri).then(document => {
      // Consume references service from the Language Server
      const param = languageClient.code2ProtocolConverter.asTextDocumentPositionParams(document, position);
      languageClient.sendRequest(ReferencesRequest.type, param).then(locations => {
        commands.executeCommand(EDITOR_SHOW_REFERENCES, uri, languageClient.protocol2CodeConverter.asPosition(position), locations.map(languageClient.protocol2CodeConverter.asLocation));
      })
    })
  }));
}

// Command for configuration update

/**
 * Update a given setting from the Qute language server.
 *
 * @param context the extension context.
 */
export function registerConfigurationUpdateCommand(configurationUpdateCommandId : string, getSettingsValue, context: ExtensionContext) {
  context.subscriptions.push(commands.registerCommand(configurationUpdateCommandId, async (configItemEdit: ConfigurationItemEdit) => {
    const section = configItemEdit.section;
    const value = getSettingsValue(configItemEdit.value, configItemEdit.section, configItemEdit.editType);
    const config = getConfiguration(configItemEdit.scopeUri);
    switch (configItemEdit.editType) {
      case ConfigurationItemEditType.Add:
        addToPreferenceArray(config, section, value);
        break;
      case ConfigurationItemEditType.Delete: {
        config.workspaceConfiguration.update(section, undefined, config.target);
        break;
      }
      case ConfigurationItemEditType.Update: {
        config.workspaceConfiguration.update(section, value, config.target);
        break;
      }
      case ConfigurationItemEditType.Remove: {
        removeFromPreferenceArray(config, section, value);
        break;
      }
    }
  }));
}

export interface ConfigurationItemEdit extends ConfigurationItem {
  value: any;
  editType: ConfigurationItemEditType;
}

export enum ConfigurationItemEditType {
  Add = 0,
  Delete = 1,
  Update = 2,
  Remove = 3
}

interface IConfiguration {
  workspaceConfiguration: WorkspaceConfiguration;
  target: ConfigurationTarget;
}

function getConfiguration(scopeUri: string): IConfiguration {
  if (scopeUri) {
    const workspaceFolder = workspace.getWorkspaceFolder(Uri.parse(scopeUri));
    if (workspaceFolder) {
      return {
        workspaceConfiguration: workspace.getConfiguration(undefined, workspaceFolder),
        target: ConfigurationTarget.WorkspaceFolder
      };
    }
  }
  return {
    workspaceConfiguration: workspace.getConfiguration(),
    target: ConfigurationTarget.Workspace
  };
}

function addToPreferenceArray<T>(config: IConfiguration, key: string, value: T): void {
  const workspaceConfiguration = config.workspaceConfiguration;
  const configArray: T[] = workspaceConfiguration.get<T[]>(key, []);
  if (Array.isArray(value)) {
    value.forEach(item => {
      if (!configArray.includes(item)) {
        configArray.push(item);
      }
    });
  } else {
    if (configArray.includes(value)) {
      return;
    }
    configArray.push(value);
  }
  workspaceConfiguration.update(key, configArray, config.target);
}

function removeFromPreferenceArray<T>(config: IConfiguration, key: string, value: T): void {
  const workspaceConfiguration = config.workspaceConfiguration;
  const configArray: T[] = workspaceConfiguration.get<T[]>(key, []);
  if (Array.isArray(value)) {
    value.forEach(item => {
      if (configArray.includes(item)) {
        configArray.splice(configArray.indexOf(item), 1);
      }
    });
  } else {
    if (!configArray.includes(value)) {
      return;
    }
    configArray.splice(configArray.indexOf(value), 1);
  }
  workspaceConfiguration.update(key, configArray, config.target);
}
