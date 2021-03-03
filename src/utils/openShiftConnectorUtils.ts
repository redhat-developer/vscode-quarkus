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
import { commands, Disposable, Extension, extensions, ProgressLocation, Uri, window } from "vscode";

export const OPENSHIFT_CONNECTOR_EXTENSION_ID = 'redhat.vscode-openshift-connector';
export const OPENSHIFT_CONNECTOR = 'OpenShift Connector extension';
const DOWNLOAD_TIMEOUT = 60000; // Timeout for downloading VSCode OpenShift Connector, in milliseconds

/**
 * Returns true if the OpenShift connector extension is installed, and false otherwise
 *
 * @returns true if the OpenShift connector extension is installed, and false otherwise
 */
export function isOpenShiftConnectorInstalled(): boolean {
  return !!extensions.getExtension(OPENSHIFT_CONNECTOR_EXTENSION_ID);
}

/**
 * Returns the OpenShift Connector extension API
 *
 * @throws Error if the extension is not installed
 * @returns the OpenShift Connector extension API
 */
export async function getOpenShiftConnector(): Promise<any> {
  if (!isOpenShiftConnectorInstalled()) {
    throw new Error(`${OPENSHIFT_CONNECTOR} is not installed`);
  }
  const openShiftConnector: Extension<any> = extensions.getExtension(OPENSHIFT_CONNECTOR_EXTENSION_ID);
  if (openShiftConnector.isActive) {
    return openShiftConnector.exports;
  }
  return extensions.getExtension(OPENSHIFT_CONNECTOR_EXTENSION_ID).activate();
}

/**
 * Install the OpenShift Connector extension
 *
 * @returns when the extension is installed
 * @throws if the user refuses to install the extension, or if the extension does not get installed within a timeout period
 */
async function installOpenShiftConnector(): Promise<void> {
  let installListenerDisposable: Disposable;
  return new Promise<void>((resolve, reject) => {
    installListenerDisposable = extensions.onDidChange(() => {
      if (isOpenShiftConnectorInstalled()) {
        resolve();
      }
    });
    commands.executeCommand("workbench.extensions.installExtension", OPENSHIFT_CONNECTOR_EXTENSION_ID)
      .then((_unused: any) => { }, reject);
    setTimeout(reject, DOWNLOAD_TIMEOUT, new Error(`${OPENSHIFT_CONNECTOR} installation is taking a while. Cancelling 'Deploy to OpenShift'. Please retry after the OpenShift Connector installation has finished`));
  }).finally(() => {
    installListenerDisposable.dispose();
  });
}

/**
 * Install the OpenShift Connector extension and show the progress
 *
 * @returns when the extension is installed
 * @throws if the extension installation fails or times out
 */
export async function installOpenShiftConnectorWithProgress(): Promise<void> {
  await window.withProgress({ location: ProgressLocation.Notification, title: `Installing ${OPENSHIFT_CONNECTOR}...` }, progress => {
    const openShiftConnectorInstall: Promise<void> = installOpenShiftConnector();
    openShiftConnectorInstall.catch((e) => {
      window.showErrorMessage(`${e}`);
    });
    return openShiftConnectorInstall;
  });
  window.showInformationMessage(`Successfully installed ${OPENSHIFT_CONNECTOR}.`);
}

/**
 * Create a component from the given Quarkus project, then push the component to OpenShift
 *
 * @param projectUri the uri of the Quarkus project to deploy
 */
export async function deployQuarkusProject(projectUri: Uri): Promise<void> {
  await commands.executeCommand("openshift.component.deployRootWorkspaceFolder", //
    projectUri,
    "java-quarkus"
  );
}
