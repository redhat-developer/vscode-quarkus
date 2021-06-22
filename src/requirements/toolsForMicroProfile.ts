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
import { extensions, window } from "vscode";
import { QuarkusContext } from "../QuarkusContext";
import { installExtension, isExtensionInstalled } from "../utils/extensionInstallationUtils";

const TOOLS_FOR_MICRO_PROFILE_EXT = 'redhat.vscode-microprofile';

const STARTUP_INSTALL_MEMO = 'mpExtInstallOnStartup.isIgnored';

/**
 * Prompts the user to install Tools for MicroProfile if they don't have it installed
 *
 * Allows the user to silence this prompt in the future by clicking on a button.
 * Warns the user that only some functionality is available if they choose not to install vscode-microprofile.
 *
 * @returns when the user has installed Tools for MicroProfile,
 *          or the user has chosen not to install Tools for MicroProfile,
 *          or its detected that they've silenced this popup
 */
export async function installMPExtOnStartup(): Promise<void> {
  if (isExtensionInstalled(TOOLS_FOR_MICRO_PROFILE_EXT)) {
    return;
  }
  const installOnStartupIsIgnored = QuarkusContext.getExtensionContext().globalState.get(STARTUP_INSTALL_MEMO, false);
  if (installOnStartupIsIgnored) {
    return;
  }
  const YES = 'Install';
  const NO = 'Don\'t install';
  const NOT_AGAIN = 'Don\'t ask me again';
  const result = await window.showWarningMessage('vscode-quarkus depends on Tools for MicroProfile for many of its features, '
    + 'but can provide some functionality without it. '
    + 'Install Tools for MicroProfile now? '
    + 'You will need to reload the window after the installation.', YES, NO, NOT_AGAIN);
  if (result === YES) {
    try {
      await installExtension(TOOLS_FOR_MICRO_PROFILE_EXT);
    } catch (e) {
      window.showErrorMessage(e);
    }
  } else if (result === NOT_AGAIN) {
    QuarkusContext.getExtensionContext().globalState.update(STARTUP_INSTALL_MEMO, true);
    limitedFunctionalityWarning();
  } else {
    limitedFunctionalityWarning();
  }
}

/**
 * Installs Tools for MicroProfile with the user's permission, in order to use a given command
 *
 * @param commandDescription description of the command that requires Tools for MicroProfile in order to be used
 * @returns when the user refuses to install,
 *          or when the install succeeds,
 *          or when the install fails
 */
export async function installMPExtForCommand(commandDescription: string) {
  const YES = 'Install';
  const NO = `Cancel ${commandDescription}`;
  const result = await window.showWarningMessage(`${commandDescription} requires Tools for MicroProfile. Install it now? `
    + 'You will need to reload the window after the installation.',
    YES, NO);
  if (result === YES) {
    try {
      await installExtension(TOOLS_FOR_MICRO_PROFILE_EXT);
    } catch (e) {
      window.showErrorMessage(e);
    }
  } else {
    window.showErrorMessage(`${commandDescription} requires Tools for MicroProfile, so it can't be run.`);
  }
}

/**
 * Returns true if Tools for MicroProfile is installed, and false otherwise
 *
 * @returns true if Tools for MicroProfile is installed, and false otherwise
 */
 export function isToolsForMicroProfileInstalled(): boolean {
  return isExtensionInstalled(TOOLS_FOR_MICRO_PROFILE_EXT);
}

/**
 * Returns when Tools for MicroProfile has started
 *
 * @returns when Tools for MicroProfile has started
 */
export async function microProfileToolsStarted(): Promise<void> {
  await extensions.getExtension(TOOLS_FOR_MICRO_PROFILE_EXT).activate();
}

async function limitedFunctionalityWarning(): Promise<void> {
  await window.showInformationMessage('vscode-quarkus will run with limited functionality');
}
