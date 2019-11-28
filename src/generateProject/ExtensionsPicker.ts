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

import { QUARKUS_GROUP_ID } from '../definitions/constants';
import { ConfigurationChangeEvent, Disposable, QuickPickItem, Uri, workspace, window } from 'vscode';
import { State } from '../definitions/inputState';
import { QExtension } from '../definitions/QExtension';
import { QuarkusConfig } from '../QuarkusConfig';
import { QuarkusContext } from '../QuarkusContext';
import { MultiStepInput, QuickInputButtonWithCallback, QuickPickParameters } from '../utils/multiStepUtils';
import { getQExtensions } from '../utils/requestUtils';

/**
 * Options for the 'pick extensions' quick input
 */
interface PickExtensionsOptions {
  showLastUsed: boolean; // Set to true to show the 'last used' option
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

  public static async createExtensionsPicker(input: MultiStepInput,
    state: Partial<State>,
    options: PickExtensionsOptions,
    next?: (input: MultiStepInput, state: Partial<State>) => any) {

    const extensionsPicker: ExtensionsPicker = new ExtensionsPicker();
    await extensionsPicker.setExtensions();

    return extensionsPicker.pickExtensions(input, state, options, next);
  }

  private constructor() {
    this.showDescription = QuarkusConfig.getShowExtensionDescriptions();
  }

  private async setExtensions() {
    try {
      this.allExtensions = await getQExtensions();
      this.defaultExtensions = this.getDefaultQExtensions();
      this.selectedExtensions = [];
      this.unselectedExtensions = this.allExtensions;
    } catch (err) {
      throw err;
    }
  }

  private async pickExtensions(
    input: MultiStepInput,
    state: Partial<State>,
    options: PickExtensionsOptions,
    next?: (input: MultiStepInput, state: Partial<State>) => any) {

    let pick: QuickPickExtensionItem;

    do {

      const quickPickItems: QuickPickExtensionItem[] = this.getItems(options);

      pick = await input.showQuickPick<QuickPickExtensionItem, QuickPickParameters<QuickPickExtensionItem>>({
        title: 'Quarkus Tools',
        step: options.step ? options.step : input.getStepNumber(),
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

    this.allExtensions.forEach((extension: QExtension) => {
      if (defaultExtensionIds.includes(extension.getGroupIdArtifactIdString())) {
        result.push(extension);
      }
    });
    return result;
  }

  private getItems(options: PickExtensionsOptions): QuickPickExtensionItem[] {
    let items: QuickPickExtensionItem[] = [];

    if (this.selectedExtensions.length === 0 && this.defaultExtensions.length > 0 && options.showLastUsed) {
      this.addLastUsedOption(items);
    }

    if (options.allowZeroExtensions || this.selectedExtensions.length > 0) {
      this.addContinueOption(items);
    }

    items = items.concat(this.selectedExtensions.concat(this.unselectedExtensions).map((it: QExtension) => {
      const quickPickItem: QuickPickExtensionItem = {
        type: Type.Extension,
        description: it.category,
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
    items.push({
      type: Type.Stop,
      label: `$(tasklist) ${this.selectedExtensions.length} extensions selected`,
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
