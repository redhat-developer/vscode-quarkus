/**
 * Copyright 2020 Red Hat, Inc. and others.

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
import * as semver from 'semver';
import { VSCODE_YAML_EXTENSION_ID, MICROPROFILE_SCHEMA, MICROPROFILE_SCHEMA_PREFIX } from "./YamlConstants";
import { Uri } from 'vscode';
import { LanguageClient } from 'vscode-languageclient';
import { MicroProfileLS } from '../definitions/constants';

// The function signature exposed by vscode-yaml:
// 1. the requestSchema api will be called by vscode-yaml extension to decide whether the schema can be handled by this
// contributor, if it returns undefined, means it doesn't support this yaml file, vscode-yaml will ask other contributors
// 2. the requestSchemaContent api  will give the parameter uri returned by the first api, and ask for the json content(after stringify) of
// the schema
declare type YamlSchemaContributor = (schema: string,
  requestSchema: (resource: string) => string | undefined,
  requestSchemaContent: (uri: string) => Promise<string>) => void;

interface JsonSchemaForProjectInfo {
  projectURI: string;
  jsonSchema: string;
}

export interface MicroProfilePropertiesChangeEvent {
  projectURIs: Array<String>;
}

// Yaml Schema cache which caches YAML Schema (in JSON format) for application.yaml files
// which belong to a MicroProfile project.
export class YamlSchemaCache {
  private readonly cache = new Map<string /* application yaml URI */, JsonSchemaForProjectInfo>();
  private _languageClient: LanguageClient;
  public set languageClient(languageClient: LanguageClient) {
    this._languageClient = languageClient;
  }

  /**
   * Returns the JSON Schema to use for the  given application yaml file URI.
   *
   * @param applicationYamlUri the application yaml file URI
   */
  public async getSchema(applicationYamlUri: string): Promise<string | undefined> {
    const yamlSchema = this.cache.get(applicationYamlUri);
    if (yamlSchema) {
      return yamlSchema.jsonSchema;
    }
    if (!this._languageClient) {
      return undefined;
    }
    const params = {
      uri: applicationYamlUri,
      scopes: [1, 2]
    };
    return this._languageClient.sendRequest(MicroProfileLS.JSON_SCHEMA_FOR_PROJECT_INFO_REQUEST, params)
      .then((result: JsonSchemaForProjectInfo) => {
        const jsonSchema = result.jsonSchema;
        this.cache.set(applicationYamlUri, result);
        return jsonSchema;
      }, (err) => {
        console.error(`Error while consumming '${MicroProfileLS.JSON_SCHEMA_FOR_PROJECT_INFO_REQUEST}' request: ${err.message}`);
      });
  }

  /**
   * Evict the cache according to the classpath changed of the given project URIs
   *
   * @param event the properties change event
   */
  public evict(event: MicroProfilePropertiesChangeEvent) {
    // collect all application.yaml uris which belong to the event project URIs
    // and evict them from the cache.
    this.cache.forEach((jsonSchema: JsonSchemaForProjectInfo, uri: string) => {
      if (event.projectURIs.includes(jsonSchema.projectURI)) {
        this.cache.delete(uri);
      }
    });
  }
}

let yamlSchemaCache: YamlSchemaCache;

export async function registerYamlSchemaSupport(): Promise<YamlSchemaCache | undefined> {
  const yamlPlugin: any = await activateYamlExtension();
  if (!yamlPlugin || !yamlPlugin.registerContributor) {
    // activateYamlExtension has already alerted users about errors.
    return undefined;
  }
  yamlSchemaCache = new YamlSchemaCache();
  // register for microprofile schema provider
  yamlPlugin.registerContributor(MICROPROFILE_SCHEMA, requestYamlSchemaUriCallback, requestYamlSchemaContentCallback);
  return yamlSchemaCache;
}

// find redhat.vscode-yaml extension and try to activate it to get the yaml contributor
async function activateYamlExtension(): Promise<{ registerContributor: YamlSchemaContributor } | undefined> {
  const ext = vscode.extensions.getExtension(VSCODE_YAML_EXTENSION_ID);
  if (!ext) {
    vscode.window.showWarningMessage('Please install \'YAML Support by Red Hat\' via the Extensions pane.');
    return undefined;
  }
  const yamlPlugin = await ext.activate();

  if (!yamlPlugin || !yamlPlugin.registerContributor) {
    vscode.window.showWarningMessage('The installed Red Hat YAML extension doesn\'t support Quarkus Intellisense. Please upgrade \'YAML Support by Red Hat\' via the Extensions pane.');
    return undefined;
  }

  if (ext.packageJSON.version && !semver.gte(ext.packageJSON.version, '0.0.15')) {
    vscode.window.showWarningMessage('The installed Red Hat YAML extension doesn\'t support multiple schemas. Please upgrade \'YAML Support by Red Hat\' via the Extensions pane.');
  }
  return yamlPlugin;
}

// see docs from YamlSchemaContributor
function requestYamlSchemaUriCallback(resource: string): string | undefined {
  const textEditor = vscode.window.visibleTextEditors.find((editor) => editor.document.uri.toString() === resource);
  if (textEditor) {
    if (resource.endsWith('application.yaml') || resource.endsWith('application.yml')) {
      return MICROPROFILE_SCHEMA_PREFIX + resource;
    }
  }
  return undefined;
}

// see docs from YamlSchemaContributor
function requestYamlSchemaContentCallback(uri: string): Promise<string | undefined> {
  const parsedUri = Uri.parse(uri);
  if (parsedUri.scheme !== MICROPROFILE_SCHEMA) {
    return undefined;
  }
  if (!parsedUri.path || !parsedUri.path.startsWith('/')) {
    return undefined;
  }
  const applicationYamlUri = uri.substring(MICROPROFILE_SCHEMA_PREFIX.length);
  return yamlSchemaCache.getSchema(applicationYamlUri);
}
