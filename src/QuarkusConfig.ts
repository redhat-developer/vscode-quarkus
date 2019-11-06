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
  BuildToolName,
  DEFAULT_API_URL,
  DEFAULT_BUILD_TOOL,
  DEFAULT_GROUP_ID,
  DEFAULT_ARTIFACT_ID,
  DEFAULT_PROJECT_VERSION,
  DEFAULT_PACKAGE_NAME,
  DEFAULT_RESOURCE_NAME
} from './definitions/constants';
import { workspace } from 'vscode';

/**
 * This class manages the extension's interaction with
 * settings.json
 */
export namespace QuarkusConfig {

  export const QUARKUS_CONFIG_NAME = 'quarkus.tools';

  export const STARTER_API = 'quarkus.tools.starter.api';
  export const BUILD_TOOL = 'quarkus.tools.starter.defaults.buildTool';
  export const GROUP_ID = 'quarkus.tools.starter.defaults.groupId';
  export const ARTIFACT_ID = 'quarkus.tools.starter.defaults.artifactId';
  export const PROJECT_VERSION = 'quarkus.tools.starter.defaults.projectVersion';
  export const PACKAGE_NAME = 'quarkus.tools.starter.defaults.packageName';
  export const RESOURCE_NAME = 'quarkus.tools.starter.defaults.resourceName';
  export const EXTENSIONS = 'quarkus.tools.starter.defaults.extensions';
  export const ALWAYS_SHOW_WELCOME_PAGE = 'quarkus.tools.alwaysShowWelcomePage';
  export const DEBUG_TERMINATE_ON_EXIT = 'quarkus.tools.debug.terminateProcessOnExit';

  export function getApiUrl(): string {
    return workspace.getConfiguration().get<string>(STARTER_API, DEFAULT_API_URL);
  }

  export function getDefaultBuildTool(): BuildToolName {
    return workspace.getConfiguration().get<BuildToolName>(BUILD_TOOL, DEFAULT_BUILD_TOOL);
  }

  export function getDefaultGroupId(): string {
    return workspace.getConfiguration().get<string>(GROUP_ID, DEFAULT_GROUP_ID);
  }

  export function getDefaultArtifactId(): string {
    return workspace.getConfiguration().get<string>(ARTIFACT_ID, DEFAULT_ARTIFACT_ID);
  }

  export function getDefaultProjectVersion(): string {
    return workspace.getConfiguration().get<string>(PROJECT_VERSION, DEFAULT_PROJECT_VERSION);
  }

  export function getDefaultPackageName(): string {
    return workspace.getConfiguration().get<string>(PACKAGE_NAME, DEFAULT_PACKAGE_NAME);
  }

  export function getDefaultResourceName(): string {
    return workspace.getConfiguration().get<string>(RESOURCE_NAME, DEFAULT_RESOURCE_NAME);
  }

  export function getDefaultExtensions(): any[] {
    return workspace.getConfiguration().get<string[]>(EXTENSIONS, []);
  }

  export function getAlwaysShowWelcomePage(): boolean {
    return workspace.getConfiguration().get<boolean>(ALWAYS_SHOW_WELCOME_PAGE, true);
  }

  export function getTerminateProcessOnDebugExit(): TerminateProcessConfig {
    return workspace.getConfiguration().get<TerminateProcessConfig>(DEBUG_TERMINATE_ON_EXIT);
  }

  export function setDefaults(defaults: Defaults): void {
    workspace.getConfiguration(QUARKUS_CONFIG_NAME).update('starter.defaults', defaults, true);
  }

  export function setAlwaysShowWelcomePage(value: boolean): void {
    workspace.getConfiguration(QUARKUS_CONFIG_NAME).update(removeQuarkusConfigName(ALWAYS_SHOW_WELCOME_PAGE), value, true);
  }

  export function setTerminateProcessOnDebugExit(value: string): void {
    workspace.getConfiguration(QUARKUS_CONFIG_NAME).update(removeQuarkusConfigName(DEBUG_TERMINATE_ON_EXIT), value, true);
  }

  function removeQuarkusConfigName(configName: string) {
    return configName.replace(QUARKUS_CONFIG_NAME + '.', '');
  }
}

interface Defaults {
  buildTool: string;
  groupId: string;
  artifactId: string;
  projectVersion: string;
  packageName: string;
  resourceName: string;
  extensions: string[];
}

export enum TerminateProcessConfig {
  Ask = "Ask",
  Terminate = "Always terminate",
  DontTerminate = "Never terminate"
}
