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

import { QUARKUS_STARTER_CONFIG_NAME, DEFAULT_API_URL } from './projectGenerationConstants';
import { workspace } from 'vscode';
import { QExtension } from './extensionInterfaces';

/**
 * This class manages the extension's interaction with
 * the `quarkus.tools.starter` configuration in
 * settings.json
 */

export class ConfigManager {

  apiUrl?: string;
  defaults: Partial<Defaults>;

  constructor() {
    this.defaults = {};
    this.apiUrl = workspace.getConfiguration(QUARKUS_STARTER_CONFIG_NAME).get('api');
    this.defaults =  workspace.getConfiguration(QUARKUS_STARTER_CONFIG_NAME).get('defaults');
  }

  getSettingsJson(): SettingsJson {
    return {
      api: this.apiUrl,
      defaults: this.defaults
    } as SettingsJson;
  }

  saveDefaultsToConfig(defaults: Defaults) {
      workspace.getConfiguration(QUARKUS_STARTER_CONFIG_NAME).update('defaults', defaults, true);
  }
}

/**
 * Relevant data from the user's settings.json
 *
 * ie, contents of  workspace.getConfiguration('quarkus.tools.starter')
 */
export interface SettingsJson {
  api?: string;
  defaults: Partial<Defaults>;
}

export interface Defaults {
  groupId: string;
  artifactId: string;
  projectVersion: string;
  packageName: string;
  resourceName: string;
  extensions: QExtension[];
}
