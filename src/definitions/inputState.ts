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

import { Uri, WorkspaceFolder } from 'vscode';
import { QExtension } from './QExtension';
import { BuildSupport } from '../buildSupport/BuildSupport';

export interface State {
  totalSteps: number;
  extensions: QExtension[];
}

/**
 * Class representing data required to generate project
 */
export interface ProjectGenState extends State {
  buildTool: string;
  groupId: string;
  artifactId: string;
  projectVersion: string;
  packageName: string;
  resourceName: string;
  targetDir: Uri;
  isGenerateSampleCode: boolean;
}

export interface AddExtensionsState extends State {
  buildFilePath: Uri;
  buildSupport: BuildSupport;
  workspaceFolder: WorkspaceFolder;
}
