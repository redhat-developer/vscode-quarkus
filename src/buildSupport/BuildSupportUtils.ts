import { Uri, WorkspaceFolder, workspace } from 'vscode';
import { getFilePathsFromWorkspace } from '../utils/workspaceUtils';
import { BuildSupport } from './BuildSupport';
import { GradleBuildSupport } from './GradleBuildSupport';
import { MavenBuildSupport } from './MavenBuildSupport';

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
 * Returns an array of Uris for pom.xml and build.gradle files located under
 * (checks subdirectories) all workspace folders
 */
export async function searchBuildFile(): Promise<Uri[]> {
  const workspaceFolders: WorkspaceFolder[] | undefined = workspace.workspaceFolders;

  if (workspaceFolders === undefined) {
    return [];
  }

  const buildFilePaths: Uri[] = await workspaceFolders.reduce(async (buildFilePaths: Promise<Uri[]>, folderToSearch: WorkspaceFolder) => {
    const accumulator = await buildFilePaths;
    const buildGradleUris: Uri[] = await getFilePathsFromWorkspace(folderToSearch, `**/${BUILD_GRADLE}`);
    const pomFileUris: Uri[] = await getFilePathsFromWorkspace(folderToSearch, `**/${POM_XML}`);

    return Promise.resolve(accumulator.concat(pomFileUris).concat(buildGradleUris));
  }, Promise.resolve([]));

  return buildFilePaths;
}
