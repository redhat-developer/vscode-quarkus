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

export const MICROPROFILE_SCHEMA = 'microprofile';
export const MICROPROFILE_SCHEMA_PREFIX = MICROPROFILE_SCHEMA + '://schema/';
export const VSCODE_YAML_EXTENSION_ID = 'redhat.vscode-yaml';
export const VSCODE_YAML_DISPLAY_NAME = 'YAML Support by Red Hat';
export const VSCODE_YAML_NOT_INSTALLED_MESSAGE = `For application.yaml support, please install '${VSCODE_YAML_DISPLAY_NAME}' and reload ${vscode.env.appName}.`;
export const VSCODE_YAML_LOW_VERSION_MESSAGE = `The installed version of '${VSCODE_YAML_DISPLAY_NAME}' doesn't support multiple schemas. Please install the latest version and reload ${vscode.env.appName}.`;
export const VSCODE_YAML_NO_REGISTRATION_MESSAGE = `The installed version of '${VSCODE_YAML_DISPLAY_NAME}' doesn't support Quarkus Intellisense. Please install the latest version and reload ${vscode.env.appName}.`;
export const VSCODE_YAML_INSTALL_SUCCESS = `Successfully installed '${VSCODE_YAML_DISPLAY_NAME}'. Please reload ${vscode.env.appName}.`;