import * as request from 'request-promise';
import * as unzipper from 'unzipper';
import { QExtension } from './interface/QExtension';
import { Config } from './class/Config';
import { DEFAULT_API_URL } from './constants';


export async function getQExtensions(config: Config): Promise<QExtension[]> {

  const apiUrl: string = config.apiUrl ? config.apiUrl : DEFAULT_API_URL;

  return await request.get(`${apiUrl}/extension/list`)
    .then((body) => {
      const qExtensions: QExtension[] = JSON.parse(body);
      return qExtensions.sort((a, b) => a.name.localeCompare(b.name));
    });
}

export async function downloadProject(config: Config) {
  // make url
  const apiUrl: string = config.apiUrl ? config.apiUrl : DEFAULT_API_URL;

  const chosenExtArtifactIds: string[] = config.extensions.map((it) => it.artifactId);

  const qProjectUrl: string = `${apiUrl}/generator?` +
    `g=${config.groupId}&` +
    `a=${config.artifactId}&` +
    `pv=${config.projectVersion}&` +
    `cn=${config.packageName}.${config.resourceName}&` +
    `e=${chosenExtArtifactIds.join('&e=')}`;

  return request(qProjectUrl)
  .pipe(unzipper.Extract({ path: config.targetDir.fsPath })).promise();
}