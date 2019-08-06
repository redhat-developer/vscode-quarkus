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

import { QUARKUS_CONFIG_NAME, DEFAULT_API_URL } from './projectGenerationConstants';
import { workspace } from 'vscode';
import { QExtension } from './extension';

/**
 * This class manages the extension's interaction with
 * settings.json
 */

export class ConfigManager {

  apiUrl: string;
  defaults: Partial<Defaults>;

  constructor() {
    this.apiUrl = DEFAULT_API_URL;
    this.defaults = {};

    const settings = workspace.getConfiguration('').get<SettingsJson>(QUARKUS_CONFIG_NAME);

    if (!settings) {
      return;
    }

    if (settings.apiUrl) {
      this.apiUrl = settings.apiUrl;
    }

    if (settings.defaults) {
      this.defaults = settings.defaults;
    }
  }

  getSettingsJson(): SettingsJson {
    return {
      apiUrl: this.apiUrl,
      defaults: this.defaults
    } as SettingsJson;
  }

  saveDefaultsToConfig(defaults: Defaults) {
    this.defaults = defaults;
    workspace.getConfiguration().update('quarkus.tools.starter', {apiUrl: this.apiUrl, defaults: defaults}, true);
  }
}

/**
 * Relevant data from the user's settings.json
 *
 * ie, contents of  workspace.getConfiguration('quarkus.tools.starter')
 */
export interface SettingsJson {
  apiUrl: string;
  defaults: Partial<Defaults>;
}

interface Defaults {
  groupId: string;
  artifactId: string;
  projectVersion: string;
  packageName: string;
  resourceName: string;
  extensions: QExtension[];
}
