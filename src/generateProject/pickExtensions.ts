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

import { MultiStepInput } from '../utils/multiStepUtils';
import { QExtension } from '../definitions/extensionInterfaces';
import { State } from '../definitions/inputState';
import { SettingsJson } from '../definitions/configManager';
import { getQExtensions } from '../utils/requestUtils';
import { DEFAULT_API_URL } from '../definitions/projectGenerationConstants';

enum Type {
  Extension,
  Stop,
  LastUsed
}

interface QuickPickItem {
  type: Type; // stop, last used, extension
  label: string;
  description: string;
  detail?: string;
  artifactId?: string; // only for extensions
}

/**
 * Determines if the "Last Used" item should appear in the QuickPick menu
 */
let addLastUsed: boolean;

export async function pickExtensionsWithoutLastUsed(
  input: MultiStepInput,
  state: Partial<State>,
  settings: SettingsJson,
  next?: (input: MultiStepInput, state: Partial<State>) => any) {

  addLastUsed = false;
  return pickExtensions(input, state, settings, next);
}

export async function pickExtensionsWithLastUsed(
  input: MultiStepInput,
  state: Partial<State>,
  settings: SettingsJson,
  next?: (input: MultiStepInput, state: Partial<State>) => any) {

  addLastUsed = true;
  await pickExtensions(input, state, settings, next);
}

async function pickExtensions(
  input: MultiStepInput,
  state: Partial<State>,
  settings: SettingsJson,
  next: (input: MultiStepInput, state: Partial<State>) => any) {

  const apiUrl = settings.api ? settings.api : DEFAULT_API_URL;

  let allExtensions: QExtension[];

  try {
    allExtensions = await getQExtensions(apiUrl);
  } catch (err) {
    state.wizardInterrupted = {reason: `Unable to reach ${apiUrl}/extensions.`};
    return;
  }

  let defaultExtensions: QExtension[] = [];

  if (settings.defaults.extensions) {
    defaultExtensions = settings.defaults.extensions.filter((defExtension) => {
      return allExtensions.some((extension) => extension.artifactId === defExtension.artifactId);
    });
  }

  let selectedExtensions: QExtension[] = [];
  let unselectedExtensions: QExtension[] = allExtensions;
  let pick: QuickPickItem;

  do {

    const quickPickItems: QuickPickItem[] = getItems(selectedExtensions, unselectedExtensions, defaultExtensions);

    pick = await input.showQuickPick({
      title: 'Quarkus Tools',
      step: input.getStepNumber(),
      totalSteps: state.totalSteps,
      placeholder: 'Pick extensions',
      items: quickPickItems,
      activeItem: quickPickItems[0]
    });

    switch (pick.type) {
      case Type.Extension: {

        // unselect
        if (selectedExtensions.some((it) => { return it.artifactId === pick.artifactId; })) {
          const dependency = selectedExtensions.find((it) => it.artifactId === pick.artifactId);
          if (dependency) {
            selectedExtensions = selectedExtensions.filter((it) => it.artifactId !== pick.artifactId);
            unselectedExtensions.push(dependency);
            unselectedExtensions.sort((a, b) => a.name.localeCompare(b.name));
          }
        } else {
          // select
          const dependency = unselectedExtensions.find(((it) => { return it.artifactId === pick.artifactId; }));
          if (dependency) {
            unselectedExtensions = unselectedExtensions.filter((it) => it.artifactId !== pick.artifactId);
            selectedExtensions.push(dependency);
            selectedExtensions.sort((a, b) => a.name.localeCompare(b.name));
          }
        }
        break;
      }
      case Type.LastUsed: {
        state.extensions = defaultExtensions;
        break;
      }
      case Type.Stop: {
        state.extensions = selectedExtensions;
        break;
      }
    }

  } while (pick.type === Type.Extension);

  if (next) {
    return state.wizardInterrupted ? null : (input: MultiStepInput) => next(input, state);
  }
}

function getItems(selected: QExtension[], unselected: QExtension[], defaults: QExtension[]): QuickPickItem[] {
  const items: QuickPickItem[] = selected.concat(unselected).map((it) => {
    return {
      type: Type.Extension,
      label: `${selected.some((other) => it.artifactId === other.artifactId) ? '$(check) ' : ''}${it.name}`,
      description: `(${it.artifactId})`,
      artifactId: it.artifactId
    };
  });

  // Push the dependencies selection stopper on top of the dependencies list
  items.unshift({
    type: Type.Stop,
    label: `$(tasklist) ${selected.length} extensions selected`,
    description: '',
    detail: 'Press <Enter>  to continue'
  });

  if (selected.length === 0 && defaults.length > 0 && addLastUsed) { // TODO pass default extensions to this function. if exists, run addLastUsedOption
    addLastUsedOption(items, defaults);
  }

  return items;
}

function addLastUsedOption(items: QuickPickItem[], prevExtensions: QExtension[]) {

  const extensionNames = prevExtensions.map((it) => it.name).join(', ');

  items.unshift({
    type: Type.LastUsed,
    label: `$(clock) Last used`,
    description: '',
    detail: extensionNames
  });
}
