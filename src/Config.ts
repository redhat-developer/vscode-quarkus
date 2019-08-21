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
import {
  DEFAULT_API_URL,
  DEFAULT_GROUP_ID,
  DEFAULT_ARTIFACT_ID,
  DEFAULT_PROJECT_VERSION,
  DEFAULT_PACKAGE_NAME,
  DEFAULT_RESOURCE_NAME
} from './definitions/projectGenerationConstants';
import { workspace } from 'vscode';
import { QExtension } from './definitions/extensionInterfaces';

/**
 * This class manages the extension's interaction with
 * settings.json
 */
const QUARKUS_CONFIG_NAME = 'quarkus.tools.starter';

export namespace Config {

  export function getApiUrl(): string {
    return getQuarkusToolsSection<string>('api', DEFAULT_API_URL);
  }

  export function getDefaultGroupId(): string {
    return getQuarkusToolsSection<string>('defaults.groupId', DEFAULT_GROUP_ID);
  }

  export function getDefaultArtifactId(): string {
    return getQuarkusToolsSection<string>('defaults.artifactId', DEFAULT_ARTIFACT_ID);
  }

  export function getDefaultProjectVersion() {
    return getQuarkusToolsSection<string>('defaults.projectVersion', DEFAULT_PROJECT_VERSION);
  }

  export function getDefaultPackageName() {
    return getQuarkusToolsSection<string>('defaults.packageName', DEFAULT_PACKAGE_NAME);
  }

  export function getDefaultResourceName() {
    return getQuarkusToolsSection<string>('defaults.resourceName', DEFAULT_RESOURCE_NAME);
  }

  export function getDefaultExtensions() {
    return getQuarkusToolsSection<QExtension[]>('defaults.extensions', []);
  }

  export function saveDefaults(defaults: Defaults) {
      workspace.getConfiguration(QUARKUS_CONFIG_NAME).update('defaults', defaults, true);
  }

  function getQuarkusToolsSection<T>(section: string, fallback: T): T {
    return workspace.getConfiguration(QUARKUS_CONFIG_NAME).get<T>(section, fallback);
  }
}

interface Defaults {
  groupId?: string;
  artifactId?: string;
  projectVersion: string;
  packageName: string;
  resourceName: string;
  extensions: QExtension[];
}
