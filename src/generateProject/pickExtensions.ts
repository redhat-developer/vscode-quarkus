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
import { QUARKUS_GROUP_ID } from '../definitions/constants';
import { QuarkusContext } from '../QuarkusContext';
import { MultiStepInput } from '../utils/multiStepUtils';
import { QExtension } from '../definitions/QExtension';
import { State } from '../definitions/inputState';
import { getQExtensions } from '../utils/requestUtils';

/**
 * Options for the 'pick extensions' quick input
 */
interface PickExtensionsOptions {
  showLastUsed: boolean; // Set to true to show the 'last used' option
  allowZeroExtensions: boolean; // Set to true to allow user to continue with zero extensions
  step?: number; // Optional: Specify an explicit step number if desired
}

interface QuickPickItem {
  type: Type; // stop, last used, extension
  label: string;
  description: string;
  detail?: string;
  artifactId?: string; // only for extensions
}

enum Type {
  Extension,
  Stop,
  LastUsed
}

export async function pickExtensions(
  input: MultiStepInput,
  state: Partial<State>,
  options: PickExtensionsOptions,
  next?: (input: MultiStepInput, state: Partial<State>) => any) {

  const allExtensions: QExtension[] = await getQExtensions();

  const defaultExtensions: QExtension[] = getDefaultQExtensions(allExtensions);
  let selectedExtensions: QExtension[] = [];
  let unselectedExtensions: QExtension[] = allExtensions;
  let pick: QuickPickItem;

  do {

    const quickPickItems: QuickPickItem[] = getItems(selectedExtensions, unselectedExtensions, defaultExtensions, options);

    pick = await input.showQuickPick({
      title: 'Quarkus Tools',
      step: options.step ? options.step : input.getStepNumber(),
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
    return (input: MultiStepInput) => next(input, state);
  }
}

function getDefaultQExtensions(allExtensions: QExtension[]): QExtension[] {
  const result: QExtension[] = [];
  let defaultExtensionIds: any[] = QuarkusContext.getDefaultExtensions();

  defaultExtensionIds = defaultExtensionIds.filter((extensionId: any) => {
    return typeof extensionId === 'string' && extensionId.length > 0;
  });

  defaultExtensionIds = defaultExtensionIds.map((extensionId: any) => {
    const semicolon: number = extensionId.indexOf(':');
    if (semicolon !== -1) {
      return extensionId;
    } else {
      return `${QUARKUS_GROUP_ID}:${extensionId}`;
    }
  });

  allExtensions.forEach((extension: QExtension) => {
    if (defaultExtensionIds.includes(extension.getGroupIdArtifactIdString())) {
      result.push(extension);
    }
  });
  return result;
}

function getItems(selected: QExtension[], unselected: QExtension[], defaults: QExtension[], options: PickExtensionsOptions): QuickPickItem[] {
  let items: QuickPickItem[] = [];

  if (selected.length === 0 && defaults.length > 0 && options.showLastUsed) {
    addLastUsedOption(items, defaults);
  }

  if (options.allowZeroExtensions || selected.length > 0) {
    addContinueOption(items, selected.length);
  }

  items = items.concat(selected.concat(unselected).map((it) => {
    return {
      type: Type.Extension,
      label: `${selected.some((other) => it.artifactId === other.artifactId) ? '$(check) ' : ''}${it.name}`,
      description: `(${it.artifactId})`,
      artifactId: it.artifactId
    };
  }));

  return items;
}

function addContinueOption(items: QuickPickItem[], numOfSelected: number) {
  items.push({
    type: Type.Stop,
    label: `$(tasklist) ${numOfSelected} extensions selected`,
    description: '',
    detail: 'Press <Enter>  to continue'
  });
}

function addLastUsedOption(items: QuickPickItem[], prevExtensions: QExtension[]) {

  const extensionNames = prevExtensions.map((it) => it.name).join(', ');

  items.push({
    type: Type.LastUsed,
    label: `$(clock) Last used`,
    description: '',
    detail: extensionNames
  });
}
