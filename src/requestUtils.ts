import * as request from 'request-promise';
import * as unzipper from 'unzipper';
import { QExtension } from './interface/QExtension';
import { State } from './class/State';


export async function getQExtensions(state: State): Promise<QExtension[]> {

  return await request.get(`${state.apiUrl}/extension/list`)
    .then((body) => {
      const qExtensions: QExtension[] = JSON.parse(body);
      return qExtensions.sort((a, b) => a.name.localeCompare(b.name));
    });
}

export async function downloadProject(state: State) {
  
  const chosenExtArtifactIds: string[] = state.extensions.map((it) => it.artifactId);

  const qProjectUrl: string = `${state.apiUrl}/generator?` +
    `g=${state.groupId}&` +
    `a=${state.artifactId}&` +
    `pv=${state.projectVersion}&` +
    `cn=${state.packageName}.${state.resourceName}&` +
    `e=${chosenExtArtifactIds.join('&e=')}`;

  return request(qProjectUrl)
  .pipe(unzipper.Extract({ path: state.targetDir.fsPath })).promise();
}