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

import { executeInTerminal } from "../terminal/quarkusTerminalUtils";
import { State } from "../definitions/state";
import { ConfigManager } from "../definitions/configManager";
import { MultiStepInput } from "../utils/multiStepUtils";
import { pickExtensionsWithoutLastUsed } from "../generateProject/pickExtensions";
import { QExtension } from "../definitions/extension";

export async function add(configManager: ConfigManager) {
  const state: Partial<State> = {
    totalSteps: 1
  };
  async function collectInputs(state: Partial<State>) {
    await MultiStepInput.run(input => pickExtensionsWithoutLastUsed(input, state, configManager.getSettingsJson()));
  }
  await collectInputs(state);
  const artifactIds: String[] = getArtifactIds(state.extensions!);
  const command = `quarkus:add-extension -Dextensions="${artifactIds.join(',')}"`;
  await executeInTerminal(command, true);
}

function getArtifactIds(extensions: QExtension[]): String[] {
  return extensions.map((it) => it.artifactId);
}