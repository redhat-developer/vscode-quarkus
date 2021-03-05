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
import * as path from 'path';

import { QUARKUS_GROUP_ID } from '../../definitions/constants';
import { QuickPickItem, Uri } from 'vscode';
import { State } from '../../definitions/inputState';
import { QExtension } from '../../definitions/QExtension';
import { QuarkusConfig } from '../../QuarkusConfig';
import { QuarkusContext } from '../../QuarkusContext';
import { MultiStepInput, QuickInputButtonWithCallback, QuickPickParameters } from '../../utils/multiStepUtils';
import { getQExtensions } from '../../utils/requestUtils';

/**
 * Options for the 'pick extensions' quick input
 */
interface PickExtensionsOptions {
  showLastUsed: boolean; // Set to true to show the 'last used' option
  showRequiredExtensions: boolean; // required extensions are pre-selected and cannot be unselected
  allowZeroExtensions: boolean; // Set to true to allow user to continue with zero extensions
  step?: number; // Optional: Specify an explicit step number if desired
}

interface QuickPickExtensionItem extends QuickPickItem {
  type: Type; // stop, last used, extension
  label: string;
  description: string;
  detail?: string;
  extension?: QExtension; // only for extensions
}

enum Type {
  Extension,
  Stop,
  LastUsed
}

export class ExtensionsPicker {

  private showDescription: boolean;
  private allExtensions: QExtension[];
  private defaultExtensions: QExtension[];
  private selectedExtensions: QExtension[];
  private unselectedExtensions: QExtension[];
  private options: PickExtensionsOptions;

  public static async createExtensionsPicker(input: MultiStepInput,
    state: Partial<State>,
    options: PickExtensionsOptions,
    next?: (input: MultiStepInput, state: Partial<State>) => any) {

    const extensionsPicker: ExtensionsPicker = new ExtensionsPicker(options);
    await extensionsPicker.setExtensions();

    return extensionsPicker.pickExtensions(input, state, next);
  }

  private constructor(options: PickExtensionsOptions) {
    this.showDescription = QuarkusConfig.getShowExtensionDescriptions();
    this.options = options;
  }

  private async setExtensions() {
    try {
      this.allExtensions = await getQExtensions();

      this.defaultExtensions = this.getDefaultQExtensions();
      this.selectedExtensions = [];
      this.unselectedExtensions = [];

      if (this.options.showRequiredExtensions) {
        this.allExtensions.forEach((extension: QExtension) => {
          if (extension.isRequired) {
            this.selectedExtensions.push(extension);
          } else {
            this.unselectedExtensions.push(extension);
          }
        });
      } else {
        this.allExtensions = this.allExtensions.filter((extension: QExtension) => !extension.isRequired);
        this.unselectedExtensions = this.allExtensions;
      }
    } catch (err) {
      throw err;
    }
  }

  private async pickExtensions(
    input: MultiStepInput,
    state: Partial<State>,
    next?: (input: MultiStepInput, state: Partial<State>) => any) {

    let pick: QuickPickExtensionItem;

    do {

      const quickPickItems: QuickPickExtensionItem[] = this.getItems();

      pick = await input.showQuickPick<QuickPickExtensionItem, QuickPickParameters<QuickPickExtensionItem>>({
        title: 'Quarkus Tools',
        step: this.options.step ? this.options.step : input.getStepNumber(),
        totalSteps: state.totalSteps,
        placeholder: 'Pick extensions',
        items: quickPickItems,
        buttons: [ this.getInfoButton() ],
        configChanges: [
          {
            configName: QuarkusConfig.STARTER_SHOW_EXT_DESC,
            callback: () => this.showDescription = QuarkusConfig.getShowExtensionDescriptions()
          }
        ]
      });

      if (pick) {
        switch (pick.type) {
          case Type.Extension: {
            // unselect
            if (!pick.extension.isRequired) {
              if (this.isSelected(pick.extension)) {
                this.selectedExtensions = this.selectedExtensions.filter((it) => it.artifactId !== pick.extension.artifactId);
                this.unselectedExtensions.push(pick.extension);
                this.unselectedExtensions.sort((a, b) => a.name.localeCompare(b.name));
              } else {
                // select
                this.unselectedExtensions = this.unselectedExtensions.filter((it) => it.artifactId !== pick.extension.artifactId);
                this.selectedExtensions.push(pick.extension);
                this.selectedExtensions.sort((a, b) => a.name.localeCompare(b.name));
              }
            }
            break;
          }
          case Type.LastUsed: {
            state.extensions = this.defaultExtensions;
            break;
          }
          case Type.Stop: {
            state.extensions = this.selectedExtensions;
            break;
          }
          default:
            break;
        }
      }

    } while (!pick || pick.type === Type.Extension);

    if (next) {
      return (input: MultiStepInput) => next(input, state);
    }
  }

  private getInfoButton(): QuickInputButtonWithCallback {
    const darkThemeIcon: Uri = Uri.file(path.join(QuarkusContext.getExtensionContext().extensionPath, 'assets/buttons/info_dark_theme.svg'));
    const lightThemeIcon: Uri = Uri.file(path.join(QuarkusContext.getExtensionContext().extensionPath, 'assets/buttons/info_light_theme.svg'));
    return {
      iconPath: { light: lightThemeIcon, dark: darkThemeIcon },
      tooltip: 'Toggle extension descriptions',
      callback: () => {
        this.showDescription = !this.showDescription;
        QuarkusConfig.setShowExtensionDescriptions(this.showDescription);
      }
    } as QuickInputButtonWithCallback;
  }

  private getDefaultQExtensions(): QExtension[] {
    const result: QExtension[] = [];
    let defaultExtensionIds: string[] = QuarkusContext.getDefaultExtensions();

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

    this.allExtensions.forEach((extension: QExtension) => {
      if ((this.options.showRequiredExtensions && extension.isRequired) ||
          defaultExtensionIds.includes(extension.getGroupIdArtifactIdString())) {
        result.push(extension);
      }
    });
    return result;
  }

  private getItems(): QuickPickExtensionItem[] {
    let items: QuickPickExtensionItem[] = [];

    const nothingSelectedAndDefaultsExist: boolean = this.selectedExtensions.length === 0 && this.defaultExtensions.length > 0;
    const isSelectedAllRequired: boolean = this.selectedExtensions.length > 0 && this.selectedExtensions.every(e => e.isRequired);
    const isDefaultAllRequired: boolean = this.defaultExtensions.length > 0 && this.defaultExtensions.every(e => e.isRequired);

    if (this.options.showLastUsed) {
      if (nothingSelectedAndDefaultsExist || (isSelectedAllRequired && !isDefaultAllRequired)) {
        this.addLastUsedOption(items);
      }
    }

    if (this.options.allowZeroExtensions || this.selectedExtensions.length > 0) {
      this.addContinueOption(items);
    }

    items = items.concat(this.selectedExtensions.concat(this.unselectedExtensions).map((it: QExtension) => {
      let description: string;
      if (this.showDescription) {
        description = (it.isRequired ? ' (This is a required extension)' : ` (${it.groupId}:${it.artifactId})`);
      } else {
        description = it.category;
      }

      const quickPickItem: QuickPickExtensionItem = {
        type: Type.Extension,
        description,
        label: `${this.isSelected(it) ? '$(check) ' : ''}${it.name}`,
        extension: it
      };

      if (this.showDescription && !this.isSelected(it)) {
        quickPickItem.detail = it.description;
      }

      return quickPickItem;
    }));

    return items;
  }

  private isSelected(item: QExtension) {
    return this.selectedExtensions.some((other) => item.artifactId === other.artifactId);
  }

  private addContinueOption(items: QuickPickExtensionItem[]) {
    const numSelected: number = this.selectedExtensions.length;
    items.push({
      type: Type.Stop,
      label: `$(tasklist) ${numSelected} extension${numSelected !== 1 ? 's' : ''} selected`,
      description: '',
      detail: 'Press <Enter>  to continue'
    });
  }

  private addLastUsedOption(items: QuickPickExtensionItem[]) {

    const extensionNames = this.defaultExtensions.map((it: QExtension) => it.name).join(', ');

    items.push({
      type: Type.LastUsed,
      label: `$(clock) Last used`,
      description: '',
      detail: extensionNames
    });
  }
}
