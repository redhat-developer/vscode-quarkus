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
import { commands } from "vscode";
import { BuildSupport } from "../buildSupport/BuildSupport";
import { GradleBuildSupport } from "../buildSupport/GradleBuildSupport";
import { MavenBuildSupport } from "../buildSupport/MavenBuildSupport";
import { JavaVSCodeCommands } from "./constants";

export class ProjectLabelInfo {
  uri: string;
  name: string;
  labels: ProjectLabel[];
  constructor(uri: string, name: string, labels: ProjectLabel[]) {
    this.uri = uri;
    this.labels = labels;
    this.name = name;
  }

  public getBuildSupport(): BuildSupport | undefined {
    if (this.isGradleProject()) {
      return new GradleBuildSupport();
    }
    if (this.isMavenProject()) {
      return new MavenBuildSupport();
    }
    return undefined;
  }

  public isQuarkusProject(): boolean {
    return this.labels.includes(ProjectLabel.Quarkus);
  }

  public isMavenProject(): boolean {
    return this.labels.includes(ProjectLabel.Maven);
  }

  public isMicroProfileProject(): boolean {
    return this.labels.includes(ProjectLabel.MicroProfile);
  }

  public isGradleProject(): boolean {
    return this.labels.includes(ProjectLabel.Gradle);
  }

  public static async getWorkspaceProjectLabelInfo(): Promise<ProjectLabelInfo[]> {
    const projectLabels: { uri: string, name: string, labels: ProjectLabel[] }[] = await commands.executeCommand("java.execute.workspaceCommand", JavaVSCodeCommands.WORKSPACE_LABELS_COMMAND_ID);
    return projectLabels.map((p) => {
      return new ProjectLabelInfo(p.uri, p.name, p.labels);
    });
  }

  /**
   * Returns the label information for the given file URI.
   * @param uri the file URI
   * @return the label information for the given file URI.
   */
  public static async getProjectLabelInfo(uri: string): Promise<ProjectLabelInfo> {
    const params = { uri };
    const projectLabel: { uri: string, name: string, labels: ProjectLabel[] } = await commands.executeCommand("java.execute.workspaceCommand", JavaVSCodeCommands.PROJECT_LABELS_COMMAND_ID, params);
    return new ProjectLabelInfo(projectLabel.uri, projectLabel.name, projectLabel.labels);
  }
}

export const enum ProjectLabel {
  MicroProfile = 'microprofile',
  Quarkus = 'quarkus',
  Maven = 'maven',
  Gradle = 'gradle'
}
