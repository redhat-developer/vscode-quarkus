/**
 * Copyright 2021 Red Hat, Inc. and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { commands, Disposable, extensions } from "vscode";

/**
 * Error that is throw when the extension download times out
 */
export const EXT_DOWNLOAD_TIMEOUT_ERROR = new Error('Extension installation is taking a while');

const DOWNLOAD_TIMEOUT = 60000;

/**
 * Installs the extension with the given id
 *
 * This function will timeout with an error if the installation takes a while.
 * However, the extension installation will not be cancelled.
 *
 * @param extensionId the id (`"${publisher}.${name}"`) of the extension to check
 * @returns when the extension is installed
 * @throws `EXT_DOWNLOAD_TIMEOUT_ERROR` when the extension installation takes a while,
 *         or a different error when the extension installation fails.
 */
export async function installExtension(extensionId: string): Promise<void> {
  let installListenerDisposable: Disposable;
  return new Promise<void>((resolve, reject) => {
    installListenerDisposable = extensions.onDidChange(() => {
      if (isExtensionInstalled(extensionId)) {
        resolve();
      }
    });
    commands.executeCommand("workbench.extensions.installExtension", extensionId)
      .then((_unused: any) => { }, reject);
    setTimeout(reject, DOWNLOAD_TIMEOUT, EXT_DOWNLOAD_TIMEOUT_ERROR);
  }).finally(() => {
    installListenerDisposable.dispose();
  });
}

/**
 * Returns true if the extension is installed and false otherwise
 *
 * @param extensionId the id (`"${publisher}.${name}"`) of the extension to check
 * @returns `true` if the extension is installed and `false` otherwise
 */
export function isExtensionInstalled(extensionId: string): boolean {
  return !!extensions.getExtension(extensionId);
}
