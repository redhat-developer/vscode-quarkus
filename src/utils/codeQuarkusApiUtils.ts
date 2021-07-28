/**
 * Copyright 2021 Red Hat, Inc. and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { IncomingMessage } from "http";
import * as https from "https";
import * as yaml from "js-yaml";
import * as path from "path";
import { URL } from "url";
import { QuarkusConfig } from "../QuarkusConfig";

const HTTP_MATCHER = new RegExp('^http://');

/**
 * Represents the capabilities of a Code Quarkus API, such as code.quarkus.io/api or code.quarkus.redhat.com/api
 */
export interface CodeQuarkusFunctionality {
  /**
   * This Code Quarkus API supports the `ne=...` parameter to specify that example code should not be generated
   *
   * @deprecated the `ne=...` parameter will be removed in favour of the `nc=...` parameter
   */
  supportsNoExamplesParameter: boolean;
  /**
   * This Code Quarkus API supports the `nc=...` to specify that starter code should not be generated
   */
  supportsNoCodeParameter: boolean;
}

/**
 * Returns the capabilities of the Code Quarkus API instance that is defined in the user settings
 *
 * @returns the capabilities of the Code Quarkus API instance that is defined in the user settings
 * @throws if something goes wrong when getting the functionality from OpenAPI
 */
export async function getCodeQuarkusApiFunctionality(): Promise<CodeQuarkusFunctionality> {
  let oldOpenApiUrl: string = path.dirname(QuarkusConfig.getApiUrl()) + '/openapi';
  let newOpenApiUrl: string = path.dirname(QuarkusConfig.getApiUrl()) + '/q/openapi';
  oldOpenApiUrl = oldOpenApiUrl.replace(HTTP_MATCHER, "https://");
  newOpenApiUrl = newOpenApiUrl.replace(HTTP_MATCHER, "https://");
  let openApiYaml: string;
  try {
    openApiYaml = await httpsGet(newOpenApiUrl);
  } catch {
    openApiYaml = await httpsGet(oldOpenApiUrl);
  }
  const openApiData: any = yaml.load(openApiYaml);

  return {
    supportsNoExamplesParameter: openApiData?.paths?.['/api/download']?.get?.parameters?.filter(p => p?.name === 'ne').length > 0,
    supportsNoCodeParameter: openApiData?.paths?.['/api/download']?.get?.parameters?.filter(p => p?.name === 'nc').length > 0,
  } as CodeQuarkusFunctionality;
}

/**
 * Returns a set of capabilities that are implemented by all Code Quarkus APIs
 *
 * @returns a set of capabilities that are implemented by all Code Quarkus APIs
 */
export function getDefaultFunctionality() {
  return {
    supportsNoExamplesParameter: false,
    supportsNoCodeParameter: false,
  } as CodeQuarkusFunctionality;
}

/**
 * Returns the GET response body if the code is 200 and rejects otherwise
 *
 * @param url URL to GET
 * @returns the response body if the code is 200 and rejects otherwise
 * @throws if anything goes wrong (not 200 response, any other errors during get)
 */
async function httpsGet(url: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    https.get(url, (res: IncomingMessage) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        httpsGet(new URL(url).origin + res.headers.location) //
          .then(resolve, reject);
      } else if (res.statusCode !== 200) {
        reject(`${res.statusCode}: ${res.statusMessage}`);
      }
      res.on('data', (d: Buffer) => {
        resolve(d.toString('utf8'));
      });
    })
      .on('error', reject);
  });
}
