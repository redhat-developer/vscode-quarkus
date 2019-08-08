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

import * as request from 'request-promise';
import * as unzipper from 'unzipper';
import { QExtension, APIExtension } from '../definitions/extension';
import { State } from '../definitions/state';

export async function getQExtensions(apiUrl: string): Promise<QExtension[]> {

  return await request.get(`${apiUrl}/extensions`)
    .then((body) => {
      const qExtensions: QExtension[] = convertToQExtensions(JSON.parse(body));

      return qExtensions.sort((a, b) => a.name.localeCompare(b.name));
    });
}

function convertToQExtensions(extensions: APIExtension[]): QExtension[] {
  return extensions.map((extension) => {
    const semicolon: number = extension.id.indexOf(':');
    const groupId: string = extension.id.substring(0, semicolon);
    const artifactId: string = extension.id.substring(semicolon + 1);

    return {
      name: extension.name,
      labels: extension.labels,
      groupId,
      artifactId
    } as QExtension;
  });
}

export async function downloadProject(state: State, apiUrl: string) {

  const chosenExtArtifactIds: string[] = state.extensions!.map((it) => it.artifactId);
  const chosenIds: string[] = chosenExtArtifactIds.map((artifactId) => {
    return 'io.quarkus:' + artifactId;
  });

  const qProjectUrl: string = `${apiUrl}/download?` +
    `g=${state.groupId}&` +
    `a=${state.artifactId}&` +
    `v=${state.projectVersion}&` +
    `c=${state.packageName}.${state.resourceName}&` +
    `e=${chosenIds.join('&e=')}`;

  return request(qProjectUrl)
  .pipe(unzipper.Extract({ path: state.targetDir!.fsPath })).promise();
}
