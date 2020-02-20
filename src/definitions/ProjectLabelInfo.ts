import { commands } from "vscode";
import { PROJECT_LABELS_COMMAND_ID } from "./constants";

export class ProjectLabelInfo {
  uri: string;
  labels: ProjectLabel[];
  constructor(uri: string, labels: ProjectLabel[]) {
    this.uri = uri;
    this.labels = labels;
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
    const projectLabels: {uri: string, labels: ProjectLabel[]}[] = await commands.executeCommand("java.execute.workspaceCommand", PROJECT_LABELS_COMMAND_ID);
    return projectLabels.map((p) => {
      return new ProjectLabelInfo(p.uri, p.labels);
    })
  }
}

export const enum ProjectLabel {
  MicroProfile = 'microprofile',
  Quarkus = 'quarkus',
  Maven = 'maven',
  Gradle = 'gradle'
}
