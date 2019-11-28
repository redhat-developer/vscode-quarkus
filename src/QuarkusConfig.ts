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
} from './definitions/constants';
import { ConfigurationTarget, workspace } from 'vscode';

/**
 * This class manages the extension's interaction with
 * settings.json
 */
export namespace QuarkusConfig {

  export const QUARKUS_CONFIG_NAME = 'quarkus.tools';

  export const STARTER_API = 'quarkus.tools.starter.api';
  export const STARTER_SHOW_EXT_DESC = 'quarkus.tools.starter.showExtensionDescriptions';
  export const ALWAYS_SHOW_WELCOME_PAGE = 'quarkus.tools.alwaysShowWelcomePage';
  export const DEBUG_TERMINATE_ON_EXIT = 'quarkus.tools.debug.terminateProcessOnExit';

  export function getApiUrl(): string {
    return workspace.getConfiguration().get<string>(STARTER_API, DEFAULT_API_URL);
  }

  export function getAlwaysShowWelcomePage(): boolean {
    return workspace.getConfiguration().get<boolean>(ALWAYS_SHOW_WELCOME_PAGE, true);
  }

  export function getShowExtensionDescriptions(): boolean {
    return workspace.getConfiguration().get<boolean>(STARTER_SHOW_EXT_DESC, true);
  }

  export function getTerminateProcessOnDebugExit(): TerminateProcessConfig {
    return workspace.getConfiguration().get<TerminateProcessConfig>(DEBUG_TERMINATE_ON_EXIT);
  }

  export function setAlwaysShowWelcomePage(value: boolean): void {
    saveToQuarkusConfig(ALWAYS_SHOW_WELCOME_PAGE, value);
  }

  export function setShowExtensionDescriptions(value: boolean): void {
    saveToQuarkusConfig(STARTER_SHOW_EXT_DESC, value);
  }

  export function setTerminateProcessOnDebugExit(value: string): void {
    saveToQuarkusConfig(DEBUG_TERMINATE_ON_EXIT, value);
  }

  export function saveToQuarkusConfig<T>(configName: string, value: T) {
    workspace.getConfiguration().update(configName, value, ConfigurationTarget.Global);
  }
}

export enum TerminateProcessConfig {
  Ask = "Ask",
  Terminate = "Always terminate",
  DontTerminate = "Never terminate"
}
