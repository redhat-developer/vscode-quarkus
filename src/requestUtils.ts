import * as request from 'request-promise';
import { QExtension } from './definitions';

const DEFAULT_URL: string = 'http://localhost:8080';;

export async function getQExtensions(): Promise<QExtension[]> {
  return await request.get(`${DEFAULT_URL}/extension/list`)
    .then((body) => {
      const qExtensions: QExtension[] = JSON.parse(body);
      return qExtensions.sort((a, b) => a.name.localeCompare(b.name));
    });
}