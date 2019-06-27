import { executeInTerminal } from "../terminal/quarkusterminalutils";
import { State } from "../definitions/State";
import { MultiStepInput } from "../utils/multiStepUtils";
import { pickExtensionsWithoutLastUsed } from "../generateProject/pickExtensions";
import { QExtension } from "../createQuarkusProject";

export async function add() {
  let state: State = new State();
  async function collectInputs(state: State) {
    await MultiStepInput.run(input => pickExtensionsWithoutLastUsed(input, state));
  }
  await collectInputs(state);
  const artifactIds: String[] = getArtifactIds(state.extensions);
  const command = `quarkus:add-extension -Dextensions="${artifactIds.join(',')}"`;
  await executeInTerminal(command, true);
}

function getArtifactIds(extensions: QExtension[]): String[] {
  return extensions.map((it) => it.artifactId);
}