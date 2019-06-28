import { executeInTerminal } from "../terminal/quarkusterminalutils";
import { State } from "../definitions/State";
import { ConfigManager } from "../definitions/ConfigManager";
import { MultiStepInput } from "../utils/multiStepUtils";
import { pickExtensionsWithoutLastUsed } from "../generateProject/pickExtensions";
import { QExtension } from "../createQuarkusProject";

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