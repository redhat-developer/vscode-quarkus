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
import { commands, workspace } from 'vscode';
import { getWorkspaceProjectLabels } from './utils/workspaceUtils';
import { Disposable } from 'vscode-languageclient';
import { ProjectLabel, ProjectLabelInfo } from './definitions/ProjectLabelInfo';
import { MicroProfilePropertiesChangeEvent, MicroProfilePropertiesScopeEnum } from './yaml/YamlSchema';

export class QuarkusProjectListener {
  private quarkusProjectsCache: ProjectLabelInfo[];

  constructor() {
    this.quarkusProjectsCache = [];
  }

  public getQuarkusProjectListener(): Disposable {
    const listener: Disposable = workspace.onDidChangeWorkspaceFolders(async () => {
      await new Promise((res => setTimeout(res, 100)));
      await this.updateCacheAndContext();
    });

    return {
      dispose: () => {
        listener.dispose();
        this.setQuarkusProjectExistsContext(false);
      }
    };
  }

  public async propertiesChange(event: MicroProfilePropertiesChangeEvent): Promise<void> {
    if (event.projectURIs.length === 0) {
      return;
    }

    const projectURI: string = event.projectURIs[0];
    if ((this.quarkusProjectsCache.length === 0 || this.quarkusProjectsCache.map((info) => info.uri).includes(projectURI)) &&
        event.type.includes(MicroProfilePropertiesScopeEnum.dependencies)) {
      await this.updateCacheAndContext();
    }
  }

  /**
   * Updates the `quarkusProjectsCache` and `quarkusProjectExists` context
   */
  public async updateCacheAndContext(): Promise<void> {
    this.quarkusProjectsCache = await getWorkspaceProjectLabels(ProjectLabel.Quarkus);
    await this.setQuarkusProjectExistsContext(this.quarkusProjectsCache.length > 0);
  }

  /**
   * Sets the `quarkusProjectExists` context to `true` if current workspace
   * contains a Quarkus project. Sets to `false` otherwise.
   */
  private async setQuarkusProjectExistsContext(value: boolean): Promise<void> {
    await commands.executeCommand('setContext', 'quarkusProjectExists', value);
  }
}

const quarkusProjectListener: QuarkusProjectListener = new QuarkusProjectListener();
export default quarkusProjectListener;