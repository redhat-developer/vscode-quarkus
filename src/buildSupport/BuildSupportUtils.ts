import { Uri, WorkspaceFolder } from 'vscode';
import { getFilePathsFromWorkspace, getFilePathsFromFolder, getWorkspaceProjectLabels } from '../utils/workspaceUtils';
import { BuildSupport } from './BuildSupport';
import { GradleBuildSupport } from './GradleBuildSupport';
import { MavenBuildSupport } from './MavenBuildSupport';
import { ProjectLabel } from '../definitions/ProjectLabelInfo';

const POM_XML = 'pom.xml';
const BUILD_GRADLE = 'build.gradle';

/**
 * Determines whether the Quarkus project located in `workspaceFolder` is a Maven project
 * or a Gradle project
 * @param workspaceFolder
 */
export async function getBuildSupport(workspaceFolder: WorkspaceFolder): Promise<BuildSupport | undefined> {
  if ((await getFilePathsFromWorkspace(workspaceFolder, `**/${BUILD_GRADLE}`)).length > 0) {
    return new GradleBuildSupport();
  }

  if ((await getFilePathsFromWorkspace(workspaceFolder, `**/${POM_XML}`)).length > 0) {
    return new MavenBuildSupport();
  }

  throw 'Workspace folder does not contain a Maven or Gradle project';
}

/**
 * Returns an array of uris for pom.xml and build.gradle files belonging to
 * Quarkus projects located in the current workspace
 */
export async function searchBuildFile(): Promise<Uri[]> {
  const folders: string[] = (await getWorkspaceProjectLabels(ProjectLabel.Quarkus)).map(info => info.uri);

  const buildFilePaths: Uri[] = await folders.reduce(async (buildFilePaths: Promise<Uri[]>, pathToSearch: string) => {
    const accumulator = await buildFilePaths;
    const buildGradleUris: Uri[] = await getFilePathsFromFolder(pathToSearch, `**/${BUILD_GRADLE}`);
    const pomFileUris: Uri[] = await getFilePathsFromFolder(pathToSearch, `**/${POM_XML}`);

    return Promise.resolve(accumulator.concat(pomFileUris).concat(buildGradleUris));
  }, Promise.resolve([]));

  return buildFilePaths;
}