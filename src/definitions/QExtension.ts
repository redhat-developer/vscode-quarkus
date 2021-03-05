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

import { QUARKUS_GROUP_ID } from './constants';

/**
* Interface representing a Quarkus extension
*/
export class QExtension {
  name: string;
  category: string;
  description: string;
  labels: string[];
  groupId: string;
  artifactId: string;
  isRequired: boolean;

  constructor(name: string, category: string, description: string, labels: string[], groupId: string, artifactId: string, isRequired: boolean) {
    this.name = name;
    this.category = category;
    this.description = description;
    this.labels = labels;
    this.groupId = groupId;
    this.artifactId = artifactId;
    this.isRequired = isRequired;
  }

  getGroupIdArtifactIdString() {
    return `${this.groupId}:${this.artifactId}`;
  }
}

export function convertToQExtension(extension: APIExtension): QExtension {

  if (!extension.id || extension.id.length === 0) {
    return;
  }

  const semicolon: number = extension.id.indexOf(':');
  let groupId: string;
  let artifactId: string;

  if (semicolon !== -1) {
    groupId = extension.id.substring(0, semicolon);
    artifactId = extension.id.substring(semicolon + 1);
  } else {
    groupId = QUARKUS_GROUP_ID;
    artifactId = extension.id;
  }
  return new QExtension(extension.name, extension.category, extension.description,
      extension.labels, groupId, artifactId, extension.default);
}

/**
 * Interface representing a Quarkus extension
 * from the ${apiUrl}/extensions endpoint
 */
export interface APIExtension {
  id: string;
  name: string;
  labels: string[];
  description: string;
  shortName: string;
  category: string;
  order: Number;
  default: boolean;
}
