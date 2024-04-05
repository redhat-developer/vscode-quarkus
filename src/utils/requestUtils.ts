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

import * as fs from 'fs';
import * as p from 'path';
import { Readable } from 'stream';
import { fromBuffer, ZipFile } from 'yauzl';
import { ProjectGenState } from '../definitions/inputState';
import { APIExtension, convertToQExtension, QExtension } from '../definitions/QExtension';
import { QuarkusConfig } from '../QuarkusConfig';
import { CodeQuarkusFunctionality } from './codeQuarkusApiUtils';

const HEADERS = {
  'Client-Name': 'vscode-quarkus',
  'Client-Contact-Email': 'fbricon@redhat.com,azerr@redhat.com,dakwon@redhat.com'
};

export async function getQExtensions(platform?: string): Promise<QExtension[]> {
  const apiUrl = `${QuarkusConfig.getApiUrl()}/extensions${platform === undefined ? `` : `/stream/${platform}`}`;
  const extensions: APIExtension[] = await tryGetExtensionsJSON(apiUrl);
  const qExtensions: QExtension[] = extensions.map((ext: APIExtension) => {
    return convertToQExtension(ext);
  });
  const noDuplicates: QExtension[] = removeDuplicateArtifactIds(qExtensions);
  return noDuplicates.sort((a, b) => a.name.localeCompare(b.name));
}

async function tryGetExtensionsJSON(apiUrl: string): Promise<APIExtension[]> {
  try {
    const abortController = new AbortController();
    const timeout = setTimeout(() => { abortController.abort(); }, 30_000);
    const response = await fetch(apiUrl, {
      headers: HEADERS,
      signal: abortController.signal
    });
    clearTimeout(timeout);
    return (await response.json()) as APIExtension[];
  } catch {
    throw `Unable to reach ${apiUrl}`;
  }
}

function removeDuplicateArtifactIds(extensions: QExtension[]): QExtension[] {
  const ids: Set<string> = new Set();

  return extensions.reduce((accumulator: QExtension[], extension: QExtension) => {
    if (!ids.has(extension.artifactId)) {
      ids.add(extension.artifactId);
      accumulator.push(extension);
    }
    return accumulator;
  }, [] as QExtension[]);
}

export async function downloadProject(state: ProjectGenState, codeQuarkusFunctionality: CodeQuarkusFunctionality): Promise<ZipFile> {
  const apiUrl: string = QuarkusConfig.getApiUrl();
  const chosenIds: string[] = state.extensions!.map((it) => `${it.groupId}:${it.artifactId}`);

  const canSpecifyGenerateCode = codeQuarkusFunctionality.supportsNoCodeParameter || codeQuarkusFunctionality.supportsNoExamplesParameter;
  const parameterToSpecifyGenerateCode = codeQuarkusFunctionality.supportsNoCodeParameter ? 'nc' : 'ne';

  const qProjectUrl: string = `${apiUrl}/download?` +
    `b=${state.buildTool.toUpperCase()}&` +
    `S=${state.platformVersion}&` +
    `j=${state.javaVersion}&` +
    `g=${state.groupId}&` +
    `a=${state.artifactId}&` +
    `v=${state.projectVersion}&` +
    `c=${state.packageName}.${state.resourceName}&` +
    `${(canSpecifyGenerateCode ? `${parameterToSpecifyGenerateCode}=${!state.shouldGenerateCode}&` : '')}` +
    `e=${chosenIds.join('&e=')}`;

  const buffer: Buffer = await tryGetProjectBuffer(qProjectUrl);
  return extract(buffer, state.targetDir!.fsPath);
}

async function tryGetProjectBuffer(projectUrl: string): Promise<Buffer> {
  try {
    const response = await fetch(projectUrl, {
      headers: HEADERS,
    });
    return Buffer.from(await response.arrayBuffer());
  } catch {
    throw 'Unable to download Quarkus project.';
  }
}

const yauzlFromBuffer = promisify(fromBuffer);

function promisify(api) {
  return (...args) => {
    return new Promise((resolve, reject) => {
      api(...args, (err, response) => {
        if (err) return reject(err);
        resolve(response);
      });
    });
  };
}

async function extract(content: Buffer, path: string): Promise<ZipFile> {
  const zipfile: ZipFile = (await yauzlFromBuffer(content, { lazyEntries: true })) as ZipFile;
  const openReadStream = promisify(zipfile.openReadStream.bind(zipfile));

  zipfile.readEntry();

  zipfile.on("entry", async (entry) => {
    if (entry.fileName !== "/") {
      const mappedPath = p.resolve(path, p.normalize(entry.fileName));
      if (entry.fileName.endsWith("/")) {
        fs.mkdirSync(mappedPath);
      } else {
        const stream: Readable = (await openReadStream(entry)) as Readable;
        stream.pipe(fs.createWriteStream(mappedPath, { mode: entry.externalFileAttributes >>> 16 }));
      }
    }
    zipfile.readEntry();
  });

  return zipfile;
}
